// DOM Elements
const projectForm = document.getElementById('projectForm');
const projectList = document.getElementById('projectList');
const loadingSpinner = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');

// Show loading spinner
function showLoading() {
    loadingSpinner.style.display = 'block';
    errorMessage.style.display = 'none';
}

// Hide loading spinner
function hideLoading() {
    loadingSpinner.style.display = 'none';
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Handle form submission
projectForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const file = document.getElementById('file').files[0];
    const videoLink = document.getElementById('videoLink').value;

    // Validate file size (max 10MB)
    if (file && file.size > 10 * 1024 * 1024) {
        showError('File size should be less than 10MB');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);
    formData.append('videoLink', videoLink);

    try {
        showLoading();
        const response = await fetch('http://localhost:3000/api/projects', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to submit project');
        }

        const data = await response.json();
        alert('Project submitted successfully!');
        projectForm.reset();
        await loadProjects();
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to submit project. Please try again.');
    } finally {
        hideLoading();
    }
});

// Load and display projects
async function loadProjects() {
    try {
        showLoading();
        const response = await fetch('http://localhost:3000/api/projects');
        
        if (!response.ok) {
            throw new Error('Failed to load projects');
        }

        const projects = await response.json();
        projectList.innerHTML = '';
        
        if (projects.length === 0) {
            projectList.innerHTML = '<p class="no-projects">No projects submitted yet.</p>';
            return;
        }

        projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.innerHTML = `
                <div class="project-header">
                    <h3>${project.title}</h3>
                    <span class="project-date">${formatDate(project.createdAt)}</span>
                </div>
                <p class="project-description">${project.description}</p>
                ${project.videoLink ? `
                    <a href="${project.videoLink}" target="_blank" class="video-link">
                        <i class="fas fa-video"></i> Watch Video
                    </a>
                ` : ''}
                <div class="project-footer">
                    <a href="${project.fileUrl}" class="download-link" target="_blank">
                        <i class="fas fa-download"></i> Download Files
                    </a>
                </div>
            `;
            projectList.appendChild(projectCard);
        });
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load projects. Please try again later.');
    } finally {
        hideLoading();
    }
}

// Load projects when page loads
window.addEventListener('load', loadProjects);