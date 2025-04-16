# #!/usr/bin/env python
# # coding: utf-8

# # In[ ]:


# import os
# import cv2
# import numpy as np
# import torch
# import requests
# import time
# import matplotlib.pyplot as plt
# from facenet_pytorch import InceptionResnetV1, MTCNN
# from sklearn.preprocessing import normalize

# API_URL = "http://localhost:3000/mark-attendance"
# # RTSP_URL = "rtsp://attendance:admin%40123@:554/Streaming/Channels/101"

# # Initialize MTCNN and InceptionResnetV1
# mtcnn = MTCNN(keep_all=True)
# resnet = InceptionResnetV1(pretrained='vggface2').eval()

# # Function to detect and encode faces
# def detect_and_encode(image):
#     with torch.no_grad():
#         boxes, _ = mtcnn.detect(image)
#         if boxes is not None:
#             faces = []
#             for box in boxes:
#                 x1, y1, x2, y2 = map(int, box)
#                 face = image[y1:y2, x1:x2]
#                 if face.size == 0:
#                     continue
#                 face = cv2.resize(face, (160, 160), interpolation=cv2.INTER_LINEAR)
#                 face = np.transpose(face, (2, 0, 1)).astype(np.float32) / 255.0
#                 face_tensor = torch.tensor(face).unsqueeze(0)
#                 encoding = resnet(face_tensor).detach().numpy().flatten()
#                 encoding = normalize([encoding])[0]  # L2 normalization
#                 faces.append(encoding)
#             return faces
#     return []

# # Function to encode all known faces from 'images' folder
# def encode_known_faces(folder_path='../backend/uploads'):
#     known_face_encodings = []
#     known_face_names = []
    
#     # for file in os.listdir(folder_path):
#     #     if file.endswith(('.jpg', '.jpeg', '.png')):
#     #         name = os.path.splitext(file)[0]  # Extract name from filename
#     #         image_path = os.path.join(folder_path, file)
#     #         known_image = cv2.imread(image_path)
#     #         if known_image is not None:
#     #             known_image_rgb = cv2.cvtColor(known_image, cv2.COLOR_BGR2RGB)
#     #             encodings = detect_and_encode(known_image_rgb)
#     #             if encodings:
#     #                 known_face_encodings.append(encodings[0])  # Assuming one face per image
#     #                 known_face_names.append(name)
    
#     # return known_face_encodings, known_face_names
#     for person_name in os.listdir(folder_path):
#         person_folder = os.path.join(folder_path, person_name)
#         if not os.path.isdir(person_folder):
#             continue
        
#         embedding_file = os.path.join(person_folder, 'embeddings.csv')
#         if not os.path.exists(embedding_file):
#             continue

#         with open(embedding_file, 'r') as f:
#             for line in f:
#                 try:
#                     values = list(map(float, line.strip().split(',')))
#                     if len(values) == 512:
#                         known_face_encodings.append(np.array(values))
#                         known_face_names.append(person_name)
#                 except ValueError:
#                     print(f"Skipping invalid embedding in {embedding_file}")


#     known_face_encodings = normalize(np.array(known_face_encodings))  # normalize for cosine similarity
#     return known_face_encodings, known_face_names

# # Encode known faces automatically
# known_face_encodings, known_face_names = encode_known_faces()

# # Function to recognize faces using cosine similarity
# def recognize_faces(known_encodings, known_names, test_encodings, threshold=0.5):
#     recognized_names = []
#     for test_encoding in test_encodings:
#         similarities = np.dot(known_encodings, test_encoding)  # Cosine similarity
#         best_match_idx = np.argmax(similarities)
#         if similarities[best_match_idx] > threshold:
#             recognized_names.append(known_names[best_match_idx])
#         else:
#             recognized_names.append('Not Recognized')
#     return recognized_names

# # Start video capture
# cap = cv2.VideoCapture(0)
# # cap = cv2.VideoCapture(RTSP_URL)
# threshold = 0.5  # Adjusted threshold for better classification

