// Job Model - Stores job/internship postings in JSON file
const fs = require('fs');
const path = require('path');

// Path to the JSON file
const dbPath = path.join(__dirname, '../database/jobs.json');

// Function to read all jobs from JSON file
const getAllJobs = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading jobs:', error);
    return [];
  }
};

// Function to write jobs to JSON file
const saveJobs = (jobs) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(jobs, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving jobs:', error);
    return false;
  }
};

// Function to find job by ID
const findJobById = (id) => {
  const jobs = getAllJobs();
  return jobs.find((job) => job.id === parseInt(id));
};

// Function to get jobs posted by a specific recruiter
const getJobsByRecruiterId = (recruiterId) => {
  const jobs = getAllJobs();
  return jobs.filter((job) => job.recruiterId === parseInt(recruiterId));
};

// Function to create a new job posting
const createJob = (jobData, recruiterId) => {
  const jobs = getAllJobs();

  // Generate next ID
  const maxId = jobs.length > 0 ? Math.max(...jobs.map(j => j.id)) : 0;

  const newJob = {
    id: maxId + 1,
    title: jobData.title,
    description: jobData.description,
    company: jobData.company,
    location: jobData.location,
    stipend: jobData.stipend || 'Not specified',
    duration: jobData.duration || '3 months',
    skills: jobData.skills || [],
    recruiterId: parseInt(recruiterId),
    postedDate: new Date().toISOString().split('T')[0],
    deadline: jobData.deadline || '',
    applicationsCount: 0,
  };

  jobs.push(newJob);
  saveJobs(jobs);
  return newJob;
};

// Function to update job
const updateJob = (id, updateData) => {
  const jobs = getAllJobs();
  const jobIndex = jobs.findIndex((job) => job.id === parseInt(id));

  if (jobIndex === -1) return null;

  jobs[jobIndex] = {
    ...jobs[jobIndex],
    ...updateData,
    id: jobs[jobIndex].id, // Don't change ID
    recruiterId: jobs[jobIndex].recruiterId, // Don't change recruiter
  };

  saveJobs(jobs);
  return jobs[jobIndex];
};

// Function to delete job
const deleteJob = (id) => {
  const jobs = getAllJobs();
  const index = jobs.findIndex((job) => job.id === parseInt(id));

  if (index > -1) {
    jobs.splice(index, 1);
    saveJobs(jobs);
    return true;
  }
  return false;
};

// Export all functions
module.exports = {
  createJob,
  getAllJobs,
  findJobById,
  getJobsByRecruiterId,
  updateJob,
  deleteJob,
  saveJobs,
};
