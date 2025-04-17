# Smart Attendance System - AI-Driven Face Recognition

![Frontend + Backend](https://img.shields.io/badge/Tech%20Stack-Frontend%3A%20React.js%20%7C%20Chart.js%20%7C%20Tailwind%20CSS%20%7C%20Axios%20--Backend%3A%20Node.js%20%7C%20Express.js%20%7C%20Supabase%20%7C%20JWT%20%2F%20Bcrypt-brightgreen)
![AI/ML Stack](https://img.shields.io/badge/AI%2FML-OpenCV%20%7C%20MTCNN%20%7C%20InceptionResnetV1%20%7C%20Scikit--learn%20%7C%20NumPy-blue)

## 📌 Overview
The Smart Attendance System is an AI-powered face recognition solution designed to automate and streamline attendance marking in real-time. Leveraging the power of deep learning models like MTCNN for face detection and InceptionResnetV1 for face recognition, the system achieves over 99% accuracy with sub-200ms latency. Integrated with IP cameras, it ensures seamless tracking without manual intervention. The platform features a dynamic React.js dashboard, backed by Node.js and Supabase, providing administrators with insightful analytics, attendance logs, and real-time data visualization. This project blends machine learning, computer vision, and full-stack web development to solve a real-world problem efficiently and intelligently.

## 🚀 Features
- 🧠 **AI-Driven**: Uses deep learning for face detection and recognition.
- 🎯 **High Accuracy**: Achieves 99%+ accuracy using MTCNN + InceptionResnetV1.
- ⚡ **Real-Time Performance**: Processes live camera feeds with low latency.
- 📊 **Interactive Dashboard**: Visualize attendance logs and analytics via a React.js frontend.
- 🛠 **Robust Tech Stack**: Node.js backend, Supabase DB, and Scikit-learn for matching embeddings.
- 🔐 **Secure and Scalable**: Designed for institutions or workplaces with multiple users and IP cameras.

## 🛠 Tech Stack
- **Frontend**: React.js, Chart.js, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js, Supabase, JWT / Bcrypt
- **AI/ML**: OpenCV, MTCNN, InceptionResnetV1, Scikit-learn, NumPy

## 🔧 Installation & Setup

Follow the steps below to clone, install dependencies, and run the project locally. Make sure you have **Node.js**, **npm**, and **Python** installed on your machine.

### 1. **Clone the Repository**
Start by cloning the repository to your local machine:
```bash
git clone https://github.com/Sayantan-dev1003/AttendanceSystem.git
```

### 2. **Navigate to Project Directory**
Once the repository is cloned, change your working directory to the project folder:
```bash
cd AttendanceSystem
```

### 3. **Set Up Frontend**
Navigate to the frontend folder where the React application is located:
```bash
cd frontend
```
Install all necessary dependencies for the frontend:
```bash
npm install
```

### 4. **Set Up Backend (Node.js)**
Open a new terminal window and navigate to the backend directory:
```bash
cd backend
```
Install all necessary dependencies for the backend:
```bash
npm install
```

### 5. **Run the Backend**
To start the backend server, use nodemon (which automatically restarts the server when code changes):
```bash
nodemon app
```
This will start the Node.js backend on the specified port (usually http://localhost:3000).

### 6. **Set Up Flask Server (AI Model)**
Open another new terminal window and navigate to the flaskserver folder, which contains the Python Flask application used for the AI model:
```bash
cd flaskserver
```
Install the required Python dependencies using pip:
```bash
pip install -r requirements.txt
```
This will install all necessary Python packages for running the AI model (e.g., OpenCV, TensorFlow, etc.).

### 7. **Run Flask Server**
To start the Flask server, use the following command:
```bash
python faceRecognition.py
```
This will start the Flask server that handles the face recognition and model predictions.

![Image](https://github.com/user-attachments/assets/a0a12ee9-c94e-4c50-9e70-c16acec026d3)
![Image](https://github.com/user-attachments/assets/3c133a71-b5ac-438d-9412-e9986a864dda)
![Image](https://github.com/user-attachments/assets/76b6dfea-c15a-467f-b755-e156827b0da6)
![Image](https://github.com/user-attachments/assets/b3131720-1b96-4499-9454-6f7b256e4bf6)
![Image](https://github.com/user-attachments/assets/a0f82bbc-bc54-441f-968d-941f5e116e8a)