# seen_names = set()

# detection_times = []
# recognition_times = []
# frame_count = 0

# while cap.isOpened():
#     ret, frame = cap.read()
#     if not ret:
#         break
    
#     frame_count += 1

#     # Measure detection + embedding time
#     start_detection = time.time()
#     test_face_encodings = detect_and_encode(frame_rgb)
#     end_detection = time.time()
#     detection_times.append(end_detection - start_detection)

#     # Measure recognition time
#     start_recognition = time.time()
#     if test_face_encodings and known_face_encodings:
#         boxes, _ = mtcnn.detect(frame_rgb)
#         boxes = boxes if boxes is not None else []
#         names = recognize_faces(np.array(known_face_encodings), known_face_names, test_face_encodings, threshold)
#         end_recognition = time.time()
#         recognition_times.append(end_recognition - start_recognition)
#     else:
#         recognition_times.append(0)  # No faces to recognize
    
#     frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#     test_face_encodings = detect_and_encode(frame_rgb)
    
#     if test_face_encodings and known_face_encodings:
#         boxes, _ = mtcnn.detect(frame_rgb)
#         boxes = boxes if boxes is not None else []  # Prevent NoneType error

#         names = recognize_faces(np.array(known_face_encodings), known_face_names, test_face_encodings, threshold)

#         for name, box in zip(names, boxes):
#             # Ensure that the box is valid and the name is recognized
#             # if box is not None and name in known_face_names and name not in seen_names:
#             #     x1, y1, x2, y2 = map(int, box)
#             #     cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
#             #     cv2.putText(frame, name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

#             #     # Store only recognized names
#             #     seen_names.add(name)

#             #     # Send POST request to mark attendance (Uncomment if needed)
#             #     response = requests.post(API_URL, json={"name": name})
#             #     print(f"Response: {response.json()}")   

#             #     print(f"Name recognized: {name}")
#             if box is not None and name != 'Not Recognized':
#                 x1, y1, x2, y2 = map(int, box)
#                 cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
#                 cv2.putText(frame, name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

#                 if name not in seen_names:
#                     seen_names.add(name)

#                 # Send POST request to mark attendance (only once per person)
#                 try:
#                     response = requests.post(API_URL, json={"name": name})
#                     print(f"Attendance marked for {name}: {response.status_code} - {response.json()}")
#                 except Exception as e:
#                     print(f"Error sending attendance for {name}: {e}")            

#     cv2.imshow('Face Recognition', frame)
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break

# cap.release()
# # Plot detection and recognition times
# plt.figure(figsize=(10, 5))
# plt.plot(detection_times, label='Detection & Embedding Time')
# plt.plot(recognition_times, label='Recognition Time')
# plt.xlabel('Frame Number')
# plt.ylabel('Time (seconds)')
# plt.title('Face Detection and Recognition Time per Frame')
# plt.legend()
# plt.grid(True)
# plt.tight_layout()
# plt.show()

# cv2.destroyAllWindows()

# #!/usr/bin/env python
# # coding: utf-8

# # import os
# # import cv2
# # import numpy as np
# # import torch
# # import requests
# # import time
# # import matplotlib.pyplot as plt
# # from facenet_pytorch import InceptionResnetV1, MTCNN
# # from sklearn.preprocessing import normalize

# # API_URL = "http://localhost:3000/mark-attendance"

# # # Initialize MTCNN and InceptionResnetV1
# # mtcnn = MTCNN(keep_all=True)
# # resnet = InceptionResnetV1(pretrained='vggface2').eval()

