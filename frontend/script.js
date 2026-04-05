// ======================================================
// SMART INTERNSHIP TRACKER - JAVASCRIPT (IMPROVED)
// ======================================================

// ====== CONSTANTS ======
const STORAGE_KEY = 'applications'; // UNIFIED: Contains all applications from both interns and recruiters
const JOBS_STORAGE_KEY = 'jobs';

// ====== ROLE-BASED ACCESS CONTROL ======

function checkAuthAndRole() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function checkRoleAccess(requiredRole) {
    const userRole = localStorage.getItem('role');
    const currentPage = getCurrentPage();
    
    // Pages accessible by interns
    const internPages = ['index.html', 'add.html', 'detail.html', 'profile.html', 'browse-jobs.html', ''];
    
    // Pages accessible by recruiters
    const recruiterPages = ['company.html', 'applicant.html'];
    
    if (userRole === 'intern' && !internPages.includes(currentPage)) {
        window.location.href = 'index.html';
        return false;
    }
    
    if (userRole === 'recruiter' && !recruiterPages.includes(currentPage)) {
        window.location.href = 'company.html';
        return false;
    }
    
    return true;
}

function getUserRole() {
    return localStorage.getItem('role') || 'intern';
}

function getUserObject() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        return JSON.parse(userStr);
    }
    return {
        name: localStorage.getItem('userName') || 'User',
        email: localStorage.getItem('userEmail') || 'user@example.com',
        role: localStorage.getItem('role') || 'intern'
    };
}

function getUserName() {
    const user = getUserObject();
    return user.name || 'User';
}

function logout() {
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
}

// ====== INITIALIZATION ======
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!checkAuthAndRole()) return;
    
    // Check role access
    if (!checkRoleAccess()) return;
    
    // Setup dynamic sidebar
    setupDynamicSidebar();
    
    // Display user role
    displayUserRole();
    
    // Initialize app
    initializeApp();
});

// ====== DYNAMIC SIDEBAR ======

function setupDynamicSidebar() {
    const userRole = getUserRole();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const page = link.getAttribute('data-page');
        
        // Hide pages based on role
        if (userRole === 'intern') {
            if (page === 'company') {
                link.style.display = 'none';
            }
        } else if (userRole === 'recruiter') {
            if (page !== 'company') {
                link.style.display = 'none';
            }
        }
    });
    
    // Setup logout button
    setupLogout();
}

function displayUserRole() {
    const userName = getUserName();
    const userRole = getUserRole();
    
    // Find header and add user info
    const header = document.querySelector('.header-title');
    if (header) {
        const existingBadge = header.querySelector('.user-role-badge');
        if (!existingBadge) {
            const badge = document.createElement('span');
            badge.className = 'user-role-badge';
            badge.style.cssText = `
                display: inline-block;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                background-color: ${userRole === 'intern' ? '#DBEAFE' : '#FED7AA'};
                color: ${userRole === 'intern' ? '#2563EB' : '#F97316'};
                margin-left: 12px;
            `;
            badge.textContent = userRole === 'intern' ? '👨‍🎓 Intern' : '🏢 Recruiter';
            header.appendChild(badge);
        }
    }
}

// ====== DATA MIGRATION ======
// Fix old applications that don't have proper candidateName
function extractNameFromEmail(email) {
    if (!email) return 'Unknown';
    
    // Get part before @
    const localPart = email.split('@')[0];
    
    // Split by dots and filter out numbers
    const parts = localPart
        .split('.')
        .filter(part => !/^\d+$/.test(part)) // Remove all-digit parts
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()) // Capitalize each word
        .join(' ');
    
    return parts || 'Unknown';
}

function migrateApplicationData() {
    const applications = getApplications();
    const jobs = getJobs();
    let updated = false;
    
    applications.forEach(app => {
        // ALWAYS extract proper name from email - don't rely on candidateName field
        let properName = extractNameFromEmail(app.candidateEmail);
        
        // Update candidateName if:
        // - It doesn't exist
        // - It's "undefined" or "Unknown"
        // - It looks like an email (contains dots)
        if (!app.candidateName || 
            app.candidateName === 'undefined' ||
            app.candidateName === 'Unknown' ||
            app.candidateName.includes('.') ||
            app.candidateName.includes('@')) {
            
            app.candidateName = properName;
            updated = true;
            console.log(`✅ Migrated ${app.candidateEmail} → ${properName}`);
        }
        
        // Add jobId if missing - match by company and job role
        if (!app.jobId) {
            const matchingJob = jobs.find(job => 
                job.company === app.companyName && 
                job.title === app.jobRole
            );
            if (matchingJob) {
                app.jobId = matchingJob.id;
                updated = true;
                console.log(`✅ Added jobId to application: ${app.companyName} - ${app.jobRole}`);
            }
        }
    });
    
    if (updated) {
        saveApplications(applications);
        console.log(`✅ Migration complete: ${applications.length} applications updated`);
    }
}

