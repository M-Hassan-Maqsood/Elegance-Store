import pandas as pd
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import requests
import os
import pickle
from dotenv import load_dotenv
import json
import time

# Load environment variables from .env file
load_dotenv()

# File paths for saved embeddings and index
EMBEDDINGS_PATH = "/Recomend/product_embeddings.pkl"
FAISS_INDEX_PATH = "/Recomend/product_index.faiss"
PRODUCT_INFO_PATH = "/Recomend/product_info.pkl"

# Use absolute path for the CSV file
df = pd.read_csv("/Recomend/products.csv")

# Initialize Sentence Transformer model
model = SentenceTransformer("all-MiniLM-L6-v2")


# Function to preprocess product data and create embeddings
def create_product_embeddings(df, model):
    product_data = []

    for _, row in df.iterrows():
        # Combine product features into a single string for embedding
        # Use correct column name "Product Description" instead of "Description"
        product_str = f"Description: {row['Product Description']}, Price: {row['Price']}, Color: {row['Color']}"
        product_data.append(product_str)

    # Convert product data to embeddings
    product_embeddings = model.encode(product_data)

    return product_embeddings


# Check if embeddings and index already exist, if not create and save them
if not os.path.exists(EMBEDDINGS_PATH) or not os.path.exists(FAISS_INDEX_PATH):
    print("Creating embeddings and FAISS index for the first time...")

    # Create product embeddings
    product_embeddings = create_product_embeddings(df, model)

    # Build a FAISS index
    dimension = product_embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(np.array(product_embeddings, dtype=np.float32))

    # Store product information for easy access
    product_info = {
        i: {
            "ID": row["ID"],
            "Product Name": row["Product Name"],
            "Description": row["Product Description"],
            "Price": row["Price"],
            "Color": row["Color"],
        }
        for i, row in df.iterrows()
    }

    # Save embeddings, index, and product info to disk
    with open(EMBEDDINGS_PATH, "wb") as f:
        pickle.dump(product_embeddings, f)

    faiss.write_index(index, FAISS_INDEX_PATH)

    with open(PRODUCT_INFO_PATH, "wb") as f:
        pickle.dump(product_info, f)

    print(f"Embeddings saved to {EMBEDDINGS_PATH}")
    print(f"FAISS index saved to {FAISS_INDEX_PATH}")
    print(f"Product info saved to {PRODUCT_INFO_PATH}")
else:
    print("Loading pre-computed embeddings and FAISS index...")

    # Load embeddings and index from disk
    with open(EMBEDDINGS_PATH, "rb") as f:
        product_embeddings = pickle.load(f)

    index = faiss.read_index(FAISS_INDEX_PATH)

    with open(PRODUCT_INFO_PATH, "rb") as f:
        product_info = pickle.load(f)

    print("Embeddings and index loaded successfully.")


# Function to convert user input into a vector
def user_input_to_vector(user_input):
    # Convert the user input into a single string
    user_input_str = f"Skin Tone: {user_input['skin_tone']}, Season: {user_input['season']}, Event: {user_input['event']}, Budget: {user_input['budget']}"
    # Get the embedding of the user input
    user_vector = model.encode([user_input_str])
    return user_vector


# Function to find the best matching products using FAISS
def find_best_matching_products(user_vector, index, top_n=3):
    # Perform the search in the FAISS index
    D, I = index.search(np.array(user_vector, dtype=np.float32), top_n)
    return I[0]  # Return the indices of the top_n most similar products


# Function to get an explanation from Gemini API
def get_gemini_explanation(user_input, recommended_product):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "API key not found. Please set the GEMINI_API_KEY environment variable."

    # Format the prompt with product details and user preferences
    prompt = f"""
    As a fashion adviser, explain why this product would be a good recommendation for a user with the following preferences:
    - Skin tone: {user_input["skin_tone"]}
    - Season: {user_input["season"]}
    - Event: {user_input["event"]}
    - Budget: {user_input["budget"]}
    
    The recommended product is:
    - Name: {recommended_product["Product Name"]}
    - Description: {recommended_product["Description"]}
    - Price: {recommended_product["Price"]}
    - Color: {recommended_product["Color"]}
    
    Provide a concise explanation (1-2 sentences) focusing on why this is a good match for their needs.
    """

    # Updated to use gemini-2.0-flash model as specified in your cURL example
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    headers = {"Content-Type": "application/json", "x-goog-api-key": api_key}

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 150,
            "topP": 0.8,
            "topK": 40,
        },
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()  # Raise an exception for HTTP errors

        response_data = response.json()
        if "candidates" in response_data and len(response_data["candidates"]) > 0:
            explanation = response_data["candidates"][0]["content"]["parts"][0][
                "text"
            ].strip()
            return explanation
        else:
            return "No explanation generated."
    except Exception as e:
        return f"Error getting explanation: {str(e)}"


