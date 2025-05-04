import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from PIL import Image
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import torch
import torchvision  # Added the missing import
from torchvision import transforms, models
import argparse  # Added for command line arguments

# Load image information
df_info = pd.read_csv("image_database.csv")
print(f"Loaded information for {len(df_info)} images")

# Load embeddings
with open("image_embeddings.pkl", "rb") as f:
    embeddings = pickle.load(f)
print(f"Loaded {len(embeddings)} embeddings")

# Set up the model for query image processing
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


def extract_query_embedding(image_path):
    """Extract embedding for a query image"""
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
        print(f"Error processing query image {image_path}: {e}")
        return None


def find_similar_items(query_image_path, top_k=5):
    """Find the most similar clothing items to the query image"""
    # Extract embedding for the query image
    query_embedding = extract_query_embedding(query_image_path)

    if query_embedding is None:
        print("Failed to process query image")
        return None

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

    # Get the top k unique items
    top_items = []
    unique_items = set()

    for _, row in results_df.iterrows():
        if row["item_id"] not in unique_items and len(unique_items) < top_k:
            top_items.append(row)
            unique_items.add(row["item_id"])

    return pd.DataFrame(top_items)


def display_results(query_image_path, similar_items_df):
    """Display query image and top matching items"""
    if similar_items_df is None or len(similar_items_df) == 0:
        print("No matching items to display")
        return

    n_items = len(similar_items_df)
    plt.figure(figsize=(15, 4))

    # Display query image
    plt.subplot(1, n_items + 1, 1)
    query_img = Image.open(query_image_path)
    plt.imshow(query_img)
    plt.title("Query Image")
    plt.axis("off")

    # Display top matches (one per clothing item)
    for i, (_, row) in enumerate(similar_items_df.iterrows()):
        plt.subplot(1, n_items + 1, i + 2)
        img = Image.open(row["image_path"])
        plt.imshow(img)
        plt.title(f"Item: {row['item_id']}\nSimilarity: {row['similarity']:.2f}")
        plt.axis("off")

    plt.tight_layout()
    plt.show()


def process_specific_image(image_path, top_k=5):
    """Process a specific image path provided by the user"""
    if not os.path.exists(image_path):
        print(f"Error: Image path '{image_path}' does not exist")
        return

    print(f"Processing image: {image_path}")

    # Find similar items
    top_matches = find_similar_items(image_path, top_k=top_k)

    # Display results
    display_results(image_path, top_matches)

    # Print results
    print("\nMatching Results:")
    for i, (_, row) in enumerate(top_matches.iterrows(), 1):
        print(f"{i}. Item: {row['item_id']}, Similarity: {row['similarity']:.4f}")

    return top_matches


def get_random_test_image():
    """Get a random test image from the dataset"""
    images_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "images")

    all_folders = [
        folder
        for folder in os.listdir(images_dir)
        if os.path.isdir(os.path.join(images_dir, folder))
    ]

    if not all_folders:
        print("No folders found in the dataset directory")
        return None, None

    # Select a random folder
    test_folder = random.choice(all_folders)
    folder_path = os.path.join(images_dir, test_folder)

    # Get images in the folder
    test_images = [
        f
        for f in os.listdir(folder_path)
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    ]

    if not test_images:
        print(f"No images found in folder {test_folder}")
        return None, None

    # Select a random image
    test_image = os.path.join(folder_path, random.choice(test_images))
    return test_image, test_folder


if __name__ == "__main__":
    # Set up argument parser
    parser = argparse.ArgumentParser(
        description="Find similar clothing items to an image"
    )
    parser.add_argument(
        "--image", type=str, help="Path to the query image", default=None
    )
    parser.add_argument(
        "--top_k", type=int, default=5, help="Number of similar items to return"
    )
    args = parser.parse_args()

    if args.image:
        # Use the specified image
        top_matches = process_specific_image(args.image, top_k=args.top_k)
    else:
        # Use a random test image
        import random

        test_image, test_folder = get_random_test_image()

        if test_image:
            print(f"Selected test image: {test_image}")
            top_matches = process_specific_image(test_image, top_k=args.top_k)

            # Check if top result is correct (only applicable for random test images)
            if test_folder and top_matches is not None and not top_matches.empty:
                correct_match = top_matches.iloc[0]["item_id"] == test_folder
                print(f"\nCorrect match as top result: {'✓' if correct_match else '✗'}")
