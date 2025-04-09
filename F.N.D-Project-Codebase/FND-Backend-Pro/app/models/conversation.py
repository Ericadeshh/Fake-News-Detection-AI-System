from datetime import datetime
from app import db

class Conversation(db.Model):
    __tablename__ = 'conversations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    input_text = db.Column(db.Text, nullable=False)
    prediction = db.Column(db.String(50), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    feedback = db.Column(db.String(50), nullable=True)  # 'correct', 'incorrect', None
    
    user = db.relationship('User', backref='conversations')
    
    def __repr__(self):
        return f'<Conversation {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'input_text': self.input_text,
            'prediction': self.prediction,
            'confidence': self.confidence,
            'created_at': self.created_at.isoformat(),
            'feedback': self.feedback
        }