package com.engine.workflow.config;

import io.camunda.zeebe.client.ZeebeClient;
import io.camunda.zeebe.client.impl.oauth.OAuthCredentialsProviderBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ZeebeConfig {

    @Value("${camunda.client.cloud.cluster-id}")
    private String clusterId;

    @Value("${camunda.client.auth.client-id}")
    private String clientId;

    @Value("${camunda.client.auth.client-secret}")
    private String clientSecret;

    @Value("${camunda.client.cloud.region:fra-1}")
    private String region;

    @Bean(destroyMethod = "close")
    public ZeebeClient zeebeClient() {
        var credentialsProvider = new OAuthCredentialsProviderBuilder()
                .authorizationServerUrl("https://login.cloud.camunda.io/oauth/token")
                .audience("zeebe.camunda.io")
                .clientId(clientId)
                .clientSecret(clientSecret)
                .build();

        String gatewayAddress = clusterId + "." + region + ".zeebe.camunda.io:443";

        return ZeebeClient.newClientBuilder()
                .gatewayAddress(gatewayAddress)
                .credentialsProvider(credentialsProvider)
                .build();
    }
}