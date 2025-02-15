import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    SUPABASE_URL = os.getenv("SUPABASE_URL")  # Add Supabase URL
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # Add Supabase Key
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")