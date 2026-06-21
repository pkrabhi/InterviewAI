package com.interviewai.repository;

import com.interviewai.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    // Look up the report for a specific session
    Optional<Report> findBySessionId(Long sessionId);
}
