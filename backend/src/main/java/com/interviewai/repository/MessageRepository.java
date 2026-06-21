package com.interviewai.repository;

import com.interviewai.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // Fetch the full conversation history for a session, in order.
    // This list is sent to Groq on every turn so the AI has full context.
    List<Message> findBySessionIdOrderBySequenceAsc(Long sessionId);

    // Count messages in a session (used to track progress, end at 6–8 exchanges)
    long countBySessionId(Long sessionId);
}
