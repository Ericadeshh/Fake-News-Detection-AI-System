from datetime import datetime
from app import db
from sqlalchemy import text

class Conversation(db.Model):
    """Enhanced database model with indexes and constraints"""
    __tablename__ = 'conversations'
    
    id = db.Column(db.Integer, primary_key=True)
    input_text = db.Column(db.Text, nullable=False)
    prediction = db.Column(db.String(50), nullable=False, index=True)
    edited_prediction = db.Column(db.String(50), nullable=True)  # Made explicitly nullable
    confidence = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    feedback = db.Column(db.String(50), nullable=True)
    processing_time = db.Column(db.Float, nullable=True)
    
    def __repr__(self):
        return f'<Conversation {self.id} - {self.prediction} ({self.confidence:.2%})>'
    
    def to_dict(self):
        """Enhanced serialization with all fields"""
        return {
            'id': self.id,
            'input_text': self.input_text[:100] + '...' if len(self.input_text) > 100 else self.input_text,
            'prediction': self.prediction,
            'edited_prediction': self.edited_prediction,
            'confidence': self.confidence,
            'created_at': self.created_at.isoformat(),
            'feedback': self.feedback,
            'processing_time': self.processing_time
        }

def init_db(app):
    """Initialize database with proper error handling and column checks"""
    with app.app_context():
        try:
            # First check if the edited_prediction column exists
            inspector = db.inspect(db.engine)
            columns = inspector.get_columns('conversations')
            column_names = [col['name'] for col in columns]
            
            if 'edited_prediction' not in column_names:
                app.logger.warning("⚠️ edited_prediction column missing - attempting to add...")
                try:
                    # Add the new column
                    db.session.execute(text('ALTER TABLE conversations ADD COLUMN edited_prediction VARCHAR(50)'))
                    db.session.commit()
                    app.logger.info("✅ Successfully added edited_prediction column")
                except Exception as alter_error:
                    db.session.rollback()
                    app.logger.error(f"❌ Failed to add edited_prediction column: {str(alter_error)}")
                    raise

            # Create all tables (won't recreate existing ones)
            db.create_all()
            app.logger.info("✅ Database tables verified/created")
            
            # Create indexes if they don't exist
            from sqlalchemy import Index
            indexes = [
                Index('ix_conversation_prediction', Conversation.prediction),
                Index('ix_conversation_created_at', Conversation.created_at)
            ]
            
            for idx in indexes:
                idx.create(bind=db.engine, checkfirst=True)
                
            app.logger.info("✅ Database indexes verified")
            
            # Verify the edited_prediction column is properly nullable
            if 'edited_prediction' in column_names:
                edited_pred_col = next(col for col in columns if col['name'] == 'edited_prediction')
                if not edited_pred_col['nullable']:
                    app.logger.warning("⚠️ edited_prediction column is not nullable - attempting to modify...")
                    try:
                        db.session.execute(text('ALTER TABLE conversations MODIFY COLUMN edited_prediction VARCHAR(50) NULL'))
                        db.session.commit()
                        app.logger.info("✅ Successfully set edited_prediction as nullable")
                    except Exception as modify_error:
                        db.session.rollback()
                        app.logger.error(f"❌ Failed to modify edited_prediction column: {str(modify_error)}")
                        raise
            
        except Exception as e:
            app.logger.error(f"❌ Database initialization failed: {str(e)}")
            raise