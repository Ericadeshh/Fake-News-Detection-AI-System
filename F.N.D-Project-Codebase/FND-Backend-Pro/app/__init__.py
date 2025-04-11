# Updated app/__init__.py
__version__ = "1.0.0" 

import os
import sys
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text, create_engine
from flask_migrate import Migrate # type: ignore
from flask_cors import CORS # type: ignore
from config import Config
import logging
from datetime import datetime
import sqlalchemy
import time

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()

def verify_environment():
    """Enhanced environment verification with timing"""
    start_time = time.time()
    venv_path = os.path.abspath("venv")
    python_path = sys.executable
    
    if not python_path.startswith(venv_path):
        raise RuntimeError(
            f"CRITICAL: Running with {python_path}\n"
            f"Must use {venv_path}\\Scripts\\python.exe"
        )
    logging.info(f"✓ Virtual environment verified in {(time.time()-start_time)*1000:.2f}ms")

def initialize_database(app):
    """Database initialization with timing and detailed logging"""
    start_time = time.time()
    logger = logging.getLogger(__name__)
    
    try:
        # Test database connection
        db.session.execute(text('SELECT 1'))
        logger.info(f"✅ Database connection verified in {(time.time()-start_time)*1000:.2f}ms")
        
        # Create all tables
        db.create_all()
        logger.info(f"✅ Database tables verified in {(time.time()-start_time)*1000:.2f}ms")
        
    except sqlalchemy.exc.OperationalError as e:
        if "Unknown database" in str(e):
            logger.warning("⚠️ Database doesn't exist - creating...")
            base_url = app.config['SQLALCHEMY_DATABASE_URI'].rsplit('/', 1)[0]
            with create_engine(base_url).connect() as conn:
                db_name = app.config['SQLALCHEMY_DATABASE_URI'].split('/')[-1].split('?')[0]
                conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {db_name}"))
                conn.execute(text("COMMIT"))
            logger.info(f"✅ Database created in {(time.time()-start_time)*1000:.2f}ms")
            
            # Retry table creation
            db.create_all()
        else:
            logger.error(f"❌ Database error: {str(e)}")
            raise
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {str(e)}")
        raise

def create_app(config_class=Config):
    """Enhanced application factory with timing metrics"""
    total_start = time.time()
    
    # Verify environment
    verify_environment()
    
    # Initialize Flask app
    app_start = time.time()
    app = Flask(__name__)
    app.config.from_object(config_class)
    logging.info(f"✓ Flask app initialized in {(time.time()-app_start)*1000:.2f}ms")
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger(__name__)
    
    # CORS configuration - UPDATED TO ALLOW PORT 5173
    cors_start = time.time()
    CORS(app, resources={
        r"/predict": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]},
        r"/feedback": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]},
        r"/health": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]},
        r"/stats": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}
    })
    logging.info(f"✓ CORS configured for React frontend in {(time.time()-cors_start)*1000:.2f}ms")

    # Database initialization
    with app.app_context():
        db_start = time.time()
        db.init_app(app)
        migrate.init_app(app, db)
        initialize_database(app)
        logging.info(f"✓ Database initialized in {(time.time()-db_start)*1000:.2f}ms")

    # Register blueprints
    routes_start = time.time()
    from app import routes
    app.register_blueprint(routes.bp)
    logging.info(f"✓ Routes registered in {(time.time()-routes_start)*1000:.2f}ms")

    # Initialize AI service
    ai_start = time.time()
    from app.ai_service import ai_service
    app.ai_service = ai_service
    
    # Pre-load model
    if not ai_service.is_ready():
        logging.warning("⚠️ AI service not ready - attempting to load model...")
        ai_service.load_model()
    
    if ai_service.is_ready():
        logging.info(f"✓ AI service initialized and model loaded in {(time.time()-ai_start)*1000:.2f}ms")
    else:
        logging.error("❌ Failed to initialize AI service")
        raise RuntimeError("AI service failed to initialize")

    logging.info(f"🚀 Application fully initialized in {(time.time()-total_start)*1000:.2f}ms")
    return app