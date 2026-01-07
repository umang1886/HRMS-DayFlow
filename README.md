<div align="center">

# 💼 HRMS-DayFlow

### Smart Human Resource Management System
---
[![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![n8n](https://img.shields.io/badge/n8n-Automation-FF6D00?style=for-the-badge&logo=n8n)](https://n8n.io/)

A modern HRMS platform for employee management, attendance tracking, leave approvals, payroll visibility,  
and automated HR workflows for Admins and Employees.

</div>

---

## Dayflow – Human Resource Management System (HRMS)

**Every workday, perfectly aligned.**

Dayflow is a modern Human Resource Management System (HRMS) designed to digitize and streamline core HR operations such as employee onboarding, profile management, attendance tracking, leave management, payroll visibility, and approval workflows for Admins and HR officers.

---

## 📁 Project Structure

```
HRMS-DayFlow/
│
├── public/
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
│
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   ├── ui/
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── aspect-ratio.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── command.tsx
│   │   │   ├── context-menu.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── hover-card.tsx
│   │   │   ├── input-otp.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── resizable.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── stat-card.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   ├── toggle.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── use-toast.ts
│   │   │
│   │   └── NavLink.tsx
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx
│   │
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── types.ts
│   │
│   ├── lib/
│   │   └── utils.ts
│   │
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Attendance.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Employees.tsx
│   │   │   ├── Leaves.tsx
│   │   │   ├── Payroll.tsx
│   │   │   └── Reports.tsx
│   │   │
│   │   ├── employee/
│   │   │   ├── Attendance.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Leaves.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── Reports.tsx
│   │   │
│   │   ├── Auth.tsx
│   │   ├── Index.tsx
│   │   └── NotFound.tsx
│   │
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── supabase/
│   ├── migrations/
│   │   ├── 20260103092634_*.sql
│   │   └── 20260103092644_*.sql
│   │
│   └── config.toml
│
├── .env
├── .gitignore
├── bun.lockb
├── components.json
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```
---

## 🚀 Features

### 🔐 Authentication & Authorization

* Secure **Sign Up / Sign In**
* Email-based authentication
* Role-based access control (**Admin/HR** and **Employee**)
* Password security rules and validation

### 👤 User Roles

#### Admin / HR Officer

* Manage employees
* View and approve attendance
* Approve or reject leave requests
* View and manage payroll details
* Access reports and analytics

#### Employee

* View personal profile and job details
* Check attendance (daily/weekly)
* Apply for leave and track status
* View salary/payroll details (read-only)

---

## 📊 Dashboard

### Employee Dashboard

* Quick access to:

  * Profile
  * Attendance
  * Leave Requests
  * Logout
* Recent activity and notifications

### Admin / HR Dashboard

* Employee list management
* Attendance records overview
* Leave approval panel
* Ability to switch between employees

---

## 🧾 Employee Profile Management

### View Profile

Employees can view:

* Personal information
* Job details
* Salary structure
* Uploaded documents
* Profile picture

### Edit Profile

* Employees: Limited fields (address, phone number, profile picture)
* Admin/HR: Full access to edit employee details

---

## ⏱️ Attendance Management

### Attendance Tracking

* Daily and weekly attendance views
* Check-in / Check-out functionality
* Attendance status types:

  * Present
  * Absent
  * Half-day
  * Leave

### Attendance Visibility

* Employees: View only their own attendance
* Admin/HR: View attendance of all employees

---

## 🏖️ Leave & Time-Off Management

### Apply for Leave (Employee)

* Select leave type:

  * Paid Leave
  * Sick Leave
  * Unpaid Leave
* Choose date range
* Add remarks
* Track leave status:

  * Pending
  * Approved
  * Rejected

### Leave Approval (Admin/HR)

* View all leave requests
* Approve or reject leave
* Add comments
* Real-time updates in employee records

---

## 💰 Payroll & Salary Management

### Employee Payroll View

* Read-only access to salary and payroll details

### Admin Payroll Control

* View payroll of all employees
* Update salary structure
* Ensure payroll accuracy
* Email and notification alerts

---

## 📈 Reports & Analytics

* Attendance reports
* Salary slips
* Payroll summaries
* HR analytics dashboard

---

## 🛠️ System Scope

* Secure authentication system
* Role-based dashboards
* Employee lifecycle management
* Attendance and leave automation
* Payroll transparency

---

## 🔄 Leave Approval Automation

* The Leave Approval process is automated using **n8n**.
* When an Admin or HR approves or rejects a leave request from the Admin Panel, an **n8n Webhook** is triggered automatically.
* Leave request details are sent to the workflow and stored in **Google Sheets** for record management.
* Based on the leave status (Approved or Rejected), an automated **email notification** is sent to the respective employee.
* This ensures real-time updates and removes the need for manual email communication.

### Automation Flow

* Admin approves or rejects leave request
* n8n webhook is triggered
* Leave data is processed
* Record is stored in Google Sheet
* Email notification is sent to employee
  * Approved → Approval email
  * Rejected → Rejection email
   
---


## 🧩 Future Enhancements

* Advanced analytics and insights
* Automated payroll generation
* Integration with third-party tools
* Performance management module
* Mobile application support

---

## 📐 System Design

* Initial system flow and UI wireframes created using **Excalidraw**

---

## 📌 Project Purpose

The goal of Dayflow is to replace manual HR processes with a centralized, secure, and user-friendly digital platform that improves efficiency, transparency, and accuracy in HR operations.

---

## 📄 License

This project is developed for academic and learning purposes. Licensing details can be added as per project requirements.

---

**Developed with ❤️ for efficient HR management.**