# # # Function to detect and encode faces
# # def detect_and_encode(image):
# #     with torch.no_grad():
# #         boxes, _ = mtcnn.detect(image)
# #         if boxes is not None:
# #             faces = []  
# #             for box in boxes:
# #                 x1, y1, x2, y2 = map(int, box)
# #                 face = image[y1:y2, x1:x2]
# #                 if face.size == 0:
# #                     continue
# #                 face = cv2.resize(face, (160, 160), interpolation=cv2.INTER_LINEAR)
# #                 face = np.transpose(face, (2, 0, 1)).astype(np.float32) / 255.0
# #                 face_tensor = torch.tensor(face).unsqueeze(0)
# #                 encoding = resnet(face_tensor).detach().numpy().flatten()
# #                 encoding = normalize([encoding])[0]  # L2 normalization
# #                 faces.append(encoding)
# #             return faces
# #     return []

# # # Function to encode all known faces from embeddings
# # def encode_known_faces(folder_path='../backend/uploads'):
# #     known_face_encodings = []
# #     known_face_names = []

# #     for person_name in os.listdir(folder_path):
# #         person_folder = os.path.join(folder_path, person_name)
# #         if not os.path.isdir(person_folder):
# #             continue

# #         embedding_file = os.path.join(person_folder, 'embeddings.csv')
# #         if not os.path.exists(embedding_file):
# #             continue

# #         with open(embedding_file, 'r') as f:
# #             for line in f:
# #                 try:
# #                     values = list(map(float, line.strip().split(',')))
# #                     print("values: ", values)
# #                     if len(values) == 512:
# #                         known_face_encodings.append(np.array(values))
# #                         known_face_names.append(person_name)
# #                     else:
# #                         print(f"Skipping invalid embedding in {embedding_file}")
# #                 except ValueError:
# #                     print(f"Skipping invalid embedding in {embedding_file}")

# #     if known_face_encodings:
# #         known_face_encodings = normalize(np.array(known_face_encodings))  # normalize for cosine similarity
# #     else:
# #         known_face_encodings = np.array([])  # avoid normalization on empty array

# #     return known_face_encodings, known_face_names

# # # Encode known faces automatically
# # known_face_encodings, known_face_names = encode_known_faces()

# # # Function to recognize faces using cosine similarity
# # def recognize_faces(known_encodings, known_names, test_encodings, threshold=0.5):
# #     recognized_names = []
# #     for test_encoding in test_encodings:
# #         similarities = np.dot(known_encodings, test_encoding)  # Cosine similarity
# #         best_match_idx = np.argmax(similarities)
        
# #         if similarities[best_match_idx] > threshold:
# #             recognized_name = known_names[best_match_idx]
# #             recognized_names.append(recognized_name)
            
# #             # Add this check for match found
# #             matches = [similarities[best_match_idx] > threshold]
# #             if True in matches:  # Check if any match is True
# #                 first_match_index = matches.index(True)
# #                 if known_names[first_match_index] == recognized_name:
# #                     print("Embeddings matched")  # Print when embeddings match
# #                 else:
# #                     print("Not recognized")
# #         else:
# #             recognized_names.append('Not Recognized')
# #     return recognized_names


# # # Start video capture
# # cap = cv2.VideoCapture(0)
# # threshold = 0.5
# # seen_names = set()

# # detection_times = []
# # recognition_times = []
# # frame_count = 0

# # while cap.isOpened():
# #     ret, frame = cap.read()
# #     if not ret:
# #         break

# #     frame_count += 1
# #     frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)  # Moved this up

# #     # Measure detection + embedding time
# #     start_detection = time.time()
# #     test_face_encodings = detect_and_encode(frame_rgb)
# #     end_detection = time.time()
# #     detection_times.append(end_detection - start_detection)

# #     # Measure recognition time
# #     start_recognition = time.time()
# #     if test_face_encodings and known_face_encodings.size != 0:
# #         boxes, _ = mtcnn.detect(frame_rgb)
# #         boxes = boxes if boxes is not None else []
# #         names = recognize_faces(np.array(known_face_encodings), known_face_names, test_face_encodings, threshold)
# #         end_recognition = time.time()
# #         recognition_times.append(end_recognition - start_recognition)
# #     else:
# #         boxes = []
# #         names = []
# #         recognition_times.append(0)

