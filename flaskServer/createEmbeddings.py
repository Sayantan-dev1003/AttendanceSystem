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