from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import logging

# Set up logging
logging.basicConfig(
    filename="recommendation_api.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Add the current directory to sys.path to import the ClothingRecommender
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from clothing_recommender_model import ClothingRecommender, PRICE_RANGES

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from your chatbot

# Initialize the recommender system
recommender = ClothingRecommender(
    csv_path=os.path.join(
        os.path.dirname(__file__), "products_with_type_and_occasion.csv"
    ),
    embeddings_path=os.path.join(
        os.path.dirname(__file__), "enhanced_product_embeddings.pkl"
    ),
    faiss_index_path=os.path.join(
        os.path.dirname(__file__), "enhanced_product_index.faiss"
    ),
    product_info_path=os.path.join(
        os.path.dirname(__file__), "enhanced_product_info.pkl"
    ),
)


@app.route("/filter_options", methods=["GET"])
def get_filter_options():
    """Return available filter options for dropdowns"""
    try:
        filter_options = recommender.get_filter_options()
        logger.info("Filter options retrieved successfully")
        return jsonify({"success": True, "filter_options": filter_options})
    except Exception as e:
        logger.error(f"Error retrieving filter options: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/recommend", methods=["POST"])
def recommend():
    """Get personalized recommendations with price filtering"""
    # Get data from request
    data = request.json
    if not data:
        logger.warning("No data provided in request")
        return jsonify({"success": False, "error": "No data provided"}), 400

    # Extract mandatory price range filter
    budget_str = data.get("budget", "4000-10000")

    # Convert budget string to appropriate price range
    if budget_str.lower() == "under 4000" or budget_str == "budget":
        price_range = "budget"
    elif budget_str.lower() == "above 10000" or budget_str == "premium":
        price_range = "premium"
    else:  # Default to mid-range
        price_range = "mid_range"

    logger.info(f"Price range selected: {price_range}")

    # Extract optional filters
    skin_tone = data.get("skin_tone")
    event_type = data.get("event_type")  # Map to 'occasion' in the recommender
    product_type = data.get("product_type")
    season = data.get("season")

    # Format user preferences for recommender
    user_preferences = {
        "budget": price_range,  # mandatory
        "skin_tone": skin_tone,  # optional
        "event": event_type,  # optional
        "season": season,  # optional (for explanations)
        "product_type": product_type,  # optional
    }

    try:
        # Get recommendations - get 9 recommendations at once instead of just 3
        # Check if a specific number of recommendations was requested
        top_n = data.get("top_n", 9)  # Default to 9 recommendations
        logger.info(
            f"Getting {top_n} recommendations with preferences: {user_preferences}"
        )
        recommendations = recommender.recommend(
            user_preferences, top_n=top_n, with_explanations=True
        )

        if not recommendations:
            logger.warning("No recommendations found")
            return jsonify(
                {
                    "success": True,
                    "recommendations": [],
                    "message": "No products found matching your preferences.",
                }
            )

        # Format recommendations for frontend
        formatted_recommendations = []
        for rec in recommendations:
            product = rec["product"]
            formatted_rec = {
                "product_id": product["ID"],
                "product_name": product["Product Name"],
                "description": product["Description"],
                "price": product["Price"],
                "color": product["Color"],
                "explanation": rec["explanation"],
                "similarity_score": round(rec["similarity_score"], 2),
                # Try to construct an image path based on product ID
                "image_url": f"/images/{product['ID']}/1.jpg",
            }

            # Add optional fields if available
            if "Product Type" in product:
                formatted_rec["product_type"] = product["Product Type"]
            if "Occasion" in product:
                formatted_rec["occasion"] = product["Occasion"]
            if "Skin Tone Category" in product:
                formatted_rec["skin_tone"] = product["Skin Tone Category"]

            formatted_recommendations.append(formatted_rec)

        logger.info(f"Returning {len(formatted_recommendations)} recommendations")
        return jsonify({"success": True, "recommendations": formatted_recommendations})

    except Exception as e:
        logger.error(f"Error in recommendation process: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "ok", "message": "Recommendation API is running"})


if __name__ == "__main__":
    print("Starting Clothing Recommendation API Server")
    logger.info("Starting Clothing Recommendation API Server")
    app.run(debug=True, port=5000)
