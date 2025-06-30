# Stage 1: Build the application
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app

# Copy Maven project files
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy application source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Stage 2: Create a minimal runtime image
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy built JAR from the build stage
COPY --from=build /app/target/euraka-server-0.0.1-SNAPSHOT.jar /app/euraka-server.jar

# Expose the Eureka server port
EXPOSE 8761

# Run the Eureka server
ENTRYPOINT ["java", "-jar", "euraka-server.jar"]
