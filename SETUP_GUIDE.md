# Digital Health Analytics System - Setup Guide

## Quick Start

### 1. Start the Application

Run the batch script to start all services:

```bash
.\run_project.bat
```

This will start:
- **Backend API**: http://localhost:5000
- **ML Service**: http://localhost:5001
- **Frontend**: http://localhost:5173

### 2. Access the Application

Open your browser and navigate to: **http://localhost:5173**

### 3. Login Credentials

**Patient Account:**
- Email: `patient@demo.com`
- Password: `password`

**Doctor Account:**
- Email: `doctor@demo.com`
- Password: `password`

**Admin Account:**
- Email: `admin@demo.com`
- Password: `password`

---

## Available Doctors for Appointments

The system includes **6 doctors** available for appointment booking:

1. **Demo Doctor** - General Practice
2. **Dr. Sarah Johnson** - Cardiology
3. **Dr. Michael Chen** - Endocrinology
4. **Dr. Emily Rodriguez** - General Medicine
5. **Dr. James Wilson** - Neurology
6. **Dr. Priya Patel** - Pediatrics

> **Note**: If the doctor dropdown appears empty, simply refresh your browser page (F5) to reload the list.

---

## Features

### For Patients
- ✅ **Dashboard** - View AI health score, reminders, and alerts
- ✅ **Medical Records** - Add, edit, delete health records with file uploads
- ✅ **Appointments** - Book appointments with available doctors
- ✅ **Disease Prediction** - AI predictions for diabetes, heart disease, hypertension, anemia
- ✅ **Analytics** - Visualize health trends over time
- ✅ **Settings** - Manage profile and preferences

### For Doctors
- ✅ **Dashboard** - View patient statistics and critical alerts
- ✅ **Appointments** - Manage appointment requests (approve/reject/complete)
- ✅ **Patient Records** - Access patient health records
- ✅ **Critical Patients** - Monitor high-risk patients

### For Admins
- ✅ **Dashboard** - System-wide statistics
- ✅ **User Management** - View all users and system activity
- ✅ **System Alerts** - Monitor system-wide health alerts

---

## Database Management

### Re-seed Doctors

If you need to add the sample doctors again:

```bash
node backend\seed_doctors.js
```

### Full Database Reset

To reset the entire database with demo data:

```bash
node backend\seed.js
```

> **Warning**: This will delete all existing data including users, records, and appointments.

---

## Troubleshooting

### Doctor Dropdown is Empty
**Solution**: Refresh your browser page (F5 or Ctrl+R)

### Services Not Starting
**Solution**: Make sure MongoDB is running and ports 5000, 5001, and 5173 are available

### ML Service Errors
**Solution**: The system has fallback heuristic scoring if ML service is offline

---

## System Verification

Run the verification script to check all services:

```bash
node verify_system.js
```

Expected output:
- ✅ ML Service: Connected
- ✅ Backend: Online

---

## Technology Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **ML Service**: Python Flask
- **Authentication**: JWT
- **Charts**: Chart.js
