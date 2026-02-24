import torch
from torchvision import transforms
import timm
import pytorch_lightning as pl
import os

# --- 1. SMART PATH FINDER 🕵️‍♂️ ---
# This ensures Python finds the model file no matter where you run the command from.
# It looks for: backend_api/app/models/deepfake_vit_model.pth
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) 
MODEL_PATH = os.path.join(BASE_DIR, "models", "deepfake_vit_model.pth")

# --- 2. DEFINE THE BRAIN ARCHITECTURE 🏗️ ---
# We must define the class exactly as it was during training
class ViTDeepfakeClassifier(pl.LightningModule):
    def __init__(self):
        super().__init__()
        # We set pretrained=False because we are loading YOUR custom weights now!
        self.model = timm.create_model('vit_base_patch16_224', pretrained=False, num_classes=2)

    def forward(self, x):
        return self.model(x)

# --- 3. THE LOAD FUNCTION 🔄 ---
def load_model():
    print(f"🔄 Looking for AI Brain at: {MODEL_PATH}")
    
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"❌ CRITICAL ERROR: Model not found at {MODEL_PATH}. Did you move it?")

    # Initialize the empty architecture
    model = ViTDeepfakeClassifier()
    
    # Load the weights (Safe for CPU or GPU)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    state_dict = torch.load(MODEL_PATH, map_location=device)
    
    # Load weights into the model
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval() # Set to evaluation mode (turns off training features)
    
    print(f"✅ AI Brain Loaded Successfully on {device}!")
    return model

# --- 4. IMAGE PREPROCESSING 🖼️ ---
# This ensures user images look exactly like the training data (224x224, normalized)
val_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
])