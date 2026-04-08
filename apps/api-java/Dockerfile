# ============================================================
# Spring Boot — multi-stage production Dockerfile
# ============================================================

# Stage 1: build with Maven
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

# Cache dependency layer
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Build
COPY src ./src
RUN mvn package -DskipTests -q

# Stage 2: extract layers for faster restarts
FROM eclipse-temurin:21-jre AS layers
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

# Stage 3: final runtime image
FROM eclipse-temurin:21-jre AS runner

# Install curl for Docker healthcheck
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*

RUN addgroup --system spring \
 && adduser  --system --ingroup spring spring

WORKDIR /app
USER spring

COPY --from=layers /app/dependencies/          ./
COPY --from=layers /app/spring-boot-loader/    ./
COPY --from=layers /app/snapshot-dependencies/ ./
COPY --from=layers /app/application/           ./

EXPOSE 8080

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "org.springframework.boot.loader.launch.JarLauncher"]