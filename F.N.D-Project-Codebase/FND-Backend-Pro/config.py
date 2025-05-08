import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

class Config:
    # Core configuration
    SECRET_KEY = os.getenv('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError("No SECRET_KEY set in environment variables")
    
    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 3600,
        'pool_size': 10,
        'max_overflow': 20
    }
    
    # JWT configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour
    JWT_TOKEN_LOCATION = ['headers']
    
    # Model configuration
    MODEL_PATH = os.getenv('MODEL_PATH', './saved_model')
    TOKENIZER_FILE = os.getenv('TOKENIZER_FILE', 'tokenizer.pkl')
    MODEL_FILE = os.getenv('MODEL_FILE', 'true_fake_news_classifier.keras')
    
    # Validate model paths
    @property
    def tokenizer_path(self):
        path = Path(self.MODEL_PATH) / self.TOKENIZER_FILE
        if not path.exists():
            raise FileNotFoundError(f"Tokenizer not found at: {path}")
        return str(path)
    
    @property
    def model_path(self):
        path = Path(self.MODEL_PATH) / self.MODEL_FILE
        if not path.exists():
            raise FileNotFoundError(f"Model not found at: {path}")
        return str(path)
    
    # Performance settings
    MAX_TEXT_LENGTH = 5000  # characters
    PREDICTION_TIMEOUT = 30  # seconds
    
    # config.py (add to Config class)
    ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'admin@fnd.com')
    ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'admin_123')