import os
from dotenv import load_dotenv  # Import dotenv to load environment variables
from app import create_app

# Load environment variables from .env file
load_dotenv()

app = create_app()

if __name__ == '__main__':
    debug_mode = os.getenv("FLASK_DEBUG", "True") == "True"
    try:
        app.run(host="0.0.0.0", port=5000, debug=debug_mode)
    except Exception as e:
        print(f"Error starting the application: {e}")