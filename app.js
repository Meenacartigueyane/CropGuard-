// ===== API Helper =====
async function apiCall(endpoint, options = {}) {
    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });
    return response.json();
}

// ===== Alert Helper =====
function showAlert(elementId, message, type = 'success') {
    const alert = document.getElementById(elementId);
    if (!alert) return;
    alert.className = `alert alert-${type} show`;
    alert.textContent = message;
    setTimeout(() => {
        alert.classList.remove('show');
    }, 5000);
}

// ===== Auth Pages =====
async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showAlert('login-alert', 'Please fill in all fields', 'danger');
        return;
    }
    
    try {
        const data = await apiCall('/api/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (data.success) {
            window.location.href = '/dashboard';
        } else {
            showAlert('login-alert', data.message, 'danger');
        }
    } catch (error) {
        showAlert('login-alert', 'An error occurred. Please try again.', 'danger');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    
    if (!username || !email || !password) {
        showAlert('register-alert', 'Please fill in all fields', 'danger');
        return;
    }
    
    if (password.length < 6) {
        showAlert('register-alert', 'Password must be at least 6 characters', 'danger');
        return;
    }
    
    try {
        const data = await apiCall('/api/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password, role })
        });
        
        if (data.success) {
            showAlert('register-alert', 'Registration successful! Redirecting to login...', 'success');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        } else {
            showAlert('register-alert', data.message, 'danger');
        }
    } catch (error) {
        showAlert('register-alert', 'An error occurred. Please try again.', 'danger');
    }
}

async function handleLogout() {
    try {
        await apiCall('/api/logout', { method: 'POST' });
        window.location.href = '/login';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// ===== Detection Page =====
let selectedFile = null;

function setupDragDrop() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    
    if (!uploadArea || !fileInput) return;
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
}

function handleFileSelect(file) {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
        showAlert('detect-alert', 'Please select a valid image file (PNG, JPG, JPEG, BMP, GIF, WEBP)', 'danger');
        return;
    }
    
    if (file.size > 16 * 1024 * 1024) {
        showAlert('detect-alert', 'File size must be less than 16MB', 'danger');
        return;
    }
    
    selectedFile = file;
    
    // Display File Info
    const fileNameEl = document.getElementById('file-info-name');
    const fileSizeEl = document.getElementById('file-info-size');
    const fileTypeEl = document.getElementById('file-info-type');
    
    if (fileNameEl) fileNameEl.textContent = file.name;
    if (fileSizeEl) fileSizeEl.textContent = `Size: ${(file.size / 1024).toFixed(1)} KB`;
    if (fileTypeEl) fileTypeEl.textContent = `Format: ${file.type.split('/')[1].toUpperCase()}`;
    
    // Show Preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const previewSection = document.getElementById('preview-section');
        const previewImage = document.getElementById('preview-image');
        if (previewImage) previewImage.src = e.target.result;
        if (previewSection) previewSection.classList.add('active');
    };
    reader.readAsDataURL(file);
}