# #     for name, box in zip(names, boxes):
# #         if box is not None and name != 'Not Recognized':
# #             x1, y1, x2, y2 = map(int, box)
# #             cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
# #             cv2.putText(frame, name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

# #             if name not in seen_names:
# #                 seen_names.add(name)
# #                 try:
# #                     response = requests.post(API_URL, json={"name": name})
# #                     print(f"Attendance marked for {name}: {response.status_code} - {response.json()}")
# #                 except Exception as e:
# #                     print(f"Error sending attendance for {name}: {e}")

# #             # Here, after marking attendance, you can also authenticate and rerun
# #             matches = [True]  # Or some matching condition based on your own criteria
# #             if True in matches:
# #                 first_match_index = matches.index(True)
# #                 if known_face_names[first_match_index] == name:
# #                     print("Embeddings matched")

# #     cv2.imshow('Face Recognition', frame)
# #     if cv2.waitKey(1) & 0xFF == ord('q'):
# #         break

# # cap.release()

# # # Plot detection and recognition times
# # plt.figure(figsize=(10, 5))
# # plt.plot(detection_times, label='Detection & Embedding Time')
# # plt.plot(recognition_times, label='Recognition Time')
# # plt.xlabel('Frame Number')
# # plt.ylabel('Time (seconds)')
# # plt.title('Face Detection and Recognition Time per Frame')
# # plt.legend()
# # plt.grid(True)
# # plt.tight_layout()
# # plt.show()

# # cv2.destroyAllWindows()

# # import os
# # import cv2
# # import numpy as np
# # import torch
# # import requests
# # import time
# # import matplotlib.pyplot as plt
# # from facenet_pytorch import InceptionResnetV1, MTCNN
# # from sklearn.preprocessing import normalize

# # API_URL = "http://localhost:3000/mark-attendance"

# # # Initialize MTCNN and InceptionResnetV1
# # mtcnn = MTCNN(keep_all=True)
# # resnet = InceptionResnetV1(pretrained='vggface2').eval()

# # # Function to detect and encode faces
# # def detect_and_encode(image):
# #     with torch.no_grad():
# #         boxes, _ = mtcnn.detect(image)
# #         if boxes is not None:
# #             faces = []
# #             for box in boxes:
# #                 x1, y1, x2, y2 = map(int, box)
# #                 face = image[y1:y2, x1:x2]
# #                 if face.size == 0:
# #                     continue
# #                 face = cv2.resize(face, (160, 160), interpolation=cv2.INTER_LINEAR)
# #                 face = np.transpose(face, (2, 0, 1)).astype(np.float32) / 255.0
# #                 face_tensor = torch.tensor(face).unsqueeze(0)
# #                 encoding = resnet(face_tensor).detach().numpy().flatten()
# #                 encoding = normalize([encoding])[0]  # L2 normalization
# #                 faces.append(encoding)
# #             return faces
# #     return []

# # # Function to encode all known faces from embeddings
# # def encode_known_faces(folder_path="../backend/uploads"):
# #     known_face_encodings = []
# #     known_face_names = []

# #     for person_name in os.listdir(folder_path):
# #         person_folder = os.path.join(folder_path, person_name)
# #         if not os.path.isdir(person_folder):
# #             continue

# #         embedding_file = os.path.join(person_folder, "embeddings.csv")
# #         if not os.path.exists(embedding_file):
# #             continue

# #         with open(embedding_file, "r") as f:
# #             for line in f:
# #                 try:
# #                     values = list(map(float, line.strip().split(",")))
# #                     if len(values) == 512:
# #                         known_face_encodings.append(np.array(values))
# #                         known_face_names.append(person_name)
# #                     else:
# #                         print(f"Skipping invalid embedding in {embedding_file}")
# #                 except ValueError:
# #                     print(f"Skipping invalid embedding in {embedding_file}")

# #     if known_face_encodings:
# #         known_face_encodings = normalize(np.array(known_face_encodings))
# #     else:
# #         known_face_encodings = np.array([])

