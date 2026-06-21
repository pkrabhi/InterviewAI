package com.interviewai.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

/**
 * Handles JWT creation and validation.
 *
 * How JWT works in this app:
 *   1. User signs in with Google → backend verifies the Google token
 *   2. Backend creates our own JWT (signed with jwt.secret) containing userId + email
 *   3. Frontend stores the JWT in AsyncStorage
 *   4. Every API request sends JWT in "Authorization: Bearer <token>" header
 *   5. JwtAuthFilter validates the JWT before each request reaches a controller
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expirationMs;

    /**
     * Creates a JWT for the given user.
     * The token contains: userId (subject), email (custom claim), issued time, expiry.
     */
    public String generateToken(Long userId, String email) {
        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("email", email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extracts the userId from a validated token.
     * Called by JwtAuthFilter to identify which user made the request.
     */
    public Long getUserIdFromToken(String token) {
        String subject = parseClaims(token).getSubject();
        return Long.parseLong(subject);
    }

    public String getEmailFromToken(String token) {
        return (String) parseClaims(token).get("email");
    }

    /**
     * Returns true if the token is properly signed and not expired.
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSigningKey() {
        // HS256 needs at least 256 bits (32 bytes). Our secret is 64+ chars, so we're fine.
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
