# 🚀 Production-Ready Contact Form API

This isn't just another basic backend; it's a secure, reliable, and scalable solution designed to handle contact form submissions for any modern web application. I built this project with a security-first mindset, incorporating best practices to ensure that it's robust and ready for production deployment right out of the box.

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

## 🛠️ Tech Stack

| Component           | Technology                                      |
| ------------------- | ----------------------------------------------- |
| **Runtime**         | Node.js                                         |
| **Framework**       | Express.js                                      |
| **Emailing**        | Nodemailer (with Gmail)                         |
| **Validation**      | Joi                                             |
| **Security**        | CORS, Express Rate Limit, Helmet                |
| **Containerization**| Docker                                          |

---

## 🏁 Getting Started

Getting this API up and running is quick and easy.

### Prerequisites

-   Node.js (v18 or later)
-   npm
-   Docker (optional, for containerized deployment)

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

**Responses:**

-   **Success (200 OK):**
    ```json
    {
      "success": true,
      "message": "Emails sent successfully!"
    }
    ```
-   **Validation Error (400 Bad Request):**
    ```json
    {
      "errors": [
        "\"name\" cannot be an empty field",
        "\"email\" must be a valid email address"
      ]
    }
    ```

---

## 📝 Environment Variables

These variables are required for the application to run correctly.

| Variable           | Description                                                                                                                              | Example                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `PORT`             | The port on which the server will run.                                                                                                   | `5000`                                |
| `OWNER_EMAIL`      | The Gmail address where you'll receive contact notifications.                                                                            | `your.email@gmail.com`                |
| `OWNER_EMAIL_PASS` | **Important:** This is a Gmail App Password, not your regular account password.         | `abcd efgh ijkl mnop`                 |
| `FRONTEND_URL`     | The full URL of your frontend application. This is whitelisted by CORS. For local dev, this might be `http://localhost:3000`. | `https://your-portfolio-domain.com` |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📄 License

This project is licensed under the MIT License.
