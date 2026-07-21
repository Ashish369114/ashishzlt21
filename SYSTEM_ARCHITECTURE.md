# Zayn Levi Technologies: School ERP System
## System Architecture & Maintenance Guide

This document provides a comprehensive overview of the software engineering (SWE) architecture, technology stack, maintenance protocols, and CI/CD pipelines used in the School Enterprise Resource Planning (ERP) platform. 

> [!TIP]
> **How to save this as a PDF:**
> If you are viewing this markdown document in a browser or IDE, you can usually right-click and select **Print** (or press `Ctrl+P` / `Cmd+P`), then choose **"Save as PDF"** as the destination.

---

## 1. System Architecture & Technology Stack

The application is designed using a decoupled client-server architecture, ensuring high scalability and modularity.

### Frontend (Client-Side)
The frontend is a Single Page Application (SPA) responsible for all user interfaces and interactions.
* **Core Framework:** React 18
* **Routing:** React Router v6
* **Styling:** Tailwind CSS (utility-first CSS framework for rapid UI development)
* **API Communication:** Axios (for making HTTP requests to the backend)
* **Real-time Communication:** Socket.io-client (for real-time notifications/chat)
* **Animations & Charts:** Framer Motion (UI animations) and Recharts (data visualization)

### Backend (Server-Side)
The backend is a RESTful API service that handles business logic, security, and data management.
* **Core Framework:** Node.js with Express.js
* **Database ORM:** Sequelize (Object-Relational Mapping library used to interact with the database using JavaScript models instead of raw SQL)
* **Authentication:** JSON Web Tokens (JWT) and `bcryptjs` for secure password hashing.
* **Real-time Server:** Socket.io

### Database Layer
* **Primary Database:** PostgreSQL (Relational database ideal for complex, structured data like school records, attendance, and finance).

---

## 2. Infrastructure & Cloud Deployment (AWS)

The platform relies on Amazon Web Services (AWS) for hosting and infrastructure. 

* **Frontend Hosting:** AWS S3 (Simple Storage Service) configured for static website hosting. 
* **Backend Hosting:** AWS EC2 (Elastic Compute Cloud) running Amazon Linux/Ubuntu. 
* **Database Hosting:** AWS RDS (Relational Database Service) for a managed, scalable PostgreSQL database.
* **Secrets Management:** AWS Secrets Manager (Used to securely store production variables like `DB_PASSWORD` and `JWT_SECRET` so they are never hardcoded in the repository).

---

## 3. Codebase Structure & Flow

### Backend Directory Structure (`/backend`)
* **`server.js`:** The entry point. It initializes the Express app, configures CORS (security), connects to the database, and loads routes.
* **`models/`:** Defines the database schemas using Sequelize. Example: `User.js` defines the columns for the Users table.
* **`routes/`:** Maps URLs to specific functions. Example: `/api/auth/login` is mapped to the login controller.
* **`controllers/`:** Contains the core business logic. This is where data is fetched from the database, modified, and returned as JSON to the frontend.
* **`middleware/`:** Security checkpoints. The `auth.js` middleware ensures a user has a valid JWT token before allowing them to access private data.

### Request Flow Example (Login)
1. User clicks "Login" on the React frontend.
2. Axios sends a POST request to `http://<EC2-IP>/api/auth/login`.
3. The Express router routes this to the `authController`.
4. The Controller queries the PostgreSQL database via Sequelize.
5. `bcrypt` verifies the password. A JWT token is generated and returned to the React app.

---

## 4. Software Engineering (SWE) Practices

### Continuous Integration & Continuous Deployment (CI/CD)
The project uses **GitHub Actions** (`.github/workflows/`) to automate deployments. This means developers do not need to manually copy files to servers.
* **`deploy-frontend.yml`:** Whenever code is pushed to the `frontend/` directory, this pipeline automatically runs `npm run build` and syncs the built files to the AWS S3 bucket.
* **`deploy-backend.yml`:** Whenever code is pushed to the `backend/` directory, this pipeline connects to the AWS EC2 instance via SSH, pulls the latest code, installs dependencies, securely fetches the environment variables from AWS Secrets Manager, and restarts the server.

### Process Management (PM2)
On the EC2 server, the backend is kept alive using **PM2**, a production process manager for Node.js. If the server crashes, PM2 automatically restarts it.

---

## 5. Maintenance & Troubleshooting Guide

### Managing the Database
* **Database Syncing:** Sequelize can automatically create tables if they are missing using `sequelize.sync()`.
* **Seeding Data:** To insert default data (like demo admins and subjects), the backend has seed scripts (`create_db.js`, `seedFn.js`). You can trigger a database reset and seed by hitting the `/api/force-seed` endpoint.

### Checking Backend Logs (EC2)
If the backend crashes or returns 500 Internal Server Errors, you must check the PM2 logs on the EC2 instance. 
1. SSH into the EC2 instance.
2. Run `pm2 logs` to see a live stream of the backend terminal output.
3. Run `pm2 status` to see if the Node.js application is online or in an "errored" state.
4. Run `pm2 restart all` if you need to manually reboot the API.

### Handling Environment Variables
If you need to change a database password, the JWT secret, or the backend URL, **do not change it in the code**. 
1. Go to **AWS Secrets Manager** in the AWS Console.
2. Edit the secret for your environment (e.g., `zltsos/dev`).
3. Re-run the GitHub Actions deployment pipeline so it pulls the new secrets and generates a fresh `.env` file on the server.

> [!WARNING]
> **CORS Configurations**
> If the frontend URL ever changes (e.g., moving from `dev.zltsos.com` to `www.zltsos.com`), you must update the `allowedOrigins` array in `backend/server.js` to prevent the browser from blocking requests due to Cross-Origin Resource Sharing (CORS) security rules.
