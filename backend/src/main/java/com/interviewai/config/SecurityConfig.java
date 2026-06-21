package com.interviewai.config;

import com.interviewai.security.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

/**
 * Central security configuration for the app.
 *
 * Key decisions:
 *   - STATELESS sessions (JWT, not cookies — mobile-friendly)
 *   - CSRF disabled (not needed for stateless REST APIs)
 *   - /api/auth/** is public (login doesn't require a token)
 *   - Everything else requires a valid JWT
 *   - CORS allows all origins in development (tighten in production)
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .cors()
            .and()
            .csrf().disable()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeRequests()
                // Public routes — no token needed
                .antMatchers("/api/auth/**").permitAll()
                // All other routes require a valid JWT
                .anyRequest().authenticated()
            .and()
            // Run our filter before Spring's default username/password filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
    }

    /**
     * CORS policy.
     *
     * During development the React Native app runs on your phone via Expo Go.
     * The phone makes HTTP calls to your computer's local IP (e.g. 192.168.1.x:8080).
     * Allowing all origins here makes development easy.
     *
     * Before going to production: change allowedOriginPatterns to your Railway app URL.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(Collections.singletonList("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
