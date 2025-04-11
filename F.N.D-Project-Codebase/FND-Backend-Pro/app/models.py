# Updated app/models.py
from datetime import datetime
from app import db

class Conversation(db.Model):
    """Enhanced database model with indexes and constraints"""
    __tablename__ = 'conversations'
    
    id = db.Column(db.Integer, primary_key=True)
    input_text = db.Column(db.Text, nullable=False)
    prediction = db.Column(db.String(50), nullable=False, index=True)
    confidence = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    feedback = db.Column(db.String(50))
    processing_time = db.Column(db.Float)  # Time taken for prediction in ms
    
    def __repr__(self):
        return f'<Conversation {self.id} - {self.prediction} ({self.confidence:.2%})>'
    
    def to_dict(self):
        """Enhanced serialization with all fields"""
        return {
            'id': self.id,
            'input_text': self.input_text[:100] + '...' if len(self.input_text) > 100 else self.input_text,
            'prediction': self.prediction,
            'confidence': self.confidence,
            'created_at': self.created_at.isoformat(),
            'feedback': self.feedback,
            'processing_time': self.processing_time
        }

def init_db(app):
    """Initialize database with proper error handling"""
    with app.app_context():
        try:
            db.create_all()
            app.logger.info("Database tables verified/created")
            
            # Create indexes if they don't exist
            from sqlalchemy import Index
            indexes = [
                Index('ix_conversation_prediction', Conversation.prediction),
                Index('ix_conversation_created_at', Conversation.created_at)
            ]
            
            for idx in indexes:
                idx.create(bind=db.engine, checkfirst=True)
                
            app.logger.info("Database indexes verified")
            
        except Exception as e:
            app.logger.error(f"Database initialization failed: {str(e)}")
            raise