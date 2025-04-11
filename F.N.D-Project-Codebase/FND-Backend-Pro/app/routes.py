import sys
import os
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

def _build_cors_preflight_response():
    response = jsonify({'status': 'success'})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    return response

@bp.route('/')
def home():
    return """
    <h1>Fake News Detection API</h1>
    <p>Available endpoints:</p>
    <ul>
        <li>GET /health - System status</li>
        <li>POST /predict - Submit text for analysis</li>
        <li>POST /feedback - Provide feedback on predictions</li>
        <li>POST /change-feedback - Change feedback analysis</li>
    </ul>
    """

@bp.route('/health', methods=['GET', 'OPTIONS'])
def health_check():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    status = {
        'api': 'running',
        'database': 'ok',
        'model': ai_service.get_status(),
        'timestamp': datetime.utcnow().isoformat()
    }
    response = jsonify(status)
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    return response

@bp.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        if not request.is_json:
            return jsonify({'error': 'Request must be JSON'}), 400
            
        data = request.get_json()
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        label, confidence = ai_service.predict(text)
        
        conversation = Conversation(
            input_text=text[:5000],
            prediction=label,
            edited_prediction=None,
            confidence=confidence,
            feedback=None
        )
        
        db.session.add(conversation)
        db.session.commit()
        
        response = jsonify({
            'prediction': label,
            'confidence': confidence,
            'id': conversation.id,
            'status': 'success'
        })
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        return response
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        response = jsonify({'error': str(e)})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        return response, 500

@bp.route('/feedback', methods=['POST', 'OPTIONS'])
def feedback():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        data = request.get_json()
        conv_id = data.get('id')
        feedback = data.get('feedback')
        
        conversation = Conversation.query.get(conv_id)
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        conversation.feedback = feedback
        db.session.commit()
        
        response = jsonify({'message': 'Feedback received', 'id': conv_id})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        return response
        
    except Exception as e:
        logger.error(f"Feedback error: {str(e)}")
        response = jsonify({'error': str(e)})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        return response, 500

@bp.route('/change-feedback', methods=['POST', 'OPTIONS'])
def change_feedback():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        data = request.get_json()
        conv_id = data.get('id')
        edited_prediction = data.get('edited_prediction')
        
        conversation = Conversation.query.get(conv_id)
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        conversation.edited_prediction = edited_prediction
        db.session.commit()
        
        response = jsonify({
            'message': 'Edited prediction received',
            'id': conv_id,
            'new_prediction': edited_prediction
        })
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        return response
        
    except Exception as e:
        logger.error(f"Change feedback error: {str(e)}")
        response = jsonify({'error': str(e)})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        return response, 500

@bp.route('/stats', methods=['GET', 'OPTIONS'])
def get_stats():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        stats = {
            'total_predictions': Conversation.query.count(),
            'true_predictions': Conversation.query.filter_by(prediction='true').count(),
            'fake_predictions': Conversation.query.filter_by(prediction='fake').count(),
            'average_confidence': db.session.query(
                db.func.avg(Conversation.confidence)
            ).scalar() or 0,
            'feedback_stats': {
                'correct': Conversation.query.filter_by(feedback='correct').count(),
                'incorrect': Conversation.query.filter_by(feedback='incorrect').count()
            }
        }
        response = jsonify(stats)
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        return response
    except Exception as e:
        response = jsonify({'error': str(e)})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        return response, 500