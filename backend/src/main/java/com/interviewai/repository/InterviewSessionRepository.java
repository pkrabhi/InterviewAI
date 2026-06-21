package com.interviewai.repository;

import com.interviewai.entity.InterviewSession;
import com.interviewai.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {

    // History screen: all sessions for a user, newest first
    List<InterviewSession> findByUserOrderByCreatedAtDesc(User user);

    // Count completed sessions for a user (used to enforce FREE plan limit)
    long countByUserAndStatus(User user, String status);
}
