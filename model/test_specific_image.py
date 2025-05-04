import os
from emd import process_specific_image


def main():
    # Hardcode the image path here - you can simply change this path whenever you want to test a different image
    image_path = r"E:\web\ladies-clothing-store (2)\model\images\AJ230601\image_3.jpg"

    # Number of similar items to find (you can change this as needed)
    top_k = 5

    # Verify the image exists
    if not os.path.exists(image_path):
        print(f"Error: Image not found at '{image_path}'")
        return

    print(f"Processing image: {image_path}")
    print(f"Finding top {top_k} similar items...")

    # Process the image and find similar items
    process_specific_image(image_path, top_k=top_k)


if __name__ == "__main__":
    main()
