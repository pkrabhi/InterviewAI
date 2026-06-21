package com.interviewai.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * Maps to the "interview_sessions" table.
 * One row = one mock interview (from start to completion/abandonment).
 */
@Entity
@Table(name = "interview_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many sessions can belong to one user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // java | fullstack | data | devops | react | hr
    @Column(nullable = false, length = 50)
    private String role;

    // junior | mid | senior
    @Column(nullable = false, length = 20)
    private String level;

    // technical | hr | system_design | mixed
    @Column(name = "interview_type", nullable = false, length = 20)
    private String interviewType;

    // The job description the user pasted (optional, can be NULL)
    @Column(name = "jd_text", columnDefinition = "TEXT")
    private String jdText;

    // ACTIVE | COMPLETED | ABANDONED
    @Column(length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    // Set when the session is completed (0–100)
    @Column(name = "overall_score")
    private Integer overallScore;

    // How long the interview took, in seconds
    @Column(name = "duration_secs")
    private Integer durationSecs;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