# #     return known_face_encodings, known_face_names

# # # Encode known faces automatically
# # known_face_encodings, known_face_names = encode_known_faces()

# # # Function to recognize faces using cosine similarity
# # def recognize_faces(known_encodings, known_names, test_encodings, threshold=0.5):
# #     recognized_names = []
# #     for test_encoding in test_encodings:
# #         similarities = np.dot(known_encodings, test_encoding)  # Cosine similarity
# #         best_match_idx = np.argmax(similarities)
# #         if similarities[best_match_idx] > threshold:
# #             recognized_names.append(known_names[best_match_idx])
# #         else:
# #             recognized_names.append("Not Recognized")
# #     return recognized_names

# # # Start video capture
# # cap = cv2.VideoCapture(0)
# # threshold = 0.5
# # seen_names = set()
# # recognition_times = []
# # frame_count = 0

# # while cap.isOpened():
# #     ret, frame = cap.read()
# #     if not ret:
# #         break

# #     frame_count += 1
# #     frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

# #     # Detect and encode faces
# #     test_face_encodings = detect_and_encode(frame_rgb)

# #     # Measure recognition time
# #     start_recognition = time.time()
# #     if test_face_encodings and known_face_encodings.size != 0:
# #         boxes, _ = mtcnn.detect(frame_rgb)
# #         boxes = boxes if boxes is not None else []
# #         names = recognize_faces(known_face_encodings, known_face_names, test_face_encodings, threshold)
# #     else:
# #         boxes = []
# #         names = []
# #     end_recognition = time.time()

# #     # Record recognition time
# #     recognition_time = end_recognition - start_recognition
# #     recognition_times.append(recognition_time)
# #     print(f"Recognition time for frame {frame_count}: {recognition_time:.4f} seconds")

# #     # Draw rectangles and names, mark attendance
# #     for name, box in zip(names, boxes):
# #         if box is not None and name != "Not Recognized":
# #             x1, y1, x2, y2 = map(int, box)
# #             cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
# #             cv2.putText(
# #                 frame,
# #                 name,
# #                 (x1, y1 - 10),
# #                 cv2.FONT_HERSHEY_SIMPLEX,
# #                 1,
# #                 (0, 255, 0),
# #                 2,
# #                 cv2.LINE_AA,
# #             )

# #             if name not in seen_names:
# #                 seen_names.add(name)
# #                 try:
# #                     response = requests.post(API_URL, json={"name": name})
# #                     print(f"Attendance marked for {name}: {response.status_code} - {response.json()}")
# #                 except Exception as e:
# #                     print(f"Error sending attendance for {name}: {e}")

# #     cv2.imshow("Face Recognition", frame)
# #     if cv2.waitKey(1) & 0xFF == ord("q"):
# #         break

# # cap.release()
# # cv2.destroyAllWindows()

# # # Calculate average recognition time
# # if recognition_times:
# #     avg_time = np.mean(recognition_times)
# #     print(f"Average recognition time: {avg_time:.4f} seconds")
# # else:
# #     print("No recognition times recorded.")

# # # Plot recognition times
# # plt.figure(figsize=(10, 5))
# # plt.plot(recognition_times, marker="o", linestyle="-", label="Recognition Time")
# # if recognition_times:
# #     plt.axhline(
# #         y=avg_time,
# #         color="r",
# #         linestyle="--",
# #         label=f"Average Time: {avg_time:.4f} sec",
# #     )
# # plt.xlabel("Frame Number")
# # plt.ylabel("Time (seconds)")
# # plt.title("Face Recognition Time per Frame")
# # plt.legend()
# # plt.grid(True)
# # plt.tight_layout()
# # plt.show()

# import os
# import cv2
# import numpy as np
# import torch
# import requests
# import time
# import matplotlib.pyplot as plt
# from facenet_pytorch import InceptionResnetV1, MTCNN
# from sklearn.preprocessing import normalize

# API_URL = "http://localhost:3000/mark-attendance"

