from datetime import datetime
from app import db
from sqlalchemy import text, inspect
from flask import current_app
import logging

class Conversation(db.Model):
    """Enhanced database model with indexes and constraints"""
    __tablename__ = 'conversations'
    
    id = db.Column(db.Integer, primary_key=True)
    input_text = db.Column(db.Text, nullable=False)
    input_type = db.Column(db.String(10), nullable=False)  # 'text', 'file', or 'url'
    prediction = db.Column(db.String(50), nullable=False, index=True)
    edited_prediction = db.Column(db.String(50), nullable=True)
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
            'input_type': self.input_type,
            'prediction': self.prediction,
            'edited_prediction': self.edited_prediction,
            'confidence': self.confidence,
            'created_at': self.created_at.isoformat(),
            'feedback': self.feedback,
            'processing_time': self.processing_time
        }

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20))
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<User {self.email}>'

    def set_password(self, password):
        from werkzeug.security import generate_password_hash
        self.password = generate_password_hash(password)

    def check_password(self, password):
        from werkzeug.security import check_password_hash
        return check_password_hash(self.password, password)
    
def verify_database(app):
    """Verify and initialize database with proper schema"""
    with app.app_context():
        try:
            logging.info("\n🛠️  Checking database schema...")
            
            # Create all tables if they don't exist
            logging.info("🔍 Checking tables...")
            db.create_all()
            
            # Verify table structure
            inspector = inspect(db.engine)
            if 'conversations' not in inspector.get_table_names():
                logging.info("📂 Creating new 'conversations' table...")
            
            columns = inspector.get_columns('conversations')
            column_names = [col['name'] for col in columns]
            logging.info(f"✅ Found {len(column_names)} columns in 'conversations' table")
            
            # Check for required columns and add if missing
            required_columns = {
                'edited_prediction': 'VARCHAR(50) NULL',
                'input_type': 'VARCHAR(10) NOT NULL DEFAULT "text"'
            }
            
            for col_name, col_type in required_columns.items():
                if col_name not in column_names:
                    logging.warning(f"⚠️  Adding missing column: {col_name}...")
                    try:
                        db.session.execute(text(f'ALTER TABLE conversations ADD COLUMN {col_name} {col_type}'))
                        db.session.commit()
                        logging.info(f"✅ Successfully added column: {col_name}")
                    except Exception as e:
                        db.session.rollback()
                        logging.error(f"❌ Failed to add column {col_name}: {str(e)}")
                        raise

            # Verify indexes
            logging.info("\n🔍 Checking database indexes...")
            from sqlalchemy import Index
            indexes = [
                Index('ix_conversation_prediction', Conversation.prediction),
                Index('ix_conversation_created_at', Conversation.created_at)
            ]
            
            for idx in indexes:
                idx.create(bind=db.engine, checkfirst=True)
                
            logging.info("✅ Database verification complete")
            return True
            
        except Exception as e:
            logging.error(f"\n❌ Database verification failed: {str(e)}")
            raise


def init_db(app):
    """Initialize database (legacy function, now calls verify_database)"""
    return verify_database(app)