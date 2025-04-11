# Updated app/routes.py
from flask import Blueprint, request, jsonify
from app.models import Conversation
from app import db
from app.ai_service import ai_service
import logging
from datetime import datetime
from sqlalchemy import text
import time

bp = Blueprint('routes', __name__)
logger = logging.getLogger(__name__)

@bp.route('/')
def home():
    """Enhanced home endpoint with system info"""
    from app import __version__
    return f"""
    <h1>Fake News Detection API</h1>
    <p>Version: {__version__}</p>
    <p>Available endpoints:</p>
    <ul>
        <li>GET /health - Comprehensive system status</li>
        <li>POST /predict - Submit text for analysis (JSON: {"text": "your news here"})</li>
        <li>POST /feedback - Provide feedback on predictions (JSON: {"id": 123, "feedback": "correct|incorrect"})</li>
        <li>GET /stats - System performance statistics</li>
    </ul>
    """

@bp.route('/health', methods=['GET'])
def health_check():
    """Comprehensive health check with timing metrics"""
    start_time = time.time()
    
    status = {
        'api': 'running',
        'database': 'ok',
        'model': ai_service.get_status(),
        'timestamp': datetime.utcnow().isoformat(),
        'system': {
            'python_version': sys.version,
            'platform': sys.platform
        }
    }
    
    # Database check
    db_start = time.time()
    try:
        db.session.execute(text('SELECT 1'))
        status['database_latency_ms'] = (time.time() - db_start) * 1000
    except Exception as e:
        status['database'] = 'error'
        status['database_error'] = str(e)
        logger.error(f"Database health check failed: {str(e)}")
    
    status['response_time_ms'] = (time.time() - start_time) * 1000
    return jsonify(status)

@bp.route('/predict', methods=['POST'])
def predict():
    """Enhanced prediction endpoint with detailed metrics"""
    start_time = time.time()
    request_data = {
        'received_at': datetime.utcnow().isoformat(),
        'text_length': None,
        'processing_time': None
    }
    
    try:
        # Validate request
        if not request.is_json:
            logger.warning("Non-JSON request received")
            return jsonify({
                'error': 'Request must be JSON',
                'status': 'error',
                'request_data': request_data
            }), 400
            
        data = request.get_json()
        text = data.get('text', '').strip()
        request_data['text_length'] = len(text)
        
        if not text:
            logger.warning("Empty text input received")
            return jsonify({
                'error': 'Text is required',
                'status': 'error',
                'request_data': request_data
            }), 400
        
        # Check model readiness
        if not ai_service.is_ready():
            logger.error("Prediction attempted while model not ready")
            return jsonify({
                'error': 'Service temporarily unavailable',
                'status': 'error',
                'request_data': request_data
            }), 503
        
        logger.info(f"Processing prediction request (text length: {len(text)})")
        
        # Get prediction with timing
        predict_start = time.time()
        label, confidence = ai_service.predict(text)
        request_data['processing_time'] = (time.time() - predict_start) * 1000
        
        # Save to database
        db_start = time.time()
        conversation = Conversation(
            input_text=text[:5000],  # Limit to 5000 chars
            prediction=label,
            confidence=confidence,
            processing_time=request_data['processing_time']
        )
        
        db.session.add(conversation)
        db.session.commit()
        request_data['db_time'] = (time.time() - db_start) * 1000
        
        logger.info(f"Prediction completed (ID: {conversation.id})")
        
        request_data['total_time'] = (time.time() - start_time) * 1000
        
        return jsonify({
            'prediction': label,
            'confidence': confidence,
            'id': conversation.id,
            'status': 'success',
            'request_data': request_data
        })
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        request_data['total_time'] = (time.time() - start_time) * 1000
        return jsonify({
            'error': 'Failed to process prediction',
            'details': str(e),
            'status': 'error',
            'request_data': request_data
        }), 500

@bp.route('/feedback', methods=['POST'])
def feedback():
    """Enhanced feedback endpoint with validation"""
    start_time = time.time()
    
    try:
        if not request.is_json:
            return jsonify({
                'error': 'Request must be JSON',
                'status': 'error'
            }), 400
            
        data = request.get_json()
        conv_id = data.get('id')
        feedback = data.get('feedback')
        
        if not conv_id or feedback not in ['correct', 'incorrect']:
            return jsonify({
                'error': 'Invalid request parameters',
                'status': 'error',
                'details': 'Requires id and feedback (correct/incorrect)'
            }), 400
        
        conversation = Conversation.query.get(conv_id)
        if not conversation:
            return jsonify({
                'error': 'Conversation not found',
                'status': 'error'
            }), 404
        
        conversation.feedback = feedback
        db.session.commit()
        
        logger.info(f"Feedback recorded for ID: {conv_id}")
        
        return jsonify({
            'message': 'Feedback received',
            'id': conv_id,
            'status': 'success',
            'processing_time_ms': (time.time() - start_time) * 1000
        })
        
    except Exception as e:
        logger.error(f"Feedback error: {str(e)}")
        return jsonify({
            'error': 'Failed to process feedback',
            'details': str(e),
            'status': 'error',
            'processing_time_ms': (time.time() - start_time) * 1000
        }), 500

@bp.route('/stats', methods=['GET'])
def get_stats():
    """System performance statistics"""
    stats = {
        'total_predictions': Conversation.query.count(),
        'true_predictions': Conversation.query.filter_by(prediction='true').count(),
        'fake_predictions': Conversation.query.filter_by(prediction='fake').count(),
        'average_confidence': db.session.query(
            db.func.avg(Conversation.confidence)
        ).scalar(),
        'feedback_stats': {
            'correct': Conversation.query.filter_by(feedback='correct').count(),
            'incorrect': Conversation.query.filter_by(feedback='incorrect').count()
        }
    }
    return jsonify(stats)