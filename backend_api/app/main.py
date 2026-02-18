from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
from PIL import Image
import uvicorn
import os
import shutil
import io

# --- 1. SETUP APP ---
app = FastAPI(title="Deepfake Detective (Double Agent)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. LOAD BOTH MODELS LOCALLY 🧠 ---
print("⏳ Loading AI Ensemble... (This may take 1-2 minutes)")

try:
    # AGENT A: The "Swap Hunter" (Ashish-ViT renamed)
    # Specializes in Face Swaps (Deepfakes, Video manip)
    print("   ...Loading Agent: Vigilante-V2...")
    detector_swap = pipeline("image-classification", model="ashish-001/deepfake-detection-using-ViT")
    
    # AGENT B: The "GenAI Hunter" (Dima806 renamed)
    # Specializes in GANs, Midjourney, StyleGAN artifacts
    print("   ...Loading Agent: Sentinel-X...")
    detector_gen = pipeline("image-classification", model="dima806/deepfake_vs_real_image_detection")
    
    print("✅ Double Agent System Loaded Successfully!")
except Exception as e:
    print(f"❌ Critical Error loading models: {e}")
    detector_swap = None
    detector_gen = None

class VideoRequest(BaseModel):
    url: str

# --- HELPER: NORMALIZE SCORES ---
def get_fake_probability(predictions):
    """ extracts the 'fake' score regardless of the label name """
    fake_score = 0.0
    for pred in predictions:
        label = pred['label'].lower()
        score = pred['score']
        
        # Check for FAKE labels
        if label in ['fake', 'deepfake', 'artificial', 'label_1']:
            fake_score = score
        
        # Check for REAL labels
        elif label in ['real', 'natural', 'label_0']:
            if fake_score == 0: fake_score = 1.0 - score
            
    return fake_score

# --- 3. ENDPOINT: SCAN IMAGE (ENSEMBLE) 📸 ---
@app.post("/scan-image/")
async def scan_image(file: UploadFile = File(...)):
    print(f"📸 Agent received image: {file.filename}")
    
    if detector_swap is None or detector_gen is None:
        return {"verdict": "ERROR", "analysis": "Models failed to load."}

    try:
        # Read image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # 🧠 DOUBLE SCAN
        preds_swap = detector_swap(image) # Ask Vigilante-V2
        preds_gen = detector_gen(image)   # Ask Sentinel-X
        
        # Get probabilities
        score_swap = get_fake_probability(preds_swap)
        score_gen = get_fake_probability(preds_gen)
        
        print(f"🕵️‍♂️ Vigilante-V2 (Swap): {score_swap:.4f} | Sentinel-X (GenAI): {score_gen:.4f}")

        # ⚖️ THE VERDICT LOGIC
        final_score = max(score_swap, score_gen) * 100
        verdict = "FAKE" if final_score > 50 else "REAL"
        
        # 🔄 SCORE FLIP FOR UX
        # If Real, show "Authenticity Score" (100 - Risk)
        display_score = final_score
        if verdict == "REAL":
            display_score = 100 - final_score
        
        # Smart Analysis Text (Using New Cool Names)
        if verdict == "FAKE":
            if score_swap > 0.9:
                analysis = f"CRITICAL: Face Swap detected by Vigilante-V2. Confidence: {display_score:.1f}%"
            elif score_gen > 0.9:
                analysis = f"CRITICAL: AI Generation detected by Sentinel-X. Confidence: {display_score:.1f}%"
            else:
                analysis = f"Suspicious artifacts detected by Ensemble. Confidence: {display_score:.1f}%"
        else:
            analysis = f"Verified by Double Agent System. No anomalies found. Confidence: {display_score:.1f}%"

        return {
            "verdict": verdict,
            "confidence_score": f"{display_score:.2f}%",
            "analysis": analysis
        }

    except Exception as e:
        print(f"❌ Error: {e}")
        return {"verdict": "ERROR", "analysis": str(e)}

# --- 4. ENDPOINT: SCAN VIDEO LINK 🎥 ---
@app.post("/scan-video/")
async def scan_video(request: VideoRequest):
    return {
        "verdict": "REAL", 
        "confidence_score": "0.00%", 
        "analysis": "Video scanning temporarily disabled to test Image Ensemble."
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)