async function handleDetect() {
    if (!selectedFile) {
        showAlert('detect-alert', 'Please select an image first', 'danger');
        return;
    }
    
    const cropSelect = document.getElementById('crop-select');
    const cropType = cropSelect ? cropSelect.value : 'Auto-Detect';
    
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('crop_type', cropType);
    
    const detectBtn = document.getElementById('detect-btn');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    if (detectBtn) detectBtn.disabled = true;
    if (loadingOverlay) loadingOverlay.classList.add('active');
    
    try {
        const response = await fetch('/api/detect', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        if (data.success) {
            window.location.href = `/results/${data.data.report_id}`;
        } else {
            showAlert('detect-alert', data.message, 'danger');
            if (detectBtn) detectBtn.disabled = false;
            if (loadingOverlay) loadingOverlay.classList.remove('active');
        }
    } catch (error) {
        showAlert('detect-alert', 'An error occurred during image feature detection. Please try again.', 'danger');
        if (detectBtn) detectBtn.disabled = false;
        if (loadingOverlay) loadingOverlay.classList.remove('active');
    }
}

// ===== Results Page =====
async function loadResults(reportId) {
    try {
        const data = await apiCall(`/api/reports/${reportId}`);
        
        if (data.success) {
            const result = data.data;
            displayResults(result);
        } else {
            showAlert('results-alert', data.message, 'danger');
        }
    } catch (error) {
        showAlert('results-alert', 'Failed to load results from database. Please try again.', 'danger');
    }
}

function displayResults(result) {
    // Hide loading, show content
    const loadingEl = document.getElementById('results-loading');
    const contentEl = document.getElementById('results-content');
    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'block';
    
    // Original Uploaded Image Display
    const uploadedImgEl = document.getElementById('result-uploaded-image');
    const fullImgBtn = document.getElementById('btn-full-image');
    const imageUrl = result.image_url || `/uploaded_images/${result.image_filename}`;
    
    if (uploadedImgEl) uploadedImgEl.src = imageUrl;
    if (fullImgBtn) fullImgBtn.href = imageUrl;
    
    // Metadata display
    document.getElementById('meta-filename').textContent = result.image_filename;
    document.getElementById('meta-dimensions').textContent = result.dimensions || '300x300';
    document.getElementById('meta-filesize').textContent = (result.file_size_kb || 150) + ' KB';
    document.getElementById('meta-reportid').textContent = `#${result.id}`;
    
    // Results values
    document.getElementById('result-deficiency').textContent = result.deficiency_type;
    document.getElementById('result-crop').textContent = result.crop_type;
    document.getElementById('result-severity').textContent = result.severity;
    document.getElementById('result-confidence').textContent = (result.confidence * 100).toFixed(1) + '%';
    document.getElementById('result-description').textContent = result.description || 'Analysis completed.';
    document.getElementById('result-recommendation').textContent = result.recommendation;
    
    const createdDate = new Date(result.created_at).toLocaleString();
    document.getElementById('result-date').textContent = createdDate;
    
    // Confidence Bar
    const confidenceBar = document.getElementById('confidence-fill');
    if (confidenceBar) {
        confidenceBar.style.width = (result.confidence * 100) + '%';
    }
    
    // Severity Badge
    const severityBadge = document.getElementById('severity-badge');
    if (severityBadge) {
        severityBadge.className = 'severity-badge';
        const sev = (result.severity || 'mild').toLowerCase();
        if (sev === 'mild') severityBadge.classList.add('severity-mild');
        else if (sev === 'moderate') severityBadge.classList.add('severity-moderate');
        else if (sev === 'severe') severityBadge.classList.add('severity-severe');
        else severityBadge.classList.add('severity-mild');
    }
    
    // Color Analysis Spectrum Bars
    if (result.color_analysis) {
        try {
            const colors = typeof result.color_analysis === 'string' ? JSON.parse(result.color_analysis) : result.color_analysis;
            
            document.getElementById('metric-green').textContent = (colors.green || 0) + '%';
            document.getElementById('bar-green').style.width = (colors.green || 0) + '%';
            
            document.getElementById('metric-yellow').textContent = (colors.yellow || 0) + '%';
            document.getElementById('bar-yellow').style.width = (colors.yellow || 0) + '%';
            
            document.getElementById('metric-brown').textContent = (colors.brown || 0) + '%';
            document.getElementById('bar-brown').style.width = (colors.brown || 0) + '%';
            
            document.getElementById('metric-purple').textContent = (colors.purple || 0) + '%';
            document.getElementById('bar-purple').style.width = (colors.purple || 0) + '%';
        } catch (e) {
            console.error('Failed to parse color analysis JSON', e);
        }
    }
}

// ===== Reports Page =====
async function loadReports() {
    try {
        const data = await apiCall('/api/reports');
        
        if (data.success && data.data.length > 0) {
            displayReports(data.data);
        } else {
            document.getElementById('reports-table-container').innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <h3>No Database Reports Yet</h3>
                    <p>Upload a crop leaf image to generate and store your first diagnosis report.</p>
                    <a href="/detect" class="btn-detect" style="margin-top: 1rem; text-decoration: none;">
                        Upload & Detect Now
                    </a>
                </div>
            `;
        }
    } catch (error) {
        showAlert('reports-alert', 'Failed to load reports from database. Please try again.', 'danger');
    }
}

function displayReports(reports) {
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Original Image</th>
                    <th>Date Stored</th>
                    <th>Crop Type</th>
                    <th>Deficiency</th>
                    <th>Confidence</th>
                    <th>Severity</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    reports.forEach(report => {
        const severityClass = (report.severity || '').toLowerCase() === 'mild' ? 'severity-mild' : 
                             (report.severity || '').toLowerCase() === 'moderate' ? 'severity-moderate' : 'severity-severe';
        const date = new Date(report.created_at).toLocaleDateString();
        const imageUrl = report.image_url || `/uploaded_images/${report.image_filename}`;
        
        html += `
            <tr>
                <td>
                    <a href="${imageUrl}" target="_blank" title="Click to view full image">
                        <img src="${imageUrl}" class="report-thumb" alt="${report.crop_type} leaf image" style="width: 55px; height: 55px; border-radius: 8px; object-fit: cover; border: 2px solid var(--border-color); display: block;">
                    </a>
                </td>
                <td>${date}</td>
                <td><strong>${report.crop_type}</strong></td>
                <td>${report.deficiency_type}</td>
                <td>${(report.confidence * 100).toFixed(1)}%</td>
                <td><span class="severity-badge ${severityClass}">${report.severity}</span></td>
                <td>
                    <button class="btn-view" onclick="window.location.href='/results/${report.id}'">View Report</button>
                    <button class="btn-delete" onclick="deleteReport(${report.id})">Delete</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    
    document.getElementById('reports-table-container').innerHTML = html;
}

async function deleteReport(reportId) {
    if (!confirm('Are you sure you want to delete this database report?')) return;
    
    try {
        const data = await apiCall(`/api/reports/${reportId}`, { method: 'DELETE' });
        if (data.success) {
            showAlert('reports-alert', 'Report deleted from database', 'success');
            loadReports();
        } else {
            showAlert('reports-alert', data.message, 'danger');
        }
    } catch (error) {
        showAlert('reports-alert', 'Failed to delete report. Please try again.', 'danger');
    }
}

// ===== Dashboard =====
async function loadDashboard() {
    try {
        const data = await apiCall('/api/reports');
        if (data.success) {
            const reports = data.data;
            const totalReports = reports.length;
            document.getElementById('total-reports').textContent = totalReports;
            
            const deficiencyCount = reports.filter(r => r.deficiency_type !== 'Healthy').length;
            document.getElementById('deficiency-found').textContent = deficiencyCount;
            
            const healthyCount = reports.filter(r => r.deficiency_type === 'Healthy').length;
            document.getElementById('healthy-crops').textContent = healthyCount;
            
            // Render Recent Activity Gallery
            const recentContainer = document.getElementById('recent-activity');
            if (recentContainer) {
                if (reports.length === 0) {
                    recentContainer.innerHTML = `
                        <div style="padding: 2rem; text-align: center; color: var(--text-muted); background: white; border-radius: var(--radius); width: 100%;">
                            <p>No uploaded image records found. Start by uploading a crop leaf image!</p>
                            <a href="/detect" class="btn-detect" style="margin-top: 1rem; text-decoration: none; display: inline-block;">+ New Detection</a>
                        </div>
                    `;
                } else {
                    let galleryHtml = '';
                    reports.slice(0, 4).forEach(r => {
                        const imgUrl = r.image_url || `/uploaded_images/${r.image_filename}`;
                        galleryHtml += `
                            <div class="recent-card" onclick="window.location.href='/results/${r.id}'" style="background: white; border-radius: var(--radius); padding: 1rem; box-shadow: var(--shadow); cursor: pointer; transition: transform 0.3s; display: flex; gap: 1rem; align-items: center;">
                                <img src="${imgUrl}" alt="${r.crop_type}" style="width: 70px; height: 70px; border-radius: 8px; object-fit: cover; border: 2px solid var(--border-color);">
                                <div style="flex: 1;">
                                    <h4 style="color: var(--primary-dark); margin-bottom: 0.2rem;">${r.crop_type}</h4>
                                    <p style="font-weight: 600; font-size: 0.9rem; color: var(--text-dark); margin-bottom: 0.2rem;">${r.deficiency_type}</p>
                                    <span style="font-size: 0.8rem; color: var(--text-muted);">${new Date(r.created_at).toLocaleDateString()}</span>
                                </div>
                                <span class="btn-view" style="font-size: 0.8rem;">View</span>
                            </div>
                        `;
                    });
                    recentContainer.innerHTML = galleryHtml;
                }
            }
        }
    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

// ===== Initialize Pages =====
document.addEventListener('DOMContentLoaded', () => {
    setupDragDrop();
    
    if (document.getElementById('total-reports')) {
        loadDashboard();
    }
    
    const resultsContainer = document.getElementById('results-container');
    if (resultsContainer) {
        const reportId = resultsContainer.dataset.reportId;
        if (reportId) {
            loadResults(reportId);
        }
    }
    
    if (document.getElementById('reports-table-container')) {
        loadReports();
    }
});
