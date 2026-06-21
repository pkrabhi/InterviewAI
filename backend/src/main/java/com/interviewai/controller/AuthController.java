package com.interviewai.controller;

import com.interviewai.dto.AuthResponse;
import com.interviewai.dto.GoogleAuthRequest;
import com.interviewai.entity.User;
import com.interviewai.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Handles authentication endpoints.
 *
 * All routes under /api/auth/** are PUBLIC (no JWT needed) except /api/auth/me.
 * SecurityConfig already permits /api/auth/**, so /me will still get the user
 * from the JwtAuthFilter if a valid token is present, but it's technically
 * accessible without one (it will just return 401 if not authenticated).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * POST /api/auth/google
     *
     * Called by the React Native app immediately after Google Sign-In.
     *
     * Request body:
     *   { "idToken": "eyJhb..." }   ← the token from GoogleSignin.signIn()
     *
     * Response:
     *   { "token": "eyJ...", "userId": 1, "email": "...", "name": "...", ... }
     */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody GoogleAuthRequest request) {
        AuthResponse response = authService.loginWithGoogle(request.getIdToken());
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/auth/me
     *
     * Called on app startup to check if the stored JWT is still valid
     * and get fresh user data (plan changes, session count, etc.).
     *
     * @AuthenticationPrincipal is injected by JwtAuthFilter — it's the User entity
     * from the DB, so no extra DB call needed here.
     */
    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getProfile(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(authService.getProfile(user));
    }

    /**
     * POST /api/auth/logout
     *
     * Since we use stateless JWT, "logout" on the backend is a no-op.
     * The frontend simply deletes the token from AsyncStorage.
     * This endpoint exists so the frontend has a consistent API to call.
     *
     * Phase 9 enhancement: add a token blacklist for true server-side logout.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok().build();
    }
}
