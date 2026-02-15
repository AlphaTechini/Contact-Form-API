# 🚀 Production-Ready Contact Form API

This isn't just another basic backend; it's a secure, reliable, and scalable solution designed to handle contact form submissions for any modern web application. I built this project with a security-first mindset, incorporating best practices to ensure that it's robust and ready for production deployment right out of the box.

---

## 🏗️ System Architecture

### Complete Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Contact Form  │    │   Email Service │
│   (Any Domain)  │◄──►│   API Gateway   │◄──►│   (Gmail/Nodemailer)│
└─────────────────┘    └────────┬────────┘    └─────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Rate Limiter      │
                    │   (Redis-backed)    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Input Validator   │
                    │   (Joi Schema)      │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   XSS Sanitizer     │
                    │   (DOMPurify)       │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Audit Logger      │
                    │   (Structured JSON) │
                    └─────────────────────┘
```

### Data Flow Architecture
1. **Request Ingress**: CORS-validated requests from whitelisted frontend domains
2. **Rate Limiting**: Redis-backed rate limiting with sliding window algorithm
3. **Input Validation**: Strict Joi schema validation with detailed error reporting
4. **Security Processing**: XSS sanitization and content filtering
5. **Dual Email Dispatch**: Parallel email sending to owner and user confirmation
6. **Audit Logging**: Structured JSON logging with PII redaction
7. **Response Handling**: Standardized success/error responses with appropriate HTTP status codes

---

## ✨ Core Features

I've packed this API with features to make it as resilient and developer-friendly as possible:

-   **📧 Dual Email Notifications**: Instantly sends a notification to the site owner and a confirmation auto-reply to the user upon successful submission.
-   **🛡️ Fort-Knox Security**:
    -   **Rate Limiting**: Protects against brute-force and spam attacks by limiting request frequency.
    -   **Secure CORS Policy**: Whitelists your frontend URL, preventing unauthorized domains from accessing the API.
    -   **XSS Prevention**: All user-submitted content is sanitized before being included in emails, neutralizing cross-site scripting threats.
    -   **Helmet Middleware**: Sets crucial security headers to protect against common web vulnerabilities.
-   **⚙️ Robust Input Validation**: Leverages `joi` to enforce strong, schema-based validation on all incoming data, ensuring data integrity and preventing bad inputs.
-   **🐳 Fully Dockerized**: Comes with a multi-stage `Dockerfile` that builds a small, optimized, and secure image, running the application as a non-root user.

---

## 🔒 Security Architecture Deep Dive

### Threat Model
| Threat Vector | Impact | Mitigation |
|---------------|--------|------------|
| **Spam/Bot Attacks** | Resource exhaustion, inbox flooding | Redis rate limiting, CAPTCHA integration capability |
| **Email Injection** | Unauthorized email sending | Strict input validation, parameterized email templates |
| **XSS Payloads** | Client-side script execution | DOMPurify sanitization, Content-Security-Policy headers |
| **Credential Theft** | Gmail account compromise | App passwords only, encrypted secrets storage |
| **Data Exfiltration** | PII leakage via logs | Structured logging with automatic PII redaction |
| **CORS Bypass** | Cross-domain API abuse | Strict origin whitelisting, preflight validation |

### Cryptographic Implementation
- **Transport Security**: TLS 1.3 enforced via Helmet middleware
- **Secret Management**: Environment variables with runtime validation
- **Email Authentication**: Gmail OAuth2 with app-specific passwords
- **Content Security**: CSP headers with strict source policies

### Input Validation Strategy
```javascript
// Example validation schema with security considerations
const contactSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s\-']+$/) // Prevent injection characters
    .required(),
  email: Joi.string()
    .email({ tlds: { allow: true } })
    .required(),
  message: Joi.string()
    .min(10)
    .max(1000)
    .required()
});
```

---

## ⚡ Fault Tolerance & Reliability

### Failure Scenarios & Recovery
| Component | Failure Mode | Recovery Strategy |
|-----------|--------------|-------------------|
| **Email Service** | Gmail API timeout/failure | Exponential backoff retry (3 attempts), fallback logging |
| **Rate Limiter** | Redis connection failure | Graceful degradation (continue without rate limiting) |
| **Validation** | Schema corruption | Default safe schema, alert on validation errors |
| **Logging** | Log destination unavailable | Local file fallback, alert on log failures |

### Exactly-Once Delivery Semantics
- **Idempotency Keys**: Optional `X-Idempotency-Key` header for duplicate prevention
- **Transaction Logging**: All successful submissions logged with unique identifiers
- **Replay Capability**: Failed email attempts can be manually replayed from logs

### Health Monitoring
- **Liveness Probe**: `/health/live` - Basic process health
- **Readiness Probe**: `/health/ready` - Full dependency check (Redis, email service)
- **Metrics Endpoint**: `/metrics` - Prometheus-compatible metrics

---

## 🛠️ Tech Stack

| Component | Technology | Production Considerations |
|-----------|------------|--------------------------|
| **Runtime** | Node.js | v18+ LTS with security patches |
| **Framework** | Express.js | Minimal middleware, security-focused |
| **Emailing** | Nodemailer (with Gmail) | App passwords, OAuth2 support |
| **Validation** | Joi | Strict schemas, detailed error reporting |
| **Security** | CORS, Express Rate Limit, Helmet | Production-hardened configurations |
| **Containerization** | Docker | Multi-stage build, non-root user |
| **Rate Limiting** | Redis | External Redis cluster for production |
| **Logging** | Winston | Structured JSON, PII redaction |

---

## 📊 Operational Excellence

### Monitoring Dashboard Specifications
**Key Metrics to Track:**
- Request rate (requests/minute)
- Error rate (5xx responses)
- Email delivery success rate
- Rate limiting triggers
- Average response time
- Memory/CPU usage

**Alerting Thresholds:**
- **Critical**: Email delivery failure rate > 5% for 5 minutes
- **Warning**: Rate limiting triggered > 10 times/minute  
- **Info**: Response time > 2 seconds for 95th percentile

### Backup & Recovery Procedures
- **Configuration Backup**: `.env` files stored in encrypted vault
- **Log Retention**: 30-day retention with daily rotation
- **Disaster Recovery**: Container rebuild from source with configuration restore

### Capacity Planning Guidelines
- **Single Instance**: Handles ~100 requests/minute comfortably
- **Horizontal Scaling**: Stateless design allows easy horizontal scaling
- **Rate Limit Tuning**: Adjust based on legitimate user behavior patterns
- **Email Quotas**: Monitor Gmail sending limits (500/day for free accounts)

---

## 📈 Scaling Patterns

### Horizontal Scaling Strategy
- **Stateless Design**: No session state, perfect for horizontal scaling
- **External Dependencies**: Redis for rate limiting, external email service
- **Load Balancing**: Compatible with any HTTP load balancer
- **Auto-Scaling**: CPU/memory-based scaling rules

### Performance Optimization
- **Connection Pooling**: Reuse email service connections
- **Async Processing**: Non-blocking email sending
- **Caching**: Rate limit counters in Redis with TTL
- **Compression**: Gzip compression for larger payloads

### Queue-Based Processing (Advanced)
For high-volume deployments, consider adding:
- **Message Queue**: RabbitMQ/Kafka for email processing
- **Worker Processes**: Dedicated email sending workers
- **Retry Logic**: Sophisticated retry with dead-letter queues
- **Batch Processing**: Group multiple notifications for efficiency

---

## 🔄 Integration Patterns

### CI/CD Pipeline Integration
```yaml
# GitHub Actions example
name: Deploy Contact Form API
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and push Docker image
        run: |
          docker build -t ${{ secrets.REGISTRY }}/${{ github.repository }}:${{ github.sha }}
          docker push ${{ secrets.REGISTRY }}/${{ github.repository }}:${{ github.sha }}
      - name: Deploy to production
        run: kubectl set image deployment/contact-api *=${{ secrets.REGISTRY }}/${{ github.repository }}:${{ github.sha }}
