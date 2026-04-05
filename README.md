# Smart Internship Tracker

A beginner-friendly full-stack web application for managing internship and job postings, applications, and tracking. Built with Node.js, Express, and simple HTML/JavaScript frontend using REST APIs.

## Project Overview

This project is designed as a college software engineering experiment based on UML Class Diagrams and Sequence Diagrams for a Job/Internship Portal. It demonstrates:

- Full-stack web development with Node.js and Express
- REST API design principles
- Frontend-Backend communication using Fetch API
- MVC architecture pattern
- In-memory data storage (no database required for this beginner level)

## Features

### For Students:
- User registration and login
- Browse all available internship/job postings
- Apply for jobs with resume and cover letter
- Track application status (pending, under-review, accepted, rejected)
- Update profile/resume information
- View all submitted applications

### For Recruiters:
- User registration and login
- Post new internship/job opportunities
- View posted jobs and applications received
- Update application status after review
- Manage job postings (update/delete)

## Technology Stack

- **Backend:** Node.js with Express.js
- **Frontend:** HTML5 + CSS3 + Vanilla JavaScript
- **API Communication:** Fetch API (REST)
- **Data Storage:** In-memory arrays (no database)
- **Styling:** Modern CSS with Flexbox and CSS Grid

## Project Structure

```
Smart-internship-tracker/
│
├── backend/
│   ├── server.js                 # Main Express server
│   ├── routes/
│   │   ├── userRoutes.js        # User registration & login endpoints
│   │   ├── jobRoutes.js         # Job posting endpoints
│   │   └── applicationRoutes.js # Application submission endpoints
│   └── models/
│       ├── userModel.js         # User data management
│       ├── jobModel.js          # Job data management
│       └── applicationModel.js  # Application data management
│
├── frontend/
│   ├── index.html               # Home page
│   ├── login.html               # Login page
│   ├── dashboard.html           # User dashboard
│   ├── postJob.html             # Job posting form (recruiters)
│   └── applyJob.html            # Job application form (students)
│
├── package.json                 # Node.js dependencies
└── README.md                    # This file
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone or download the project**
   ```bash
   cd Smart-internship-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   npm start
   ```
   OR for development with auto-reload:
   ```bash
   npm run dev
   ```

   The server will start at: **http://localhost:3000**

2. **Open the frontend in your browser**
   - Navigate to: **http://localhost:3000/frontend/index.html**
   - OR open: `frontend/index.html` directly in your browser (note: you may need to use a local server for full functionality)

## API Endpoints

### User Routes (`/api/users`)
- `POST /register` - Register a new user (student or recruiter)
- `POST /login` - Login user
- `GET /profile/:id` - Get user profile
- `PUT /profile/:id/resume` - Update user resume

### Job Routes (`/api/jobs`)
- `POST /` - Post a new job (recruiters only)
- `GET /` - Get all jobs
- `GET /:id` - Get job by ID
- `GET /recruiter/:recruiterId` - Get jobs posted by recruiter
- `PUT /:id` - Update job post
- `DELETE /:id` - Delete job post

### Application Routes (`/api/applications`)
- `POST /` - Submit job application
- `GET /` - Get all applications
- `GET /:id` - Get application by ID
- `GET /job/:jobId` - Get applications for a job
- `GET /student/:studentId` - Get applications from a student
- `PUT /:id/status` - Update application status

## User Workflow

### Student Workflow:
1. Register as "student"
2. Login with credentials
3. Browse available jobs on dashboard
4. Click "Apply Now" on desired job
5. Enter resume and cover letter
6. Submit application
7. View application status in "My Applications"
8. Update profile when needed

### Recruiter Workflow:
1. Register as "recruiter"
2. Login with credentials
3. Click "Post Job" to create new posting
4. Fill job details (title, company, location, salary, description)
5. Post the job
6. View posted jobs and received applications on dashboard
7. Review applications and update their status (pending → under-review → accepted/rejected)

## Example API Requests

### Register a Student
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "userType": "student"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Post a Job (Recruiter)
```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Frontend Developer Internship",
    "company": "Tech Corp",
    "jobType": "internship",
    "location": "New York, USA",
    "salary": "$5000/month",
    "description": "Looking for frontend developer...",
    "recruiterId": 1234567890.123456
  }'
