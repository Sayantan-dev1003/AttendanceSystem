# import os
# import cv2
# import numpy as np
# import pandas as pd
# from keras_facenet import FaceNet

# # Initialize FaceNet model
# embedder = FaceNet()

# def generate_embeddings(person_folder):
#     # Prepare list to hold embeddings and corresponding image names
#     embeddings = []
#     image_names = []

#     # List all image files in the person's folder
#     for file_name in os.listdir(person_folder):
#         file_path = os.path.join(person_folder, file_name)

#         # Check if the file is an image (basic check)
#         if file_name.lower().endswith(('.png', '.jpg', '.jpeg')):
#             # Read the image
#             image = cv2.imread(file_path)
#             if image is None:
#                 print(f"Warning: Unable to read {file_path}. Skipping.")
#                 continue

#             # Convert image to RGB
#             rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

#             # Extract embeddings using FaceNet
#             results = embedder.extract(rgb_image, threshold=0.95)

#             if results:
#                 embedding = results[0]['embedding']
#                 embeddings.append(embedding)
#                 image_names.append(file_name)
#                 print(f"[INFO] Processed {file_name}")
#             else:
#                 print(f"[WARNING] No face detected in {file_name}. Skipping.")

#     if embeddings:
#         # Convert to DataFrame
#         df = pd.DataFrame(embeddings)
#         folder_name = os.path.basename(person_folder.rstrip('/\\'))
#         df.insert(0, folder_name, [''] * len(embeddings))  # Insert image names as first column

#         # Save to CSV in the same person folder
#         csv_path = os.path.join(person_folder, 'embeddings.csv')
#         df.to_csv(csv_path, index=False)
#         print(f"[SUCCESS] Embeddings saved to {csv_path}")
#     else:
#         print("[ERROR] No embeddings were generated.")

# # Example usage:
# # person_folder = 'actual_folder_path'  # Replace with your actual path
# # generate_embeddings(person_folder)

# uploads_path = '../backend/uploads'

# # Get list of all folders in uploads directory
# subfolders = [f for f in os.listdir(uploads_path) if os.path.isdir(os.path.join(uploads_path, f))]

# if not subfolders:
#     print("[ERROR] No user folders found inside uploads.")
# else:
#     for folder_name in subfolders:
#         person_folder = os.path.join(uploads_path, folder_name)
#         print(f"[INFO] Generating embeddings for folder: {person_folder}")
#         generate_embeddings(person_folder)

import os
import cv2
import numpy as np
import pandas as pd
import sys
from keras_facenet import FaceNet

# Initialize FaceNet model
embedder = FaceNet()

def generate_embeddings(person_folder):
    embeddings = []
    image_names = []

    for file_name in os.listdir(person_folder):
        file_path = os.path.join(person_folder, file_name)
        if file_name.lower().endswith(('.png', '.jpg', '.jpeg')):
            image = cv2.imread(file_path)
            if image is None:
                continue
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = embedder.extract(rgb_image, threshold=0.95)
            if results:
                embedding = results[0]['embedding']
                embeddings.append(embedding)
                image_names.append(file_name)

    if embeddings:
        df = pd.DataFrame(embeddings)
        folder_name = os.path.basename(person_folder.rstrip('/\\'))
        df.insert(0, folder_name, [''] * len(embeddings))
        csv_path = os.path.join(person_folder, 'embeddings.csv')
        df.to_csv(csv_path, index=False)
        print(f"[SUCCESS] Embeddings saved to {csv_path}")
    else:
        print("[ERROR] No embeddings were generated.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("[ERROR] Folder path not provided.")
        sys.exit(1)
    
    folder_path = sys.argv[1]
    print(f"[INFO] Generating embeddings for: {folder_path}")
    generate_embeddings(folder_path)