package com.interviewai.repository;

import com.interviewai.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA generates all SQL at runtime — no implementation needed.
 * Just declare the method signature and Spring figures out the query.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Used during Google Sign-In: find existing user by their Google sub ID
    Optional<User> findByGoogleId(String googleId);

    // Used to check if email already exists (uniqueness guard)
    Optional<User> findByEmail(String email);

    boolean existsByGoogleId(String googleId);
}
