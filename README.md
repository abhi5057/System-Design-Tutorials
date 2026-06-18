# E-commerce Order Processing System

This is the backend for an E-commerce Order Processing System built with **Java 21** and **Spring Boot 3**. It allows customers to place orders, track their status, and supports basic order operations including a scheduled background worker.

## Core Features
1. **Create an Order:** Place an order with multiple items.
2. **Retrieve Order Details:** Fetch order details by order ID.
3. **Update Order Status:** Supports statuses like `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, and `CANCELLED`.
4. **List all Orders:** Retrieve all orders, optionally filtered by status.
5. **Cancel an Order:** Customers can cancel an order, but only if it’s still in `PENDING` status.
6. **Background Job:** Automatically updates `PENDING` orders to `PROCESSING` every 5 minutes.

---

## Tech Stack
- **Java 21 LTS:** Utilizing standard enterprise features.
- **Spring Boot 3.x:** Core application framework.
- **Spring Data JPA & Hibernate:** Database access and ORM.
- **PostgreSQL:** Production-ready relational database.
- **Spring `@Scheduled`:** Built-in task scheduling for the background job.
- **Springdoc OpenAPI (Swagger):** API documentation and testing UI.

---

## Running Locally

### Prerequisites
- JDK 21 installed.
- Maven installed (or use the provided `./mvnw` wrapper).
- A running PostgreSQL database.

### Setup Instructions
1. **Clone the repository.**
2. **Configure Database:**
   Update the database connection details in `src/main/resources/application.yml` or expose them as environment variables:
   ```bash
   export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/your_db
   export SPRING_DATASOURCE_USERNAME=postgres
   export SPRING_DATASOURCE_PASSWORD=postgres
   ```
3. **Build the Application:**
   ```bash
   ./mvnw clean install -DskipTests
   ```
4. **Run the Application:**
   ```bash
   ./mvnw spring-boot:run
   ```
   Or run the compiled jar:
   ```bash
   java -jar target/order-system-0.0.1-SNAPSHOT.jar
   ```

### API Testing (Swagger UI)
Once the application is running, navigate to the auto-generated Swagger UI to test the endpoints:
- **Swagger UI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI JSON Docs:** [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

---

## Free Cloud Deployment for Demo

To showcase this application without incurring costs, you can use the following free-tier services.

### 1. Database: Neon.tech (Serverless PostgreSQL)
1. Go to [Neon.tech](https://neon.tech/) and sign up.
2. Create a new project and select PostgreSQL version 15 or 16.
3. Copy the provided connection string. It will look like: `postgresql://user:password@endpoint.neon.tech/dbname`.
4. Convert it to the JDBC format for Spring Boot: `jdbc:postgresql://endpoint.neon.tech/dbname`.

### 2. Application Hosting: Render.com (Web Service)
1. Push this repository to your GitHub account.
2. Go to [Render.com](https://render.com/), sign in, and click **New -> Web Service**.
3. Connect your GitHub repository.
4. **Environment:** Select `Docker` (or Java if native support is preferred, but a simple Dockerfile is robust).
   *(Note: For this repo, Render can automatically detect Maven if you configure the build command as `./mvnw clean package` and start command as `java -jar target/order-system-0.0.1-SNAPSHOT.jar` using the "Native Environment").*
5. **Environment Variables:**
   Add the following variables obtained from Neon.tech:
   - `SPRING_DATASOURCE_URL` = `jdbc:postgresql://endpoint.neon.tech/dbname`
   - `SPRING_DATASOURCE_USERNAME` = `your_neon_username`
   - `SPRING_DATASOURCE_PASSWORD` = `your_neon_password`
6. Deploy. Render will build and host your app. Use the provided Render URL to access the `/swagger-ui.html` page to test your live demo.

### Teardown Instructions (Post-Demo)
- **Render:** Go to the dashboard, select your Web Service, click "Settings", scroll to the bottom, and click "Delete Web Service".
- **Neon:** Go to your Neon console, select your project, go to "Settings", and click "Delete Project".

---

## AI Usage Documentation (Cursor AI / ChatGPT)

*As requested by the coding assignment guidelines, here is a breakdown of how AI was leveraged for this project:*

### 1. Project Scaffolding & Setup
- **Prompting:** AI was used to generate the Maven build script and directory structure.
- **Corrections:** The AI initially attempted to download via `start.spring.io` using an unsupported format for CLI, but was quickly corrected to download the zip bundle and extract it locally. It was also guided to swap from properties to YAML for standard configurations.

### 2. Data Modeling & ORM
- **Prompting:** AI generated the JPA Entities (`Order`, `OrderItem`), utilizing Lombok to reduce boilerplate code, and configuring the One-to-Many bidirectional relationship correctly.
- **Handling Keywords:** AI natively recognized that `Order` is a reserved SQL keyword in PostgreSQL and automatically applied `@Table(name = "orders")` to prevent syntax errors during table generation.

### 3. Business Logic & Background Scheduling
- **Prompting:** AI implemented the Service layer, DTOs with validation (`jakarta.validation`), and standard custom exceptions for `ResourceNotFound` and `InvalidOperation` (for cancelling non-pending orders).
- **Scheduled Job:** Instead of using heavy message brokers for a simple 5-minute status update, AI was directed to use Spring's native `@Scheduled` cron worker, ensuring it runs efficiently and updates `PENDING` orders asynchronously.

### 4. Controller & Swagger API Integration
- **Prompting:** The AI generated RESTful endpoints mapped with `springdoc-openapi` annotations (`@Tag`, `@Operation`) so the Swagger UI comes pre-documented out of the box, making it exceptionally easy for reviewers to test.
