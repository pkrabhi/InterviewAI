package com.interviewai.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * Maps to the "reports" table.
 * One report per completed session (1:1 with InterviewSession).
 *
 * strengths / improvements / next_topics are stored as JSON arrays in TEXT columns.
 * Example: ["Strong Spring Boot knowledge", "Good use of examples"]
 * In Phase 6, ReportService will serialize/deserialize these with Jackson ObjectMapper.
 */
@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Each session has exactly one report
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", unique = true, nullable = false)
    private InterviewSession session;

    @Column(name = "overall_score")
    private Integer overallScore;

    @Column(name = "technical_score")
    private Integer technicalScore;

    @Column(name = "communication_score")
    private Integer communicationScore;

    @Column(name = "problem_solving_score")
    private Integer problemSolvingScore;

    @Column(name = "best_practices_score")
    private Integer bestPracticesScore;

    // JSON arrays stored as text, e.g. ["Strong Spring Boot", "Good examples"]
    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String improvements;

    @Column(name = "next_topics", columnDefinition = "TEXT")
    private String nextTopics;

    // Filesystem path to the generated PDF (Phase 6)
    @Column(name = "pdf_path", length = 500)
    private String pdfPath;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
