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
COPY --from=build /app/target/apigateway-0.0.1-SNAPSHOT.jar /app/apigateway.jar

# Expose the gateway port
EXPOSE 9090

# Run the application
ENTRYPOINT ["java", "-jar", "apigateway.jar"]
