#!/usr/bin/env python
# Script to find similar images based on embeddings
import os
import sys
import numpy as np
import pandas as pd
import pickle
import torch
import torchvision
from torchvision import transforms, models
from PIL import Image
from sklearn.metrics.pairwise import cosine_similarity
import json

# Get the image path from the command line argument
if len(sys.argv) < 2:
    print(json.dumps({"error": "No image file provided"}))
    sys.exit(1)

query_image_path = sys.argv[1]
current_dir = os.path.dirname(os.path.abspath(__file__))

try:
    # Load image information
    df_info = pd.read_csv(os.path.join(current_dir, "image_database.csv"))

    # Load embeddings
    with open(os.path.join(current_dir, "image_embeddings.pkl"), "rb") as f:
        embeddings = pickle.load(f)

    # Set up the model for query image processing - Using the exact same approach as emd.py
    model = models.resnet50(weights=torchvision.models.ResNet50_Weights.IMAGENET1K_V2)
    feature_extractor = torch.nn.Sequential(*list(model.children())[:-1])
    feature_extractor.eval()

    # Use GPU if available
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    feature_extractor = feature_extractor.to(device)

    # Define image preprocessing
    preprocess = transforms.Compose(
        [
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ]
    )

    # Extract embedding for a query image - using the exact same function as in emd.py
    def extract_query_embedding(image_path):
        try:
            img = Image.open(image_path).convert("RGB")
            img_tensor = preprocess(img)
            img_tensor = img_tensor.unsqueeze(0).to(device)

            with torch.no_grad():
                features = feature_extractor(img_tensor)

            # Flatten and normalize
            query_embedding = features.squeeze().cpu().numpy()
            query_embedding = query_embedding / np.linalg.norm(query_embedding)
            return query_embedding
        except Exception as e:
            print(json.dumps({"error": f"Error processing query image: {str(e)}"}))
            sys.exit(1)

    # Find similar items - using the exact same approach as in emd.py but with threshold
    def find_similar_items(query_embedding, top_k=5, threshold=0.6):
        # Calculate similarity with all database images
        similarities = []
        for embedding in embeddings:
            similarity = cosine_similarity(
                query_embedding.reshape(1, -1), embedding.reshape(1, -1)
            )[0][0]
            similarities.append(similarity)

        # Add similarities to the dataframe
        results_df = df_info.copy()
        results_df["similarity"] = similarities

        # Sort by similarity (highest first)
        results_df = results_df.sort_values("similarity", ascending=False)

        # Apply similarity threshold
        results_df = results_df[results_df["similarity"] >= threshold]

        # Get the top k unique items using the same approach as in emd.py
        top_items = []
        unique_items = set()

        for _, row in results_df.iterrows():
            item_id = row["item_id"]
            if item_id not in unique_items and len(unique_items) < top_k:
                top_items.append(
                    {
                        "id": item_id,
                        "similarity": float(row["similarity"]),
                        "image_path": row["image_path"],
                    }
                )
                unique_items.add(item_id)

        return top_items

    # Process the query image
    query_embedding = extract_query_embedding(query_image_path)
    similar_items = find_similar_items(query_embedding, top_k=5, threshold=0.6)

    # Return results as JSON
    print(json.dumps(similar_items))

except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
