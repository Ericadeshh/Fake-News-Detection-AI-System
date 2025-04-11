import joblib
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences

# Load files directly
try:
    print("Loading tokenizer...")
    tokenizer = joblib.load('saved_model/tokenizer.pkl')
    
    print("Loading model...")
    model = load_model('saved_model/true_fake_news_classifier.keras')
    
    print("Testing prediction...")
    test_text = "Sample news text to verify model works"
    sequence = tokenizer.texts_to_sequences([test_text])
    padded = pad_sequences(sequence, maxlen=150)
    prediction = model.predict(padded)
    print(f"Test prediction: {prediction[0][0]}")
    
except Exception as e:
    print(f"ERROR: {str(e)}")