# Function to display options and get user choice
def get_user_choice(question, options):
    print(f"\n{question}")

    # Display options
    for i, option in enumerate(options, 1):
        print(f"{i}. {option}")

    # Get user choice
    while True:
        try:
            choice_input = input("Enter the number or type your choice: ")

            # If user entered a number
            if choice_input.isdigit():
                choice_num = int(choice_input)
                if 1 <= choice_num <= len(options):
                    choice = options[choice_num - 1]
                    break
                else:
                    print(f"Please enter a number between 1 and {len(options)}.")
            # If user typed the option directly
            else:
                choice_input = choice_input.strip().lower()
                for option in options:
                    if choice_input == option.lower():
                        choice = option
                        break
                else:
                    print(f"Please enter one of the given options.")
                    continue
                break
        except ValueError:
            print("Invalid input. Please enter a number or one of the options.")

    # Display confirmation message
    print(f"{choice}")
    return choice


# Function to get user information through conversation with button-like options
def get_user_preferences():
    # Dictionary to store user preferences
    user_preferences = {}

    # Skin tone
    skin_tone_options = ["Fair", "Medium", "Dark"]
    skin_tone = get_user_choice("What is your skin tone?", skin_tone_options)
    user_preferences["skin_tone"] = skin_tone
    print(f"Thank you for sharing your {skin_tone} skin tone.")

    # Season
    season_options = ["Summer", "Winter", "Spring", "Autumn"]
    season = get_user_choice("Which season are you shopping for?", season_options)
    user_preferences["season"] = season
    print(f"Perfect! You're shopping for the {season} season.")

    # Event
    event_options = ["Wedding", "Casual", "Party", "Formal"]
    event = get_user_choice("What type of event are you shopping for?", event_options)
    user_preferences["event"] = event
    print(f"Great! You're shopping for a {event} event.")

    # Budget
    budget_options = ["Under 5000", "5000-10000", "Above 10000"]
    budget = get_user_choice("What is your budget range?", budget_options)
    user_preferences["budget"] = budget
    print(f"Thank you! Your budget is {budget}.")

    # Parse budget
    if budget == "Under 5000":
        user_preferences["budget"] = 5000
    elif budget == "5000-10000":
        user_preferences["budget"] = 10000
    else:  # Above 10000
        user_preferences["budget"] = 40000

    return user_preferences


# Function to recommend products with explanations
def recommend_products_with_explanations(user_input):
    try:
        start_time = time.time()
        print(
            f"\nFinding recommendations for {user_input['skin_tone']} skin tone, {user_input['season']} season, {user_input['event']} event, with budget {user_input['budget']}..."
        )

        # Convert user input to embedding
        user_vector = user_input_to_vector(user_input)

        # Find the best matching products using FAISS
        top_product_indices = find_best_matching_products(user_vector, index, top_n=3)

        # Fetch the recommended products and explanations
        recommended_products = []
        for idx in top_product_indices:
            product = product_info[idx]
            print(f"Getting explanation for {product['Product Name']}...")
            explanation = get_gemini_explanation(user_input, product)
            recommended_products.append(
                {"product": product, "explanation": explanation}
            )

        end_time = time.time()
        print(f"\nRecommendations generated in {end_time - start_time:.2f} seconds")
        return recommended_products
    except Exception as e:
        print(f"Error: {e}")
        return []


# Function to display recommendations in a more readable format
def display_recommendations(recommendations):
    print("\n" + "=" * 30)
    print(" " * 30 + "PERSONALIZED RECOMMENDATIONS")
    print("=" * 30)

    for i, item in enumerate(recommendations, 1):
        product = item["product"]
        explanation = item["explanation"]

        print(f"\n[RECOMMENDATION #{i}]")
        print(f"Product ID: {product['ID']}")
        print(f"Product Name: {product['Product Name']}")
        print(f"Price: Rs. {product['Price']}")
        print(f"Color: {product['Color']}")
        print(f"\nWhy this matches your preferences:")
        print(f"  {explanation}")
        print("-" * 80)


if __name__ == "__main__":
    print("\n" + "=" * 80)
    print(" " * 20 + "WELCOME TO ELEGANCE CLOTHING RECOMMENDATION SYSTEM")
    print("=" * 80)

    print(
        "\nTo provide you with personalized recommendations, I'll ask you a few questions."
    )
    print("Please select one of the options for each question.")

    # Get user preferences through conversation with button-like options
    user_input = get_user_preferences()

    print("\nFinding personalized recommendations based on your preferences:")
    print(f"- Skin Tone: {user_input['skin_tone']}")
    print(f"- Season: {user_input['season']}")
    print(f"- Event: {user_input['event']}")
    print(
        f"- Budget: {'Under 5000' if user_input['budget'] == 5000 else '5000-10000' if user_input['budget'] == 10000 else 'Above 10000'}"
    )

    # Get product recommendations and explanations
    recommendations = recommend_products_with_explanations(user_input)

    # Display the recommendations in a better format instead of saving to file
    display_recommendations(recommendations)

    print("\nThank you for using our recommendation system!")
