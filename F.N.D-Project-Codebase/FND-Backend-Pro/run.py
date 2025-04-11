# Updated run.py
from app import create_app
from app.ai_service import ai_service
import logging
import sys
import os

def verify_system():
    """Comprehensive system verification before startup"""
    checks = {
        'virtualenv': False,
        'database': False,
        'model': False
    }
    
    # 1. Verify virtual environment
    try:
        venv_path = os.path.abspath("venv")
        if not sys.executable.startswith(venv_path):
            logging.error(f"CRITICAL: Activate venv first using:\n{venv_path}\\Scripts\\activate")
            return False
        checks['virtualenv'] = True
    except Exception as e:
        logging.error(f"Virtual environment check failed: {str(e)}")
        return False
    
    # 2. Verify model files exist
    try:
        from config import Config
        model_path = os.path.join(Config.MODEL_PATH, Config.MODEL_FILE)
        tokenizer_path = os.path.join(Config.MODEL_PATH, Config.TOKENIZER_FILE)
        
        if not os.path.exists(model_path):
            logging.error(f"Model file not found at: {model_path}")
            return False
        if not os.path.exists(tokenizer_path):
            logging.error(f"Tokenizer file not found at: {tokenizer_path}")
            return False
        checks['model'] = True
    except Exception as e:
        logging.error(f"Model verification failed: {str(e)}")
        return False
    
    logging.info("System verification passed:")
    for check, status in checks.items():
        logging.info(f"✓ {check.capitalize()}")
    return True

if __name__ == '__main__':
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    if not verify_system():
        sys.exit(1)
    
    try:
        app = create_app()
        
        # Final verification
        if not ai_service.is_ready():
            logging.error("❌ AI service failed to initialize")
            sys.exit(1)
            
        logging.info("🚀 Starting Flask development server")
        app.run(host='0.0.0.0', port=5000, debug=True)
        
    except Exception as e:
        logging.error(f"❌ Application startup failed: {str(e)}")
        sys.exit(1)