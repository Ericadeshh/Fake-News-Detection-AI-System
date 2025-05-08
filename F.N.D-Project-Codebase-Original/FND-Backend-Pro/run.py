# Updated run.py with enhanced logging
from app import create_app
from app.ai_service import ai_service
from app.models import verify_database
import logging
import sys
import os
from time import sleep
from datetime import datetime

def setup_logging():
    """Configure beautiful logging with colors and emojis"""
    logging.addLevelName(logging.INFO, "ℹ️ INFO")
    logging.addLevelName(logging.WARNING, "⚠️ WARN")
    logging.addLevelName(logging.ERROR, "❌ ERROR")
    logging.addLevelName(logging.DEBUG, "🐛 DEBUG")
    
    formatter = logging.Formatter(
        '\n%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    handler = logging.StreamHandler()
    handler.setFormatter(formatter)
    
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    logger.addHandler(handler)
    
    return logger

def print_banner():
    """Print beautiful startup banner"""
    banner = f"""
    🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀
    🚀                                               🚀
    🚀       FAKE NEWS DETECTION SYSTEM             🚀
    🚀          Starting up...                      🚀
    🚀       {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}            🚀
    🚀                                               🚀
    🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀
    """
    print(banner)

def verify_system():
    """Comprehensive system verification before startup"""
    logging.info("\n🔍 Beginning system verification...")
    checks = {
        'virtualenv': False,
        'database': False,
        'model': False
    }
    
    # 1. Verify virtual environment
    try:
        logging.info("\n🛠️  Checking virtual environment...")
        venv_path = os.path.abspath("venv")
        if not sys.executable.startswith(venv_path):
            logging.error(f"❌ CRITICAL: Activate venv first using:\n{venv_path}\\Scripts\\activate")
            return False
        checks['virtualenv'] = True
        logging.info("✅ Virtual environment verified")
    except Exception as e:
        logging.error(f"❌ Virtual environment check failed: {str(e)}")
        return False
    
    # 2. Verify model files exist
    try:
        logging.info("\n🧠 Checking AI model files...")
        from config import Config
        model_path = os.path.join(Config.MODEL_PATH, Config.MODEL_FILE)
        tokenizer_path = os.path.join(Config.MODEL_PATH, Config.TOKENIZER_FILE)
        
        if not os.path.exists(model_path):
            logging.error(f"❌ Model file not found at: {model_path}")
            return False
        if not os.path.exists(tokenizer_path):
            logging.error(f"❌ Tokenizer file not found at: {tokenizer_path}")
            return False
        checks['model'] = True
        logging.info("✅ Model files verified")
    except Exception as e:
        logging.error(f"❌ Model verification failed: {str(e)}")
        return False
    
    logging.info("\n🎉 System verification passed:")
    for check, status in checks.items():
        logging.info(f"   ✓ {check.capitalize()}")
    return True

if __name__ == '__main__':
    logger = setup_logging()
    print_banner()
    
    if not verify_system():
        sys.exit(1)
    
    try:
        # Initialize application
        logging.info("\n🌐 Starting application initialization...")
        app = create_app()
        
        # Initialize database
        logging.info("\n💾 Database initialization:")
        verify_database(app)
        
        # Initialize AI service
        logging.info("\n🧠 Initializing AI model:")
        if not ai_service.is_ready():
            logging.error("❌ AI service failed to initialize")
            sys.exit(1)
        logging.info("✅ AI model ready")
        
        # Final startup message
        logging.info(f"""
        \n🎉🎉🎉 Application Startup Complete 🎉🎉🎉
        
        ========================================
        🚀 Fake News Detection System Ready!
        ========================================
        🌐 Backend: http://localhost:5000
        💻 Frontend: http://localhost:5173
        🕒 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        ========================================
        """)
        
        app.run(host='0.0.0.0', port=5000, debug=True)
        
    except Exception as e:
        logging.error(f"\n❌❌❌ Application startup failed: {str(e)}")
        sys.exit(1)