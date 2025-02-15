from flask import Blueprint, request, jsonify, current_app
from app import bcrypt
from app.models import User
from flask_jwt_extended import create_access_token
import datetime
import os
from werkzeug.utils import secure_filename

auth_bp = Blueprint('auth', __name__)

# Configure upload folder and allowed extensions
UPLOAD_FOLDER = 'app/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@auth_bp.route('/signin', methods=['POST'])
def signin():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    # Retrieve user from Supabase
    response = current_app.supabase.table('users').select('*').eq('email', email).execute()
    user_data = response.data

    if not user_data or not bcrypt.check_password_hash(user_data[0]['password'], password):
        return jsonify({"message": "Invalid email or password"}), 401

    user = User.from_dict(user_data[0])  # Create User instance from Supabase data

    token = create_access_token(identity={'email': email, 'userid': user.id}, expires_delta=datetime.timedelta(days=1))

    return jsonify({"message": "Login Successful", "token": token}), 200

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.form  # Use request.form to handle form data
    print("Received signup data:", data)  # Log the form data

    # Retrieve fields from the form data
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    department = data.get('department')
    designation = data.get('designation')
    password = data.get('password')
    employeeId = data.get('employeeId')

    # Validate required fields
    if not all([name, email, phone, department, designation, password, employeeId]):
        return jsonify({"message": "All fields are required"}), 400

    # Handle file upload
    if 'profilePhoto' not in request.files:
        return jsonify({"message": "No file part"}), 400

    file = request.files['profilePhoto']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({"message": "No selected file or file type not allowed"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)  # Save the file to the uploads folder

    # Check if user already exists
    response = current_app.supabase.table('users').select('*').eq('email', email).execute()
    print("Check existing user response:", response)  # Log the response

    # Check for errors in the response
    if response.data is None:
        print("Error checking existing user:", response)  # Log the error response
        return jsonify({"message": "Error checking existing user", "error": response}), 500

    if response.data:
        return jsonify({"message": "User already exists"}), 409

    # Hash the password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Create new user data
    new_user_data = {
        'email': email,
        'password': hashed_password,
        'name': name,
        'phone': phone,
        'department': department,
        'designation': designation,
        'profilePhoto': file_path,
        'employeeId': employeeId
    }

    # Insert the new user into Supabase
    response = current_app.supabase.table('users').insert(new_user_data).execute()
    print("Supabase insert response:", response)  # Log the insert response

    # Check for errors in the response
    if response.data is None:
        print("Error creating user:", response)  # Log the error response
        return jsonify({"message": "Error creating user", "error": response}), 500

    # Generate token for the new user
    token = create_access_token(identity={'email': email, 'userid': response.data[0]['id']}, expires_delta=datetime.timedelta(days=1))
    return jsonify({"message": "Registration Successful", "token": token}), 201