from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
from PIL import Image
import uvicorn
import os
import shutil
import io

# --- IMPORTS FROM YOUR TOOLBOX ---
try:
    from app.services.face_extractor import extract_faces_from_video
    from app.services.video_downloader import download_video
    VIDEO_TOOLS_AVAILABLE = True
except ImportError:
    print("⚠️ Video tools not found. Video scanning will be disabled.")
    VIDEO_TOOLS_AVAILABLE = False

# --- 1. SETUP APP ---
app = FastAPI(title="Deepfake Detective (Local Brain)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. LOAD AI MODEL LOCALLY 🧠 ---
print("⏳ Loading Dima806 Generalist model locally... (This happens only once)")
try:
    # We use the 'Generalist' model that catches both Face Swaps AND generated faces (GANs)
    deepfake_detector = pipeline("image-classification", model="dima806/deepfake_vs_real_image_detection")
    print("✅ Model loaded successfully! Agent is ready.")
except Exception as e:
    print(f"❌ Critical Error loading model: {e}")
    deepfake_detector = None

class VideoRequest(BaseModel):
    url: str

# --- 3. ENDPOINT: SCAN IMAGE 📸 ---
@app.post("/scan-image/")
async def scan_image(file: UploadFile = File(...)):
    print(f"📸 Agent received image: {file.filename}")
    
    if deepfake_detector is None:
        return {"verdict": "ERROR", "analysis": "Model failed to load."}

    try:
        # Read image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # 🧠 SCAN
        predictions = deepfake_detector(image)
        
        # 👇 DEBUG LOGS
        print(f"🕵️‍♂️ RAW MODEL OUTPUT: {predictions}") 

        fake_score = 0.0
        
        # --- UNIVERSAL LABEL PARSING ---
        # Handles "Fake", "fake", "LABEL_1", "Deepfake"
        for pred in predictions:
            label = pred['label'].lower()
            score = pred['score']
            
            # CHECK FOR FAKE
            if label in ['fake', 'deepfake', 'artificial', 'label_1']:
                fake_score = score
            
            # CHECK FOR REAL
            elif label in ['real', 'natural', 'label_0']:
                if fake_score == 0:
                    fake_score = 1.0 - score
        
        confidence = fake_score * 100
        verdict = "FAKE" if confidence > 50 else "REAL"
        
        # Smart Analysis Text
        if verdict == "FAKE":
            if confidence > 90:
                analysis = f"CRITICAL: High probability of AI generation detected. Confidence: {confidence:.2f}%"
            else:
                analysis = f"Suspicious artifacts detected. Possible editing or AI. Confidence: {confidence:.2f}%"
        else:
            analysis = f"Media authenticated. No digital anomalies found. Confidence: {confidence:.2f}%"

        return {
            "verdict": verdict,
            "confidence_score": f"{confidence:.2f}%",
            "analysis": analysis
        }

    except Exception as e:
        print(f"❌ Error: {e}")
        return {"verdict": "ERROR", "analysis": str(e)}

# --- 4. ENDPOINT: SCAN VIDEO LINK 🎥 ---
@app.post("/scan-video/")
async def scan_video(request: VideoRequest):
    if not VIDEO_TOOLS_AVAILABLE:
        return {"verdict": "ERROR", "analysis": "Video tools (downloader/extractor) are missing."}
        
    url = request.url
    print(f"🕵️‍♂️ Agent processing video: {url}")

    video_path = download_video(url)
    if not video_path:
        return {"verdict": "ERROR", "analysis": "Could not download video."}

    try:
        print("✂️ Extracting frames...")
        # Extract 3 frames
        pil_faces = extract_faces_from_video(video_path, max_frames=3)
        
        if not pil_faces:
             return {"verdict": "REAL", "confidence_score": "100%", "analysis": "No faces found to analyze."}

        fake_scores = []
        for i, face_img in enumerate(pil_faces):
            # Run Local Model
            preds = deepfake_detector(face_img)
            
            # Universal Label Logic for Video Frames too
            frame_fake_score = 0.0
            for pred in preds:
                lbl = pred['label'].lower()
                if lbl in ['fake', 'deepfake', 'artificial', 'label_1']:
                    frame_fake_score = pred['score']
                elif lbl in ['real', 'natural', 'label_0']:
                    if frame_fake_score == 0: frame_fake_score = 1.0 - pred['score']
            
            fake_scores.append(frame_fake_score)

        # Average the scores
        avg_score = (sum(fake_scores) / len(fake_scores)) * 100 if fake_scores else 0
        verdict = "FAKE" if avg_score > 50 else "REAL"
        
        return {
            "verdict": verdict,
            "confidence_score": f"{avg_score:.2f}%",
            "analysis": f"Scanned {len(pil_faces)} frames locally. Average Risk: {avg_score:.1f}%"
        }

    finally:
        # Cleanup
        if os.path.exists(video_path):
            os.remove(video_path)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)