#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Price-Filtered Recommendation System for Clothing Products

This module provides a recommendation system that:
1. Filters products by price range (mandatory)
2. Applies optional filters for skin tone, occasion, and product type
3. Uses embeddings for feature-based similarity search
4. Returns the most relevant products within the selected filters
"""

import os
import pickle
import numpy as np
import pandas as pd
import faiss
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import logging

# Set up logging
logging.basicConfig(
    filename="price_filtered_recommendations.log",
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


class PriceFilteredRecommender:
    """A recommendation system with price filtering for clothing products."""

    def __init__(
        self,
        embeddings_path="enhanced_product_embeddings.pkl",
        faiss_index_path="enhanced_product_index.faiss",
        product_info_path="enhanced_product_info.pkl",
        model_name="all-MiniLM-L6-v2",
    ):
        """
        Initialize the recommender with paths and model settings.

        Args:
            embeddings_path: Path to the product embeddings
            faiss_index_path: Path to the FAISS index
            product_info_path: Path to product information
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

        # Load data
        self._load_data()

        # Extract available options from the dataset
        self._extract_filter_options()

    def _load_data(self):
        """Load pre-computed embeddings and product information."""
        logger.info("Loading pre-computed embeddings and FAISS index...")

        try:
            with open(self.embeddings_path, "rb") as f:
                self.product_embeddings = pickle.load(f)

            self.index = faiss.read_index(self.faiss_index_path)

            with open(self.product_info_path, "rb") as f:
                self.product_info = pickle.load(f)

            logger.info("Data loaded successfully")

            # Create a DataFrame with product info for easier filtering
            self.product_df = pd.DataFrame.from_dict(self.product_info, orient="index")

        except Exception as e:
            logger.error(f"Error loading data: {e}")
            raise

    def _extract_filter_options(self):
        """Extract available options for filters from the dataset."""
        logger.info("Extracting filter options from the dataset")

        self.available_options = {
            "skin_tone": sorted(
                self.product_df["Skin Tone Category"].unique().tolist()
            ),
            "occasion": sorted(self.product_df["Occasion"].unique().tolist()),
            "product_type": sorted(self.product_df["Product Type"].unique().tolist()),
            "price_range": list(PRICE_RANGES.keys()),
        }

        logger.info(f"Available options extracted: {self.available_options}")

    def get_filter_options(self):
        """
        Get available options for each filter.

        Returns:
            Dictionary with available filter options
        """
        return self.available_options

    def _apply_filters(
        self, price_range, skin_tone=None, occasion=None, product_type=None
    ):
        """
        Apply selected filters to the product dataset.

        Args:
            price_range: String key for price range ("budget", "mid_range", "premium")
            skin_tone: Optional skin tone filter
            occasion: Optional occasion filter
            product_type: Optional product type filter

        Returns:
            List of product indices that match the filters
        """
        logger.info(
            f"Applying filters: price_range={price_range}, skin_tone={skin_tone}, occasion={occasion}, product_type={product_type}"
        )

        # Price range is mandatory
        if price_range not in PRICE_RANGES:
            raise ValueError(
                f"Invalid price range: {price_range}. Available options: {list(PRICE_RANGES.keys())}"
            )

        min_price, max_price = PRICE_RANGES[price_range]

        # Start with price filter
        query = f"(Price >= {min_price}) & (Price <= {max_price})"
        filter_parts = []

        # Apply optional filters if provided
        if skin_tone:
            filter_parts.append(f"`Skin Tone Category` == '{skin_tone}'")

        if occasion:
            filter_parts.append(f"`Occasion` == '{occasion}'")

        if product_type:
            filter_parts.append(f"`Product Type` == '{product_type}'")

        # Combine all filters
        if filter_parts:
            full_query = query + " & " + " & ".join(filter_parts)
        else:
            full_query = query

        logger.info(f"Filter query: {full_query}")

        # Apply the filters
        try:
            # Convert prices to numeric if they aren't already
            if not pd.api.types.is_numeric_dtype(self.product_df["Price"]):
                self.product_df["Price"] = pd.to_numeric(
                    self.product_df["Price"], errors="coerce"
                )

            filtered_indices = self.product_df.query(full_query).index.tolist()
            logger.info(
                f"Found {len(filtered_indices)} products after applying filters"
            )
            return filtered_indices

        except Exception as e:
            logger.error(f"Error applying filters: {e}")
            raise

    def _create_user_query_vector(self, user_preferences):
        """
        Create query vector from user preferences.

        Args:
            user_preferences: Dictionary with user preferences
                Keys: skin_tone, occasion, product_type

        Returns:
            Embedding vector for query
        """
        # Construct a query string from user preferences
        query_parts = []

        if "skin_tone" in user_preferences and user_preferences["skin_tone"]:
            query_parts.append(f"Skin Tone Category: {user_preferences['skin_tone']}")

        if "occasion" in user_preferences and user_preferences["occasion"]:
            query_parts.append(f"Occasion: {user_preferences['occasion']}")

        if "product_type" in user_preferences and user_preferences["product_type"]:
            query_parts.append(f"Product Type: {user_preferences['product_type']}")

        if "description" in user_preferences and user_preferences["description"]:
            query_parts.append(f"Description: {user_preferences['description']}")

        # If no preferences are provided, use a default query
        if not query_parts:
            query_string = "clothing product"
        else:
            query_string = ", ".join(query_parts)

        logger.info(f"Created query string: {query_string}")

        # Encode the query
        return self.model.encode([query_string])

    def recommend(
        self, price_range, skin_tone=None, occasion=None, product_type=None, top_n=5
    ):
        """
        Get personalized product recommendations based on selected filters.

        Args:
            price_range: String key for price range ("budget", "mid_range", "premium") - MANDATORY
            skin_tone: Optional skin tone filter
            occasion: Optional occasion filter
            product_type: Optional product type filter
            top_n: Number of recommendations to return

        Returns:
            List of dictionaries with recommended product info
        """
        try:
            # Apply all filters to get filtered indices
            filtered_indices = self._apply_filters(
                price_range, skin_tone, occasion, product_type
            )

            if not filtered_indices:
                logger.warning(f"No products found with the selected filters")
                return []

            # Create user preferences object for query vector generation and explanation
            user_preferences = {
                "skin_tone": skin_tone,
                "occasion": occasion,
                "product_type": product_type,
            }

            # Extract embeddings for filtered products
            filtered_embeddings = np.array(
                [self.product_embeddings[i] for i in filtered_indices]
            )

            # Create a temporary FAISS index for filtered products
            dimension = filtered_embeddings.shape[1]
            temp_index = faiss.IndexFlatL2(dimension)
            temp_index.add(np.array(filtered_embeddings, dtype=np.float32))

            # Get user query vector
            user_vector = self._create_user_query_vector(user_preferences)

            # Search in the filtered index
            D, I = temp_index.search(
                np.array(user_vector, dtype=np.float32),
                min(top_n, len(filtered_indices)),
            )

            # Map back to original indices
            original_indices = [filtered_indices[i] for i in I[0]]

            # Collect recommendations
            recommendations = []
            for idx, distance in zip(original_indices, D[0]):
                product_info = self.product_info[idx]

                recommendation = {
                    "ID": product_info["ID"],
                    "Product Name": product_info["Product Name"],
                    "Description": product_info["Description"],
                    "Price": product_info["Price"],
                    "Color": product_info["Color"],
                    "Product Type": product_info["Product Type"],
                    "Occasion": product_info["Occasion"],
                    "Skin Tone Category": product_info["Skin Tone Category"],
                    "Similarity Score": float(
                        1 / (1 + distance)
                    ),  # Convert distance to similarity score
                }
                recommendations.append(recommendation)

            logger.info(f"Found {len(recommendations)} recommendations")
            return recommendations

        except Exception as e:
            logger.error(f"Error in recommend function: {e}")
            raise

    def get_explanation(self, user_preferences, recommended_product):
        """
        Generate an explanation for why a product was recommended.

        Args:
            user_preferences: Dictionary with user preferences
            recommended_product: Dictionary with product info

        Returns:
            String with explanation
        """
        explanation_parts = []

        # Check matching features
        if (
            "skin_tone" in user_preferences
            and user_preferences["skin_tone"]
            and user_preferences["skin_tone"]
            == recommended_product["Skin Tone Category"]
        ):
            explanation_parts.append(
                f"This product is suitable for {user_preferences['skin_tone']} skin tones"
            )

        if (
            "occasion" in user_preferences
            and user_preferences["occasion"]
            and user_preferences["occasion"] == recommended_product["Occasion"]
        ):
            explanation_parts.append(
                f"Perfect for {user_preferences['occasion']} occasions"
            )

        if (
            "product_type" in user_preferences
            and user_preferences["product_type"]
            and user_preferences["product_type"] == recommended_product["Product Type"]
        ):
            explanation_parts.append(
                f"This is a {user_preferences['product_type']} as you requested"
            )

        # Add price info
        explanation_parts.append(f"Priced at Rs. {recommended_product['Price']}")

        return " | ".join(explanation_parts)


