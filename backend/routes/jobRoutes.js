// Job Routes - Handles job/internship postings

const express = require('express');
const router = express.Router();
const jobModel = require('../models/jobModel');
const userModel = require('../models/userModel');

// ===== CREATE JOB POSTING =====
// POST /api/jobs
// Post a new job/internship (only recruiters can do this)
router.post('/', (req, res) => {
  try {
    const { title, description, company, salary, location, jobType, recruiterId } = req.body;

    // Validation
    if (!title || !description || !company || !location || !jobType || !recruiterId) {
      return res
        .status(400)
        .json({ error: 'Please fill in all required fields' });
    }

    // Verify recruiter exists
    const recruiter = userModel.findUserById(recruiterId);
    if (!recruiter || recruiter.userType !== 'recruiter') {
      return res
        .status(403)
        .json({ error: 'Only recruiters can post jobs' });
    }

    // Create job
    const newJob = jobModel.createJob(
      {
        title,
        description,
        company,
        salary,
        location,
        jobType, // 'internship' or 'job'
      },
      recruiterId
    );

    res.status(201).json({
      message: 'Job posted successfully!',
      job: newJob,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error posting job' });
  }
});

// ===== GET ALL JOBS =====
// GET /api/jobs
// Get all available job postings
router.get('/', (req, res) => {
  try {
    const allJobs = jobModel.getAllJobs();

    res.status(200).json({
      message: 'Jobs retrieved successfully!',
      jobs: allJobs,
      totalJobs: allJobs.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching jobs' });
  }
});

// ===== GET RECRUITER'S JOBS =====
// GET /api/jobs/recruiter/:recruiterId
// Get all jobs posted by a specific recruiter
// NOTE: This must come BEFORE /:id route to match correctly
router.get('/recruiter/:recruiterId', (req, res) => {
  try {
    const recruiterId = parseFloat(req.params.recruiterId);

    // Verify recruiter exists
    const recruiter = userModel.findUserById(recruiterId);
    if (!recruiter || recruiter.userType !== 'recruiter') {
      return res.status(403).json({ error: 'User is not a recruiter' });
    }

    const recruiterJobs = jobModel.getJobsByRecruiterId(recruiterId);

    res.status(200).json({
      message: 'Recruiter jobs retrieved successfully!',
      jobs: recruiterJobs,
      totalJobs: recruiterJobs.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching recruiter jobs' });
  }
});

// ===== GET JOB BY ID =====
// GET /api/jobs/:id
// Get a specific job by ID
// NOTE: This comes AFTER specific routes like /recruiter/:id
router.get('/:id', (req, res) => {
  try {
    const jobId = parseFloat(req.params.id);
    const job = jobModel.findJobById(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching job' });
  }
});

// ===== UPDATE JOB =====
// PUT /api/jobs/:id
// Update a job posting
router.put('/:id', (req, res) => {
  try {
    const jobId = parseFloat(req.params.id);
    const { title, description, salary, location } = req.body;

    const job = jobModel.findJobById(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Update only provided fields
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (salary) updateData.salary = salary;
    if (location) updateData.location = location;

    const updatedJob = jobModel.updateJob(jobId, updateData);

    res.status(200).json({
      message: 'Job updated successfully!',
      job: updatedJob,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating job' });
  }
});

// ===== DELETE JOB =====
// DELETE /api/jobs/:id
// Delete a job posting
router.delete('/:id', (req, res) => {
  try {
    const jobId = parseFloat(req.params.id);

    const job = jobModel.findJobById(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const deleted = jobModel.deleteJob(jobId);

    if (deleted) {
      res.status(200).json({ message: 'Job deleted successfully!' });
    } else {
      res.status(500).json({ error: 'Failed to delete job' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting job' });
  }
});

module.exports = router;
