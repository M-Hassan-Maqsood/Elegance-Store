#!/usr/bin/env python
import os
from os import path
import sys
import pickle
import faiss
import numpy as np
from pathlib import Path
import pandas as pd
from PIL import Image
import io
import base64
import torch
import rembg
from torchvision.transforms import Compose, Resize, CenterCrop, ToTensor, Normalize

# Get the project root directory
project_root = Path(__file__).parent.parent.parent.parent

# Add the fyp directory to the path so we can import modules
sys.path.append(str(project_root))

# File paths - update to use the model directory in the project root
EMBEDDINGS_PATH = path.join(project_root, "model", "dinov2_embeddings.pkl")
METADATA_PATH = path.join(project_root, "model", "dinov2_metadata.csv")
COMBINED_DATA_PATH = path.join(project_root, "model", "dinov2_combined_data.pkl")
FAISS_INDEX_PATH = path.join(project_root, "model", "dinov2_index.faiss")
IMAGES_DIR = path.join(
    project_root, "public", "imgrt"
)  # Assuming images are in public/imgrt

# Define image preprocessing
preprocess = Compose(
    [
        Resize(256),
        CenterCrop(224),
        ToTensor(),
        Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)


# Set up the model for feature extraction
def load_model():
    """Load the DINOv2 model for feature extraction"""
    try:
        print("Loading DINOv2 model...")
        try:
            # Try loading from torch hub first (the simpler approach)
            model = torch.hub.load("facebookresearch/dinov2", "dinov2_vitb14")
            model.eval()
        except Exception as e:
            print(f"Error loading from hub: {e}")
            print("Loading DINOv2 with custom implementation...")

            # Import necessary libraries for DINOv2
            from torch import nn
            from torch.hub import load_state_dict_from_url

            # DINOv2 model configuration
            MODEL_URL = "https://dl.fbaipublicfiles.com/dinov2/dinov2_vitb14/dinov2_vitb14_pretrain.pth"

            # Simple implementation of ViT for DINOv2
            class VisionTransformer(nn.Module):
                def __init__(
                    self,
                    img_size=224,
                    patch_size=14,
                    in_chans=3,
                    embed_dim=768,
                    depth=12,
                    num_heads=12,
                    mlp_ratio=4,
                    norm_layer=nn.LayerNorm,
                ):
                    super().__init__()
                    self.img_size = img_size
                    self.patch_size = patch_size
                    self.in_chans = in_chans
                    self.embed_dim = embed_dim

                    # Create patches
                    self.patch_embed = nn.Conv2d(
                        in_chans, embed_dim, kernel_size=patch_size, stride=patch_size
                    )

                    # Create class token and positional embedding
                    self.cls_token = nn.Parameter(torch.zeros(1, 1, embed_dim))
                    self.pos_embed = nn.Parameter(
                        torch.zeros(1, (img_size // patch_size) ** 2 + 1, embed_dim)
                    )

                    # Main transformer blocks
                    self.blocks = nn.ModuleList(
                        [
                            nn.TransformerEncoderLayer(
                                d_model=embed_dim,
                                nhead=num_heads,
                                dim_feedforward=int(embed_dim * mlp_ratio),
                                dropout=0.0,
                                batch_first=True,
                            )
                            for _ in range(depth)
                        ]
                    )

                    self.norm = norm_layer(embed_dim)

                def forward(self, x):
                    # Get patches
                    x = self.patch_embed(x)
                    x = x.flatten(2).transpose(1, 2)  # B,C,H,W -> B,N,C

                    # Append class token
                    cls_token = self.cls_token.expand(x.shape[0], -1, -1)
                    x = torch.cat((cls_token, x), dim=1)

                    # Add positional embedding
                    x = x + self.pos_embed

                    # Apply transformer blocks
                    for block in self.blocks:
                        x = block(x)

                    x = self.norm(x)

                    # Return [CLS] token as embedding
                    return x[:, 0]

            # Define model architecture based on DINOv2 ViT-B/14
            model = VisionTransformer(
                img_size=224,
                patch_size=14,
                embed_dim=768,  # Base model embedding dimension
                depth=12,  # Number of transformer blocks
                num_heads=12,  # Number of attention heads
            )

            # Load pre-trained weights
            state_dict = load_state_dict_from_url(MODEL_URL, map_location="cpu")

            # Remove some keys that might not match our simplified implementation
            for key in list(state_dict.keys()):
                if "head" in key:  # Remove classification head weights
                    del state_dict[key]

            # Load weights (with strict=False to ignore missing keys)
            model.load_state_dict(state_dict, strict=False)

            # Set to evaluation mode
            model.eval()

        # Use CPU as we're running in a serverless environment
        device = torch.device("cpu")
        model = model.to(device)

        # Define the transform
        transform = Compose(
            [
                Resize(256),
                CenterCrop(224),
                ToTensor(),
                Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ]
        )

        return model, transform, device
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        return None, None, None


# Load embeddings and FAISS index
def load_embeddings():
    """Load embeddings, FAISS index and product database"""
    try:
        embeddings = None
        metadata_df = None
        faiss_index = None

        # Verify files exist
        if not os.path.exists(COMBINED_DATA_PATH) and not os.path.exists(
            EMBEDDINGS_PATH
        ):
            print("Neither combined data nor embeddings file found")
            return None, None, None

        if not os.path.exists(METADATA_PATH) and not os.path.exists(COMBINED_DATA_PATH):
            print("No metadata file found")
            return None, None, None

        # Try to load the combined data first
        try:
            with open(COMBINED_DATA_PATH, "rb") as f:
                combined_data = pickle.load(f)
                embeddings = combined_data["embeddings"]
                metadata_df = pd.DataFrame(combined_data["metadata"])
                print(
                    f"Loaded {len(embeddings)} embeddings and metadata from combined file"
                )
        except (FileNotFoundError, KeyError) as e:
            print(f"Combined data not found or invalid: {e}")

            # Try loading separate files
            try:
                with open(EMBEDDINGS_PATH, "rb") as f:
                    embeddings = pickle.load(f)

                metadata_df = pd.read_csv(METADATA_PATH)
                print(
                    f"Loaded {len(embeddings)} embeddings and metadata from separate files"
                )
            except Exception as e:
                print(f"Error loading data: {e}")
                return None, None, None

        # Load or create FAISS index
        try:
            if os.path.exists(FAISS_INDEX_PATH):
                faiss_index = faiss.read_index(FAISS_INDEX_PATH)
                print(f"Loaded FAISS index from {FAISS_INDEX_PATH}")
            else:
                print("FAISS index file not found, creating new index...")
                # Convert embeddings to a numpy array for FAISS
                embedding_list = list(embeddings.values())
                embedding_matrix = np.vstack(embedding_list).astype("float32")

                # Build a FAISS index
                dim = embedding_matrix.shape[1]  # Embedding dimension
                faiss_index = faiss.IndexFlatIP(
                    dim
                )  # Inner product (cosine similarity for normalized vectors)
                faiss_index.add(embedding_matrix)
                print(f"Created FAISS index with {faiss_index.ntotal} vectors")

                # Save the index for future use
                faiss.write_index(faiss_index, FAISS_INDEX_PATH)
                print(f"Saved FAISS index to {FAISS_INDEX_PATH}")
        except Exception as e:
            print(f"Error with FAISS index: {e}")
            faiss_index = None

        return embeddings, faiss_index, metadata_df
    except Exception as e:
        print(f"Error loading embeddings: {str(e)}")
        return None, None, None


# Extract embedding from image
def extract_embedding(image_data, model, transform, device, remove_bg=True):
    """Extract embedding from a base64 encoded image"""
    try:
        # Convert base64 image to PIL Image
        image = Image.open(io.BytesIO(base64.b64decode(image_data)))

        # Remove background if requested
        if remove_bg:
            print("Removing background from image...")
            # Apply rembg and convert back to RGB to ensure 3 channels
            img_no_bg = rembg.remove(image)
            # The result from rembg is RGBA, convert back to RGB to ensure compatibility
            image = Image.new(
                "RGB", image.size, (255, 255, 255)
            )  # Create a white background
            image.paste(
                img_no_bg, mask=img_no_bg.getchannel("A")
            )  # Paste using alpha as mask

        # Apply transformations
        img_tensor = transform(image).unsqueeze(0).to(device)

        # Extract features
        with torch.no_grad():
            features = model(img_tensor)

        # Convert to numpy and normalize
        embedding = features.squeeze().cpu().numpy()
        embedding = embedding / np.linalg.norm(embedding)

        return embedding
    except Exception as e:
        print(f"Error extracting embedding: {str(e)}")
        return None


# Function to search for similar products
def search_similar_products(image_base64, top_k=12, remove_bg=True):
    """Search for similar products using the image"""
    # Load model
    model, transform, device = load_model()
    if model is None:
        return {"error": "Failed to load model"}

    # Load embeddings and index
    embeddings, index, df = load_embeddings()
    if index is None or df is None:
        return {"error": "Failed to load embeddings"}

    # Extract embedding from uploaded image
    query_embedding = extract_embedding(
        image_base64, model, transform, device, remove_bg=remove_bg
    )
    if query_embedding is None:
        return {"error": "Failed to extract embedding from image"}

    # Search the index
    query_embedding = query_embedding.reshape(1, -1).astype("float32")
    distances, indices = index.search(
        query_embedding, top_k * 3
    )  # Get extra results for filtering

    # Get paths corresponding to indices
    paths = list(embeddings.keys())

    # Get the similar products
    similar_products = []
    seen_product_ids = set()

    for i, idx in enumerate(indices[0]):
        if idx < 0 or idx >= len(paths):
            continue  # Skip invalid indices

        path = paths[idx]
        similarity = float(distances[0][i])  # Convert to float for JSON serialization

        # Get product_id from metadata
        product_id = None
        path_in_metadata = df["relative_path"] == path
        if any(path_in_metadata):
            product_info = df[path_in_metadata].iloc[0]
            product_id = product_info["product_id"]

        # Filter out same product
        if product_id in seen_product_ids:
            continue

        if product_id:
            seen_product_ids.add(product_id)

        full_path = os.path.join(IMAGES_DIR, path)

        similar_products.append(
            {
                "product_id": product_id,
                "image_path": path,
                "full_path": full_path,
                "similarity": similarity,
            }
        )

        if len(similar_products) >= top_k:
            break

    return {"success": True, "results": similar_products}


# Main function for the script
if __name__ == "__main__":
    # If there's a command-line argument, try to process it as base64 image
    if len(sys.argv) > 1:
        image_base64 = sys.argv[1]
        top_k = int(sys.argv[2]) if len(sys.argv) > 2 else 12
        remove_bg = True if len(sys.argv) <= 3 else (sys.argv[3].lower() != "false")

        results = search_similar_products(
            image_base64, top_k=top_k, remove_bg=remove_bg
        )
        import json

        print(json.dumps(results))
    else:
        print(json.dumps({"error": "No image data provided"}))
