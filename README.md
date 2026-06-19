# E-commerce Order Processing System

This repository contains the backend for an E-commerce Order Processing System built with **Java 21** and **Spring Boot 3**. It allows customers to place orders, track their status, supports standard order lifecycle operations, and executes an automated scheduled job to transition order states.

---

## 🏛 Architecture & Design

### High-Level Design (HLD)
The system is built as a **Monolithic RESTful Web Service** representing a core microservice in a broader e-commerce ecosystem.

```text
[ Client / Postman / Swagger ]
             | (HTTP/JSON)
             v
+-------------------------------+
|      Order System Backend     |
|  +-------------------------+  |
|  |     REST Controller     |  |  <-- Inbound API routing & validation
|  +-------------------------+  |
|             |                 |
|  +-------------------------+  |
|  |      Service Layer      |  |  <-- Core Business Logic & Transactions
|  +-------------------------+  |
|             |                 |
|  +-------------------------+  |
|  |        DAO Layer        |  |  <-- Data Access Abstraction
|  +-------------------------+  |
|             |                 |
|  +-------------------------+  |  <-- Spring Data JPA Interfaces
|  |       Repository        |  |
|  +-------------------------+  |
+-------------------------------+
             | (JDBC/TCP)
             v
      [( PostgreSQL )] <-- Relational Data Store
```

### Low-Level Design (LLD)
The system strictly adheres to enterprise **SOLID** principles and the layered architectural pattern:

1. **Controllers (`OrderController`)**: Handles HTTP requests, enforces API contracts (DTOs via `@Valid`), and outputs HTTP Responses. Includes Pagination via Spring Data `Pageable`.
2. **DTOs (Data Transfer Objects)**: Encapsulate input parameters (e.g., `CreateOrderRequest`). This decouples the API contract from internal database entities.
3. **Services (`OrderService` Interface -> `OrderServiceImpl`)**: Encapsulates business logic. Transaction management (`@Transactional`) ensures atomicity (e.g., if saving an order item fails, the parent order rolls back).
4. **DAO (`OrderDao` Interface -> `OrderDaoImpl`)**: Abstracts the underlying database technology from the business logic, bridging the Service and the Repository.
5. **Repositories (`OrderRepository`)**: Spring Data JPA interfaces extending `JpaRepository`. Provides out-of-the-box CRUD and pagination capability.
6. **Entities (`Order`, `OrderItem`)**: Object-Relational Mapped (ORM) JPA classes.
   * *Note on Entities:* We explicitly use `@Getter` and `@Setter` instead of Lombok's `@Data` to prevent fatal circular reference `StackOverflowError`s resulting from the bidirectional One-to-Many mapping.
7. **Global Exception Handling (`GlobalExceptionHandler`)**: A centralized `@ControllerAdvice` component that intercepts standard exceptions (`ResourceNotFoundException`, `MethodArgumentNotValidException`). It natively utilizes **RFC 7807 (ProblemDetail)**, which is the Spring Boot 3 standard for standardizing HTTP error payloads.
8. **Scheduled Job (`OrderStatusJob`)**: A Spring `@Scheduled` background task running asynchronously to update `PENDING` orders to `PROCESSING`.
9. **Centralized Logging**: Asynchronous Logback implementation generating Rolling Files.

---

## ⚙️ Tech Stack & Engineering Reasoning

The choices made for this repository deliberately lean towards **Industry Standard Long-Term Support (LTS)** tools favored by enterprise giants.

| Technology | Justification |
| :--- | :--- |
| **Java 21 LTS** | The current standard LTS. Provides Virtual Threads (Project Loom) for highly scalable, concurrent backend requests. |
| **Spring Boot 3.x** | The absolute industry standard for building robust, production-ready, and maintainable web applications. |
| **Spring Data JPA** | Abstracts away boilerplate SQL. Ensures safe, SQL-injection-proof database interactions via Hibernate. |
| **PostgreSQL** | The most advanced, feature-rich, open-source relational database. Perfect for transactional financial/e-commerce data (ACID compliant). |
| **Maven** | Standard build automation and dependency management tool. |

### Architectural Decisions: Why NOT Kafka, Redis, or AWS?

When designing software, premature optimization is a massive anti-pattern. The requirements dictate a straightforward REST API with a **simple 5-minute periodic status update job**.

1. **Why not Kafka / RabbitMQ?**
   * **The Requirement:** "A background job should automatically update PENDING orders to PROCESSING every 5 minutes."
   * **Reasoning:** Message brokers (Kafka, RabbitMQ) are designed for event-driven architectures, pub/sub broadcasting, and decoupling massive microservice networks. Introducing a highly complex distributed commit log (Kafka) to run a localized 5-minute cron job is extreme over-engineering. Spring's native `@Scheduled` cron worker handles this requirement natively, efficiently, and with zero infrastructural overhead.
