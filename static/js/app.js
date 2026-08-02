// ===== CropGuard AI Client Application =====

// 1. Image File Preview & Upload Handling
let selectedLeafFile = null;

function setupImageUploader() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    
    if (!uploadArea || !fileInput) return;
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('border-primary');
        uploadArea.style.background = '#e8f5e9';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('border-primary');
        uploadArea.style.background = '#ffffff';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-primary');
        uploadArea.style.background = '#ffffff';
        if (e.dataTransfer.files.length > 0) {
            handleLeafFile(e.dataTransfer.files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleLeafFile(e.target.files[0]);
        }
    });
}

function handleLeafFile(file) {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(file.type)) {
        showGlobalAlert('detect-alert', 'Only JPG, JPEG, and PNG files are allowed.', 'danger');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showGlobalAlert('detect-alert', 'File size exceeds maximum limit of 5MB.', 'danger');
        return;
    }
    
    selectedLeafFile = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const previewImage = document.getElementById('preview-image');
        const previewSection = document.getElementById('preview-section');
        const fileNameEl = document.getElementById('file-name-text');
        const fileSizeEl = document.getElementById('file-size-text');
        
        if (previewImage) previewImage.src = e.target.result;
        if (fileNameEl) fileNameEl.textContent = file.name;
        if (fileSizeEl) fileSizeEl.textContent = `${(file.size / 1024).toFixed(1)} KB`;
        if (previewSection) previewSection.classList.remove('d-none');
    };
    reader.readAsDataURL(file);
}

