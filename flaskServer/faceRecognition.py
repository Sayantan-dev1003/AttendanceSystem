import os
import cv2
import numpy as np
import torch
import requests
import time
import pandas as pd
from datetime import datetime
from facenet_pytorch import InceptionResnetV1, MTCNN
from sklearn.preprocessing import normalize

# ------------------- Configuration -------------------
UPLOADS_FOLDER = '../backend/uploads'  # Folder where embeddings are stored
API_URL = "http://localhost:3000/mark-attendance"
THRESHOLD = 0.65  # Cosine similarity threshold
# -----------------------------------------------------

# Initialize models
mtcnn = MTCNN(keep_all=True)
resnet = InceptionResnetV1(pretrained='vggface2').eval()

# ------------------- Functions -------------------

def detect_and_encode(image):
    with torch.no_grad():
        boxes, _ = mtcnn.detect(image)
        if boxes is not None:
            embeddings = []
            for box in boxes:
                x1, y1, x2, y2 = map(int, box)
                face = image[y1:y2, x1:x2]
                if face.size == 0:
                    continue
                face = cv2.resize(face, (160, 160))
                face = np.transpose(face, (2, 0, 1)).astype(np.float32) / 255.0
                face_tensor = torch.tensor(face).unsqueeze(0)
                encoding = resnet(face_tensor).detach().numpy().flatten()
                embedding = normalize([encoding])[0]
                embeddings.append((embedding, box))
            return embeddings
    return []

def match_embedding(input_embedding):
    for person_folder in os.listdir(UPLOADS_FOLDER):
        full_path = os.path.join(UPLOADS_FOLDER, person_folder)
        csv_path = os.path.join(full_path, 'embeddings.csv')
        if not os.path.exists(csv_path):
            continue

        df = pd.read_csv(csv_path, header=None)
        for _, row in df.iterrows():
            known_embedding = row.values.astype(float)
            known_embedding = normalize([known_embedding])[0]
            similarity = np.dot(known_embedding, input_embedding)
            if similarity >= THRESHOLD:
                return person_folder
    return "Unknown"

def mark_attendance(name):
    try:
        timestamp = datetime.now().isoformat()
        response = requests.post(API_URL, json={"name": name, "time": timestamp})
        if response.status_code == 200:
            print(f"✅ Marked attendance for {name}")
            return True
        else:
            print(f"⚠️ Failed to mark attendance for {name}: {response.status_code}")
    except Exception as e:
        print(f"❌ Error sending request for {name}: {e}")
    return False

# ------------------- Main -------------------

cap = cv2.VideoCapture(0)
marked_names = set()

print("🎥 Starting camera. Press 'q' to quit.")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    embeddings_with_boxes = detect_and_encode(rgb_frame)

    for embedding, box in embeddings_with_boxes:
        name = match_embedding(embedding)

        x1, y1, x2, y2 = map(int, box)
        color = (0, 255, 0) if name != 'Unknown' else (0, 0, 255)
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        cv2.putText(frame, name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

        if name != "Unknown" and name not in marked_names:
            if mark_attendance(name):
                marked_names.add(name)

    cv2.imshow("Face Recognition Attendance", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
print("📸 Camera stopped.")