# 🕵️‍♂️ Deepfake Detective System

<div align="center">

![Status](https://img.shields.io/badge/status-active-success.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![React](https://img.shields.io/badge/react-19.2.0-61dafb.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

*A professional-grade, multi-layered AI forensic pipeline for detecting deepfakes, face swaps, and AI-generated media*

[Features](#-features) • [Architecture](#-architecture) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack)

</div>

---

## 🎯 Overview

Deepfake Detective is an advanced detection system that combines multiple AI models with forensic analysis techniques to identify manipulated media. Built with a cyberpunk-inspired React frontend and a powerful FastAPI backend, it employs a "triple-agent" approach using two specialized Vision Transformers and a forensic analysis engine.

## ✨ Features

### 🤖 **Multi-Model Ensemble AI**
- **Dual ViT Architecture**: Combines two specialized Hugging Face Vision Transformers
- **MAX Confidence Logic**: Trusts the most suspicious prediction to cover blind spots
- **Complementary Detection**: One model specializes in face swaps, the other in AI-generated content

### 🔬 **Prism Forensic Engine**
Goes beyond black-box AI by inspecting the digital DNA of files:
- **EXIF/Metadata Extraction**: Detects traces of editing software (Photoshop, GIMP, Adobe)
- **Error Level Analysis (ELA)**: Calculates compression anomalies to identify spliced pixels
- **Face Geometry Scanning**: Uses MediaPipe to verify facial landmark alignment with human anatomy

### 💻 **Modern Web Interface**
- **Cyberpunk-themed UI**: Neon-styled React dashboard with smooth animations
- **Real-time Analysis**: Line-by-line forensic diagnostic logs
- **Drag & Drop Upload**: Support for JPG, PNG, WEBP formats
- **Confidence Scoring**: Detailed breakdown of detection confidence

---

## 🧠 Architecture

The system employs a **triple-agent approach** where each component specializes in different detection methods:

### 1. **Vigilante-V2 (The Swap Hunter)**
- **Role**: Face Swap Specialist
- **Target**: Traditional deepfakes, face swaps, video manipulation
- **Model**: [`ashish-001/deepfake-detection-using-ViT`](https://huggingface.co/ashish-001/deepfake-detection-using-ViT)

### 2. **Sentinel-X (The GenAI Hunter)**
- **Role**: Synthetic Media Specialist  
- **Target**: Fully synthetic faces, GANs, AI-generated textures
- **Model**: [`dima806/deepfake_vs_real_image_detection`](https://huggingface.co/dima806/deepfake_vs_real_image_detection)

### 3. **Prism (The Forensic Analyst)**
- **Role**: Digital Forensics Expert
- **Methods**: 
  - Metadata inspection for software signatures
  - ELA scoring for compression inconsistencies
  - MediaPipe facial geometry validation

**Detection Strategy**: The system queries all three agents simultaneously and uses `MAX(confidence)` logic - if any agent raises suspicion, the content is flagged.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2.0 | UI Framework |
| TypeScript | 5.9.3 | Type Safety |
| Vite | 7.3.1 | Build Tool |
| Tailwind CSS | 4.1.18 | Styling |
| Framer Motion | 12.34.0 | Animations |
| Axios | 1.13.5 | API Requests |
| Lucide React | 0.563.0 | Icons |

### Backend
| Technology | Purpose |
|-----------|---------|
| FastAPI | REST API Framework |
| Transformers | Hugging Face Model Pipeline |
| PyTorch | Deep Learning Runtime |
| MediaPipe | Face Landmark Detection |
| Pillow (PIL) | Image Processing |
| OpenCV | Computer Vision |
| Uvicorn | ASGI Server |

---

## 🚀 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/farazmirzax/deepfake-detection-system.git
cd deepfake-detection-system
```

### 2️⃣ Backend Setup

```bash
cd backend_api

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn python-multipart transformers torch pillow opencv-python mediapipe numpy pydantic
```

### 3️⃣ Frontend Setup

```bash
cd frontend_web

# Install dependencies
npm install
```

---

## 🎮 Usage

### Start the Backend
```bash
cd backend_api
uvicorn app.main:app --reload
```
**Note**: First run will download AI models (~2GB). Wait for `✅ Full Team Active!`

### Start the Frontend
```bash
cd frontend_web
npm run dev
```
Open browser to `http://localhost:5173`

### Analyze an Image

1. Click the **Image Analysis** tab
2. Drag & drop or click to upload an image (JPG, PNG, WEBP)
3. Wait for the forensic analysis to complete
4. Review the verdict, confidence score, and detailed diagnostic logs

### Sample Output
```
VERDICT: FAKE
CONFIDENCE: 87.45%

ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI AGENT RESULTS:
• Vigilante-V2 (Swap Hunter): 85.2% SUSPICIOUS
• Sentinel-X (GenAI Hunter): 87.5% SUSPICIOUS

🔬 FORENSIC EVIDENCE:
• ⚠️ FORENSIC FLAG: High compression anomaly (ELA Score: 18.3). Pixels may be altered.
• Geometry: Face structure verified (Eyes/Nose/Mouth alignment valid).
• Metadata: Present but no obvious editing software found.
```

---

## 📊 Detection Capabilities

| Content Type | Detection Rate | Notes |
|-------------|---------------|-------|
| Face Swaps | ⭐⭐⭐⭐⭐ | Primary strength |
| AI-Generated Faces | ⭐⭐⭐⭐⭐ | StyleGAN, Midjourney, DALL-E |
| Heavily Edited Photos | ⭐⭐⭐⭐ | May trigger false positives |
| Subtle Manipulations | ⭐⭐⭐ | Challenging for all models |
| Video Analysis | 🚧 | Currently disabled (planned) |

---

## 🔮 Roadmap

- [x] Dual AI model ensemble
- [x] Forensic analysis engine (EXIF, ELA, geometry)
- [x] Modern web interface
- [ ] Video URL analysis (download + frame extraction)
- [ ] Batch processing
- [ ] API key authentication
- [ ] Advanced ELA visualization
- [ ] Model fine-tuning on custom datasets

---

## ⚠️ Disclaimer

**For Educational & Research Use Only**

This tool is designed for educational purposes and research in digital forensics. Key limitations:

- **Not 100% Accurate**: No detection system is perfect. False positives and false negatives will occur.
- **Against Sophisticated Fakes**: State-of-the-art deepfakes may evade detection.
- **Heavily Edited Content**: Legitimate photos with heavy retouching may be flagged.
- **Evolving Threat**: AI generation techniques constantly improve.

⚖️ **Always use this tool as part of a broader investigative process, not as sole evidence.**

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Hugging Face](https://huggingface.co) for model hosting
- [MediaPipe](https://google.github.io/mediapipe/) for face landmark detection
- [FastAPI](https://fastapi.tiangolo.com/) for the excellent web framework

---

<div align="center">

**Built with 🧠 by [Faraz Mirza](https://github.com/farazmirzax)**

[Report Bug](https://github.com/farazmirzax/deepfake-detection-system/issues) • [Request Feature](https://github.com/farazmirzax/deepfake-detection-system/issues)

</div>