// ====== MAIN INITIALIZATION ======

function initializeApp() {
    // Migrate old application data on load
    migrateApplicationData();
    
    // Add navigation listeners
    addNavigationListeners();
    
    // Initialize page based on current URL
    const currentPage = getCurrentPage();
    
    if (currentPage === 'index.html' || currentPage === '') {
        initializeDashboard();
    } else if (currentPage === 'add.html') {
        initializeAddPage();
    } else if (currentPage === 'detail.html') {
        initializeDetailPage();
    } else if (currentPage === 'profile.html') {
        initializeProfilePage();
    } else if (currentPage === 'browse-jobs.html') {
        initializeBrowseJobsPage();
    } else if (currentPage === 'company.html') {
        initializeCompanyPage();
    } else if (currentPage === 'applicant.html') {
        initializeApplicantPage();
    }
}

// ====== UTILITY FUNCTIONS ======

function getCurrentPage() {
    return window.location.pathname.split('/').pop();
}

function addNavigationListeners() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (!this.href.includes('http') && this.style.display !== 'none') {
                navLinks.forEach(l => {
                    if (l.style.display !== 'none') {
                        l.classList.remove('active');
                    }
                });
                this.classList.add('active');
            }
        });
    });
}

function setupLogout() {
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.removeEventListener('click', handleLogout);
        btn.addEventListener('click', handleLogout);
    });
}

function handleLogout(e) {
    e.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
        logout();
    }
}

// ====== LOCALSTORAGE FUNCTIONS ======

function getApplications() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveApplications(applications) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
}

function addApplication(application) {
    application.id = Date.now().toString();
    const user = getUserObject();
    application.candidateName = user.name || 'Anonymous Intern';
    application.candidateEmail = user.email || 'intern@example.com';
    application.createdAt = new Date().toISOString();
    application.interviewDate = null; // Will be set when status changes to Interview
    
    const applications = getApplications();
    applications.push(application);
    saveApplications(applications);
    
    return application;
}

function updateApplication(id, updatedData) {
    const applications = getApplications();
    const index = applications.findIndex(app => app.id === id);
    if (index !== -1) {
        applications[index] = { ...applications[index], ...updatedData };
        saveApplications(applications);
        return applications[index];
    }
    return null;
}

function deleteApplication(id) {
    const applications = getApplications();
    const filtered = applications.filter(app => app.id !== id);
    saveApplications(filtered);
}

function getApplicationById(id) {
    const applications = getApplications();
    return applications.find(app => app.id === id);
}

// ====== JOBS STORAGE ======

function getJobs() {
    const data = localStorage.getItem(JOBS_STORAGE_KEY);
    return data ? JSON.parse(data) : getSampleJobs();
}

function saveJobs(jobs) {
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
}

function getSampleJobs() {
    return [
        {
            id: '1',
            title: 'Software Engineer Intern',
            company: 'Airbnb',
            location: 'San Francisco, CA',
            salary: '$50,000 - $70,000',
            description: 'Join our platform engineering team and work on scalable systems. You will help build the infrastructure that powers millions of bookings worldwide. Learn full-stack development and best practices from experienced engineers.',
            postedDate: '2024-03-20',
            applicants: 5
        },
        {
            id: '2',
            title: 'Product Manager Intern',
            company: 'Google',
            location: 'Mountain View, CA',
            salary: '$55,000 - $75,000',
            description: 'Work on innovative products shaping the future. As a Product Manager Intern, you will collaborate with cross-functional teams to drive product strategy and development. Gain hands-on experience in product planning, research, and analytics.',
            postedDate: '2024-03-18',
            applicants: 3
        },
        {
            id: '3',
            title: 'Frontend Developer Intern',
            company: 'Netflix',
            location: 'Los Gatos, CA',
            salary: '$48,000 - $68,000',
            description: 'Build beautiful and responsive user interfaces for our streaming platform. You will work with React, TypeScript, and modern web technologies. Collaborate with UX designers and backend engineers to create amazing user experiences.',
            postedDate: '2024-03-15',
            applicants: 8
        },
        {
            id: '4',
            title: 'Data Science Intern',
            company: 'Microsoft',
            location: 'Redmond, WA',
            salary: '$52,000 - $72,000',
            description: 'Dive into big data and machine learning. Work with large datasets and build predictive models. You will use Python, SQL, and machine learning frameworks to solve real-world problems and drive business insights.',
            postedDate: '2024-03-12',
            applicants: 6
        }
    ];
}

// Note: getApplicants now uses the same storage as applications (UNIFIED SYSTEM)

// ====== DASHBOARD PAGE ======

function initializeDashboard() {
    updateDashboardStats();
    displayRecentApplications();
}

