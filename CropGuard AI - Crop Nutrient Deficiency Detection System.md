# CropGuard AI - Crop Nutrient Deficiency Detection System

## Project Overview

CropGuard AI is an intelligent web application that uses Artificial Intelligence (CNN-based deep learning) to detect nutrient deficiencies in crop leaves. The system helps farmers, agricultural officers, researchers, and students identify crop health issues quickly and receive smart fertilizer recommendations.

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Flask (Python) |
| Database | SQLite |
| AI Model | CNN (Convolutional Neural Network) - Simulated in prototype |
| IDE | Visual Studio Code |
| Version Control | GitHub |

## Features

1. **User Authentication** - Registration and login system with role-based access
2. **Image Upload** - Drag-and-drop or click-to-upload crop leaf images
3. **AI Detection** - Automated nutrient deficiency detection using CNN model
4. **Smart Recommendations** - Fertilizer and treatment suggestions
5. **Report Management** - View, manage, and delete previous detection reports
6. **Dashboard** - Overview statistics and quick actions

## Installation & Running

```bash
# Navigate to project directory
cd crop-deficiency-detector

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py

# Open browser and go to
http://localhost:5000
```

## Project Structure

```
crop-deficiency-detector/
├── app.py                  # Main Flask application
├── requirements.txt        # Python dependencies
├── crop_deficiency.db      # SQLite database (auto-created)
├── static/
│   ├── css/
│   │   └── style.css       # Main stylesheet
│   ├── js/
│   │   └── app.js          # Frontend JavaScript
│   ├── images/             # Static images
│   └── uploads/            # Uploaded crop images
└── templates/
    ├── login.html          # Login page
    ├── register.html       # Registration page
    ├── dashboard.html      # User dashboard
    ├── detect.html         # Image upload & detection
    ├── results.html        # Detection results
    └── reports.html        # Reports history
```

## Detectable Nutrient Deficiencies

- Nitrogen Deficiency
- Phosphorus Deficiency
- Potassium Deficiency
- Iron Deficiency
- Magnesium Deficiency
- Zinc Deficiency
- Healthy (No deficiency)

## Future Enhancements

- Train CNN model with real crop leaf datasets
- Integrate with weather data for contextual analysis
- Add multi-language support
- Mobile-responsive PWA
- Real-time notifications
- Advanced analytics and reporting

## License

This project is developed for academic and research purposes.

---
**CropGuard AI** - Supporting Smart Farming & Sustainable Agriculture