2. **Why not Redis?**
   * **Reasoning:** Redis is typically used for distributed caching, session management, or as a message broker. Our dataset (orders) is highly transactional and stateful. We do not have read-heavy workloads that require sub-millisecond cache hits. Writing directly to PostgreSQL ensures ACID compliance, which is critical for e-commerce orders.
3. **Why not AWS / EKS / EC2?**
   * **Reasoning:** To meet the assignment's constraint of providing a zero-cost demonstration environment, we opted for **Serverless/PaaS** solutions (Neon.tech for Postgres, Render.com for App Hosting). Utilizing raw AWS EC2 or EKS would incur immediate billing and require complex Terraform/VPC setups, which falls outside the scope of demonstrating core backend coding competency.

### Logging Strategy & Analysis

This repository utilizes an industry-standard **Asynchronous Rolling File** logging configuration via `logback-spring.xml` utilizing SLF4J (`@Slf4j`).
* **Format & Storage:** Logs are written in an async queue to avoid blocking threads and are rolled daily (retaining 30 days history up to 3GB total) in a local `logs/` directory.
* **Centralized Log Analysis:** While the logs are currently generated locally, the architecture is explicitly designed to support the standard **Sidecar Pattern**. In a production Kubernetes/EC2 environment, you would run a log-shipping agent (such as **Fluentd**, **Filebeat**, or **Datadog Agent**) alongside the application. This sidecar agent tails the `logs/order-system.log` file periodically and pushes the data to a centralized observability stack like the **ELK Stack (Elasticsearch, Logstash, Kibana)** or **Splunk** for alerting, indexing, and anomaly detection.

---

## 🚀 Running Locally

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

## ☁️ Free Cloud Deployment for Demo

To showcase this application without incurring costs, use the following free-tier services.

### 1. Database: Neon.tech (Serverless PostgreSQL)
1. Go to [Neon.tech](https://neon.tech/) and sign up.
2. Create a new project.
3. In the "Connection Details" widget, click the **"Parameters"** tab to view your credentials explicitly. Alternatively, extract them from the provided connection string:
   * **String Format:** `postgresql://[USERNAME]:[PASSWORD]@[HOST]/[DATABASE]`
   * **Username:** The text between `postgresql://` and `:`
   * **Password:** The text between `:` and `@`
4. Convert the host and database into the JDBC format required by Spring Boot:
   `jdbc:postgresql://[HOST]/[DATABASE]?sslmode=require`

### 2. Application Hosting: Render.com (Web Service)
1. Push this repository to your GitHub.
2. Go to [Render.com](https://render.com/) -> **New -> Web Service**.
3. Connect your GitHub repository.
4. Set Build Command: `./mvnw clean package`
5. Set Start Command: `java -jar target/order-system-0.0.1-SNAPSHOT.jar`
6. **Environment Variables:**
   - `SPRING_DATASOURCE_URL` = `jdbc:postgresql://endpoint.neon.tech/dbname`
   - `SPRING_DATASOURCE_USERNAME` = `your_neon_username`
   - `SPRING_DATASOURCE_PASSWORD` = `your_neon_password`
7. Deploy. Use the provided Render URL to access `/swagger-ui.html`.

### Teardown Instructions (Post-Demo)
- **Render:** Go to Dashboard -> Web Service -> Settings -> "Delete Web Service".
- **Neon:** Go to Console -> Project Settings -> "Delete Project".

---

## 🤖 AI Usage Documentation (Cursor AI / ChatGPT)

*As requested by the coding assignment guidelines, here is a breakdown of how AI was leveraged:*

### 1. Architecture & Design Auditing
- **Prompting:** AI was utilized to analyze the codebase against strict enterprise standards. It proactively recommended and implemented a `GlobalExceptionHandler` (`@ControllerAdvice`), a **DAO Layer** (`OrderDao` -> `OrderRepository`), extracted interfaces (`OrderService`), introduced asynchronous `RollingFile` logging, and introduced `Pageable` pagination to list endpoints to prevent memory exhaustion at scale.

### 2. Boilerplate & Setup
- **Prompting:** AI generated the Maven build scripts, directory structures, and `application.yml` configurations, dynamically swapping from properties to YAML for standard configurations.

### 3. Data Modeling & JPA Pitfalls
- **Prompting:** AI generated the JPA Entities.
- **Corrections:** During the generation of bidirectional JPA relationships, AI initially suggested Lombok's `@Data`. The AI code-review sub-agent immediately caught this anti-pattern (which causes `StackOverflowError`s) and corrected the code to use `@Getter` and `@Setter` exclusively. It also successfully identified `Order` as a reserved SQL keyword and mapped it to `@Table(name = "orders")`.

### 4. Background Scheduling Strategy
- **Prompting:** Instead of hallucinating complex infrastructure (Kafka/Redis) for a simple cron requirement, the AI was guided to adhere to YAGNI (You Aren't Gonna Need It) principles, successfully implementing Spring's native `@Scheduled` annotation to fulfill the requirement efficiently.