```

### Infrastructure as Code (Terraform)
```hcl
# AWS ECS deployment example
resource "aws_ecs_task_definition" "contact_api" {
  family                   = "contact-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  
  container_definitions = jsonencode([{
    name      = "contact-api"
    image     = "${var.ecr_repository_url}:latest"
    essential = true
    portMappings = [{
      containerPort = 5000
      hostPort      = 5000
    }]
    secrets = [
      { name = "OWNER_EMAIL", valueFrom = aws_secretsmanager_secret_version.email.arn },
      { name = "OWNER_EMAIL_PASS", valueFrom = aws_secretsmanager_secret_version.password.arn }
    ]
  }])
}
```

### Multi-Provider Email Configuration
```javascript
// Support for multiple email providers
const emailProviders = {
  gmail: createGmailTransport(),
  sendgrid: createSendGridTransport(process.env.SENDGRID_API_KEY),
  ses: createSESTransport({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1'
  })
};

// Automatic failover between providers
async function sendEmailWithFallback(emailData) {
  const providers = ['gmail', 'sendgrid', 'ses'];
  for (const provider of providers) {
    try {
      await emailProviders[provider].sendMail(emailData);
      return { success: true, provider };
    } catch (error) {
      console.warn(`Failed with ${provider}:`, error.message);
      continue;
    }
  }
  throw new Error('All email providers failed');
}
```

---

## 🏁 Getting Started

Getting this API up and running is quick and easy.

### Prerequisites

-   Node.js (v18 or later)
-   npm
-   Docker (optional, for containerized deployment)
-   **Production**: Redis instance for rate limiting
-   **Production**: Gmail account with App Password enabled

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/contact-form-api.git
    cd contact-form-api
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up your environment variables:**
    Create a `.env` file in the root of the project by copying the example file:
    ```sh
    cp .env.example .env
    ```
    Now, open the `.env` file and fill in your specific details. See the Environment Variables section below for more information.

### Running the API

-   **For local development:**
    ```sh
    npm start
    ```
    The server will start, typically on `http://localhost:5000`.

