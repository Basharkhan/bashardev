package com.bashardev.backend;

import com.bashardev.backend.config.AppProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class BashardevBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BashardevBackendApplication.class, args);
	}

}