function updateDashboardStats() {
    const applications = getApplications();
    
    const total = applications.length;
    const interviews = applications.filter(app => app.status === 'Interview').length;
    const offers = applications.filter(app => app.status === 'Offer').length;
    const rejected = applications.filter(app => app.status === 'Rejected').length;
    
    const totalEl = document.getElementById('total-applications');
    const interviewsEl = document.getElementById('total-interviews');
    const offersEl = document.getElementById('total-offers');
    const rejectedEl = document.getElementById('total-rejected');
    
    if (totalEl) totalEl.textContent = total;
    if (interviewsEl) interviewsEl.textContent = interviews;
    if (offersEl) offersEl.textContent = offers;
    if (rejectedEl) rejectedEl.textContent = rejected;
}

function displayRecentApplications() {
    const applications = getApplications();
    const list = document.getElementById('applications-list');
    
    if (!list) return;
    
    if (applications.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📂</div>
                <h3>No applications yet</h3>
                <p>Start by adding your first job application!</p>
                <a href="add.html" class="btn btn-primary">Add Application</a>
            </div>
        `;
        return;
    }
    
    // Show recent 5 applications
    const recent = applications.slice(-5).reverse();
    
    list.innerHTML = recent.map(app => `
        <a href="detail.html?id=${app.id}" class="app-card">
            <div class="app-card-content">
                <div class="app-header">
                    <div class="app-title">${app.companyName}</div>
                    <div class="app-role">${app.jobRole}</div>
                </div>
                <div class="app-meta">
                    <span>📅 ${formatDate(app.applicationDate)}</span>
                    <span>📍 ${app.status}</span>
                </div>
            </div>
            <span class="badge badge-${app.status.toLowerCase()}">${app.status}</span>
        </a>
    `).join('');
}

// ====== ADD APPLICATION PAGE ======

function initializeAddPage() {
    setupApplicationForm();
}

function setupApplicationForm() {
    const form = document.getElementById('application-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const application = {
                companyName: formData.get('companyName'),
                jobRole: formData.get('jobRole'),
                applicationDate: formData.get('applicationDate'),
                status: formData.get('status'),
                salary: formData.get('salary'),
                notes: formData.get('notes')
            };
            
            addApplication(application);
            showSuccessMessage('✅ Application added successfully!');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        });
    }
}

// ====== DETAIL PAGE ======

function initializeDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (!id) {
        window.location.href = 'index.html';
        return;
    }
    
    displayApplicationDetail(id);
    setupDetailActions(id);
    setupEditModal(id);
}

function displayApplicationDetail(id) {
    const app = getApplicationById(id);
    
    if (!app) {
        document.querySelector('.page-content').innerHTML = '<div class="empty-state"><h3>Application not found</h3></div>';
        return;
    }
    
    document.getElementById('detail-company-name').textContent = app.companyName;
    document.getElementById('detail-job-role').textContent = app.jobRole;
    document.getElementById('detail-title').textContent = app.companyName;
    document.getElementById('detail-company').textContent = app.companyName;
    document.getElementById('detail-position').textContent = app.jobRole;
    document.getElementById('detail-date').textContent = formatDate(app.applicationDate);
    document.getElementById('detail-salary').textContent = app.salary || 'Not specified';
    document.getElementById('detail-status').textContent = app.status;
    document.getElementById('detail-notes').textContent = app.notes || 'No notes added';
    
    // Show interview date if status is Interview
    const interviewDateContainer = document.getElementById('interview-date-info');
    if (interviewDateContainer) {
        if (app.status === 'Interview' && app.interviewDate) {
            interviewDateContainer.innerHTML = `<div class="detail-row interview-date"><div class="detail-label">📅 Interview Date</div><div class="detail-value"><strong>${formatDate(app.interviewDate)}</strong></div></div>`;
            interviewDateContainer.style.display = 'block';
        } else {
            interviewDateContainer.style.display = 'none';
        }
    }
    
    const badge = document.getElementById('detail-badge');
    badge.className = `badge badge-${app.status.toLowerCase()}`;
    badge.textContent = app.status;
    
    // Update pipeline
    updatePipeline(app.status);
}

function updatePipeline(currentStatus) {
    const stages = document.querySelectorAll('.pipeline-stage');
    const statusOrder = ['Applied', 'Interview', 'Offer'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    stages.forEach((stage, index) => {
        const stageStatus = stage.getAttribute('data-status');
        const stageIndex = statusOrder.indexOf(stageStatus);
        
        if (stageIndex <= currentIndex) {
            stage.classList.add('active');
        } else {
            stage.classList.remove('active');
        }
    });
}

function setupDetailActions(id) {
    const editBtn = document.getElementById('edit-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const nextStageBtn = document.getElementById('next-stage-btn');
    const rejectBtn = document.getElementById('reject-btn');
    
    // Check if user is a recruiter (only recruiters can edit status)
    const userRole = getUserRole();
    const isRecruiter = userRole === 'recruiter';
    
    // Edit and Delete buttons work for both students and recruiters
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            document.getElementById('edit-modal').classList.remove('hidden');
            loadEditForm(id);
        });
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this application?')) {
                deleteApplication(id);
                showSuccessMessage('✅ Application deleted!');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        });
    }
    
    // Status editing buttons ONLY for recruiters
    if (isRecruiter) {
        if (nextStageBtn) {
            nextStageBtn.addEventListener('click', () => {
                const app = getApplicationById(id);
                const nextStatus = getNextStatus(app.status);
                if (nextStatus) {
                    updateApplication(id, { status: nextStatus });
                    showSuccessMessage(`✅ Status updated to ${nextStatus}!`);
                    setTimeout(() => {
                        displayApplicationDetail(id);
                    }, 1000);
                } else {
                    showErrorMessage('❌ No next stage available');
                }
            });
        }
        
        if (rejectBtn) {
            rejectBtn.addEventListener('click', () => {
                if (confirm('Mark this application as rejected?')) {
                    updateApplication(id, { status: 'Rejected' });
                    showSuccessMessage('✅ Application marked as rejected!');
                    setTimeout(() => {
                        displayApplicationDetail(id);
                    }, 1000);
                }
            });
        }
    } else {
        // For students: HIDE status editing buttons completely
        if (nextStageBtn) {
            nextStageBtn.style.display = 'none';
        }
        if (rejectBtn) {
            rejectBtn.style.display = 'none';
        }
    }
}

function loadEditForm(id) {
    const app = getApplicationById(id);
    document.getElementById('edit-company-name').value = app.companyName;
    document.getElementById('edit-job-role').value = app.jobRole;
    document.getElementById('edit-application-date').value = app.applicationDate;
    document.getElementById('edit-status').value = app.status;
    document.getElementById('edit-salary').value = app.salary || '';
    document.getElementById('edit-notes').value = app.notes || '';
}

function setupEditModal(id) {
    const modal = document.getElementById('edit-modal');
    const closeBtn = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('cancel-edit');
    const editForm = document.getElementById('edit-form');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }
    
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(editForm);
            const updates = {
                companyName: formData.get('companyName'),
                jobRole: formData.get('jobRole'),
                applicationDate: formData.get('applicationDate'),
                status: formData.get('status'),
                salary: formData.get('salary'),
                notes: formData.get('notes')
            };
            
            updateApplication(id, updates);
            showSuccessMessage('✅ Application updated!');
            modal.classList.add('hidden');
            setTimeout(() => {
                displayApplicationDetail(id);
            }, 1000);
        });
    }
}

function getNextStatus(currentStatus) {
    const statuses = {
        'Applied': 'Interview',
        'Interview': 'Offer',
        'Offer': null,
        'Rejected': null
    };
    return statuses[currentStatus] || null;
}

// ====== PROFILE PAGE ======

function initializeProfilePage() {
    setupResumeUpload();
    setupProfileSettings();
    displayProfileInfo();
}

function displayProfileInfo() {
    const userName = getUserName();
    const userEmail = localStorage.getItem('userEmail');
    const userRole = getUserRole();
    
    // You can update profile display here if needed
    console.log('Profile:', { userName, userEmail, userRole });
}

function setupResumeUpload() {
    const uploadInput = document.getElementById('resume-upload');
    if (uploadInput) {
        uploadInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                document.getElementById('resume-info').classList.remove('hidden');
                document.getElementById('resume-filename').textContent = `📄 ${file.name}`;
            }
        });
    }
}

function setupProfileSettings() {
    const toggles = document.querySelectorAll('.toggle input');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            console.log('Setting changed:', this.checked);
        });
    });
}

function clearResume() {
    document.getElementById('resume-upload').value = '';
    document.getElementById('resume-info').classList.add('hidden');
}

// ====== BROWSE JOBS PAGE (FOR INTERNS) ======

function initializeBrowseJobsPage() {
    displayAllJobs();
    setupJobSearchAndFilter();
    setupJobDetailModal();
}

function displayAllJobs() {
    const jobs = getJobs();
    const container = document.getElementById('jobs-container');
    
    if (!container) return;
    
    if (jobs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💼</div>
                <h3>No jobs available</h3>
                <p>Check back later for new opportunities!</p>
            </div>
        `;
        return;
    }
    
    // Update company filter dropdown
    const companyFilter = document.getElementById('company-filter');
    if (companyFilter) {
        const companies = [...new Set(jobs.map(job => job.company))];
        companyFilter.innerHTML = '<option value="">All Companies</option>' + 
            companies.map(company => `<option value="${company}">${company}</option>`).join('');
    }
    
    renderJobCards(jobs);
}