```

### Apply for a Job (Student)
```bash
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": 1234567890.123456,
    "studentId": 9876543210.654321,
    "resume": "I am a developer with 2 years experience...",
    "coverLetter": "I am interested in this role..."
  }'
```

## Important Notes for Beginners

### Security Notice:
⚠️ **This is a beginner/educational project. For production:**
- Use proper password hashing (bcrypt)
- Implement database (MongoDB, PostgreSQL)
- Use environment variables for sensitive data
- Add input validation and sanitization
- Implement authentication tokens (JWT)
- Use HTTPS

### In-Memory Storage:
- All data is stored in memory and will be lost when server restarts
- Perfect for learning and testing, but not suitable for production
- To persist data, implement a real database

## Testing with Sample Data

1. **Create a test recruiter:**
   - Register with name: "Tech Company"
   - Email: recruiter@tech.com
   - Password: pass123
   - User Type: recruiter

2. **Create a test student:**
   - Register with name: "Student Name"
   - Email: student@email.com
   - Password: pass123
   - User Type: student

3. **Post a test job:**
   - Login as recruiter
   - Go to "Post Job"
   - Fill in job details and submit

4. **Apply for test job:**
   - Login as student
   - Go to "Apply for Job"
   - Select the job and submit application

## Frontend Pages

### index.html
- Home page with welcome message
- Features overview
- Login button to get started

### login.html
- Email and password input
- Calls `/api/users/login` endpoint
- Stores user details in localStorage
- Redirects to dashboard on successful login

### dashboard.html
- Main user interface
- Different UI based on user type (student/recruiter)
- Dynamic content loading
- Application status tracking

### postJob.html
- Job posting form (recruiters only)
- Form validation
- Calls `/api/jobs` endpoint

### applyJob.html
- Job application form (students only)
- Job details display
- Resume and cover letter inputs
- Application submission

## Troubleshooting

### "Cannot GET /frontend/index.html"
- Make sure server is running (`npm start`)
- Check that you're navigating to correct URL

### "Failed to fetch" errors
- Verify backend server is running
- Check that API endpoints are correct
- Ensure CORS is enabled (it is by default)

### Data not persisting
- This is expected - data is in-memory
- It resets when you restart the server
- Re-register users and post jobs after server restart

## Learning Outcomes

By studying this project, you'll learn:

1. **Backend Development:**
   - Express.js routing and middleware
   - RESTful API design
   - MVC architecture
   - Data validation and error handling

2. **Frontend Development:**
   - HTML form handling
   - Fetch API for HTTP requests
   - DOM manipulation
   - LocalStorage for client-side data
   - CSS styling and responsive design

3. **Full-Stack Integration:**
   - Frontend-backend communication
   - CORS and HTTP headers
   - Request/response handling
   - JSON data format

## Future Enhancements

To extend this project:

1. Add a database (MongoDB, PostgreSQL)
2. Implement user authentication with JWT
3. Add password hashing with bcrypt
4. Create admin dashboard
5. Add email notifications
6. Implement search and filtering
7. Add pagination for job listings
8. Create user profile pictures
9. Add file upload for resumes (PDF/Word)
10. Implement real-time notifications

## License

ISC License - Feel free to use and modify for educational purposes.

## Contact & Support

For questions or issues, refer to the code comments or check:
- Express.js Documentation: https://expressjs.com
- MDN Web Docs: https://developer.mozilla.org
- Node.js Documentation: https://nodejs.org/docs

---

Happy Learning! 🚀
