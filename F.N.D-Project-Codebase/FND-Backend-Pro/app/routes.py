import sys
import os
from flask import Blueprint, request, jsonify, Response
from bs4 import BeautifulSoup  # type: ignore
import requests  # type: ignore
import PyPDF2
import docx
import io
from app.models import Conversation
from app import db
from app.ai_service import ai_service
import logging
from datetime import datetime, timedelta
from sqlalchemy import text, extract, func
import time
from threading import Lock

bp = Blueprint('routes', __name__)
logger = logging.getLogger(__name__)

# Global list to manage SSE clients
sse_clients = []
sse_lock = Lock()

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
        <li>POST /predict - Submit text/file/URL for analysis</li>
        <li>POST /feedback - Provide feedback on predictions</li>
        <li>POST /change-feedback - Change feedback analysis</li>
        <li>POST /fetch-article - Extract article from URL</li>
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
        'timestamp': datetime.utcnow().isoformat(),
        'features': ['text_input', 'url_input', 'file_upload']
    }
    response = jsonify(status)
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    return response

@bp.route('/fetch-article', methods=['POST', 'OPTIONS'])
def fetch_article():
    """Endpoint to fetch article content from URL"""
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # Fetch the webpage with timeout
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Parse the content
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove unwanted elements
        for element in soup(['script', 'style', 'nav', 'footer', 'iframe', 'header']):
            element.decompose()
        
        # Get text from paragraphs and headings
        paragraphs = soup.find_all(['p', 'h1', 'h2', 'h3'])
        content = ' '.join([p.get_text().strip() for p in paragraphs if p.get_text().strip()])
        
        if not content:
            return jsonify({'error': 'Could not extract article content'}), 400
            
        response = jsonify({
            'content': content[:10000],  # Limit to 10,000 chars
            'status': 'success'
        })
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        return response
        
    except Exception as e:
        logger.error(f"Failed to fetch article: {str(e)}")
        response = jsonify({
            'error': 'Failed to fetch article content',
            'details': str(e)
        })
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        return response, 500

@bp.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    """Enhanced prediction endpoint with multiple input methods"""
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    start_time = time.time()
    request_data = {
        'received_at': datetime.utcnow().isoformat(),
        'input_method': None,
        'content_length': None,
        'processing_time': None
    }
    
    try:
        content = ""
        input_type = "text"  # Default
        
        # Handle file upload
        if 'file' in request.files:
            file = request.files['file']
            if not file.filename:
                raise ValueError("No file selected")
            
            filename = file.filename.lower()
            input_type = "file"
            request_data['input_method'] = 'file_upload'
            
            if filename.endswith('.txt'):
                content = file.read().decode('utf-8')
            elif filename.endswith('.pdf'):
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(file.read()))
                content = '\n'.join([page.extract_text() for page in pdf_reader.pages])
            elif filename.endswith('.docx'):
                doc = docx.Document(io.BytesIO(file.read()))
                content = '\n'.join([para.text for para in doc.paragraphs])
            else:
                raise ValueError("Unsupported file type. Only TXT, PDF, and DOCX are supported")
        
        # Handle JSON input (text or URL content)
        elif request.is_json:
            data = request.get_json()
            if 'url' in data:
                input_type = "url"
                request_data['input_method'] = 'url'
                url = data.get('url', '').strip()
                if not url:
                    raise ValueError("URL is required")
                
                # Fetch content from URL
                fetch_response = requests.post(
                    f"http://localhost:5000/fetch-article",
                    json={'url': url},
                    headers={'Content-Type': 'application/json'}
                )
                if not fetch_response.ok:
                    raise ValueError("Failed to fetch URL content")
                content = fetch_response.json().get('content', '')
            else:
                # Get input_type from frontend payload if available
                input_type = data.get('input_type', 'text')
                request_data['input_method'] = 'text'
                content = data.get('text', data.get('content', '')).strip()
        
        else:
            raise ValueError("Invalid request format")
        
        request_data['content_length'] = len(content)
        if not content.strip():
            raise ValueError("No content provided for analysis")
        
        # Get prediction with timing
        predict_start = time.time()
        label, confidence = ai_service.predict(content)
        request_data['processing_time'] = time.time() - predict_start
        
        # Save to database
        db_start = time.time()
        conversation = Conversation(
            input_text=content[:5000],  # Limit to 5000 chars
            input_type=input_type,
            prediction=label,
            edited_prediction=None,
            confidence=confidence,
            feedback=None,
            processing_time=request_data['processing_time']
        )
        db.session.add(conversation)
        db.session.commit()
        request_data['db_time'] = time.time() - db_start
        
        # Notify SSE clients of new prediction
        with sse_lock:
            for client in sse_clients[:]:  # Copy to avoid modification during iteration
                try:
                    client.put("data: new_prediction\n\n")
                except:
                    sse_clients.remove(client)  # Remove disconnected client
        
        request_data['total_time'] = time.time() - start_time
        logger.info(f"Prediction completed (ID: {conversation.id})")
        
        response = jsonify({
            'prediction': label,
            'confidence': confidence,
            'id': conversation.id,
            'input_type': input_type,
            'status': 'success',
            'request_data': request_data
        })
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        return response
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        request_data['total_time'] = time.time() - start_time
        response = jsonify({
            'error': 'Failed to process prediction',
            'details': str(e),
            'status': 'error',
            'request_data': request_data
        })
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
        
        if not conv_id or feedback not in ['correct', 'incorrect']:
            return jsonify({
                'error': 'Invalid request parameters',
                'details': 'Requires id and feedback (correct/incorrect)'
            }), 400
        
        conversation = Conversation.query.get(conv_id)
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        conversation.feedback = feedback
        db.session.commit()
        
        logger.info(f"Feedback recorded for ID: {conv_id}")
        
        response = jsonify({
            'message': 'Feedback received',
            'id': conv_id,
            'status': 'success'
        })
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        return response
        
    except Exception as e:
        logger.error(f"Feedback error: {str(e)}")
        response = jsonify({
            'error': 'Failed to process feedback',
            'details': str(e),
            'status': 'error'
        })
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
        
        if not conv_id or edited_prediction not in ['fake', 'true']:
            return jsonify({
                'error': 'Invalid request parameters',
                'details': 'Requires id and edited_prediction (fake/true)'
            }), 400
        
        conversation = Conversation.query.get(conv_id)
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        conversation.edited_prediction = edited_prediction
        db.session.commit()
        
        logger.info(f"Edited prediction recorded for ID: {conv_id} (New value: {edited_prediction})")
        
        response = jsonify({
            'message': 'Edited prediction received',
            'id': conv_id,
            'new_prediction': edited_prediction,
            'status': 'success'
        })
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        return response
        
    except Exception as e:
        logger.error(f"Change feedback error: {str(e)}")
        response = jsonify({
            'error': 'Failed to process edited prediction',
            'details': str(e),
            'status': 'error'
        })
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        return response, 500

