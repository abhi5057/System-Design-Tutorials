# Stage 1: Build the application
FROM eclipse-temurin:21-jdk-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven wrapper and pom.xml first to cache dependencies
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Ensure the Maven wrapper is executable
RUN chmod +x ./mvnw

# Download dependencies (this layer will be cached unless pom.xml changes)
RUN ./mvnw dependency:go-offline -B

# Copy the actual project source code
COPY src ./src

# Build the application (skipping tests for faster deployment)
RUN ./mvnw clean package -DskipTests

# Stage 2: Create the production image
FROM eclipse-temurin:21-jre-alpine

# Set the working directory
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/order-system-*.jar app.jar

# Expose the port the app runs on
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
