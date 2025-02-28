#!/usr/bin/env python
# coding: utf-8

# In[ ]:


import os
import cv2
import numpy as np
import torch
from facenet_pytorch import InceptionResnetV1, MTCNN
from sklearn.preprocessing import normalize

# Initialize MTCNN and InceptionResnetV1
mtcnn = MTCNN(keep_all=True)
resnet = InceptionResnetV1(pretrained='vggface2').eval()

# Function to detect and encode faces
def detect_and_encode(image):
    with torch.no_grad():
        boxes, _ = mtcnn.detect(image)
        if boxes is not None:
            faces = []
            for box in boxes:
                x1, y1, x2, y2 = map(int, box)
                face = image[y1:y2, x1:x2]
                if face.size == 0:
                    continue
                face = cv2.resize(face, (160, 160), interpolation=cv2.INTER_LINEAR)
                face = np.transpose(face, (2, 0, 1)).astype(np.float32) / 255.0
                face_tensor = torch.tensor(face).unsqueeze(0)
                encoding = resnet(face_tensor).detach().numpy().flatten()
                encoding = normalize([encoding])[0]  # L2 normalization
                faces.append(encoding)
            return faces
    return []

# Function to encode all known faces from 'images' folder
def encode_known_faces(folder_path='../backend/uploads'):
    known_face_encodings = []
    known_face_names = []
    
    for file in os.listdir(folder_path):
        if file.endswith(('.jpg', '.jpeg', '.png')):
            name = os.path.splitext(file)[0]  # Extract name from filename
            image_path = os.path.join(folder_path, file)
            known_image = cv2.imread(image_path)
            if known_image is not None:
                known_image_rgb = cv2.cvtColor(known_image, cv2.COLOR_BGR2RGB)
                encodings = detect_and_encode(known_image_rgb)
                if encodings:
                    known_face_encodings.append(encodings[0])  # Assuming one face per image
                    known_face_names.append(name)
    
    return known_face_encodings, known_face_names

# Encode known faces automatically
known_face_encodings, known_face_names = encode_known_faces()

# Function to recognize faces using cosine similarity
def recognize_faces(known_encodings, known_names, test_encodings, threshold=0.5):
    recognized_names = []
    for test_encoding in test_encodings:
        similarities = np.dot(known_encodings, test_encoding)  # Cosine similarity
        best_match_idx = np.argmax(similarities)
        if similarities[best_match_idx] > threshold:
            recognized_names.append(known_names[best_match_idx])
        else:
            recognized_names.append('Not Recognized')
    return recognized_names

# Start video capture
cap = cv2.VideoCapture(0)
threshold = 0.5  # Adjusted threshold for better classification

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    test_face_encodings = detect_and_encode(frame_rgb)
    
    if test_face_encodings and known_face_encodings:
        boxes, _ = mtcnn.detect(frame_rgb)
        boxes = boxes if boxes is not None else []  # Fix to prevent NoneType error

        names = recognize_faces(np.array(known_face_encodings), known_face_names, test_face_encodings, threshold)

        for name, box in zip(names, boxes):
            if box is not None:
                x1, y1, x2, y2 = map(int, box)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
    
    cv2.imshow('Face Recognition', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()