-   **Using Docker:**
    1.  Build the Docker image:
        ```sh
        docker build -t contact-form-api .
        ```
    2.  Run the container, passing in your environment variables:
        ```sh
        docker run -p 5000:5000 --env-file ./.env --name my-contact-api contact-form-api
        ```

-   **Production Deployment:**
    ```sh
    # With external Redis for rate limiting
    docker run -p 5000:5000 \
      --env-file ./.env \
      -e REDIS_URL=redis://your-redis-cluster:6379 \
      --name contact-api-prod \
      contact-form-api
    ```

---

## 📡 API Endpoint

### `POST /contact`

This is the primary endpoint for submitting form data.

**Request Body:**

```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "message": "This is a test message. Your API is awesome!"
}
```

**Optional Headers:**
- `X-Idempotency-Key`: Unique identifier to prevent duplicate submissions
- `X-Forwarded-For`: Client IP for enhanced rate limiting (when behind proxy)

**Responses:**

-   **Success (200 OK):**
    ```json
    {
      "success": true,
      "message": "Emails sent successfully!",
      "requestId": "uuid-v4-generated-request-id"
    }
    ```
-   **Validation Error (400 Bad Request):**
    ```json
    {
      "errors": [
        "\"name\" cannot be an empty field",
        "\"email\" must be a valid email address"
      ],
      "requestId": "uuid-v4-generated-request-id"
    }
    ```
-   **Rate Limited (429 Too Many Requests):**
    ```json
    {
      "error": "Rate limit exceeded",
      "retryAfter": 60,
      "requestId": "uuid-v4-generated-request-id"
    }
    ```

---

## 📝 Environment Variables

These variables are required for the application to run correctly.

| Variable | Description | Example | Production Notes |
|----------|-------------|---------|------------------|
| `PORT` | The port on which the server will run. | `5000` | Should match container EXPOSE |
| `OWNER_EMAIL` | The Gmail address where you'll receive contact notifications. | `your.email@gmail.com` | Use dedicated service account |
| `OWNER_EMAIL_PASS` | **Important:** This is a Gmail App Password, not your regular account password. | `abcd efgh ijkl mnop` | Store in secrets manager |
| `FRONTEND_URL` | The full URL of your frontend application. This is whitelisted by CORS. For local dev, this might be `http://localhost:3000`. | `https://your-portfolio-domain.com` | Comma-separated for multiple origins |
| `REDIS_URL` | Redis connection string for rate limiting (optional for development) | `redis://localhost:6379` | Required for production |
| `RATE_LIMIT_WINDOW` | Rate limiting window in milliseconds | `900000` (15 minutes) | Tune based on traffic patterns |
| `RATE_LIMIT_MAX` | Maximum requests per window | `10` | Adjust for legitimate usage |

---

## 🧪 Testing Strategy

### Automated Tests
- **Unit Tests**: Input validation, sanitization logic
- **Integration Tests**: Email sending, rate limiting
- **Security Tests**: XSS payloads, injection attempts
- **Load Tests**: High concurrency scenarios

### Manual Testing Checklist
- [ ] Valid form submission works
- [ ] Invalid inputs rejected with proper errors  
- [ ] Rate limiting triggers appropriately
- [ ] XSS payloads are sanitized
- [ ] CORS blocks unauthorized origins
- [ ] Email delivery works for both owner and user
- [ ] Error scenarios handled gracefully

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

### Development Guidelines
- Follow security-first development principles
- Add tests for all new features
- Update documentation for any API changes
- Consider production implications of all changes

---

## 📄 License

This project is licensed under the MIT License.