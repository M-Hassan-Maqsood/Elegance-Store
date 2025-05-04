#!/usr/bin/env python
import sys
import json
import os

# Redirect stdout to stderr temporarily to prevent debug messages from corrupting JSON output
original_stdout = sys.stdout
sys.stdout = sys.stderr

# Add the parent directory to the path so we can import the DINOv2 search module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from image_search.similarity import find_similar_products
except ImportError:
    try:
        from similarity import find_similar_products
    except ImportError:
        # Restore stdout for the error message
        sys.stdout = original_stdout
        print(json.dumps({"error": "Could not import search module"}))
        sys.exit(1)


def main():
    """Process image data and find similar products using DINOv2"""
    try:
        # Get the base64 image from command line argument
        if len(sys.argv) < 2:
            # Restore stdout for the error message
            sys.stdout = original_stdout
            print(json.dumps({"error": "No image data provided"}))
            return

        # Check if the last argument is --file flag
        is_file_path = "--file" in sys.argv

        # Get image data
        if is_file_path:
            try:
                # Read base64 from file instead of directly from command line
                with open(sys.argv[1], "r") as f:
                    image_base64 = f.read()
            except Exception as e:
                # Restore stdout for the error message
                sys.stdout = original_stdout
                print(json.dumps({"error": f"Could not read base64 file: {str(e)}"}))
                return
        else:
            # Get base64 directly from command line (original behavior)
            image_base64 = sys.argv[1]

        # Get optional parameters
        top_k = int(sys.argv[2]) if len(sys.argv) > 2 else 12

        # Handle the case where --file might be the 4th argument
        if len(sys.argv) > 3 and sys.argv[3] != "--file":
            remove_bg = sys.argv[3].lower() != "false"
        else:
            remove_bg = True

        # Call the DINOv2 search function to find similar products
        result = find_similar_products(image_base64, top_k=top_k, remove_bg=remove_bg)

        # Restore stdout just before printing the final JSON result
        sys.stdout = original_stdout

        # Return the result as JSON
        print(json.dumps(result))
    except Exception as e:
        # Restore stdout for the error message
        sys.stdout = original_stdout
        print(json.dumps({"error": f"Error in image search: {str(e)}"}))


if __name__ == "__main__":
    main()
