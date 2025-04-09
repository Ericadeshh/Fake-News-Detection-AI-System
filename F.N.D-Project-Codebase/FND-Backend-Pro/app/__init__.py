from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .config import config
from .services.database_service import db, init_db
from .services.auth_service import jwt

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    
    # Initialize extensions
    CORS(app)
    init_db(app)
    jwt.init_app(app)
    
    # Register blueprints
    from .controllers.api_controller import api_bp
    from .controllers.auth_controller import auth_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    
    return app