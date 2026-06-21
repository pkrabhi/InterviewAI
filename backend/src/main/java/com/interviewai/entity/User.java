package com.interviewai.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * Maps to the "users" table in Supabase.
 * Each row is one Google-authenticated user.
 *
 * Lombok @Data generates getters, setters, equals, hashCode, toString.
 * Lombok @Builder lets us do: User.builder().email("x").build()
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The unique user ID that Google provides ("sub" claim in the ID token)
    @Column(name = "google_id", unique = true, nullable = false, length = 100)
    private String googleId;

    @Column(unique = true, nullable = false, length = 255)
    private String email;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    // FREE | PRO | SESSION
    @Column(length = 20)
    @Builder.Default
    private String plan = "FREE";

    @Column(name = "sessions_used")
    @Builder.Default
    private Integer sessionsUsed = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
