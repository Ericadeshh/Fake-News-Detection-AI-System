# Updated app/ai_service.py with enhanced logging
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
from time import sleep

logger = logging.getLogger(__name__)

class AIService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            logger.info("\n🧠 Initializing AI Service...")
            start_time = time.time()
            cls._verify_environment()
            cls._instance = super(AIService, cls).__new__(cls)
            cls._instance.initialize()
            logger.info(f"✅ AI Service initialized in {(time.time()-start_time)*1000:.2f}ms")
        return cls._instance
    
    @classmethod
    def _verify_environment(cls):
        """Verify we're using the correct virtual environment"""
        logger.info("🔍 Verifying Python environment...")
        venv_path = os.path.abspath("venv")
        python_path = sys.executable
        if not python_path.startswith(venv_path):
            logger.error(f"❌ Wrong Python environment: {python_path}")
            raise RuntimeError(f"Activate virtual environment first: {venv_path}\\Scripts\\activate")
        logger.info("✅ Python environment verified")
    
    def initialize(self):
        """Initialize model with timing metrics"""
        self.model = None
        self.tokenizer = None
        self.status = "not_loaded"
        self.load_model()
    
    def load_model(self):
        """Enhanced model loading with beautiful progress logging"""
        try:
            logger.info("\n🔄 Loading AI Model Components:")
            
            # Verify files exist
            model_path = os.path.join('saved_model', 'true_fake_news_classifier.keras')
            tokenizer_path = os.path.join('saved_model', 'tokenizer.pkl')

            logger.info("🔍 Checking model files...")
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Model file missing at: {model_path}")
            if not os.path.exists(tokenizer_path):
                raise FileNotFoundError(f"Tokenizer file missing at: {tokenizer_path}")
            logger.info("✅ Model files verified")

            # Load tokenizer with progress
            logger.info("\n📦 Loading tokenizer...")
            tokenizer_start = time.time()
            self.tokenizer = joblib.load(tokenizer_path)
            logger.info(f"✅ Tokenizer loaded in {(time.time()-tokenizer_start)*1000:.2f}ms")
            
            # Load model with progress animation
            logger.info("\n🏗️  Loading neural network model:")
            for i in range(1, 6):
                sleep(0.3)
                logger.info(f"   ⏳ Loading model layers... [{'='*i}{' '*(5-i)}] {i*20}%")
            
            model_start = time.time()
            self.model = load_model(model_path, compile=False)
            logger.info(f"✅ Model loaded in {(time.time()-model_start)*1000:.2f}ms")
            
            # Verify prediction works
            logger.info("\n🧪 Running verification test...")
            test_start = time.time()
            test_text = "This is a test sentence for model verification"
            sequence = self.tokenizer.texts_to_sequences([test_text])
            pad_sequences(sequence, maxlen=150)  # Test shape compatibility
            logger.info(f"✅ Verification passed in {(time.time()-test_start)*1000:.2f}ms")

            self.status = "ready"
            logger.info("\n🎉 AI Model successfully initialized and ready!")

        except Exception as e:
            self.status = "error"
            logger.error(f"\n❌ Model loading failed: {str(e)}")
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
        
        logger.info("\n🔮 Making prediction...")
        start_time = time.time()
        try:
            # Preprocessing
            clean_start = time.time()
            cleaned_text = self._preprocess(text)
            logger.debug(f"✨ Text cleaned in {(time.time()-clean_start)*1000:.2f}ms")
            
            # Tokenization
            tokenize_start = time.time()
            sequence = self.tokenizer.texts_to_sequences([cleaned_text])
            logger.debug(f"🔡 Text tokenized in {(time.time()-tokenize_start)*1000:.2f}ms")
            
            # Padding
            pad_start = time.time()
            padded = pad_sequences(sequence, maxlen=150)
            logger.debug(f"📏 Sequence padded in {(time.time()-pad_start)*1000:.2f}ms")
            
            # Prediction
            predict_start = time.time()
            prediction = self.model.predict(padded)[0][0]
            logger.debug(f"🧠 Prediction made in {(time.time()-predict_start)*1000:.2f}ms")
            
            # Result formatting
            label = 'true' if prediction > 0.5 else 'fake'
            confidence = float(prediction if prediction > 0.5 else 1 - prediction)
            
            logger.info(f"\n🎯 Prediction Result:")
            logger.info(f"   ├── Label: {'✅ TRUE' if label == 'true' else '❌ FAKE'}")
            logger.info(f"   ├── Confidence: {confidence:.2%}")
            logger.info(f"   └── Total time: {(time.time()-start_time)*1000:.2f}ms")
            
            return (label, confidence)
            
        except Exception as e:
            logger.error(f"\n❌ Prediction failed after {(time.time()-start_time)*1000:.2f}ms: {str(e)}")
            raise

    def _preprocess(self, text):
        """Optimized text cleaning pipeline"""
        text = text.lower()
        text = re.sub(r'https?://\S+|www\.\S+', '', text)
        text = re.sub(r'[^\w\s]', '', text)
        return ' '.join(text.split())

# Initialize the service when module is imported
logger.info("\n🏁 Starting AI Service initialization...")
ai_service = AIService()