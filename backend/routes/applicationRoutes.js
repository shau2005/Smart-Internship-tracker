// Application Routes - Handles job/internship applications

const express = require('express');
const router = express.Router();
const applicationModel = require('../models/applicationModel');
const jobModel = require('../models/jobModel');
const userModel = require('../models/userModel');

// ===== APPLY FOR A JOB =====
// POST /api/applications
// Student applies for a job/internship
router.post('/', (req, res) => {
  try {
    const { jobId, studentId, resume, coverLetter } = req.body;

    // Validation
    if (!jobId || !studentId || !resume) {
      return res
        .status(400)
        .json({ error: 'Please provide jobId, studentId, and resume' });
    }

    // Verify student exists and is a student
    const student = userModel.findUserById(studentId);
    if (!student || student.userType !== 'student') {
      return res
        .status(403)
        .json({ error: 'Only students can apply for jobs' });
    }

    // Verify job exists
    const job = jobModel.findJobById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if student already applied
    if (applicationModel.hasStudentApplied(jobId, studentId)) {
      return res
        .status(400)
        .json({ error: 'You have already applied for this job' });
    }

    // Create application
    const newApplication = applicationModel.createApplication({
      jobId,
      studentId,
      studentName: student.name,
      jobTitle: job.title,
      company: job.company,
      coverLetter,
    });

    // Increment applicant count for the job
    jobModel.updateJob(jobId, { applicationsCount: (job.applicationsCount || 0) + 1 });

    res.status(201).json({
      message: 'Application submitted successfully!',
      application: newApplication,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error submitting application' });
  }
});

// ===== GET ALL APPLICATIONS =====
// GET /api/applications
// Get all applications (for admin/testing purposes)
router.get('/', (req, res) => {
  try {
    const allApplications = applicationModel.getAllApplications();

    res.status(200).json({
      message: 'Applications retrieved successfully!',
      applications: allApplications,
      totalApplications: allApplications.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching applications' });
  }
});

// ===== GET APPLICATIONS FOR A JOB =====
// GET /api/applications/job/:jobId
// Get all applications for a specific job (for recruiters)
// NOTE: This must come BEFORE /:id route to match correctly
router.get('/job/:jobId', (req, res) => {
  try {
    const jobId = parseFloat(req.params.jobId);

    // Verify job exists
    const job = jobModel.findJobById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const jobApplications = applicationModel.getApplicationsByJobId(jobId);

    res.status(200).json({
      message: 'Job applications retrieved successfully!',
      jobId: jobId,
      applications: jobApplications,
      totalApplications: jobApplications.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching job applications' });
  }
});

// ===== GET APPLICATIONS FROM A STUDENT =====
// GET /api/applications/student/:studentId
// Get all applications submitted by a student
// NOTE: This must come BEFORE /:id route to match correctly
router.get('/student/:studentId', (req, res) => {
  try {
    const studentId = parseFloat(req.params.studentId);

    // Verify student exists
    const student = userModel.findUserById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const studentApplications = applicationModel.getApplicationsByStudentId(
      studentId
    );

    res.status(200).json({
      message: 'Student applications retrieved successfully!',
      studentId: studentId,
      applications: studentApplications,
      totalApplications: studentApplications.length,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Server error fetching student applications' });
  }
});

// ===== GET APPLICATION BY ID =====
// GET /api/applications/:id
// Get a specific application
// NOTE: This comes AFTER specific routes like /job/:id and /student/:id
router.get('/:id', (req, res) => {
  try {
    const applicationId = parseFloat(req.params.id);
    const application = applicationModel.findApplicationById(applicationId);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching application' });
  }
});

// ===== UPDATE APPLICATION STATUS =====
// PUT /api/applications/:id/status
// Update application status (recruiter updates after reviewing)
router.put('/:id/status', (req, res) => {
  try {
    const applicationId = parseFloat(req.params.id);
    const { newStatus } = req.body;

    // Validate status
    const validStatuses = ['pending', 'accepted', 'rejected', 'under-review'];
    if (!newStatus || !validStatuses.includes(newStatus)) {
      return res
        .status(400)
        .json({
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
    }

    const application = applicationModel.findApplicationById(applicationId);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const updatedApplication = applicationModel.updateApplicationStatus(
      applicationId,
      newStatus
    );

    res.status(200).json({
      message: 'Application status updated successfully!',
      application: updatedApplication,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating application status' });
  }
});

module.exports = router;
