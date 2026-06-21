package com.interviewai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response body for POST /api/auth/google and GET /api/auth/me
 *
 * The frontend stores the JWT in AsyncStorage and sends it on every request.
 * The user fields let the frontend show the profile picture and name immediately
 * without making a second API call.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;       // JWT — stored in AsyncStorage on the phone
    private Long userId;
    private String email;
    private String name;
    private String avatarUrl;
    private String plan;        // FREE | PRO | SESSION
    private Integer sessionsUsed;
    private boolean isNewUser;  // true on first login → show onboarding in Phase 7
}
