# Production Deployment & Submission Guide

This guide outlines step-by-step production deployment instructions for the **Beginner Level**, **Intermediate Level**, and **Advanced Level** backend REST APIs, along with the submission workflow to `g1doubts@shadowfox.in`.

---

## 📌 Submission Requirements Checklist

As per the Internship Track Submission Process:
1. **Beginner Level Deployed URL**: Publicly accessible live API link (e.g. Render / Railway / Vercel).
2. **Intermediate Level Deployed URL**: Publicly accessible live API link with JWT auth & Swagger docs.
3. **Email Submission**: Send deployed links to `g1doubts@shadowfox.in`.

---

## 🚀 Deployment Methods (Free Tier Platforms)

### Option 1: Deploying to Render.com (Recommended)

1. **Create Web Services**:
   - Log into [Render Dashboard](https://dashboard.render.com/).
   - Click **New +** -> **Web Service**.
   - Connect your GitHub repository containing the task folders.

2. **Configure Beginner Level Service**:
   - **Root Directory**: `Beginner Level`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Environment Variables**:
     - `PORT`: `3001` (or Render default)
     - `NODE_ENV`: `production`

3. **Configure Intermediate Level Service**:
   - **Root Directory**: `Intermediate Level`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Environment Variables**:
     - `PORT`: `3002`
     - `NODE_ENV`: `production`
     - `JWT_SECRET`: `<generate-secure-32-char-secret>`

4. **Configure Advanced Level Service**:
   - **Root Directory**: `Advanced Level`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Environment Variables**:
     - `PORT`: `3003`
     - `NODE_ENV`: `production`
     - `JWT_SECRET`: `<generate-secure-32-char-secret>`

---

### Option 2: Deploying to Railway.app

1. Install Railway CLI or connect via GitHub: `npx railway login`.
2. Navigate to each directory and deploy:
   ```bash
   cd "Beginner Level" && railway up
   cd "../Intermediate Level" && railway up
   cd "../Advanced Level" && railway up
   ```

---

## 📧 Email Submission Template

When emailing your submission to **`g1doubts@shadowfox.in`**, format your email as follows:

```text
Subject: Backend Developer Internship Submission - [Your Full Name] - Track Submission

Dear Mentor Team,

I have completed the assigned tasks for the Backend Developer Internship Track. Below are the details and live deployed links for review:

Candidate Name: [Your Full Name]
Track: Backend Developer
Date of Completion: [Current Date]

1. Beginner Level (Support Ticket Management REST API)
   - Live Deployed URL: https://beginner-support-ticket-api.onrender.com
   - Live Swagger Docs: https://beginner-support-ticket-api.onrender.com/api-docs
   - Repository Folder: /Beginner Level

2. Intermediate Level (E-Commerce & Inventory Management REST API)
   - Live Deployed URL: https://intermediate-ecommerce-api.onrender.com
   - Live Swagger Docs: https://intermediate-ecommerce-api.onrender.com/api-docs
   - Repository Folder: /Intermediate Level

3. Advanced Level (ClientPulse Enterprise Project & Milestone Management API)
   - Live Deployed URL: https://advanced-clientpulse-api.onrender.com
   - Live Swagger Docs: https://advanced-clientpulse-api.onrender.com/api-docs
   - Repository Folder: /Advanced Level
   - Requirement Brief: REQUIREMENT_BRIEF.md

I would like to be considered for the Advanced Level evaluation and restricted project access.

Thank you,
[Your Name]
[Your Phone / Contact Info]
```
