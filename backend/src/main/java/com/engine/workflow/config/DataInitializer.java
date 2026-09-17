package com.engine.workflow.config;

import com.engine.workflow.entity.User;
import com.engine.workflow.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                userRepository.save(new User("mariar.jud", "test", "Maria Rosaria Jud", "EMPLOYEE"));
                userRepository.save(new User("mario.rossi", "test", "Mario Rossi (Manager)", "MANAGER"));
                System.out.println("Utenti demo creati con successo in H2!");
            }
        };
    }
}