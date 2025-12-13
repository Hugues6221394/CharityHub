---

# 🎓 Student Charity Hub

### *Light of Knowledge — Transparent Digital Student Sponsorship Platform*

![.NET](https://img.shields.io/badge/.NET-8.0-purple.svg)
![ASP.NET Core Web API](https://img.shields.io/badge/ASP.NET%20Core-Web%20API-blue.svg)
![React](https://img.shields.io/badge/Frontend-React-61DAFB.svg)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

> **Student Charity Hub** is a modern, full-stack web platform designed to connect donors with financially disadvantaged students through a **secure, transparent, and accountable digital sponsorship system**.

---

## 📌 Project Overview

Educational inequality remains a major barrier to human development. Many capable students fail to complete their studies due to **financial constraints, lack of sponsorship transparency, and weak donor–student engagement**.

**Student Charity Hub** solves this problem by introducing a **technology-driven sponsorship platform** that ensures:

* Full transparency of donations
* Secure and traceable payment workflows
* Continuous academic progress tracking
* Meaningful donor–student relationships

The system is built using **ASP.NET Core Web API**, **React**, and **PostgreSQL**, following industry-standard architectural and security practices.

---

## 👥 Development Team — Group 4

| Name                       | Student ID | Role                                    |
| -------------------------- | ---------- | --------------------------------------- |
| **Iriza Gatera Merveille** | 26266      | Backend Developer                       |
| **Hugues Ngabonziza**      | 26148      | Project Lead & Full-Stack Developer     |
| **Keza Manzi Leila**       | 26260      | Frontend Developer & UI/UX Designer     |
| **Tesi Divine**            | 26017      | Business Analyst, QA & Documentation    |
| **Iriza Yvonne**           | 25875      | Database Architect & Frontend Developer |

<img width="810" height="1080" alt="image" src="https://github.com/user-attachments/assets/b26a0062-1b16-4936-90e0-add44db88d4b" />
---

## 🎯 Problem Statement

Despite Rwanda’s strong digital infrastructure and mobile money penetration, **many students are excluded from education due to financial limitations**.

### Key Challenges

* Donors lack visibility into how funds are used
* Traditional charity models provide weak accountability
* Students experience interrupted sponsorships
* Academic progress is poorly documented

This results in **donor mistrust, student dropouts, and unsustainable sponsorship models**.

---

## 💡 Proposed Solution

**Student Charity Hub** introduces a **centralized digital platform** that enables:

* Verified student profiles
* Secure donations via PayPal 
* Real-time donation and payment tracking
* Academic progress reporting
* Automated notifications and receipts

  <img width="602" height="275" alt="image" src="https://github.com/user-attachments/assets/37844f08-6c50-43af-901e-e6cc58dc760c" />


The platform transforms charity into a **transparent, measurable, and relationship-driven process**.

---
<img width="1365" height="609" alt="image" src="https://github.com/user-attachments/assets/927a86ef-78f1-4a8b-a1c5-eff8def5fcac" />


## 🚀 Core Features

### 👨‍🎓 Students

* Verified academic profiles
* Funding goal and progress tracking
* Academic updates and reports
* Secure communication with donors

### 💰 Donors

* Browse and filter student profiles
* Make secure online donations
* Track donation impact in real time
* Receive notifications and receipts

### 🛠️ Administrators

* Student verification and approval
* Donation monitoring and auditing
* Communication moderation
* System analytics and reporting

---

## 🏗️ System Architecture

The system follows a **client–server architecture** with a **RESTful API backend**.

### High-Level Architecture

* **Frontend**: React (SPA)
* **Backend**: ASP.NET Core Web API
* **Database**: PostgreSQL
* **Payments**: PayPal API
* **Notifications**: Email (SendGrid)

---

## 🔁 Donation Workflow (Sequence Explanation)

The donation process follows a secure, traceable flow:

1. Donor selects a student in the React frontend
2. Frontend sends request to ASP.NET Core Web API
3. API creates a **pending donation record** in PostgreSQL
4. Payment order is created via PayPal REST API
5. Donor is redirected to PayPal for approval
6. PayPal sends callback to the API
7. API captures payment and verifies success
8. Donation status is updated to **Completed**
9. Payment logs and notifications are stored
10. Student’s total raised amount is updated

This ensures **full financial traceability and accountability**.

---

## 🗄️ Database Design (PostgreSQL)

The PostgreSQL database stores:

* Users (Donors, Students, Admins)
* Students
* Donations
* PaymentLogs
* Messages
* Notifications

Entity relationships ensure **data integrity, auditability, and consistency**.
<img width="982" height="548" alt="image" src="https://github.com/user-attachments/assets/b98e9e6b-4701-44b0-a555-28dec7e3e773" />

---

## ⚙️ Technology Stack

| Layer          | Technology                       |
| -------------- | -------------------------------- |
| Frontend       | React, JavaScript, HTML5, CSS3   |
| Backend        | ASP.NET Core 8.0 Web API (C#)    |
| Database       | PostgreSQL                       |
| ORM            | Entity Framework Core            |
| Authentication | JWT-based authentication         |
| Payments       | PayPal API |
| Notifications  | SendGrid Email API               |

---

## 🔐 Security Measures

* HTTPS communication
* JWT authentication & authorization
* Role-based access control
* Secure payment verification
* Input validation and error handling
* Payment logging and audit trails

---

## 🧪 Testing & Quality Assurance

* Unit testing of API services
* Integration testing of payment workflows
* Validation of authentication & authorization
* Manual UI testing of React frontend

---

## 🚀 Installation & Setup

### Prerequisites

* .NET SDK 8.0
* Node.js (for React)
* PostgreSQL

### Backend Setup

```bash
git clone https://github.com/Hugues6221394/CharityHub.git
cd StudentCharityHub.Api
dotnet restore
dotnet ef database update
dotnet run
```

### Frontend Setup

```bash
cd student-charity-hub-frontend
npm install
npm start
```

---

## 📈 Expected Impact

* Increased donor trust through transparency
* Reduced student dropout rates
* Sustainable sponsorship relationships
* Measurable educational outcomes

---

## 🌍 Vision

> *A future where no student abandons education due to financial hardship, and every donor sees the real impact of their generosity.*

---

## 📜 License

This project is licensed under the **MIT License**.

---