@bp.route('/stats', methods=['GET', 'OPTIONS'])
def get_stats():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        # Calculate recent activity (last 24 hours)
        now = datetime.utcnow()
        twenty_four_hours_ago = now - timedelta(hours=24)
        
        recent_activity = db.session.query(
            extract('hour', Conversation.created_at).label('hour'),
            func.count(Conversation.id).label('predictions')
        ).filter(
            Conversation.created_at >= twenty_four_hours_ago
        ).group_by('hour').all()

        # Convert to {hour: count} format and fill missing hours
        activity_dict = {int(hour): count for hour, count in recent_activity}
        recent_activity_data = []
        for hour in range(24):
            recent_activity_data.append({
                'hour': hour,
                'predictions': activity_dict.get(hour, 0)
            })

        stats = {
            'total_predictions': Conversation.query.count(),
            'true_predictions': Conversation.query.filter_by(prediction='true').count(),
            'fake_predictions': Conversation.query.filter_by(prediction='fake').count(),
            'average_confidence': db.session.query(
                func.avg(Conversation.confidence)
            ).scalar() or 0,
            'feedback_stats': {
                'correct': Conversation.query.filter_by(feedback='correct').count(),
                'incorrect': Conversation.query.filter_by(feedback='incorrect').count(),
                'changed': Conversation.query.filter(
                    Conversation.edited_prediction.isnot(None)).count(),
            },
            'recent_activity': recent_activity_data,
            'input_methods': {
                'text': Conversation.query.filter_by(input_type='text').count(),
                'file': Conversation.query.filter_by(input_type='file').count(),
                'url': Conversation.query.filter_by(input_type='url').count(),
            },
            'accuracy': round((Conversation.query.filter_by(feedback='correct').count() / 
                            (Conversation.query.filter_by(feedback='correct').count() +
                             Conversation.query.filter_by(feedback='incorrect').count()) * 100) 
                        if (Conversation.query.filter_by(feedback='correct').count() +
                            Conversation.query.filter_by(feedback='incorrect').count()) > 0 
                        else 0)
        }
        
        response = jsonify(stats)
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        return response
    except Exception as e:
        response = jsonify({'error': str(e)})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        return response, 500

@bp.route('/recent-activity-stream', methods=['GET'])
def recent_activity_stream():
    def stream():
        with sse_lock:
            queue = []
            sse_clients.append(queue)
        
        try:
            while True:
                try:
                    message = queue.pop(0) if queue else (yield ":\n\n")  # Keep-alive comment
                    if message:
                        yield message
                except GeneratorExit:
                    with sse_lock:
                        sse_clients.remove(queue)
                    break
        except Exception as e:
            logger.error(f"SSE error: {str(e)}")
            with sse_lock:
                sse_clients.remove(queue)
    
    response = Response(stream(), mimetype='text/event-stream')
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Cache-Control'] = 'no-cache'
    response.headers['X-Accel-Buffering'] = 'no'
    return response