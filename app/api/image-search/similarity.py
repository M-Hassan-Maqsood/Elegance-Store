import os
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

# File paths - use the model directory in the project root
EMBEDDINGS_PATH = os.path.join(project_root, "model", "dinov2_embeddings.pkl")
METADATA_PATH = os.path.join(project_root, "model", "dinov2_metadata.csv")
COMBINED_DATA_PATH = os.path.join(project_root, "model", "dinov2_combined_data.pkl")
FAISS_INDEX_PATH = os.path.join(project_root, "model", "dinov2_index.faiss")
IMAGES_DIR = os.path.join(project_root, "public", "imgrt")


# Load embeddings and FAISS index
def load_embeddings():
    try:
        embeddings = None
        metadata_df = None

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
                faiss_index = faiss.read_index(str(FAISS_INDEX_PATH))
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
                faiss.write_index(faiss_index, str(FAISS_INDEX_PATH))
                print(f"Saved FAISS index to {FAISS_INDEX_PATH}")
        except Exception as e:
            print(f"Error with FAISS index: {e}")
            faiss_index = None

        return embeddings, faiss_index, metadata_df
    except Exception as e:
        print(f"Error loading embeddings: {str(e)}")
        return None, None, None


# Function to process image and get embeddings
def process_image_and_get_similar(image_data, model=None, top_k=12, remove_bg=True):
    """Process image and find similar products using DINOv2 embeddings"""
    try:
        # Convert base64 image to PIL Image
        image = Image.open(io.BytesIO(base64.b64decode(image_data)))

        # If model is None, we'll use a simplified approach for demonstration
        if model is None:
            from embedding_search import load_model, extract_embedding

            model, transform, device = load_model()

            if model is None:
                return {"error": "Failed to load DINOv2 model"}

            # Extract embedding
            embedding = extract_embedding(
                image_data, model, transform, device, remove_bg=remove_bg
            )
        else:
            # Assuming model is already loaded and configured
            # This branch would be used when you have a persistent model instance
            # Extract embedding using the provided model
            if remove_bg:
                img_no_bg = rembg.remove(image)
                image = Image.new("RGB", image.size, (255, 255, 255))
                image.paste(img_no_bg, mask=img_no_bg.getchannel("A"))

            # Apply transformations (simplified example)
            transform = Compose(
                [
                    Resize(256),
                    CenterCrop(224),
                    ToTensor(),
                    Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
                ]
            )

            img_tensor = transform(image).unsqueeze(0)
            if torch.cuda.is_available():
                img_tensor = img_tensor.cuda()

            with torch.no_grad():
                features = model(img_tensor)

            embedding = features.squeeze().cpu().numpy()
            embedding = embedding / np.linalg.norm(embedding)

        # Load embeddings and index
        embeddings, index, df = load_embeddings()

        if index is None:
            return {"error": "Failed to load embeddings or index"}

        # Search the index
        embedding = embedding.reshape(1, -1).astype("float32")
        D, I = index.search(embedding, top_k * 3)  # Get more results for filtering

        # Get paths corresponding to indices
        paths = list(embeddings.keys())

        # Get the similar products with filtering
        similar_products = []
        seen_product_ids = set()

        for i, idx in enumerate(I[0]):
            if idx < 0 or idx >= len(paths):
                continue  # Skip invalid indices

            path = paths[idx]
            similarity = float(D[0][i])

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

    except Exception as e:
        return {"error": f"Error processing image: {str(e)}"}


# Function to be called by the API route
def find_similar_products(image_base64, top_k=8, remove_bg=True):
    """Find similar clothing items based on image using DINOv2"""
    # We don't keep a persistent model here for simplicity
    # In production, you might want to load the model once and reuse it
    model = None

    # Process image and find similar products
    result = process_image_and_get_similar(
        image_base64, model, top_k=top_k, remove_bg=remove_bg
    )

    return result


# Simple test if run directly
if __name__ == "__main__":
    if len(sys.argv) > 1:
        image_base64 = sys.argv[1]
        top_k = int(sys.argv[2]) if len(sys.argv) > 2 else 12
        remove_bg = True if len(sys.argv) <= 3 else (sys.argv[3].lower() != "false")

        result = find_similar_products(image_base64, top_k=top_k, remove_bg=remove_bg)
        import json

        print(json.dumps(result))
    else:
        print(json.dumps({"error": "No image data provided"}))
