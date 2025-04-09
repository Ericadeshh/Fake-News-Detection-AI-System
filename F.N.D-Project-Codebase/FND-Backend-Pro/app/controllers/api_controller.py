from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.ai_service import ai_service
from app.models.conversation import Conversation
from app import db

api_bp = Blueprint('api', __name__)

@api_bp.route('/predict', methods=['POST'])
@jwt_required()
def predict():
    data = request.get_json()
    text = data.get('text')
    
    if not text:
        return jsonify({'error': 'Text is required'}), 400
    
    try:
        user_id = get_jwt_identity()
        prediction = ai_service.predict(text)
        
        # Log the conversation
        conversation = Conversation(
            user_id=user_id,
            input_text=text,
            prediction=prediction['label'],
            confidence=prediction['confidence']
        )
        db.session.add(conversation)
        db.session.commit()
        
        return jsonify({
            'prediction': prediction['label'],
            'confidence': prediction['confidence'],
            'conversation_id': conversation.id
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/feedback', methods=['POST'])
@jwt_required()
def provide_feedback():
    data = request.get_json()
    conversation_id = data.get('conversation_id')
    feedback = data.get('feedback')
    
    if not conversation_id or feedback not in ['correct', 'incorrect']:
        return jsonify({'error': 'Invalid request'}), 400
    
    conversation = Conversation.query.get(conversation_id)
    if not conversation:
        return jsonify({'error': 'Conversation not found'}), 404
    
    # Verify the user owns this conversation
    if conversation.user_id != get_jwt_identity():
        return jsonify({'error': 'Unauthorized'}), 403
    
    conversation.feedback = feedback
    db.session.commit()
    
    return jsonify({'message': 'Feedback recorded'})

@api_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    conversations = Conversation.query.filter_by(user_id=user_id).order_by(Conversation.created_at.desc()).all()
    return jsonify([conv.to_dict() for conv in conversations])