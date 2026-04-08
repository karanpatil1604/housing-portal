package com.housingportal.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class CacheConfig {

    /**
     * Named caches with individual TTLs:
     *  - marketStats   : 60s  (aggregated data, refreshes often)
     *  - marketFilters : 300s (filter options, semi-static)
     *  - modelInfo     : 300s (model metadata, rarely changes)
     */
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager();

        // Default spec — overridden per-cache below
        manager.setCaffeine(
                Caffeine.newBuilder()
                        .maximumSize(200)
                        .expireAfterWrite(60, TimeUnit.SECONDS)
                        .recordStats()
        );

        // Register named caches
        manager.registerCustomCache("marketStats",
                Caffeine.newBuilder()
                        .maximumSize(50)
                        .expireAfterWrite(60, TimeUnit.SECONDS)
                        .recordStats()
                        .build());

        manager.registerCustomCache("marketFilters",
                Caffeine.newBuilder()
                        .maximumSize(10)
                        .expireAfterWrite(300, TimeUnit.SECONDS)
                        .recordStats()
                        .build());

        manager.registerCustomCache("modelInfo",
                Caffeine.newBuilder()
                        .maximumSize(5)
                        .expireAfterWrite(300, TimeUnit.SECONDS)
                        .recordStats()
                        .build());

        return manager;
    }
}