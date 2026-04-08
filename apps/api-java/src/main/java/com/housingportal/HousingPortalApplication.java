package com.housingportal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class HousingPortalApplication {

    public static void main(String[] args) {
        SpringApplication.run(HousingPortalApplication.class, args);
    }
}