async function submitLeafDetection() {
    if (!selectedLeafFile) {
        showGlobalAlert('detect-alert', 'Please select a crop leaf image first.', 'warning');
        return;
    }
    
    const cropSelect = document.getElementById('crop-select');
    const cropType = cropSelect ? cropSelect.value : 'Auto-Detect';
    
    const formData = new FormData();
    formData.append('image', selectedLeafFile);
    formData.append('crop_type', cropType);
    
    const detectBtn = document.getElementById('btn-analyze-submit');
    const loadingSpinner = document.getElementById('loading-overlay');
    
    if (detectBtn) detectBtn.disabled = true;
    if (loadingSpinner) loadingSpinner.classList.remove('d-none');
    
    try {
        const res = await fetch('/api/detect', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        
        if (data.success) {
            window.location.href = `/results/${data.report_id}`;
        } else {
            showGlobalAlert('detect-alert', data.message || 'Detection failed.', 'danger');
            if (detectBtn) detectBtn.disabled = false;
            if (loadingSpinner) loadingSpinner.classList.add('d-none');
        }
    } catch (err) {
        showGlobalAlert('detect-alert', 'An error occurred during AI processing.', 'danger');
        if (detectBtn) detectBtn.disabled = false;
        if (loadingSpinner) loadingSpinner.classList.add('d-none');
    }
}

// 2. Results Page Handling & Chart.js Spectrum Pie Chart
async function loadDetectionResults(reportId) {
    try {
        const res = await fetch(`/api/reports/${reportId}`);
        const result = await res.json();
        
        if (result.success) {
            renderResultsPage(result.data);
        } else {
            showGlobalAlert('results-alert', result.message || 'Report not found.', 'danger');
        }
    } catch (err) {
        showGlobalAlert('results-alert', 'Failed to load report from database.', 'danger');
    }
}

function renderResultsPage(data) {
    const loadingEl = document.getElementById('results-loading');
    const contentEl = document.getElementById('results-content');
    
    if (loadingEl) loadingEl.classList.add('d-none');
    if (contentEl) contentEl.classList.remove('d-none');
    
    // Set Header & Image
    document.getElementById('report-id-badge').textContent = data.report_id;
    document.getElementById('report-date').textContent = data.created_at;
    document.getElementById('result-leaf-image').src = data.image_url;
    
    // Unknown Crop / Low Confidence Warning Check
    const warnEl = document.getElementById('unknown-crop-warning');
    const msgEl = document.getElementById('res-unknown-msg');
    if (warnEl) {
        if (data.crop_type === 'Unknown Crop' || (data.crop_confidence && data.crop_confidence < 80.0)) {
            warnEl.classList.remove('d-none');
            if (msgEl && data.crop_status) msgEl.textContent = data.crop_status;
        } else {
            warnEl.classList.add('d-none');
        }
    }
    
    // Stage 1: Crop Classification Model Card
    const cropConf = data.crop_confidence || 95.0;
    document.getElementById('res-crop-name').textContent = data.crop_type;
    document.getElementById('res-crop-conf-badge').textContent = `${cropConf}%`;
    const cropBar = document.getElementById('crop-conf-bar');
    if (cropBar) cropBar.style.width = `${cropConf}%`;
    const cropStatusEl = document.getElementById('res-crop-status');
    if (cropStatusEl) cropStatusEl.textContent = data.crop_status || 'Identified Successfully';
    
    // Stage 2: Nutrient Deficiency Model Card
    const defConf = data.confidence || 95.0;
    document.getElementById('res-deficiency-name').textContent = data.deficiency_type;
    document.getElementById('res-def-conf-badge').textContent = `${defConf}%`;
    const defBar = document.getElementById('def-conf-bar');
    if (defBar) defBar.style.width = `${defConf}%`;
    
    // Reliability & Risk Level Badges
    const relBadge = document.getElementById('res-reliability-badge');
    if (relBadge) {
        const rel = data.reliability || (defConf >= 95 ? 'Excellent' : defConf >= 90 ? 'Very Good' : 'Good');
        relBadge.textContent = `Reliability: ${rel}`;
        relBadge.className = 'badge px-3 py-2 rounded-pill fw-bold ' + (rel === 'Excellent' ? 'bg-success' : rel === 'Very Good' ? 'bg-info' : 'bg-primary');
    }
    
    const riskBadge = document.getElementById('res-risk-badge');
    if (riskBadge) {
        const r = data.risk_level || (data.severity_level === 'Severe' ? 'High Risk' : data.severity_level === 'Moderate' ? 'Medium Risk' : 'Low Risk');
        riskBadge.textContent = r;
        riskBadge.className = 'badge px-3 py-2 rounded-pill fw-bold ' + (r === 'High Risk' ? 'bg-danger' : r === 'Medium Risk' ? 'bg-warning text-dark' : 'bg-success');
    }
    
    // Affected Area & Severity Badge
    document.getElementById('res-affected-area').textContent = `${data.affected_area_pct}%`;
    const sevBadge = document.getElementById('res-severity-badge');
    if (sevBadge) {
        sevBadge.textContent = data.severity_level;
        sevBadge.className = 'severity-badge';
        const lev = (data.severity_level || '').toLowerCase();
        if (lev === 'mild') sevBadge.classList.add('severity-mild');
        else if (lev === 'moderate') sevBadge.classList.add('severity-moderate');
        else if (lev === 'severe') sevBadge.classList.add('severity-severe');
        else sevBadge.classList.add('severity-none');
    }
    
    // Summary Card
    document.getElementById('sum-crop').textContent = data.crop_type;
    document.getElementById('sum-deficiency').textContent = data.deficiency_type;
    document.getElementById('sum-confidence').textContent = `${defConf}%`;
    document.getElementById('sum-severity').textContent = data.severity_level;
    document.getElementById('sum-health').textContent = data.overall_health || (data.deficiency_type === 'Healthy' ? 'Excellent' : 'Fair');
    
    // Spectrum Progress Bars & Values
    document.getElementById('val-green').textContent = `${data.green_pct}%`;
    document.getElementById('bar-green').style.width = `${data.green_pct}%`;
    
    document.getElementById('val-yellow').textContent = `${data.yellow_pct}%`;
    document.getElementById('bar-yellow').style.width = `${data.yellow_pct}%`;
    
    document.getElementById('val-brown').textContent = `${data.brown_pct}%`;
    document.getElementById('bar-brown').style.width = `${data.brown_pct}%`;
    
    document.getElementById('val-purple').textContent = `${data.purple_pct}%`;
    document.getElementById('bar-purple').style.width = `${data.purple_pct}%`;
    
    // Visual Symptoms & Action Plan
    document.getElementById('res-symptoms').textContent = data.visual_symptoms;
    document.getElementById('res-action').textContent = data.immediate_action;
    document.getElementById('res-fertilizer').textContent = data.recommended_fertilizer;
    document.getElementById('res-application').textContent = data.application_method;
    document.getElementById('res-dosage').textContent = data.dosage;
    document.getElementById('res-recovery').textContent = data.recovery_time;
    
    // Dynamic Treatment Tips List
    const tipsList = document.getElementById('treatment-tips-list');
    if (tipsList) {
        try {
            const tips = typeof data.treatment_tips === 'string' ? JSON.parse(data.treatment_tips) : data.treatment_tips;
            if (Array.isArray(tips) && tips.length > 0) {
                tipsList.innerHTML = tips.map(tip => `<li class="mb-2"><i class="fa-solid fa-check-circle text-success me-2"></i>${tip}</li>`).join('');
            }
        } catch (e) {
            // fallback
        }
    }
    
    // Export Links
    const pdfBtn = document.getElementById('btn-download-pdf');
    if (pdfBtn) pdfBtn.href = `/api/pdf/${data.report_id}`;
    
    const jsonBtn = document.getElementById('btn-download-json');
    if (jsonBtn) jsonBtn.href = `/api/json/${data.report_id}`;
    
    // Render Dual Spectrum Charts (Pie & Doughnut)
    renderSpectrumCharts(data.green_pct, data.yellow_pct, data.brown_pct, data.purple_pct);
}

function renderSpectrumCharts(green, yellow, brown, purple) {
    const pieCanvas = document.getElementById('spectrumPieChart');
    const doughnutCanvas = document.getElementById('spectrumDoughnutChart');
    
    const labels = ['Healthy Green', 'Yellowing', 'Browning', 'Purple'];
    const colorsList = ['#2d6a4f', '#f77f00', '#964b00', '#6f42c1'];
    
    if (pieCanvas) {
        new Chart(pieCanvas, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{ data: [green, yellow, brown, purple], backgroundColor: colorsList }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    }

    if (doughnutCanvas) {
        new Chart(doughnutCanvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{ data: [green, yellow, brown, purple], backgroundColor: colorsList }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    }
}

function shareReportLink() {
    const currentUrl = window.location.href;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(currentUrl);
        alert('Diagnostic Report URL copied to clipboard!');
    } else {
        alert(`Shareable Report Link:\n${currentUrl}`);
    }
}

// 3. Helper Alert
function showGlobalAlert(containerId, message, type = 'success') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}

// Initialize handlers on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    setupImageUploader();
    
    const resultsWrapper = document.getElementById('results-wrapper');
    if (resultsWrapper) {
        const reportId = resultsWrapper.dataset.reportId;
        if (reportId) loadDetectionResults(reportId);
    }
});
