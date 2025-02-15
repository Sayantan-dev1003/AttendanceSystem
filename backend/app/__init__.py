from flask import Flask, send_from_directory
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from supabase import create_client
import os
from app.config import Config

bcrypt = Bcrypt()
jwt = JWTManager()
cors = CORS()

def create_app():
    app = Flask(__name__, static_folder='dist/assets', static_url_path='/assets')
    app.config.from_object(Config)

    # Initialize Flask extensions
    bcrypt.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize Supabase client
    supabase_url = app.config['SUPABASE_URL']
    supabase_key = app.config['SUPABASE_KEY']
    app.supabase = create_client(supabase_url, supabase_key)

    # Serve React App
    @app.route('/')
    def serve_react_app():
        return send_from_directory('dist', 'index.html')

    # Serve Static Files
    @app.route('/<path:path>')
    def serve_static(path):
        if os.path.exists(os.path.join('dist', path)):
            return send_from_directory('dist', path)
        return send_from_directory('dist', 'index.html')  # Ensures React handles routing

    # Register the blueprint and pass the Supabase client
    from app.routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api')
    auth_bp.supabase = app.supabase  # Pass the Supabase client to the blueprint

    return app