function renderJobCards(jobs) {
    const container = document.getElementById('jobs-container');
    
    if (jobs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💼</div>
                <h3>No matching jobs found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = jobs.map(job => `
        <div class="job-card-browse">
            <div class="job-card-header">
                <h3>${job.title}</h3>
                <span class="company-badge">${job.company}</span>
            </div>
            <p class="job-location">📍 ${job.location}</p>
            <p class="job-salary">💰 ${job.salary || 'Salary not specified'}</p>
            <p class="job-description">${job.description.substring(0, 120)}...</p>
            <div class="job-card-footer">
                <button class="btn btn-secondary-small" onclick="showJobDetail('${job.id}')">View Details</button>
                <button class="btn btn-primary-small" onclick="applyToJob('${job.id}')">Apply</button>
            </div>
        </div>
    `).join('');
}

function setupJobSearchAndFilter() {
    const searchBox = document.getElementById('job-search');
    const companyFilter = document.getElementById('company-filter');
    
    const filterJobs = () => {
        const searchTerm = (searchBox?.value || '').toLowerCase();
        const selectedCompany = companyFilter?.value || '';
        const allJobs = getJobs();
        
        const filtered = allJobs.filter(job => {
            const matchesSearch = !searchTerm || 
                job.title.toLowerCase().includes(searchTerm) ||
                job.company.toLowerCase().includes(searchTerm) ||
                job.location.toLowerCase().includes(searchTerm);
            
            const matchesCompany = !selectedCompany || job.company === selectedCompany;
            
            return matchesSearch && matchesCompany;
        });
        
        renderJobCards(filtered);
    };
    
    if (searchBox) {
        searchBox.addEventListener('input', filterJobs);
    }
    
    if (companyFilter) {
        companyFilter.addEventListener('change', filterJobs);
    }
}

function setupJobDetailModal() {
    const closeBtn = document.getElementById('close-job-detail');
    const closeBtnFooter = document.getElementById('close-job-detail-btn');
    const modal = document.getElementById('job-detail-modal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }
    
    if (closeBtnFooter) {
        closeBtnFooter.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }
}

function showJobDetail(jobId) {
    const jobs = getJobs();
    const job = jobs.find(j => j.id === jobId);
    
    if (!job) return;
    
    document.getElementById('modal-job-title').textContent = job.title;
    document.getElementById('modal-company').textContent = job.company;
    document.getElementById('modal-location').textContent = job.location;
    document.getElementById('modal-salary').textContent = job.salary || 'Not specified';
    document.getElementById('modal-posted-date').textContent = formatDate(job.postedDate || new Date().toISOString());
    document.getElementById('modal-description').textContent = job.description;
    
    const applyBtn = document.getElementById('apply-job-btn');
    applyBtn.onclick = () => applyToJob(jobId);
    
    document.getElementById('job-detail-modal').classList.remove('hidden');
}

function applyToJob(jobId) {
    const jobs = getJobs();
    const job = jobs.find(j => j.id === jobId);
    
    if (!job) {
        showErrorMessage('❌ Job not found');
        return;
    }
    
    // Check for duplicate applications
    const applications = getApplications();
    const candidateEmail = localStorage.getItem('userEmail');
    const isDuplicate = applications.some(app => 
        app.candidateEmail === candidateEmail && 
        app.companyName === job.company && 
        app.jobRole === job.title
    );
    
    if (isDuplicate) {
        showErrorMessage('❌ You have already applied to this position!');
        return;
    }
    
    // Create new application
    const newApplication = {
        companyName: job.company,
        jobRole: job.title,
        jobId: jobId,  // Store jobId to link back to this job
        applicationDate: new Date().toISOString().split('T')[0],
        status: 'Applied',
        salary: job.salary || '',
        notes: `Applied from Browse Jobs page`
    };
    
    addApplication(newApplication);
    
    // Close modal
    document.getElementById('job-detail-modal').classList.add('hidden');
    showSuccessMessage('✅ Successfully applied! Check your dashboard for updates.');
    
    // Refresh job list
    setTimeout(() => {
        displayAllJobs();
    }, 1500);
}

// ====== COMPANY PAGE ======

function initializeCompanyPage() {
    displayCompanyJobs();
    displayApplicants();
    setupJobFilters();
    setupPostJobButton();
    setupJobModal();
}

function displayCompanyJobs() {
    const jobs = getJobs();
    const applications = getApplications(); // Get applications to count per job
    const jobsList = document.getElementById('company-jobs-list');
    
    if (!jobsList) return;
    
    if (jobs.length === 0) {
        jobsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💼</div>
                <h3>No job postings yet</h3>
                <p>Create your first job posting to start receiving applications</p>
                <button class="btn btn-primary" onclick="showPostJobModal()">Post a Job</button>
            </div>
        `;
        return;
    }
    
    jobsList.innerHTML = jobs.map(job => {
        // Count applicants for this specific job using jobId
        const applicantCount = applications.filter(app => app.jobId === job.id).length;
        
        return `
            <div class="card job-card">
                <div>
                    <h3>${job.title}</h3>
                    <p style="color: var(--text-secondary); margin: 8px 0;">📍 ${job.company}</p>
                    <p style="color: var(--text-secondary); font-size: 13px;">${job.location}</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 20px; font-weight: 700; color: var(--primary-color);">${applicantCount}</div>
                    <p style="color: var(--text-secondary); font-size: 12px;">Applicants</p>
                </div>
            </div>
        `;
    }).join('');
    
    // Update filter options
    const jobFilter = document.getElementById('job-filter');
    if (jobFilter) {
        jobFilter.innerHTML = '<option value="">All Jobs</option>' + 
            jobs.map(job => `<option value="${job.id}">${job.title} - ${job.company}</option>`).join('');
    }
}

function displayApplicants() {
    const applications = getApplications(); // Use unified applications storage
    const tbody = document.getElementById('applicants-tbody');
    
    if (!tbody) return;
    
    if (applications.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px;">
                    <div class="empty-icon">📫</div>
                    <p>No applications yet</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = applications.map(app => {
        // Get the best possible candidate name
        let candidateName = app.candidateName;
        
        // If candidateName is missing, undefined, or looks like email/unknown, extract from email
        if (!candidateName || 
            candidateName === 'undefined' || 
            candidateName === 'Unknown' ||
            candidateName.includes('.') ||
            candidateName.includes('@')) {
            candidateName = extractNameFromEmail(app.candidateEmail);
        }
        
        return `
            <tr onclick="openApplicantDetail('${app.id}')" style="cursor: pointer;">
                <td>${candidateName}</td>
                <td>${app.jobRole}</td>
                <td>${formatDate(app.applicationDate)}</td>
                <td>
                    <span class="badge badge-${app.status.toLowerCase()}">${app.status}</span>
                </td>
                <td>
                    <button class="btn btn-secondary-small" onclick="openApplicantDetail('${app.id}'); event.stopPropagation();">View</button>
                </td>
            </tr>
        `;
    }).join('');
}

function setupJobFilters() {
    const jobFilter = document.getElementById('job-filter');
    const statusFilter = document.getElementById('status-filter');
    
    if (jobFilter) {
        jobFilter.addEventListener('change', filterApplicants);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterApplicants);
    }
}

function filterApplicants() {
    const companyFilter = document.getElementById('job-filter')?.value || '';
    const statusFilter = document.getElementById('status-filter')?.value || '';
    const applications = getApplications(); // Use unified applications storage
    
    const filtered = applications.filter(app => {
        const companyMatch = !companyFilter || app.companyName === companyFilter;
        const statusMatch = !statusFilter || app.status === statusFilter;
        return companyMatch && statusMatch;
    });
    
    const tbody = document.getElementById('applicants-tbody');
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px;">
                    <div class="empty-icon">📫</div>
                    <p>No applications match your filters</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filtered.map(app => `
        <tr onclick="openApplicantDetail('${app.id}')" style="cursor: pointer;">
            <td>${app.candidateName}</td>
            <td>${app.jobRole}</td>
            <td>${formatDate(app.applicationDate)}</td>
            <td>
                <span class="badge badge-${app.status.toLowerCase()}">${app.status}</span>
            </td>
            <td>
                <button class="btn btn-secondary-small" onclick="openApplicantDetail('${app.id}'); event.stopPropagation();">View</button>
            </td>
        </tr>
    `).join('');
}

function setupPostJobButton() {
    const btn = document.getElementById('post-job-btn');
    if (btn) {
        btn.addEventListener('click', showPostJobModal);
    }
}

function setupJobModal() {
    const modal = document.getElementById('post-job-modal');
    const closeBtn = document.getElementById('close-job-modal');
    const form = document.getElementById('post-job-form');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeJobModal);
    }
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const newJob = {
                id: Date.now().toString(),
                title: formData.get('jobTitle'),
                company: formData.get('companyName'),
                location: formData.get('location'),
                salary: formData.get('salary'),
                description: formData.get('jobDescription'),
                postedDate: new Date().toISOString().split('T')[0],
                applicants: 0
            };
            
            const jobs = getJobs();
            jobs.push(newJob);
            saveJobs(jobs);
            
            showSuccessMessage('✅ Job posted successfully!');
            form.reset();
            closeJobModal();
            displayCompanyJobs();
        });
    }
}

function showPostJobModal() {
    const modal = document.getElementById('post-job-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeJobModal() {
    const modal = document.getElementById('post-job-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function openApplicantDetail(applicantId) {
    // Store the applicant ID and redirect
    sessionStorage.setItem('selectedApplicantId', applicantId);
    window.location.href = 'applicant.html?id=' + applicantId;
}

// ====== APPLICANT PAGE ======

function initializeApplicantPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (!id) {
        window.location.href = 'company.html';
        return;
    }
    
    displayApplicantDetail(id);
    setupApplicantActions(id);
}

function displayApplicantDetail(id) {
    const applications = getApplications(); // Use unified applications storage
    const app = applications.find(a => a.id === id);
    
    if (!app) {
        document.querySelector('.page-content').innerHTML = '<div class="empty-state"><h3>Application not found</h3></div>';
        return;
    }
    
    // Get the best possible candidate name
    let candidateName = app.candidateName;
    if (!candidateName || 
        candidateName === 'undefined' || 
        candidateName === 'Unknown' ||
        candidateName.includes('.') ||
        candidateName.includes('@')) {
        candidateName = extractNameFromEmail(app.candidateEmail);
    }
    
    document.getElementById('applicant-full-name').textContent = candidateName;
    document.getElementById('applicant-position-name').textContent = app.jobRole;
    document.getElementById('applicant-name').textContent = candidateName;
    document.getElementById('applicant-email').textContent = app.candidateEmail || 'N/A';
    document.getElementById('applicant-phone').textContent = app.phone || 'N/A';
    document.getElementById('applicant-job-title').textContent = app.jobRole;
    document.getElementById('applicant-applied-date').textContent = formatDate(app.applicationDate);
    document.getElementById('applicant-current-status').textContent = app.status;
    
    // Skills
    const skillsContainer = document.getElementById('applicant-skills');
    skillsContainer.innerHTML = (app.skills || []).map(skill => `<span class="skill-tag">${skill}</span>`).join('');
    
    // Status badge
    const badge = document.querySelector('[id="applicant-status-badge"]');
    if (badge) {
        badge.className = `badge badge-${app.status.toLowerCase()}`;
        badge.textContent = app.status;
    }
    
    // Show interview date if status is Interview
    const interviewDateContainer = document.getElementById('interview-date-info');
    if (interviewDateContainer) {
        if (app.status === 'Interview' && app.interviewDate) {
            interviewDateContainer.innerHTML = `<p class="interview-date-display">📅 Interview scheduled on <strong>${formatDate(app.interviewDate)}</strong></p>`;
            interviewDateContainer.style.display = 'block';
        } else {
            interviewDateContainer.style.display = 'none';
        }
    }
    
    // Update pipeline
    updateApplicantPipeline(app.status);
}

function updateApplicantPipeline(currentStatus) {
    const stages = document.querySelectorAll('.pipeline-stage');
    const statusOrder = ['Applied', 'Shortlisted', 'Interview', 'Offer'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    stages.forEach((stage, index) => {
        const stageStatus = stage.getAttribute('data-status');
        const stageIndex = statusOrder.indexOf(stageStatus);
        
        if (stageIndex <= currentIndex) {
            stage.classList.add('active');
        } else {
            stage.classList.remove('active');
        }
    });
}

function setupApplicantActions(id) {
    const nextBtn = document.getElementById('move-to-next-btn');
    const messageBtn = document.getElementById('send-message-btn');
    const rejectBtn = document.getElementById('reject-applicant-btn');
    
    // Only recruiters (on company.html / applicant.html) can change status
    // Students should not see these buttons or they should be disabled
    const userRole = getUserRole();
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const applications = getApplications();
            const app = applications.find(a => a.id === id);
            const nextStatus = getNextApplicantStatus(app.status);
            
            if (nextStatus) {
                // If changing to Interview, prompt for interview date
                let updateData = { status: nextStatus };
                
                if (nextStatus === 'Interview') {
                    const interviewDate = prompt('Enter interview date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
                    if (interviewDate) {
                        // Validate date format
                        if (!/^\d{4}-\d{2}-\d{2}$/.test(interviewDate)) {
                            showErrorMessage('❌ Invalid date format. Use YYYY-MM-DD');
                            return;
                        }
                        updateData.interviewDate = interviewDate;
                    } else {
                        return; // User cancelled
                    }
                }
                
                updateApplication(id, updateData);
                showSuccessMessage(`✅ Status updated to ${nextStatus}!`);
                setTimeout(() => {
                    displayApplicantDetail(id);
                }, 1000);
            } else {
                showErrorMessage('❌ No next stage available');
            }
        });
    }
    
    if (messageBtn) {
        messageBtn.addEventListener('click', () => {
            showSuccessMessage('📧 Message feature coming soon!');
        });
    }
    
    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reject this applicant?')) {
                updateApplication(id, { status: 'Rejected' });
                showSuccessMessage('✅ Applicant rejected!');
                setTimeout(() => {
                    window.location.href = 'company.html';
                }, 1500);
            }
        });
    }
}

function getNextApplicantStatus(currentStatus) {
    const statuses = {
        'Applied': 'Shortlisted',
        'Shortlisted': 'Interview',
        'Interview': 'Offer',
        'Offer': null,
        'Rejected': null
    };
    return statuses[currentStatus] || null;
}

// ====== MESSAGE FUNCTIONS ======

function showSuccessMessage(message) {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #10B981;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        font-size: 14px;
        font-weight: 600;
        z-index: 9999;
        animation: slideIn 0.3s ease forwards;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function showErrorMessage(message) {
    // Create a simple error toast
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #EF4444;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        font-size: 14px;
        font-weight: 600;
        z-index: 9999;
        animation: slideIn 0.3s ease forwards;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ====== UTILITY FUNCTIONS ======

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// ====== DASHBOARD PAGE ======

function initializeDashboard() {
    updateDashboardStats();
    displayRecentApplications();
}

function updateDashboardStats() {
    const applications = getApplications();
    
    const total = applications.length;
    const interviews = applications.filter(app => app.status === 'Interview').length;
    const offers = applications.filter(app => app.status === 'Offer').length;
    const rejected = applications.filter(app => app.status === 'Rejected').length;
    
    document.getElementById('total-applications').textContent = total;
    document.getElementById('total-interviews').textContent = interviews;
    document.getElementById('total-offers').textContent = offers;
    document.getElementById('total-rejected').textContent = rejected;
}

function displayRecentApplications() {
    const applications = getApplications();
    const list = document.getElementById('applications-list');
    
    if (applications.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📂</div>
                <h3>No applications yet</h3>
                <p>Start by adding your first job application!</p>
                <a href="add.html" class="btn btn-primary">Add Application</a>
            </div>
        `;
        return;
    }
    
    // Show recent 5 applications
    const recent = applications.slice(-5).reverse();
    
    list.innerHTML = recent.map(app => `
        <a href="detail.html?id=${app.id}" class="app-card">
            <div class="app-card-content">
                <div class="app-header">
                    <div class="app-title">${app.companyName}</div>
                    <div class="app-role">${app.jobRole}</div>
                </div>
                <div class="app-meta">
                    <span>📅 ${formatDate(app.applicationDate)}</span>
                    <span>📍 ${app.status}</span>
                </div>
            </div>
            <span class="badge badge-${app.status.toLowerCase()}">${app.status}</span>
        </a>
    `).join('');
}

// ====== ADD APPLICATION PAGE ======

function initializeAddPage() {
    setupApplicationForm();
}

function setupApplicationForm() {
    const form = document.getElementById('application-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const application = {
                companyName: formData.get('companyName'),
                jobRole: formData.get('jobRole'),
                applicationDate: formData.get('applicationDate'),
                status: formData.get('status'),
                salary: formData.get('salary'),
                notes: formData.get('notes')
            };
            
            addApplication(application);
            alert('Application added successfully!');
            window.location.href = 'index.html';
        });
    }
}

