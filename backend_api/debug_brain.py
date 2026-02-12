import torch
import os
from PIL import Image
from app.services.predictor import load_model, val_transforms

# --- CONFIG ---
# Replace this with the filename of that DEFORMED face you just tested
TEST_IMAGE = "image_2e621e.png" 

# --- 1. LOAD BRAIN ---
print("🧠 Loading Model...")
model = load_model()
model.eval()

# --- 2. LOAD IMAGE ---
if not os.path.exists(TEST_IMAGE):
    print(f"❌ Error: Could not find {TEST_IMAGE}")
    exit()

print(f"📸 Testing on: {TEST_IMAGE}")
img = Image.open(TEST_IMAGE).convert("RGB")

# --- 3. TRANSFORM ---
# Let's see what the model actually eats
img_tensor = val_transforms(img)
print(f"📊 Tensor Stats: Min={img_tensor.min():.4f}, Max={img_tensor.max():.4f}, Mean={img_tensor.mean():.4f}")
# If Min is 0.0 and Max is 0.0, the image is loading as black!

img_tensor = img_tensor.unsqueeze(0) # Add batch dimension

# --- 4. RAW OUTPUTS ---
with torch.no_grad():
    logits = model(img_tensor)
    probs = torch.nn.functional.softmax(logits, dim=1)

print("\n🔍 --- X-RAY RESULTS ---")
print(f"🔢 Raw Logits (The raw scores): {logits.tolist()}")
print(f"📉 Probabilities: {probs.tolist()}")
print(f"🏷️ Predicted Class Index: {torch.argmax(probs).item()}")

# Check Class Mapping assumption
print("\nIf Index 0 = FAKE and Index 1 = REAL:")
print(f"   Fake Score: {probs[0][0].item()*100:.4f}%")
print(f"   Real Score: {probs[0][1].item()*100:.4f}%")