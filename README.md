# Dayflow – Human Resource Management System (HRMS)

**Every workday, perfectly aligned.**

Dayflow is a modern Human Resource Management System (HRMS) designed to digitize and streamline core HR operations such as employee onboarding, profile management, attendance tracking, leave management, payroll visibility, and approval workflows for Admins and HR officers.

---

HRMS-DayFlow/
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
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── toast.tsx
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
│   ├── pages/
│   │   ├── admin/
│   │   └── employee/
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── supabase/
│   ├── migrations/
│   └── config.toml
│
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── README.md

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