// ====== DETAIL PAGE ======

// ====== PROFILE PAGE ======

function initializeProfilePage() {
    setupResumeUpload();
    setupProfileSettings();
}

function setupResumeUpload() {
    const uploadInput = document.getElementById('resume-upload');
    if (uploadInput) {
        uploadInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                document.getElementById('resume-info').classList.remove('hidden');
                document.getElementById('resume-filename').textContent = `📄 ${file.name}`;
            }
        });
    }
}

function setupProfileSettings() {
    const toggles = document.querySelectorAll('.toggle input');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            console.log('Setting changed:', this.checked);
        });
    });
}

function clearResume() {
    document.getElementById('resume-upload').value = '';
    document.getElementById('resume-info').classList.add('hidden');
}

// ====== COMPANY PAGE ======

function openApplicantDetail(applicantId) {
    // Store the applicant ID and redirect
    sessionStorage.setItem('selectedApplicantId', applicantId);
    window.location.href = 'applicant.html?id=' + applicantId;
}

// ====== UTILITY FUNCTIONS ======

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Initialize sample data if empty
function initializeSampleData() {
    if (getApplications().length === 0) {
        const sampleApps = [
            {
                id: '1',
                companyName: 'Google',
                jobRole: 'Software Engineer Intern',
                applicationDate: '2024-03-15',
                status: 'Interview',
                salary: '$70,000 - $90,000',
                notes: 'Great opportunity in their engineering team',
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                companyName: 'Microsoft',
                jobRole: 'Product Manager Intern',
                applicationDate: '2024-03-20',
                status: 'Applied',
                salary: '$65,000 - $85,000',
                notes: 'Interested in their product strategy',
                createdAt: new Date().toISOString()
            }
        ];
        
        sampleApps.forEach(app => saveApplications([...getApplications(), app]));
    }
}

// Call this on first load
if (getApplications().length === 0 && getJobs().length === 0) {
    // Create some default data
    const defaultApps = [
        {
            id: '1',
            companyName: 'Google',
            jobRole: 'Software Engineer Intern',
            applicationDate: '2024-03-15',
            status: 'Interview',
            salary: '$70,000 - $90,000',
            notes: 'Great opportunity'
        }
    ];
    saveApplications(defaultApps);
}
