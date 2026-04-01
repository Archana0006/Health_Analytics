# Digital Health Analytics Platform

## Project Overview
The Digital Health Analytics platform is a comprehensive, full-stack web application designed to streamline healthcare management. It bridges the gap between patients, doctors, and healthcare administrators by providing a centralized system for scheduling appointments, managing medical records, handling lab tests, and viewing advanced predictive health analytics powered by machine learning.

## Features
- **Role-Based Access Control:** Secure, customized dashboards for Patients, Doctors, and Admins.
- **Smart Scheduling:** Interactive appointment booking system with real-time status tracking and notifications.
- **Electronic Health Records (EHR):** Secure storage and retrieval of patient medical histories, lab results, and prescriptions.
- **Predictive Health Analytics:** Integration with an ML service to predict risks for cardiovascular diseases, diabetes, and other critical conditions based on patient vitals.
- **Responsive & Modern UI:** A fully responsive, dark-mode premium interface featuring glassmorphism, fluid animations (Framer Motion), and toast notifications.
- **Advanced Data Handling:** Real-time search, robust filtering, and data pagination for seamless handling of large datasets.
- **Document Management:** Secure upload, storage, and retrieval of medical documents and lab reports.

## Tech Stack
### Frontend
- React.js (Vite)
- Tailwind CSS
- Framer Motion (Animations)
- Zustand (State Management)
- TanStack React Query (Data Fetching & Caching)
- Axios (HTTP Client)
- React Hot Toast (Notifications)
- Chart.js (Data Visualization)

### Backend
- Node.js & Express.js
- MongoDB & Mongoose (Database & ODM)
- JWT (Authentication)
- Socket.io (Real-time Notifications)
- Swagger (API Documentation)
- PDFKit (Report Generation)

### Machine Learning (Microservice)
- Python (Flask/FastAPI)
- Scikit-learn (Predictive Models)

## Installation Instructions

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally or an Atlas connection string
- Python 3.x (for ML service)

### Backend Setup
1. Navigate to the `backend` directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/health-analytics
   JWT_SECRET=your_secret_key
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the server: `npm start` (or `npm run dev` for nodemon)

### Frontend Setup
1. Navigate to the `frontend` directory: `cd frontend`
2. Install dependencies: `npm install`
3. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the development server: `npm run dev`

### ML Service Setup
1. Navigate to the ML directory: `cd ml-service` (or corresponding folder)
2. Install Python dependencies: `pip install -r requirements.txt`
3. Start the service (usually runs on port 5001).

## Deployment URLs
- **Frontend (Vercel):** [Insert Vercel URL here]
- **Backend (Render):** [Insert Render URL here]
- **API Documentation:** [Insert Render URL here]/api-docs

## Screenshots
*(Insert screenshots of your application here before submission)*
- `Screenshot 1: Patient Dashboard`
- `Screenshot 2: Appointment Booking`
- `Screenshot 3: Predictive Analytics ML Charts`