# # Initialize MTCNN and InceptionResnetV1
# mtcnn = MTCNN(keep_all=True)
# resnet = InceptionResnetV1(pretrained='vggface2').eval()

# # Function to detect and encode faces
# def detect_and_encode(image):
#     with torch.no_grad():
#         boxes, _ = mtcnn.detect(image)
#         if boxes is not None:
#             faces = []
#             for box in boxes:
#                 x1, y1, x2, y2 = map(int, box)
#                 face = image[y1:y2, x1:x2]
#                 if face.size == 0:
#                     continue
#                 face = cv2.resize(face, (160, 160), interpolation=cv2.INTER_LINEAR)
#                 face = np.transpose(face, (2, 0, 1)).astype(np.float32) / 255.0
#                 face_tensor = torch.tensor(face).unsqueeze(0)
#                 encoding = resnet(face_tensor).detach().numpy().flatten()
#                 encoding = normalize([encoding])[0]  # L2 normalization
#                 faces.append(encoding)
#             return faces
#     return []

# # Function to encode all known faces from 'images' folder
# def encode_known_faces(folder_path='../backend/uploads'):
#     known_face_encodings = []
#     known_face_names = []
    
#     for person_name in os.listdir(folder_path):
#         person_folder = os.path.join(folder_path, person_name)
#         if not os.path.isdir(person_folder):
#             continue
        
#         embedding_file = os.path.join(person_folder, 'embeddings.csv')
#         if not os.path.exists(embedding_file):
#             print(f"Embedding file not found for {person_name}")
#             continue

#         with open(embedding_file, 'r') as f:
#             for line_num, line in enumerate(f, 1):
#                 try:
#                     values = list(map(float, line.strip().split(',')))
#                     if len(values) == 512:
#                         known_face_encodings.append(np.array(values))
#                         known_face_names.append(person_name)
#                     else:
#                         print(f"Invalid embedding length in {embedding_file}, line {line_num}")
#                 except ValueError as e:
#                     print(f"Skipping invalid line {line_num} in {embedding_file}: {e}")

#     if known_face_encodings:
#         known_face_encodings = normalize(np.array(known_face_encodings))  # normalize for cosine similarity
#     else:
#         print("No valid face encodings found. Attendance system cannot proceed.")
#         exit()

#     return known_face_encodings, known_face_names

# # Encode known faces automatically
# known_face_encodings, known_face_names = encode_known_faces()

# # Function to recognize faces using cosine similarity
# def recognize_faces(known_encodings, known_names, test_encodings, threshold=0.5):
#     recognized_names = []
#     for test_encoding in test_encodings:
#         similarities = np.dot(known_encodings, test_encoding)  # Cosine similarity
#         best_match_idx = np.argmax(similarities)
#         if similarities[best_match_idx] > threshold:
#             recognized_names.append(known_names[best_match_idx])
#         else:
#             recognized_names.append('Not Recognized')
#     return recognized_names

# # Start video capture
# cap = cv2.VideoCapture(0)
# threshold = 0.5  # Adjusted threshold for better classification
# seen_names = set()
# detection_times = []
# recognition_times = []
# frame_count = 0

# while cap.isOpened():
#     ret, frame = cap.read()
#     if not ret:
#         break

#     frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#     frame_count += 1

#     # Measure detection + embedding time
#     start_detection = time.time()
#     test_face_encodings = detect_and_encode(frame_rgb)
#     end_detection = time.time()
#     detection_times.append(end_detection - start_detection)

#     # Measure recognition time
#     start_recognition = time.time()
#     if test_face_encodings and len(known_face_encodings) > 0:
#         boxes, _ = mtcnn.detect(frame_rgb)
#         boxes = boxes if boxes is not None else []
#         names = recognize_faces(np.array(known_face_encodings), known_face_names, test_face_encodings, threshold)
#         end_recognition = time.time()
#         recognition_times.append(end_recognition - start_recognition)

