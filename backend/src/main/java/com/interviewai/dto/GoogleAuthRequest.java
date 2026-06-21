package com.interviewai.dto;

import lombok.Data;

/**
 * Request body for POST /api/auth/google
 *
 * The React Native app sends the ID token it received from Google Sign-In.
 * The backend verifies this token with Google's servers, then creates/finds
 * the user and returns our own JWT.
 */
@Data
public class GoogleAuthRequest {

    // The ID token from @react-native-google-signin/google-signin
    // In React Native: const { idToken } = await GoogleSignin.signIn();
    private String idToken;
}
