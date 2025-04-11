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
        """Enhanced model loading with detailed logging"""
        start_time = time.time()
        try:
            logger.info("⏳ Loading AI model components...")
            
            model_path = os.path.join(os.getenv('MODEL_PATH'), os.getenv('MODEL_FILE'))
            tokenizer_path = os.path.join(os.getenv('MODEL_PATH'), os.getenv('TOKENIZER_FILE'))
            
            if not all(os.path.exists(p) for p in [model_path, tokenizer_path]):
                raise FileNotFoundError(f"Model files missing. Looking in: {model_path}")
            
            # Load tokenizer first
            tokenizer_start = time.time()
            self.tokenizer = joblib.load(tokenizer_path)
            logger.info(f"✓ Tokenizer loaded in {(time.time()-tokenizer_start)*1000:.2f}ms")
            
            # Then load model
            model_start = time.time()
            self.model = load_model(model_path, compile=False)
            logger.info(f"✓ Model loaded in {(time.time()-model_start)*1000:.2f}ms")
            
            # Verify model can make predictions
            test_start = time.time()
            test_text = "This is a test news article for model verification"
            self.predict(test_text)
            logger.info(f"✓ Model test prediction completed in {(time.time()-test_start)*1000:.2f}ms")
            
            self.status = "ready"
            logger.info(f"✅ Model fully initialized in {(time.time()-start_time)*1000:.2f}ms")
            
        except Exception as e:
            self.status = "error"
            logger.error(f"❌ Model loading failed after {(time.time()-start_time)*1000:.2f}ms: {str(e)}")
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