# Example usage
if __name__ == "__main__":
    recommender = PriceFilteredRecommender()

    # Print available options for each filter
    print("Available filter options:")
    filter_options = recommender.get_filter_options()
    for key, options in filter_options.items():
        print(f"{key}: {options}")

    # Get recommendations with mandatory price range and optional filters
    # Only price_range is mandatory, others are optional
    recommendations = recommender.recommend(
        price_range="budget",  # Mandatory: "budget", "mid_range", or "premium"
        skin_tone="Deep/Dark",  # Optional
        occasion="Casual",  # Optional
        product_type="Top",  # Optional
        top_n=5,
    )

    # Display recommendations
    print(f"\nTop 5 recommendations:")

    if not recommendations:
        print("No products found matching your filters.")
    else:
        for i, rec in enumerate(recommendations, 1):
            print(f"\n{i}. {rec['Product Name']} (ID: {rec['ID']})")
            print(f"   Price: Rs. {rec['Price']}")
            print(f"   {rec['Description']}")
            print(
                f"   Type: {rec['Product Type']} | Occasion: {rec['Occasion']} | Color: {rec['Color']}"
            )
            print(f"   Suitable for: {rec['Skin Tone Category']} skin tones")
            print(f"   Similarity Score: {rec['Similarity Score']:.3f}")

            # Example of another query with fewer filters (only price range is mandatory)
            user_preferences = {
                "skin_tone": "Deep/Dark",
                "occasion": "Casual",
                "product_type": "Top",
            }

            explanation = recommender.get_explanation(user_preferences, rec)
            print(f"   Why recommended: {explanation}")

    # Example of another query with fewer filters (only price range is mandatory)
    print("\n\nExample with only price range (mandatory) and skin tone:")
    fewer_filter_recommendations = recommender.recommend(
        price_range="mid_range",  # Mandatory
        skin_tone="Light/Fair",  # Optional
        occasion=None,  # Skipped
        product_type=None,  # Skipped
        top_n=3,
    )

    if not fewer_filter_recommendations:
        print("No products found matching your filters.")
    else:
        for i, rec in enumerate(fewer_filter_recommendations, 1):
            print(f"\n{i}. {rec['Product Name']} (ID: {rec['ID']})")
            print(f"   Price: Rs. {rec['Price']}")
            print(
                f"   Type: {rec['Product Type']} | Occasion: {rec['Occasion']} | Color: {rec['Color']}"
            )
            print(f"   Suitable for: {rec['Skin Tone Category']} skin tones")
