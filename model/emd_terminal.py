# Import necessary libraries for embedding creation
import os
import numpy as np
import pandas as pd
from PIL import Image
import torch
import torchvision
from torchvision import transforms, models
import pickle
from tqdm import tqdm  # Using regular tqdm instead of tqdm.notebook
import glob

# Set up the pre-trained model for feature extraction
print("Loading ResNet50 model...")
model = models.resnet50(weights=torchvision.models.ResNet50_Weights.IMAGENET1K_V2)
feature_extractor = torch.nn.Sequential(*list(model.children())[:-1])
feature_extractor.eval()

# Use GPU if available
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
feature_extractor = feature_extractor.to(device)
print(f"Using device: {device}")

# Define image preprocessing
preprocess = transforms.Compose(
    [
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)


# Function to extract embedding from an image
def extract_embedding(image_path):
    """Extract feature embedding from an image using the pre-trained model"""
    try:
        img = Image.open(image_path).convert("RGB")
        img_tensor = preprocess(img)
        img_tensor = img_tensor.unsqueeze(0).to(device)

        with torch.no_grad():
            features = feature_extractor(img_tensor)

        # Flatten and normalize the features
        features = features.squeeze().cpu().numpy()
        features = features / np.linalg.norm(features)  # Normalize
        return features
    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        return None


# Main folder containing all clothing item subfolders
main_dir = r"E:\web\ladies-clothing-store (2)\model\images"
print(f"Looking for images in: {main_dir}")

# Create dictionaries to store image information and embeddings
database = {
    "item_id": [],  # Folder name (clothing item ID)
    "image_path": [],  # Path to the image
    "embedding": [],  # Feature embedding
}

# Process all subfolders
folder_list = [
    f for f in os.listdir(main_dir) if os.path.isdir(os.path.join(main_dir, f))
]
print(f"Found {len(folder_list)} clothing item folders")

# Process each subfolder
for item_folder in tqdm(folder_list, desc="Processing folders"):
    folder_path = os.path.join(main_dir, item_folder)

    # Get all images in the folder
    image_files = (
        glob.glob(os.path.join(folder_path, "*.jpg"))
        + glob.glob(os.path.join(folder_path, "*.jpeg"))
        + glob.glob(os.path.join(folder_path, "*.png"))
    )

    if len(image_files) > 0:
        print(f"Processing {len(image_files)} images in folder {item_folder}")

        for img_path in tqdm(
            image_files, desc=f"  Images in {item_folder}", leave=False
        ):
            embedding = extract_embedding(img_path)

            if embedding is not None:
                database["item_id"].append(item_folder)
                database["image_path"].append(img_path)
                database["embedding"].append(embedding)

# Print summary
total_images = len(database["embedding"])
total_items = len(set(database["item_id"]))
print(
    f"Successfully processed {total_images} images from {total_items} unique clothing items"
)

# Save image information to CSV
output_csv = "image_database.csv"
df_info = pd.DataFrame(
    {"item_id": database["item_id"], "image_path": database["image_path"]}
)
df_info.to_csv(output_csv, index=False)
print(f"Saved image information to {output_csv}")

# Save embeddings to pickle file
output_pkl = "image_embeddings.pkl"
with open(output_pkl, "wb") as f:
    pickle.dump(database["embedding"], f)
print(f"Saved embeddings to {output_pkl}")

# Show sample of the saved data
print("\nSample of the saved data:")
print(df_info.head())
