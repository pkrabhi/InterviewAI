package com.interviewai.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.interviewai.dto.AuthResponse;
import com.interviewai.entity.User;
import com.interviewai.repository.UserRepository;
import com.interviewai.security.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;

/**
 * Handles Google Sign-In verification and user creation.
 *
 * Flow:
 *   1. Frontend (React Native) calls Google Sign-In → gets idToken (a JWT from Google)
 *   2. Frontend sends idToken to POST /api/auth/google
 *   3. This service verifies the token with Google's servers
 *   4. Extracts user info (email, name, avatar) from the verified token
 *   5. If user exists in DB → return their JWT
 *   6. If new user → create a DB row first, then return JWT
 */
@Service
@Slf4j
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${google.client.id}")
    private String googleClientId;

    /**
     * Verifies a Google ID token and returns our app's JWT.
     *
     * @param idToken  The raw ID token string from Google Sign-In on the phone
     * @return AuthResponse containing our JWT + user profile
     * @throws RuntimeException if the Google token is invalid or verification fails
     */
    @Transactional
    public AuthResponse loginWithGoogle(String idToken) {
        // Step 1: Verify the token with Google
        GoogleIdToken.Payload payload = verifyGoogleToken(idToken);

        String googleId = payload.getSubject();          // unique Google user ID
        String email    = payload.getEmail();
        String name     = (String) payload.get("name");
        String avatar   = (String) payload.get("picture");

        log.info("Google sign-in for email: {}", email);

        // Step 2: Find or create the user in our DB
        Optional<User> existingUser = userRepository.findByGoogleId(googleId);
        boolean isNewUser = !existingUser.isPresent();

        User user;
        if (isNewUser) {
            user = User.builder()
                    .googleId(googleId)
                    .email(email)
                    .name(name)
                    .avatarUrl(avatar)
                    .build();
            user = userRepository.save(user);
            log.info("Created new user: id={}, email={}", user.getId(), email);
        } else {
            user = existingUser.get();
            // Update name/avatar in case they changed it in Google
            user.setName(name);
            user.setAvatarUrl(avatar);
            user = userRepository.save(user);
        }

        // Step 3: Issue our own JWT
        String jwt = jwtUtil.generateToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .token(jwt)
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .avatarUrl(user.getAvatarUrl())
                .plan(user.getPlan())
                .sessionsUsed(user.getSessionsUsed())
                .isNewUser(isNewUser)
                .build();
    }

    /**
     * Returns the profile of the currently authenticated user.
     * Used by GET /api/auth/me — called on app startup to restore session.
     */
    public AuthResponse getProfile(User user) {
        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .avatarUrl(user.getAvatarUrl())
                .plan(user.getPlan())
                .sessionsUsed(user.getSessionsUsed())
                .isNewUser(false)
                .build();
    }

    /**
     * Calls Google's servers to verify the ID token is genuine.
     * Throws RuntimeException if the token is invalid or expired.
     */
    private GoogleIdToken.Payload verifyGoogleToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    // Your Google Client ID — verifies the token was issued FOR your app
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken googleIdToken = verifier.verify(idTokenString);

            if (googleIdToken == null) {
                throw new RuntimeException("Invalid Google ID token — verification returned null");
            }

            return googleIdToken.getPayload();

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to verify Google token: " + e.getMessage(), e);
        }
    }
}
