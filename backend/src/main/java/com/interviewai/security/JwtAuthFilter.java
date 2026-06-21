package com.interviewai.security;

import com.interviewai.entity.User;
import com.interviewai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

/**
 * Runs once for every HTTP request (before it hits the controller).
 *
 * What it does:
 *   1. Reads the "Authorization: Bearer <token>" header
 *   2. Validates the JWT with JwtUtil
 *   3. Loads the user from DB
 *   4. Sets the authentication in Spring's SecurityContext
 *      so controllers can call `@AuthenticationPrincipal` or SecurityContextHolder
 *
 * If the token is missing or invalid → the request continues unauthenticated.
 * SecurityConfig then decides whether to reject it (401) based on the route.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String token = extractToken(request);

        if (token != null && jwtUtil.validateToken(token)) {
            Long userId = jwtUtil.getUserIdFromToken(token);
            Optional<User> userOptional = userRepository.findById(userId);

            if (userOptional.isPresent()) {
                User user = userOptional.get();

                // Tell Spring Security "this request is authenticated as this user"
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                user,               // principal — available via @AuthenticationPrincipal
                                null,               // credentials — not needed after JWT validation
                                Collections.emptyList()   // authorities — add roles here if needed later
                        );
                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        // Always continue the filter chain — SecurityConfig handles 401 for protected routes
        filterChain.doFilter(request, response);
    }

    /**
     * Extracts the raw token string from "Authorization: Bearer eyJ..."
     * Returns null if the header is missing or malformed.
     */
    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
