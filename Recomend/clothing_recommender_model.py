import pandas as pd
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import requests
import os
import pickle
from dotenv import load_dotenv
import time
import logging

# Set up logging
logging.basicConfig(
    filename="fashion_recommendations.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Price range categories
PRICE_RANGES = {
    "budget": (0, 4000),  # Under 4000
    "mid_range": (4000, 10000),  # Between 4000-10000
    "premium": (10000, float("inf")),  # Above 10000
}


class ClothingRecommender:
    """A reusable recommendation system for clothing products based on user preferences."""

    def __init__(
        self,
        csv_path=None,
        embeddings_path="enhanced_product_embeddings.pkl",
        faiss_index_path="enhanced_product_index.faiss",
        product_info_path="enhanced_product_info.pkl",
        model_name="all-MiniLM-L6-v2",
    ):
        """
        Initialize the ClothingRecommender with paths and model settings.

        Args:
            csv_path: Path to the products CSV file
            embeddings_path: Path to save/load product embeddings
            faiss_index_path: Path to save/load FAISS index
            product_info_path: Path to save/load product information
            model_name: Name of the sentence transformer model to use
        """
        # Load environment variables
        load_dotenv()

        # Store paths
        self.embeddings_path = embeddings_path
        self.faiss_index_path = faiss_index_path
        self.product_info_path = product_info_path

        # Initialize model
        self.model = SentenceTransformer(model_name)

        # Load or create embeddings and index
        if csv_path and (
            not os.path.exists(embeddings_path) or not os.path.exists(faiss_index_path)
        ):
            self._initialize_from_csv(csv_path)
        else:
            self._load_existing_data()

        # Extract available options from the dataset
        self._extract_filter_options()

    def _initialize_from_csv(self, csv_path):
        """Initialize embeddings and index from CSV file."""
        logger.info("Creating embeddings and FAISS index for the first time...")
        print("Creating embeddings and FAISS index for the first time...")

        # Load product data
        df = pd.read_csv(csv_path)

        # Create product embeddings (excluding price and ID)
        self.product_embeddings = self._create_product_embeddings(df)

        # Build FAISS index
        dimension = self.product_embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dimension)
        self.index.add(np.array(self.product_embeddings, dtype=np.float32))

        # Store product information including additional fields if available
        self.product_info = {}
        for i, row in df.iterrows():
            product_info = {
                "ID": row["ID"],
                "Product Name": row["Product Name"],
                "Description": row["Product Description"],
                "Price": row["Price"],
                "Color": row["Color"],
            }

            # Add optional fields if they exist in the dataframe
            if "Product Type" in df.columns:
                product_info["Product Type"] = row["Product Type"]
            if "Occasion" in df.columns:
                product_info["Occasion"] = row["Occasion"]
            if "Skin Tone Category" in df.columns:
                product_info["Skin Tone Category"] = row["Skin Tone Category"]

            self.product_info[i] = product_info

        # Save to disk
        with open(self.embeddings_path, "wb") as f:
            pickle.dump(self.product_embeddings, f)

        faiss.write_index(self.index, self.faiss_index_path)

        with open(self.product_info_path, "wb") as f:
            pickle.dump(self.product_info, f)

        logger.info("Embeddings and index saved successfully")
        print("Embeddings and index saved successfully.")

    def _load_existing_data(self):
        """Load pre-computed embeddings and index from disk."""
        logger.info("Loading pre-computed embeddings and FAISS index...")
        print("Loading pre-computed embeddings and FAISS index...")

        with open(self.embeddings_path, "rb") as f:
            self.product_embeddings = pickle.load(f)

        self.index = faiss.read_index(self.faiss_index_path)

        with open(self.product_info_path, "rb") as f:
            self.product_info = pickle.load(f)

        logger.info("Embeddings and index loaded successfully")
        print("Embeddings and index loaded successfully.")

        # Create a DataFrame with product info for easier filtering
        self.product_df = pd.DataFrame.from_dict(self.product_info, orient="index")

    def _extract_filter_options(self):
        """Extract available options for filters from the dataset."""
        logger.info("Extracting filter options from the dataset")

        # Create product_df if it doesn't exist yet
        if not hasattr(self, "product_df"):
            self.product_df = pd.DataFrame.from_dict(self.product_info, orient="index")

        # Initialize with mandatory options
        self.available_options = {"price_range": list(PRICE_RANGES.keys())}

        # Add optional filters if they exist in the data
        if "Skin Tone Category" in self.product_df.columns:
            self.available_options["skin_tone"] = sorted(
                self.product_df["Skin Tone Category"].unique().tolist()
            )
        elif "skin_tone" in self.product_df.columns:
            self.available_options["skin_tone"] = sorted(
                self.product_df["skin_tone"].unique().tolist()
            )

        if "Occasion" in self.product_df.columns:
            self.available_options["occasion"] = sorted(
                self.product_df["Occasion"].unique().tolist()
            )
        elif "event" in self.product_df.columns:
            self.available_options["occasion"] = sorted(
                self.product_df["event"].unique().tolist()
            )

        if "Product Type" in self.product_df.columns:
            self.available_options["product_type"] = sorted(
                self.product_df["Product Type"].unique().tolist()
            )

        logger.info(f"Available options extracted: {self.available_options}")

    def get_filter_options(self):
        """
        Get available options for each filter.

        Returns:
            Dictionary with available filter options
        """
        return self.available_options

    def _create_product_embeddings(self, df):
        """
        Create embeddings for product data, excluding price and ID which will be used as filters.

        Args:
            df: DataFrame with product data

        Returns:
            numpy array of embeddings
        """
        product_data = []

        for _, row in df.iterrows():
            # Construct a feature string excluding price and ID (they'll be used as filters)
            features = [
                f"Description: {row['Product Description']}",
                f"Color: {row['Color']}",
            ]

            # Add optional fields if they exist
            if "Product Type" in df.columns:
                features.append(f"Product Type: {row['Product Type']}")

            if "Occasion" in df.columns:
                features.append(f"Occasion: {row['Occasion']}")

            if "Skin Tone Category" in df.columns:
                features.append(f"Skin Tone Category: {row['Skin Tone Category']}")

            # Join all features into a single string
            product_str = ", ".join(features)
            product_data.append(product_str)

        # Convert to embeddings
        logger.info(f"Encoding {len(product_data)} products")
        return self.model.encode(product_data)

    def _apply_filters(
        self, price_range=None, skin_tone=None, occasion=None, product_type=None
    ):
        """
        Apply selected filters to the product dataset.

        Args:
            price_range: String key for price range ("budget", "mid_range", "premium") or numerical value
            skin_tone: Optional skin tone filter
            occasion: Optional occasion filter
            product_type: Optional product type filter

        Returns:
            List of product indices that match the filters
        """
        logger.info(
            f"Applying filters: price_range={price_range}, skin_tone={skin_tone}, occasion={occasion}, product_type={product_type}"
        )

        # Start with all indices
        filtered_indices = set(self.product_df.index.tolist())
        filter_applied = False

        # Price filtering
        if price_range:
            filter_applied = True
            # Convert prices to numeric if they aren't already
            if not pd.api.types.is_numeric_dtype(self.product_df["Price"]):
                self.product_df["Price"] = pd.to_numeric(
                    self.product_df["Price"], errors="coerce"
                )

            # Handle string price range ("budget", "mid_range", "premium")
            if isinstance(price_range, str) and price_range in PRICE_RANGES:
                min_price, max_price = PRICE_RANGES[price_range]
            # Handle numeric budget value
            elif isinstance(price_range, (int, float)):
                # Determine which range it falls into
                if price_range <= 5000:
                    min_price, max_price = PRICE_RANGES["budget"]
                elif price_range <= 10000:
                    min_price, max_price = PRICE_RANGES["mid_range"]
                else:
                    min_price, max_price = PRICE_RANGES["premium"]
            else:
                # Default to all prices
                min_price, max_price = 0, float("inf")

            price_indices = set(
                self.product_df[
                    (self.product_df["Price"] >= min_price)
                    & (self.product_df["Price"] <= max_price)
                ].index.tolist()
            )
            filtered_indices = filtered_indices.intersection(price_indices)

        # Skin tone filtering
        if skin_tone:
            filter_applied = True
            # Check which column name is used for skin tone
            if "Skin Tone Category" in self.product_df.columns:
                skin_tone_col = "Skin Tone Category"
            elif "skin_tone" in self.product_df.columns:
                skin_tone_col = "skin_tone"
            else:
                skin_tone_col = None

            if skin_tone_col:
                skin_tone_indices = set(
                    self.product_df[
                        self.product_df[skin_tone_col] == skin_tone
                    ].index.tolist()
                )
                filtered_indices = filtered_indices.intersection(skin_tone_indices)

        # Occasion filtering
        if occasion:
            filter_applied = True
            # Check which column name is used for occasion
            if "Occasion" in self.product_df.columns:
                occasion_col = "Occasion"
            elif "event" in self.product_df.columns:
                occasion_col = "event"
            else:
                occasion_col = None

            if occasion_col:
                occasion_indices = set(
                    self.product_df[
                        self.product_df[occasion_col] == occasion
                    ].index.tolist()
                )
                filtered_indices = filtered_indices.intersection(occasion_indices)

        # Product type filtering
        if product_type and "Product Type" in self.product_df.columns:
            filter_applied = True
            type_indices = set(
                self.product_df[
                    self.product_df["Product Type"] == product_type
                ].index.tolist()
            )
            filtered_indices = filtered_indices.intersection(type_indices)

        # If no filters were applied, return all indices
        if not filter_applied:
            return list(self.product_df.index)

        logger.info(f"Found {len(filtered_indices)} products after applying filters")
        return list(filtered_indices)

    def _create_user_query_vector(self, user_input):
        """
        Create query vector from user preferences.

        Args:
            user_input: Dictionary with user preferences

        Returns:
            Embedding vector for query
        """
        # Construct a query string from user preferences
        query_parts = []

        if "skin_tone" in user_input and user_input["skin_tone"]:
            query_parts.append(f"Skin Tone Category: {user_input['skin_tone']}")

        if "season" in user_input and user_input["season"]:
            query_parts.append(f"Season: {user_input['season']}")

        if "event" in user_input and user_input["event"]:
            query_parts.append(f"Occasion: {user_input['event']}")

        if "product_type" in user_input and user_input["product_type"]:
            query_parts.append(f"Product Type: {user_input['product_type']}")

        # If no preferences are provided, use a default query
        if not query_parts:
            query_string = "clothing product"
        else:
            query_string = ", ".join(query_parts)

        logger.info(f"Created query string: {query_string}")

        # Encode the query
        return self.model.encode([query_string])

    def get_explanation(self, user_input, recommended_product):
        """
        Get explanation for recommendation using Gemini API.

        Args:
            user_input: Dictionary of user preferences
            recommended_product: Dictionary of product information

        Returns:
            str: Explanation text
        """
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return (
                "API key not found. Please set the GEMINI_API_KEY environment variable."
            )

        prompt = f"""
        As a fashion adviser, explain why this product would be a good recommendation for a user with the following preferences:
        - Skin tone: {user_input.get("skin_tone", "Not specified")}
        - Season: {user_input.get("season", "Not specified")}
        - Event: {user_input.get("event", "Not specified")}
        - Budget: {user_input.get("budget", "Not specified")}
        
        The recommended product is:
        - Name: {recommended_product["Product Name"]}
        - Description: {recommended_product["Description"]}
        - Price: {recommended_product["Price"]}
        - Color: {recommended_product["Color"]}
        """

        # Add additional product information if available
        if "Product Type" in recommended_product:
            prompt += f"- Product Type: {recommended_product['Product Type']}\n"
        if "Occasion" in recommended_product:
            prompt += f"- Occasion: {recommended_product['Occasion']}\n"
        if "Skin Tone Category" in recommended_product:
            prompt += f"- Suitable for: {recommended_product['Skin Tone Category']} skin tones\n"

        prompt += "\nProvide a concise explanation (1-2 sentences) focusing on why this is a good match for their needs."

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
            response.raise_for_status()

            response_data = response.json()
            if "candidates" in response_data and len(response_data["candidates"]) > 0:
                explanation = response_data["candidates"][0]["content"]["parts"][0][
                    "text"
                ].strip()
                return explanation
            else:
                return "No explanation generated."
        except Exception as e:
            logger.error(f"Error getting explanation: {str(e)}")
            return f"Error getting explanation: {str(e)}"

    def recommend(self, user_input, top_n=3, with_explanations=True):
        """
        Get product recommendations based on user preferences with price filtering.

        Args:
            user_input: Dictionary with user preference keys:
                - 'budget' (mandatory): numeric value or string like "5000-10000"
                - 'skin_tone' (optional): skin tone preference
                - 'event'/'occasion' (optional): event type
                - 'product_type' (optional): type of product
            top_n: Number of recommendations to return
            with_explanations: Whether to include explanations

        Returns:
            list: Recommended products with explanations if requested
        """
        try:
            start_time = time.time()

            # Extract price range (mandatory filter)
            budget = user_input.get("budget")
            if not budget:
                logger.warning("No budget specified in user input")
                price_range = None
            else:
                price_range = budget

            # Extract optional filters
            skin_tone = user_input.get("skin_tone")
            occasion = user_input.get(
                "event"
            )  # 'event' in original code maps to 'occasion'
            product_type = user_input.get("product_type")

            # Apply filters to get filtered indices
            filtered_indices = self._apply_filters(
                price_range=price_range,
                skin_tone=skin_tone,
                occasion=occasion,
                product_type=product_type,
            )

            if not filtered_indices:
                logger.warning(f"No products found with the selected filters")
                return []

            # Extract embeddings for filtered products
            filtered_embeddings = np.array(
                [self.product_embeddings[i] for i in filtered_indices]
            )

            # Create a temporary FAISS index for filtered products
            dimension = filtered_embeddings.shape[1]
            temp_index = faiss.IndexFlatL2(dimension)
            temp_index.add(np.array(filtered_embeddings, dtype=np.float32))

            # Get user query vector
            user_vector = self._create_user_query_vector(user_input)

            # Search in the filtered index
            D, I = temp_index.search(
                np.array(user_vector, dtype=np.float32),
                min(top_n, len(filtered_indices)),
            )

            # Map back to original indices
            original_indices = [filtered_indices[i] for i in I[0]]

            # Get recommendations
            recommendations = []
            for idx, distance in zip(original_indices, D[0]):
                product = self.product_info[idx]

                # Compute similarity score (convert distance to similarity)
                similarity_score = float(1 / (1 + distance))

                if with_explanations:
                    explanation = self.get_explanation(user_input, product)
                    recommendations.append(
                        {
                            "product": product,
                            "explanation": explanation,
                            "similarity_score": similarity_score,
                        }
                    )
                else:
                    recommendations.append(
                        {"product": product, "similarity_score": similarity_score}
                    )

            end_time = time.time()
            logger.info(
                f"Recommendations generated in {end_time - start_time:.2f} seconds"
            )
            print(f"Recommendations generated in {end_time - start_time:.2f} seconds")
            return recommendations

        except Exception as e:
            logger.error(f"Error in recommend function: {str(e)}")
            print(f"Error: {e}")
            return []

    def get_user_preferences_cli(self):
        """
        Get user preferences through interactive command-line interface.

        Returns:
            dict: User preferences dictionary
        """
        user_preferences = {}

        # Skin tone
        skin_tone_options = self.available_options.get(
            "skin_tone", ["Fair", "Medium", "Dark"]
        )
        skin_tone = self._get_user_choice("What is your skin tone?", skin_tone_options)
        user_preferences["skin_tone"] = skin_tone
        print(f"Thank you for sharing your {skin_tone} skin tone.")

        # Season
        season_options = ["Summer", "Winter", "Spring", "Autumn"]
        season = self._get_user_choice(
            "Which season are you shopping for?", season_options
        )
        user_preferences["season"] = season
        print(f"Perfect! You're shopping for the {season} season.")

        # Event/Occasion
        event_options = self.available_options.get(
            "occasion", ["Wedding", "Casual", "Party", "Formal"]
        )
        event = self._get_user_choice(
            "What type of event are you shopping for?", event_options
        )
        user_preferences["event"] = event
        print(f"Great! You're shopping for a {event} event.")

        # Product Type (if available)
        if "product_type" in self.available_options:
            product_type_options = self.available_options["product_type"]
            product_type = self._get_user_choice(
                "What type of product are you looking for?", product_type_options
            )
            user_preferences["product_type"] = product_type
            print(f"Looking for {product_type} products.")

        # Budget
        budget_options = ["Under 4000", "4000-10000", "Above 10000"]
        budget = self._get_user_choice("What is your budget range?", budget_options)
        print(f"Thank you! Your budget is {budget}.")

        # Parse budget
        if budget == "Under 4000":
            user_preferences["budget"] = "budget"
        elif budget == "4000-10000":
            user_preferences["budget"] = "mid_range"
        else:  # Above 10000
            user_preferences["budget"] = "premium"

        return user_preferences

    def _get_user_choice(self, question, options):
        """Helper function to display options and get user choice."""
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

        return choice

    def display_recommendations(self, recommendations):
        """
        Display recommendations in a formatted way.

        Args:
            recommendations: List of recommendation dictionaries
        """
        print("\n" + "=" * 50)
        print(" " * 10 + "PERSONALIZED RECOMMENDATIONS")
        print("=" * 50)

        for i, item in enumerate(recommendations, 1):
            product = item["product"]

            print(f"\n[RECOMMENDATION #{i}]")
            print(f"Product ID: {product['ID']}")
            print(f"Product Name: {product['Product Name']}")
            print(f"Price: Rs. {product['Price']}")
            print(f"Color: {product['Color']}")

            # Display additional information if available
            if "Product Type" in product:
                print(f"Product Type: {product['Product Type']}")
            if "Occasion" in product:
                print(f"Occasion: {product['Occasion']}")
            if "Skin Tone Category" in product:
                print(f"Suitable for: {product['Skin Tone Category']} skin tone")

            # Display similarity score
            if "similarity_score" in item:
                print(f"Relevance Score: {item['similarity_score']:.2f}")

            if "explanation" in item:
                print(f"\nWhy this matches your preferences:")
                print(f"  {item['explanation']}")

            print("-" * 80)


