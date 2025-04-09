from app import db

class Prediction(db.Model):
    __tablename__ = 'predictions'
    
    id = db.Column(db.Integer, primary_key=True)
    model_version = db.Column(db.String(50), nullable=False)
    input_features = db.Column(db.JSON, nullable=False)
    output = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    def __repr__(self):
        return f'<Prediction {self.id}>'