#         for name, box in zip(names, boxes):
#             if box is not None and name != 'Not Recognized':
#                 x1, y1, x2, y2 = map(int, box)
#                 cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
#                 cv2.putText(frame, name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

#                 if name not in seen_names:
#                     seen_names.add(name)
#                     try:
#                         response = requests.post(API_URL, json={"name": name})
#                         print(f"Attendance marked for {name}: {response.status_code} - {response.json()}")
#                     except Exception as e:
#                         print(f"Error sending attendance for {name}: {e}")
#     else:
#         recognition_times.append(0)

#     cv2.imshow('Face Recognition', frame)
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break

# cap.release()

# # Plot detection and recognition times
# plt.figure(figsize=(10, 5))
# plt.plot(detection_times, label='Detection & Embedding Time')
# plt.plot(recognition_times, label='Recognition Time')
# plt.xlabel('Frame Number')
# plt.ylabel('Time (seconds)')
# plt.title('Face Detection and Recognition Time per Frame')
# plt.legend()
# plt.grid(True)
# plt.tight_layout()
# plt.show()

# cv2.destroyAllWindows()


import os
import cv2
import numpy as np
import torch
import requests
import time
import pandas as pd
from facenet_pytorch import InceptionResnetV1, MTCNN
from sklearn.preprocessing import normalize

# ------------------- Configuration -------------------
UPLOADS_FOLDER = '../backend/uploads'  # Folder where embeddings are stored
API_URL = "http://localhost:3000/mark-attendance"
THRESHOLD = 0.5  # Cosine similarity threshold
# -----------------------------------------------------

# Initialize face detector and embedding model
mtcnn = MTCNN(keep_all=True)
resnet = InceptionResnetV1(pretrained='vggface2').eval()

# ------------------- Helper Functions -------------------

def detect_and_encode(image):
    """Detect faces and return list of L2-normalized embeddings."""
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


def load_known_embeddings(folder_path):
    known_encodings = []
    known_names = []

    for person_folder in os.listdir(folder_path):
        full_path = os.path.join(folder_path, person_folder)
        csv_path = os.path.join(full_path, 'embeddings.csv')
        if not os.path.exists(csv_path):
            continue

        df = pd.read_csv(csv_path)
        for index, row in df.iterrows():
            name = row.iloc[0]
            embedding = row.iloc[1:].values.astype(float)  # ← shape (512,)
            embedding = normalize([embedding])[0]          # ← shape (512,)
            known_encodings.append(embedding)
            known_names.append(name)

    return np.array(known_encodings), known_names


def recognize_face(input_embedding, known_encodings, known_names, threshold=0.5):
    similarities = np.dot(known_encodings, input_embedding)  # Dot product = cosine similarity
    best_match_idx = np.argmax(similarities)
    best_score = similarities[best_match_idx]

    if best_score > threshold:
        return known_names[best_match_idx]
    return "Unknown"



# ------------------- Main Logic -------------------

# Load known face embeddings
known_face_encodings, known_face_names = load_known_embeddings(UPLOADS_FOLDER)
if not known_face_encodings.size:
    print("❌ No valid embeddings found.")
    exit()

# Setup for video and attendance tracking
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
        name = recognize_face(embedding, known_face_encodings, known_face_names)
        x1, y1, x2, y2 = map(int, box)

        # Draw rectangle and label
        color = (0, 255, 0) if name != 'Not Recognized' else (0, 0, 255)
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        cv2.putText(frame, name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

        # Mark attendance
        if name != "Not Recognized" and name not in marked_names:
            try:
                response = requests.post(API_URL, json={"name": name})
                if response.status_code == 200:
                    print(f"✅ Marked attendance for {name}")
                    marked_names.add(name)
                else:
                    print(f"⚠️ Failed to mark attendance for {name}: {response.status_code}")
            except Exception as e:
                print(f"❌ Error sending request for {name}: {e}")

    # Display frame
    cv2.imshow("Face Recognition Attendance", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
print("📸 Camera stopped.")
