// Application Model - Stores job/internship applications in JSON file
const fs = require('fs');
const path = require('path');

// Path to the JSON file
const dbPath = path.join(__dirname, '../database/applications.json');

// Function to read all applications from JSON file
const getAllApplications = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading applications:', error);
    return [];
  }
};

// Function to write applications to JSON file
const saveApplications = (applications) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(applications, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving applications:', error);
    return false;
  }
};

// Function to find application by ID
const findApplicationById = (id) => {
  const applications = getAllApplications();
  return applications.find((app) => app.id === parseInt(id));
};

// Function to get applications for a specific job
const getApplicationsByJobId = (jobId) => {
  const applications = getAllApplications();
  return applications.filter((app) => app.jobId === parseInt(jobId));
};

// Function to get applications from a specific student
const getApplicationsByStudentId = (studentId) => {
  const applications = getAllApplications();
  return applications.filter((app) => app.studentId === parseInt(studentId));
};

// Function to create a new application
const createApplication = (applicationData) => {
  const applications = getAllApplications();

  // Generate next ID
  const maxId = applications.length > 0 ? Math.max(...applications.map(a => a.id)) : 0;

  const newApplication = {
    id: maxId + 1,
    jobId: parseInt(applicationData.jobId),
    studentId: parseInt(applicationData.studentId),
    studentName: applicationData.studentName || '',
    jobTitle: applicationData.jobTitle || '',
    company: applicationData.company || '',
    coverLetter: applicationData.coverLetter || '',
    status: 'applied', // 'applied', 'under-review', 'accepted', 'rejected'
    appliedDate: new Date().toISOString().split('T')[0],
    appliedTime: new Date().toLocaleTimeString(),
  };

  applications.push(newApplication);
  saveApplications(applications);
  return newApplication;
};

// Function to update application status
const updateApplicationStatus = (id, newStatus) => {
  const applications = getAllApplications();
  const applicationIndex = applications.findIndex((app) => app.id === parseInt(id));

  if (applicationIndex === -1) return null;

  applications[applicationIndex].status = newStatus;
  saveApplications(applications);
  return applications[applicationIndex];
};

// Function to check if a student already applied for a job
const hasStudentApplied = (jobId, studentId) => {
  const applications = getAllApplications();
  return applications.some(
    (app) => app.jobId === parseInt(jobId) && app.studentId === parseInt(studentId)
  );
};

// Export all functions
module.exports = {
  createApplication,
  getAllApplications,
  findApplicationById,
  getApplicationsByJobId,
  getApplicationsByStudentId,
  updateApplicationStatus,
  hasStudentApplied,
  saveApplications,
};
