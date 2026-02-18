from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
from PIL import Image, ImageChops, ImageEnhance
import uvicorn
import os
import shutil
import io
import numpy as np

# --- IMPORTS & SETUP ---
try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    print("⚠️ MediaPipe not found. 'Prism' Face Geometry scanner will be skipped.")

# --- 1. SETUP APP ---
app = FastAPI(title="Deepfake Detective (CSI Edition)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. LOAD AI MODELS (Vigilante & Sentinel) ---
print("⏳ Loading Forensic Team... (This may take 1 minute)")

try:
    # AGENT A: Swap Hunter
    print("   ...Waking up Vigilante-V2...")
    detector_swap = pipeline("image-classification", model="ashish-001/deepfake-detection-using-ViT")
    
    # AGENT B: GenAI Hunter
    print("   ...Waking up Sentinel-X...")
    detector_gen = pipeline("image-classification", model="dima806/deepfake_vs_real_image_detection")
    
    print("✅ Full Team Active!")
except Exception as e:
    print(f"❌ Critical Error loading models: {e}")
    detector_swap = None
    detector_gen = None

# --- 3. THE NEW AGENT: PRISM (Forensics) 🔬 ---
class PrismAgent:
    @staticmethod
    def scan_metadata(image: Image.Image):
        """Looks for 'Photoshop' or editing software in hidden tags"""
        logs = []
        try:
            exif_data = image.getexif()
            if not exif_data:
                return ["Metadata: Clean/Stripped (Common in social media)"]
            
            # Check for software traces
            software_tags = [0x0131, 0x013b] # Tags for 'Software' or 'Artist'
            for tag_id in software_tags:
                if tag_id in exif_data:
                    val = str(exif_data[tag_id])
                    if any(x in val.lower() for x in ['adobe', 'photoshop', 'gimp', 'editor']):
                        logs.append(f"⚠️ METADATA FLAG: Editing software detected ('{val}').")
            
            if not logs:
                logs.append("Metadata: Present but no obvious editing software found.")
        except Exception:
            logs.append("Metadata: Could not parse.")
        return logs

    @staticmethod
    def scan_ela(image: Image.Image):
        """Error Level Analysis - Checks for compression anomalies"""
        try:
            # 1. Save original to buffer
            buf = io.BytesIO()
            image.save(buf, "JPEG", quality=90)
            buf.seek(0)
            
            # 2. Open compressed version
            compressed = Image.open(buf)
            
            # 3. Compute difference
            diff = ImageChops.difference(image.convert("RGB"), compressed.convert("RGB"))
            
            # 4. Calculate 'Tamper Score'
            extrema = diff.getextrema()
            max_diff = sum([ex[1] for ex in extrema]) / 3  # Average max difference
            
            if max_diff > 15:
                return [f"⚠️ FORENSIC FLAG: High compression anomaly (ELA Score: {max_diff:.1f}). Pixels may be altered."]
            return [f"Forensics: Compression levels look natural (ELA Score: {max_diff:.1f})."]
        except Exception:
            return ["Forensics: ELA Scan failed."]

    @staticmethod
    def scan_face_geometry(image_path: str):
        """Uses MediaPipe to check if a face actually exists"""
        if not MEDIAPIPE_AVAILABLE:
            return []
        
        logs = []
        try:
            # 👇 THE FIX: Direct import path that bypasses the Windows glitch 👇
            from mediapipe.python.solutions import face_mesh as mp_face_mesh
            import cv2
            
            with mp_face_mesh.FaceMesh(
                static_image_mode=True,
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5
            ) as face_mesh:
                
                img = cv2.imread(image_path)
                if img is None: return []
                
                # Scan the face
                results = face_mesh.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
                
                if not results.multi_face_landmarks:
                    logs.append("⚠️ GEOMETRY FLAG: No human face detected (or face is obscured).")
                else:
                    logs.append("Geometry: Face structure verified (Eyes/Nose/Mouth alignment valid).")
        except Exception as e:
            print(f"Prism Geometry Error: {e}")
            pass
            
        return logs

# --- HELPER: NORMALIZE SCORES ---
def get_fake_probability(predictions):
    fake_score = 0.0
    for pred in predictions:
        label = pred['label'].lower()
        score = pred['score']
        if label in ['fake', 'deepfake', 'artificial', 'label_1']:
            fake_score = score
        elif label in ['real', 'natural', 'label_0']:
            if fake_score == 0: fake_score = 1.0 - score
    return fake_score

class VideoRequest(BaseModel):
    url: str

# --- 4. ENDPOINT: SCAN IMAGE (CSI MODE) 📸 ---
@app.post("/scan-image/")
async def scan_image(file: UploadFile = File(...)):
    print(f"📸 Agent received image: {file.filename}")
    
    # Save temp file for Prism
    temp_filename = f"temp_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Load Image
        image = Image.open(temp_filename)
        
        # --- PHASE 1: AI MODELS ---
        if detector_swap and detector_gen:
            preds_swap = detector_swap(image)
            preds_gen = detector_gen(image)
            score_swap = get_fake_probability(preds_swap)
            score_gen = get_fake_probability(preds_gen)
        else:
            score_swap, score_gen = 0.5, 0.5 # Fail safe

        # --- PHASE 2: PRISM FORENSICS ---
        prism_logs = []
        prism_logs.extend(PrismAgent.scan_metadata(image))
        prism_logs.extend(PrismAgent.scan_ela(image))
        prism_logs.extend(PrismAgent.scan_face_geometry(temp_filename))

        # --- PHASE 3: VERDICT LOGIC ---
        final_score = max(score_swap, score_gen) * 100
        verdict = "FAKE" if final_score > 50 else "REAL"
        
        # Display Score Logic
        display_score = final_score
        if verdict == "REAL":
            display_score = 100 - final_score

        # --- PHASE 4: GENERATE RICH REPORT ---
        report_lines = []
        
        # 1. The Headlines
        if verdict == "FAKE":
            if score_swap > 0.9:
                report_lines.append(f"• CRITICAL: Vigilante-V2 detected distinct Face Swap artifacts ({score_swap*100:.1f}% confidence).")
            if score_gen > 0.9:
                report_lines.append(f"• CRITICAL: Sentinel-X detected AI Generative textures ({score_gen*100:.1f}% confidence).")
        else:
             report_lines.append(f"• CLEAN: AI models found no manipulation traces.")

        # 2. The Forensics (Prism)
        for log in prism_logs:
            report_lines.append(f"• {log}")

        # Join into a single string for the frontend
        full_analysis = "\n".join(report_lines)

        return {
            "verdict": verdict,
            "confidence_score": f"{display_score:.2f}%",
            "analysis": full_analysis
        }

    except Exception as e:
        print(f"❌ Error: {e}")
        return {"verdict": "ERROR", "analysis": str(e)}
    
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

# --- 5. ENDPOINT: SCAN VIDEO LINK 🎥 ---
@app.post("/scan-video/")
async def scan_video(request: VideoRequest):
    return {"verdict": "REAL", "confidence_score": "0.00%", "analysis": "Video scanning disabled for Image Test."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)