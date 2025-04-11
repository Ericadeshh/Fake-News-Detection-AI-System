# Updated app/ai_service.py
import os
import sys
import joblib
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
import logging
from datetime import datetime
import re
import time

logger = logging.getLogger(__name__)

class AIService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            start_time = time.time()
            cls._verify_environment()
            cls._instance = super(AIService, cls).__new__(cls)
            cls._instance.initialize()
            logger.info(f"✓ AI Service singleton created in {(time.time()-start_time)*1000:.2f}ms")
        return cls._instance
    
    @classmethod
    def _verify_environment(cls):
        """Verify we're using the correct virtual environment"""
        venv_path = os.path.abspath("venv")
        python_path = sys.executable
        if not python_path.startswith(venv_path):
            raise RuntimeError(f"Wrong Python environment: {python_path}")
    
    def initialize(self):
        """Initialize model with timing metrics"""
        self.model = None
        self.tokenizer = None
        self.status = "not_loaded"
        self.load_model()
    
    def load_model(self):
        """Enhanced model loading with detailed error reporting"""
        try:
            model_path = os.path.join('saved_model', 'true_fake_news_classifier.keras')
            tokenizer_path = os.path.join('saved_model', 'tokenizer.pkl')

            # Verify files exist
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Model file missing at: {model_path}")
            if not os.path.exists(tokenizer_path):
                raise FileNotFoundError(f"Tokenizer file missing at: {tokenizer_path}")

            # Load tokenizer
            self.tokenizer = joblib.load(tokenizer_path)
            
            # Load model
            self.model = load_model(model_path, compile=False)
            
            # Verify prediction works
            test_text = "This is a test sentence for model verification"
            sequence = self.tokenizer.texts_to_sequences([test_text])
            pad_sequences(sequence, maxlen=150)  # Test shape compatibility

            self.status = "ready"
            logging.info("✅ Model loaded successfully")

        except Exception as e:
            self.status = "error"
            logging.error(f"❌ Model loading failed: {str(e)}")
            raise
    
    def get_status(self):
        """Return detailed service status"""
        return {
            "status": self.status,
            "model_loaded": self.model is not None,
            "tokenizer_loaded": self.tokenizer is not None
        }

    def is_ready(self):
        """Check if service is ready for predictions"""
        return self.status == "ready"

    def predict(self, text):
        """Enhanced prediction with timing and validation"""
        if not self.is_ready():
            raise RuntimeError("Model not loaded or not ready")
        
        start_time = time.time()
        try:
            # Preprocessing
            clean_start = time.time()
            cleaned_text = self._preprocess(text)
            logger.debug(f"Text cleaned in {(time.time()-clean_start)*1000:.2f}ms")
            
            # Tokenization
            tokenize_start = time.time()
            sequence = self.tokenizer.texts_to_sequences([cleaned_text])
            logger.debug(f"Text tokenized in {(time.time()-tokenize_start)*1000:.2f}ms")
            
            # Padding
            pad_start = time.time()
            padded = pad_sequences(sequence, maxlen=150)
            logger.debug(f"Sequence padded in {(time.time()-pad_start)*1000:.2f}ms")
            
            # Prediction
            predict_start = time.time()
            prediction = self.model.predict(padded)[0][0]
            logger.debug(f"Prediction made in {(time.time()-predict_start)*1000:.2f}ms")
            
            # Result formatting
            label = 'true' if prediction > 0.5 else 'fake'
            confidence = float(prediction if prediction > 0.5 else 1 - prediction)
            
            logger.info(f"Prediction completed in {(time.time()-start_time)*1000:.2f}ms - {label} ({confidence:.2%})")
            
            return (label, confidence)
            
        except Exception as e:
            logger.error(f"Prediction failed after {(time.time()-start_time)*1000:.2f}ms: {str(e)}")
            raise

    def _preprocess(self, text):
        """Optimized text cleaning pipeline"""
        text = text.lower()
        text = re.sub(r'https?://\S+|www\.\S+', '', text)
        text = re.sub(r'[^\w\s]', '', text)
        return ' '.join(text.split())

# Initialize the service when module is imported
ai_service = AIService()