def run_cli():
    """Run the recommendation system in command-line interface mode."""
    print("\n" + "=" * 80)
    print(" " * 20 + "WELCOME TO ELEGANCE CLOTHING RECOMMENDATION SYSTEM")
    print("=" * 80)

    print(
        "\nTo provide you with personalized recommendations, I'll ask you a few questions."
    )
    print("Please select one of the options for each question.")

    # Initialize recommender
    recommender = ClothingRecommender(
        csv_path="products_with_type_and_occasion.csv",
        embeddings_path="enhanced_product_embeddings.pkl",
        faiss_index_path="enhanced_product_index.faiss",
        product_info_path="enhanced_product_info.pkl",
    )

    # Get user preferences
    user_input = recommender.get_user_preferences_cli()

    print("\nFinding personalized recommendations based on your preferences:")
    print(f"- Skin Tone: {user_input.get('skin_tone', 'Not specified')}")
    print(f"- Season: {user_input.get('season', 'Not specified')}")
    print(f"- Event: {user_input.get('event', 'Not specified')}")

    # Display product type if available
    if "product_type" in user_input:
        print(f"- Product Type: {user_input['product_type']}")

    # Display budget range
    budget = user_input.get("budget")
    if isinstance(budget, str):
        if budget == "budget":
            budget_str = "Under 4000"
        elif budget == "mid_range":
            budget_str = "4000-10000"
        else:  # premium
            budget_str = "Above 10000"
    else:
        budget_str = f"Rs. {budget}"
    print(f"- Budget: {budget_str}")

    # Get recommendations
    recommendations = recommender.recommend(user_input, top_n=3, with_explanations=True)

    # Display recommendations
    recommender.display_recommendations(recommendations)

    print("\nThank you for using our recommendation system!")


# If the script is run directly, run the CLI
if __name__ == "__main__":
    run_cli()
