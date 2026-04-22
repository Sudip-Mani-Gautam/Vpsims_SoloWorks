# Project Overview: VPSIMS Nexus

## 1. Purpose
The **Vehicle Parts Selling & Inventory Management System (VPSIMS)** is a specialized ERP solution designed to automate the operations of a modern automotive parts distributor. It bridges the gap between complex inventory logistics and customer-facing sales operations, ensuring data integrity across procurement, warehousing, and distribution channels.

## 2. Scope
The system encompasses four distinct operational domains:
- **Administrative Control**: Managing personnel (Staff/Admin), Vendors, and high-level financial strategy.
- **Inventory Logistics**: Real-time tracking of parts, categorization, and automated stock replenishment monitoring.
- **Sales Nexus**: Facilitating transactions with automated loyalty calculation and professional PDF invoice generation.
- **Customer Ecosystem**: Enabling self-service profiling, vehicle asset linking, and historical transaction transparency.

## 3. Objectives
- **Operational Automation**: Eliminating manual errors in stock tracking and invoice generation.
- **Financial Transparency**: Providing real-time revenue stats and elite-spender insights.
- **Customer Retention**: Driving repeat business through an integrated 10% Loyalty Program and automated credit reminders via Hangfire.
- **System Stability**: Ensuring a secure, role-based access environment with a premium, responsive UI/UX theme engine.

## 4. Technology Stack
- **Backend**: .NET 9 Web API, Entity Framework Core, PostgreSQL.
- **Frontend**: React, Vite, Tailwind CSS, Shadcn UI.
- **Automation**: Hangfire (Background Jobs), QuestPDF (Document Generation).
- **Communication**: IEmailService (Transactional SMTP distribution).
