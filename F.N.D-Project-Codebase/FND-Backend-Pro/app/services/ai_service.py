import os
import joblib
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
from app import db
from app.models.prediction import Prediction
from datetime import datetime

class AIService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AIService, cls).__new__(cls)
            cls._instance.initialize()
        return cls._instance
    
    def initialize(self):
        self.model = None
        self.tokenizer = None
        self.load_model()
    
    def load_model(self):
        model_path = os.path.join('saved_model', 'true_fake_news_classifier.keras')
        tokenizer_path = os.path.join('saved_model', 'tokenizer.pkl')
        
        if os.path.exists(model_path) and os.path.exists(tokenizer_path):
            self.model = load_model(model_path)
            self.tokenizer = joblib.load(tokenizer_path)
    
    def preprocess_text(self, text):
        # Clean the text (you can use your existing cleaning function)
        text = text.lower()
        # Add more preprocessing as needed
        return text
    
    def predict(self, text, user_id=None):
        if not self.model or not self.tokenizer:
            raise Exception("Model not loaded")
        
        cleaned_text = self.preprocess_text(text)
        sequence = self.tokenizer.texts_to_sequences([cleaned_text])
        padded_sequence = pad_sequences(sequence, maxlen=150)
        
        prediction = self.model.predict(padded_sequence)[0][0]
        label = 'true' if prediction > 0.5 else 'fake'
        confidence = prediction if label == 'true' else 1 - prediction
        
        # Log the prediction to database
        prediction_record = Prediction(
            model_version='1.0',
            input_features={'text': text, 'cleaned_text': cleaned_text},
            output={'label': label, 'confidence': float(confidence)}
        )
        db.session.add(prediction_record)
        db.session.commit()
        
        return {
            'label': label,
            'confidence': float(confidence),
            'prediction_id': prediction_record.id
        }

ai_service = AIService()