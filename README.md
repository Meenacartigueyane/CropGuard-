# CropGuard AI — Complete Crop Nutrient Deficiency Detection System

CropGuard AI is a professional AI-powered web application built with Python (Flask), OpenCV, ReportLab, SQLite, Bootstrap 5, Font Awesome, and Chart.js.

## System Features

### 1. User Module (Public, No Login Required)
- **Landing Page**: Modern agriculture-themed hero banner, feature breakdown, about project, contact form, and responsive footer.
- **Upload Leaf Page**: Drag-and-drop or file browser uploader with crop species selection (Rice, Tomato, Maize, Wheat, Cotton, Chilli, Groundnut).
- **OpenCV & AI Diagnostics Result Page**:
  - Uploaded leaf preview side-by-side with AI prediction.
  - Softmax Confidence % (0-100%, e.g. 97.45%).
  - Severity Level (Mild 0–20%, Moderate 21–50%, Severe 51–100%) & Affected Leaf Area %.
  - OpenCV HSV Color Feature Spectrum Analysis (Healthy Green %, Yellow Chlorosis %, Browning Necrosis %, Purple Anthocyanin % summing to 100%) with Chart.js pie chart and progress bars.
  - Visual Symptoms Explanation & Recommended Treatment Action Plan (Immediate Action, Fertilizer, Application Method, Dosage, Recovery Time).
- **ReportLab PDF Generation**: Generates official PDF diagnostic certificate with unique Report ID, timestamp, and metadata.

### 2. Host/Admin Module (Protected Session Authentication)
- **Admin Login**:
  - **Default Username**: `host`
  - **Default Password**: `CropGuard@2026`
- **Admin Dashboard**:
  - Stat Cards: Total Predictions, Healthy Plants, Deficient Plants, Today/Weekly/Monthly counts, Top Deficiency, Top Crop.
  - Chart.js Visualizations: Bar Charts for deficiency distribution, Pie Charts for severity ratio.
  - Prediction Records Table: Real-time search, filter by crop/severity, CSV export, PDF export.
- **Fertilizer Knowledge Base**: Interface to configure fertilizer recommendation rules per crop & deficiency.
- **Change Password**: Interface to update admin credentials.

---

## Installation & Setup

1. **Clone/Open Workspace**:
   ```bash
   cd "Smart Farming with AI_ Project Overview and Benefits"
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run Application**:
   ```bash
   python app.py
   ```
   *(or `py app.py` on Windows)*

4. **Access in Browser**:
   - Public Landing Page: `http://localhost:5000`
   - Public Leaf Upload: `http://localhost:5000/detect`
   - Admin Login Portal: `http://localhost:5000/admin/login` (User: `host` | Pass: `CropGuard@2026`)
