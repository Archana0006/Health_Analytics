# Viva Preparation Notes: Digital Health Analytics

## 1. Explanation of Project Architecture
**Q: Can you explain the overall architecture of your application?**
*Answer:* I used a traditional Client-Server (Three-Tier) architecture. The presentation layer is a React Single Page Application (SPA). The application or logic layer is a RESTful API built with Node.js and Express. The data layer uses MongoDB for NoSQL storage. I also have a microservice architectural element: a standalone Python ML service that calculates health risks based on patient vitals.

## 2. Explanation of Frontend and Backend Structure
**Q: How is your code organized on the frontend and backend?**
*Answer:* 
- **Frontend:** It's compartmentalized. I have `pages` for main views, `components` for reusable UI elements (like Navbar or Cards), `context` for global settings (like AuthContext), and `hooks` for decoupled API logic (React Query). 
- **Backend:** I used the MVC (Model-View-Controller) pattern, though the 'View' is handled by React. `models` house the Mongoose schemas. `routes` handle the endpoint URL mapping. `controllers` handle the actual business logic to keep the routes clean. `middleware` handles auth and error catching.

## 3. Explanation of Database Schema
**Q: Why did you choose MongoDB, and how did you design your schemas?**
*Answer:* I chose MongoDB because healthcare data can be unstructured or highly variable (like arbitrary lab test attributes). My main collections are `User` (for authentication), `Patient` (for extended profile data), `Appointment`, and `MedicalRecord`. I used `ObjectId` references (population) to link these collections—for example, an Appointment document stores the `patientId` and `doctorId` as references rather than duplicating data.

## 4. Explanation of Deployment Process
**Q: Tell me how this project is deployed.**
*Answer:* To handle cloud-native deployment, I split the stack. The frontend is deployed to Vercel, which optimizes static assets and handles edge caching globally. The backend runs on Render, which natively spins up Node.js environments. Both services communicate securely using environment variables (`FRONTEND_URL` and `VITE_API_URL`). The database sits on MongoDB Atlas.

---

## 5. Common Viva Questions & Answers

### Q: How do you manage application state in React?
*Answer:* For global client state (like the UI sidebar toggle or small session details), I use **Zustand** because it's lighter and less boilerplate-heavy than Redux. For server-state (like fetching patient lists or records), I use **TanStack React Query**, which automatically handles caching, background refetching, and loading states.

### Q: How did you implement security in this application?
*Answer:* 
1. **Authentication:** I use bcrypt to hash passwords before storing them. When a user logs in, the server signs a JSON Web Token (JWT) referencing their User ID.
2. **Authorization:** I wrote custom middleware that checks `req.user.role`.
3. **HTTP Protections:** I use `Helmet.js` to set secure HTTP headers and `express-rate-limit` to prevent brute-force API requests.

### Q: Why did you implement `.lean()` in your backend queries?
*Answer:* By default, Mongoose returns massive, heavy Mongoose Document objects that include save/update methods. Using `.lean()` tells Mongoose to return plain JavaScript objects instead. Since I only need to *read* and send data to the frontend in these specific `GET` routes, `.lean()` drastically reduces memory overhead and speeds up the response time.

### Q: How does your UI handle different devices?
*Answer:* I used Tailwind CSS utility classes. The design is explicitly "Mobile-First". I use breakpoints like `md:` and `lg:` to alter the display properties. For example, the sidebar is fixed on Desktop, but transforms into an off-canvas drawer accessed via a hamburger menu on smaller screens. 

### Q: How did you handle Code Splitting in the frontend?
*Answer:* I wrapped my heavy route components inside `React.lazy()` and surrounded the main `<Routes>` block with `<Suspense>`. This means the browser doesn't download the entire React application bundle at once. It only fetches the JavaScript for the specific page the user is navigating to, leading to a much faster initial load.
