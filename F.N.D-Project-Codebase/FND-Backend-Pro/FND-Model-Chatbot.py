import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from wordcloud import WordCloud
from sklearn.feature_extraction.text import TfidfVectorizer
# TensorFlow imports with fallback
try:
    from tensorflow.keras.models import Sequential, load_model
    from tensorflow.keras.layers import Embedding, LSTM, Dense, Dropout
    from tensorflow.keras.preprocessing.text import Tokenizer
    from tensorflow.keras.preprocessing.sequence import pad_sequences
    from tensorflow.keras.callbacks import EarlyStopping
except ImportError:
    from keras.models import Sequential, load_model
    from keras.layers import Embedding, LSTM, Dense, Dropout
    from keras.preprocessing.text import Tokenizer
    from keras.preprocessing.sequence import pad_sequences
    from keras.callbacks import EarlyStopping
    
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from imblearn.over_sampling import SMOTE
import os
import joblib

# ======================================================
# 0. SETUP AND CONFIGURATION
# ======================================================
sns.set(style="whitegrid")
plt.style.use('fivethirtyeight')

# ======================================================
# 1. DATA LOADING
# ======================================================
def load_data():
    fake_news_df = pd.read_csv('F.N.D-Project-Codebase\FND-Backend-Pro\datasets\Fake.csv')
    true_news_df = pd.read_csv('F.N.D-Project-Codebase\FND-Backend-Pro\datasets\True.csv')
    
    # Add label column before combining
    fake_news_df['label'] = 'fake'
    true_news_df['label'] = 'true'
    
    return fake_news_df, true_news_df

fake_df, true_df = load_data()

# ======================================================
# 2. DATA INSPECTION
# ======================================================
def inspect_data(df, name):
    print(f"\n{name} Dataset Shape:", df.shape)
    print(f"\n{name} Dataset Columns:", df.columns.tolist())
    print(f"\n{name} Dataset Info:")
    print(df.info())
    print(f"\n{name} Sample:")
    print(df.head(2))
    
inspect_data(fake_df, "Fake News")
inspect_data(true_df, "True News")

# ======================================================
# 3. DATA CLEANING AND PREPROCESSING
# ======================================================
def enhanced_text_cleaning(text):
    import re
    text = text.lower()
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    text = re.sub(r'[^\w\s]', '', text)
    text = ' '.join(text.split())
    return text

def preprocess_text_data(df):
    df = df.copy()
    # Handle missing values
    text_cols = ['title', 'text', 'subject', 'date']
    for col in text_cols:
        if col in df.columns:
            df[col] = df[col].fillna('')
    
    # Combine text columns
    if 'title' in df.columns and 'text' in df.columns:
        df['full_text'] = df['title'] + ' ' + df['text']
    elif 'text' in df.columns:
        df['full_text'] = df['text']
    elif 'title' in df.columns:
        df['full_text'] = df['title']
    else:
        raise ValueError("No text columns found in dataframe")
    
    # Apply enhanced cleaning
    df['cleaned_text'] = df['full_text'].apply(enhanced_text_cleaning)
    
    # Create text features (only if columns exist)
    if 'full_text' in df.columns:
        df['text_length'] = df['full_text'].apply(len)
        df['word_count'] = df['full_text'].apply(lambda x: len(x.split()))
        df['char_count'] = df['full_text'].apply(len)
        df['avg_word_length'] = df['full_text'].apply(lambda x: np.mean([len(w) for w in x.split()]) if len(x.split()) > 0 else 0)
        df['exclamation_count'] = df['full_text'].apply(lambda x: x.count('!'))
        df['question_count'] = df['full_text'].apply(lambda x: x.count('?'))
        df['uppercase_ratio'] = df['full_text'].apply(
            lambda x: sum(1 for c in x if c.isupper())/len(x) if len(x) > 0 else 0)
    
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df['year'] = df['date'].dt.year
        df['month'] = df['date'].dt.month
    
    return df

print("\nCleaning and preprocessing Fake News data...")
fake_df = preprocess_text_data(fake_df)
print("\nCleaning and preprocessing True News data...")
true_df = preprocess_text_data(true_df)

# ======================================================
# 4. MISSING VALUE ANALYSIS VALUE HANDLING
# ======================================================
# MISSING VALUE HANDLING
def handle_missing_values(df, name):
    print(f"\n=== HANDLING MISSING VALUES IN {name.upper()} ===")
    
    # Make a clean copy to work with
    df_clean = df.copy()
    
    # Report original missing values
    print("\nOriginal missing values:")
    print(df_clean.isnull().sum()[df_clean.isnull().sum() > 0] if df_clean.isnull().sum().sum() > 0 
          else "No missing values found")
    
    # Handle missing dates - fill with empty string and set year/month to 0
    if 'date' in df_clean.columns:
        missing_dates = df_clean['date'].isnull().sum()
        if missing_dates > 0:
            print(f"\nFound {missing_dates} missing dates - filling with placeholder values")
            df_clean['date'] = df_clean['date'].fillna('Unknown')
            if 'year' in df_clean.columns:
                df_clean['year'] = df_clean['year'].fillna(0)
            if 'month' in df_clean.columns:
                df_clean['month'] = df_clean['month'].fillna(0)
    
    # Verify all missing values are handled
    remaining_missing = df_clean.isnull().sum()
    print("\nAfter handling missing values:")
    print("No missing values remaining" if remaining_missing.sum() == 0 
          else remaining_missing[remaining_missing > 0])
    
    return df_clean

print("\nProcessing missing values...")
fake_df = handle_missing_values(fake_df, "Fake News")
true_df = handle_missing_values(true_df, "True News")

#MISSING VALUES FINAL ANALYSIS
def analyze_missing_values(df, name):
    print(f"\nMissing Values in {name}:")
    print(df.isnull().sum())
    
    plt.figure(figsize=(10, 4))
    sns.heatmap(df.isnull(), cbar=False, yticklabels=False, cmap='viridis')
    plt.title(f'Missing Values in {name} Dataset')
    plt.show()

analyze_missing_values(fake_df, "Fake News")
analyze_missing_values(true_df, "True News")

# ======================================================
# 5. OUTLIER HANDLING
# ======================================================
def remove_all_outliers(df, name, columns=['text_length', 'word_count'], z_threshold=3):
    print(f"\nProcessing {name} dataset...")
    df_clean = df.copy()
    
    for column in columns:
        print(f"\nRemoving outliers in column: {column}")
        iterations = 0
        outliers_removed = -1
        
        while outliers_removed != 0:
            z_scores = np.abs((df_clean[column] - df_clean[column].mean()) / df_clean[column].std())
            outliers = z_scores > z_threshold
            outliers_removed = sum(outliers)
            
            if outliers_removed > 0:
                print(f"Iteration {iterations + 1}: Removing {outliers_removed} outliers")
                df_clean = df_clean[~outliers]
                iterations += 1
            else:
                print(f"No more outliers detected in {column} after {iterations} iterations")
    
    print("\nFinal verification:")
    for column in columns:
        z_scores = np.abs((df_clean[column] - df_clean[column].mean()) / df_clean[column].std())
        remaining_outliers = sum(z_scores > z_threshold)
        print(f"Remaining outliers in {column}: {remaining_outliers} (should be 0)")
    
    print(f"\nOriginal shape: {df.shape}")
    print(f"Cleaned shape: {df_clean.shape}")
    print(f"Percentage removed: {100*(len(df)-len(df_clean))/len(df):.2f}%")
    
    return df_clean

print("\n=== PROCESSING FAKE NEWS DATASET ===")
fake_df = remove_all_outliers(fake_df, "Fake News")
print("\n=== PROCESSING TRUE NEWS DATASET ===")
true_df = remove_all_outliers(true_df, "True News")

# ======================================================
# 6. EXPLORATORY DATA ANALYSIS (EDA)
# ======================================================
def perform_eda(df, name):
    print(f"\nPerforming EDA for {name} dataset...")
    
    plt.figure(figsize=(12, 6))
    sns.histplot(data=df, x='text_length', bins=50)
    plt.title(f'Distribution of Text Lengths - {name}')
    plt.show()
    
    plt.figure(figsize=(12, 6))
    sns.histplot(data=df, x='word_count', bins=50)
    plt.title(f'Distribution of Word Counts - {name}')
    plt.show()
    
    text = ' '.join(df['full_text'].sample(1000, random_state=42).values) if len(df) > 1000 else ' '.join(df['full_text'].values)
    wordcloud = WordCloud(width=800, height=400, background_color='white').generate(text)
    plt.figure(figsize=(15, 8))
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis('off')
    plt.title(f'Most Frequent Words - {name}')
    plt.show()
    
    if 'subject' in df.columns:
        plt.figure(figsize=(12, 6))
        sns.countplot(data=df, y='subject', order=df['subject'].value_counts().index)
        plt.title(f'Subject Distribution - {name}')
        plt.show()

perform_eda(fake_df, "Fake News")
perform_eda(true_df, "True News")

# ======================================================
# 7. FEATURE ANALYSIS
# ======================================================
def analyze_features(df, name):
    print(f"\nFeature Analysis for {name}:")
    
    numeric_cols = df.select_dtypes(include=np.number).columns.tolist()
    if numeric_cols:
        print("\nNumeric Features Summary:")
        print(df[numeric_cols].describe())
        
        # Create just one figure for the histograms
        df[numeric_cols].hist(bins=20, layout=(3, 3), figsize=(15, 10))
        plt.suptitle(f'Numeric Feature Distributions - {name}')
        plt.tight_layout()
        plt.show()
    
    if len(numeric_cols) > 1:
        # Create separate figure for heatmap
        plt.figure(figsize=(10, 8))
        sns.heatmap(df[numeric_cols].corr(), annot=True, cmap='coolwarm')
        plt.title(f'Feature Correlations - {name}')
        plt.show()
        
analyze_features(fake_df, "Fake News")
analyze_features(true_df, "True News")

# ======================================================
# 8. MODEL TRAINING (OPTIMIZED LSTM)
# ======================================================
MODEL_PATH = 'F.N.D-Project-Codebase\FND-Backend-Pro\saved_model'
TOKENIZER_PATH = os.path.join(MODEL_PATH, 'tokenizer.pkl')
MODEL_FILE = os.path.join(MODEL_PATH, 'true_fake_news_classifier.keras')

# Global variables for test data
X_test = None
y_test = None

def save_artifacts(model, tokenizer):
    """Save model and tokenizer for future use"""
    os.makedirs(MODEL_PATH, exist_ok=True)
    model.save(MODEL_FILE)
    joblib.dump(tokenizer, TOKENIZER_PATH)
    print("\nModel and tokenizer saved successfully")

def load_artifacts():
    """Load saved model and tokenizer if they exist"""
    if os.path.exists(MODEL_FILE) and os.path.exists(TOKENIZER_PATH):
        model = load_model(MODEL_FILE)
        tokenizer = joblib.load(TOKENIZER_PATH)
        print("\nLoaded pre-trained model and tokenizer")
        return model, tokenizer
    return None, None

# Check if model exists
loaded_model, loaded_tokenizer = load_artifacts()

if loaded_model and loaded_tokenizer:
    print("\nUsing pre-trained model for predictions")
    model = loaded_model
    tokenizer = loaded_tokenizer
    
    # Prepare fresh test data for evaluation with loaded model
    final_df = pd.concat([fake_df, true_df])
    texts = final_df['cleaned_text'].values
    labels = final_df['label'].map({'fake': 0, 'true': 1}).values
    
    # Tokenize and pad sequences using loaded tokenizer
    sequences = tokenizer.texts_to_sequences(texts)
    padded_sequences = pad_sequences(sequences, maxlen=150)
    
    # Create new test split
    _, X_test, _, y_test = train_test_split(
        padded_sequences, 
        labels, 
        test_size=0.2, 
        random_state=42,
        stratify=labels
    )
else:
    print("\nTraining new model...")
    # Prepare data for training
    final_df = pd.concat([fake_df, true_df])
    
    # ======================================================
    # CLASS IMBALANCE CHECKING AND HANDLING
    # ======================================================
    print("\n=== CLASS DISTRIBUTION ANALYSIS ===")
    # Check original distribution
    class_dist = final_df['label'].value_counts()
    print("\nOriginal Class Distribution:")
    print(class_dist)
    
    # Visualize class balance
    plt.figure(figsize=(6, 4))
    sns.countplot(data=final_df, x='label')
    plt.title("Original Class Distribution")
    plt.show()
    
    # Convert labels to numerical values
    texts = final_df['cleaned_text'].values
    labels = final_df['label'].map({'fake': 0, 'true': 1}).values
    
    # Tokenization and sequencing
    tokenizer = Tokenizer(num_words=8000)
    tokenizer.fit_on_texts(texts)
    sequences = tokenizer.texts_to_sequences(texts)
    padded_sequences = pad_sequences(sequences, maxlen=150)
    
    # Split data before applying SMOTE to avoid data leakage
    X_train, X_test, y_train, y_test = train_test_split(
        padded_sequences, 
        labels, 
        test_size=0.2, 
        random_state=42,
        stratify=labels  # Maintains class ratio in splits
    )
    
    # Check train/test distribution
    print("\nTraining Set Class Distribution:")
    train_dist = pd.Series(y_train).value_counts()
    print(train_dist)
    
    print("\nTest Set Class Distribution:")
    print(pd.Series(y_test).value_counts())
    
    # Apply SMOTE only if imbalance exceeds 5%
    imbalance_ratio = train_dist[0] / train_dist[1]
    if imbalance_ratio < 0.95 or imbalance_ratio > 1.05:
        print(f"\nImbalance detected (ratio: {imbalance_ratio:.2f}). Applying SMOTE...")
        
        # Reshape data for SMOTE (it expects 2D features)
        X_train_reshaped = X_train.reshape(X_train.shape[0], -1)
        
        smote = SMOTE(random_state=42)
        X_train_resampled, y_train_resampled = smote.fit_resample(X_train_reshaped, y_train)
        
        # Reshape back to original format
        X_train_resampled = X_train_resampled.reshape(-1, X_train.shape[1])
        
        # Check new distribution
        print("\nAfter SMOTE Class Distribution:")
        print(pd.Series(y_train_resampled).value_counts())
        
        # Use resampled data
        X_train, y_train = X_train_resampled, y_train_resampled
    else:
        print("\nClasses are balanced (ratio between 0.95-1.05). Proceeding without SMOTE.")
    
    # ======================================================
    # MODEL ARCHITECTURE AND TRAINING
    # ======================================================
    model = Sequential([
        Embedding(8000, 96),
        LSTM(48, return_sequences=True),
        Dropout(0.2),
        LSTM(24),
        Dense(1, activation='sigmoid')
    ])

    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )

    early_stop = EarlyStopping(
        monitor='val_loss',
        patience=1,
        restore_best_weights=True
    )

    print("\nTraining optimized LSTM model...")
    history = model.fit(
        X_train, 
        y_train,
        epochs=8,
        batch_size=128,
        validation_split=0.1,
        callbacks=[early_stop],
        verbose=1
    )
    
    # Save the trained model and tokenizer
    save_artifacts(model, tokenizer)

# ======================================================
# 9. MODEL EVALUATION (ONLY EVALUATION SECTION)
# ======================================================
print("\nModel Evaluation:")
y_pred = (model.predict(X_test) > 0.5).astype("int32")
print(classification_report(y_test, y_pred, target_names=['fake', 'true']))

cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(6,4))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=['Predicted Fake', 'Predicted True'],
            yticklabels=['Actual Fake', 'Actual True'])
plt.title('Optimized LSTM Confusion Matrix')
plt.show()

# ======================================================
# 10. FEATURE IMPORTANCE ANALYSIS
# ======================================================
print("\nFeature Importance Analysis:")

tfidf = TfidfVectorizer(max_features=5000)
X_tfidf = tfidf.fit_transform(final_df['cleaned_text'])
y = final_df['label'].map({'fake': 0, 'true': 1})

lr_model = LogisticRegression(max_iter=1000)
lr_model.fit(X_tfidf, y)

feature_names = tfidf.get_feature_names_out()
coefs = lr_model.coef_.ravel()
top_positive_words = [feature_names[i] for i in coefs.argsort()[-20:][::-1]]
top_negative_words = [feature_names[i] for i in coefs.argsort()[:20]]

print("\nTop 20 words predicting TRUE news:")
print(top_positive_words)
print("\nTop 20 words predicting FAKE news:")
print(top_negative_words)

# ======================================================
# 11. FINAL MODEL EVALUATION (SIMPLIFIED BUT COMPLETE)
# ======================================================
print("\nModel Evaluation Metrics:")
print(classification_report(y_test, y_pred, target_names=['fake', 'true']))
# Prints:
# - Precision, Recall, F1-score for each class
# - Accuracy
# - Macro/micro averages

# Confusion Matrix Visualization
plt.figure(figsize=(6,4))
sns.heatmap(confusion_matrix(y_test, y_pred), 
            annot=True, fmt='d', cmap='Blues',
            xticklabels=['Predicted Fake', 'Predicted True'],
            yticklabels=['Actual Fake', 'Actual True'])
plt.title('Model Confusion Matrix')
plt.show()
# Shows:
# - False Positives/Negatives at a glance
# - Model's error distribution

print(f"\nFinal Model Accuracy: {accuracy_score(y_test, y_pred):.4f}")
print("="*50)
# Provides quick overall performance metric

# ======================================================
# 12. PROFESSIONAL NEWS VERIFICATION CHATBOT (UPDATED)
# ======================================================
import random
from collections import Counter

class NewsVerificationBot:
    def __init__(self, model, tokenizer, fake_df, true_df):
        """
        Initialize chatbot with model, tokenizer and dataset references.
        """
        self.model = model
        self.tokenizer = tokenizer
        self.fake_df = fake_df
        self.true_df = true_df
        
        # Configure response templates
        self.response_templates = {
            'true_high_conf': [
                "This content aligns with verified true news in our database (confidence: {confidence:.1%}).",
                "Our analysis confirms this is likely true news (confidence: {confidence:.1%})."
            ],
            'true_low_conf': [
                "This appears to be true news, though with moderate confidence ({confidence:.1%}).",
                "The content seems authentic but with some reservations ({confidence:.1%})."
            ],
            'fake_high_conf': [
                "RED FLAG: This matches known fake news patterns (confidence: {confidence:.1%}).",
                "WARNING: High probability of misinformation ({confidence:.1%})."
            ],
            'fake_low_conf': [
                "Potential misinformation detected ({confidence:.1%}).",
                "Caution advised: This shows signs of unreliability ({confidence:.1%})."
            ],
            'evidence': [
                "\n\nDatabase analysis shows similar {} news with these characteristics: {}",
                "\n\nOur dataset contains matching {} news patterns including: {}"
            ],
            'error': "I encountered an error analyzing this. Please try again with complete news text.",
            'help': (
                "I'm trained on {} true and {} fake news samples.\n"
                "How to use:\n"
                "1. Paste news text\n"
                "2. I'll analyze it\n"
                "3. Receive verification assessment"
            ).format(len(true_df), len(fake_df))
        }
        
        # Extract dataset characteristics
        self.true_patterns = self._extract_dataset_patterns(true_df)
        self.fake_patterns = self._extract_dataset_patterns(fake_df)

    def _extract_dataset_patterns(self, df):
        """Extract common patterns from dataset without external dependencies"""
        # Get most common words (excluding stopwords)
        from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
        
        all_text = ' '.join(df['cleaned_text'].sample(min(1000, len(df)), random_state=42)).lower()
        words = [word for word in all_text.split() if word not in ENGLISH_STOP_WORDS and len(word) > 3]
        common_words = Counter(words).most_common(5)
        
        # Calculate average text length
        avg_length = df['text_length'].mean()
        
        # Calculate average word count
        avg_words = df['word_count'].mean()
        
        return {
            'common_words': [word[0] for word in common_words],
            'avg_length': avg_length,
            'avg_words': avg_words
        }

    def _generate_evidence(self, label):
        """Generate dataset-backed evidence for predictions"""
        patterns = self.true_patterns if label == 'true' else self.fake_patterns
        evidence_points = []
        
        if patterns['common_words']:
            evidence_points.append("words like '" + "', '".join(patterns['common_words'][:3]) + "'")
        if patterns['avg_length']:
            evidence_points.append(f"average length of {patterns['avg_length']:.0f} chars")
        if patterns['avg_words']:
            evidence_points.append(f"average {patterns['avg_words']:.0f} words per article")
        
        evidence_str = ', '.join(evidence_points[:2])  # Show top 2 evidence points
        return random.choice(self.response_templates['evidence']).format(label, evidence_str)

    def analyze_news(self, text):
        """
        Perform comprehensive news analysis with confidence scoring.
        """
        try:
            # Preprocess input text
            cleaned_text = enhanced_text_cleaning(text)
            if len(cleaned_text.split()) < 5:  # Minimum 5 words
                return "Please provide more substantial text for accurate analysis."

            # Tokenize and predict
            sequence = self.tokenizer.texts_to_sequences([cleaned_text])
            padded_sequence = pad_sequences(sequence, maxlen=150)
            prediction = self.model.predict(padded_sequence, verbose=0)[0][0]
            
            # Determine label and confidence
            label = 'true' if prediction > 0.5 else 'fake'
            confidence = prediction if label == 'true' else 1 - prediction
            
            # Select appropriate response template
            if confidence > 0.75:
                response_key = f'{label}_high_conf'
            elif confidence > 0.5:
                response_key = f'{label}_low_conf'
            else:
                response_key = f'{label}_low_conf'
            
            base_response = random.choice(self.response_templates[response_key]).format(
                confidence=confidence
            )
            
            # Add evidence if confidence is moderate or higher
            if confidence > 0.6:
                base_response += self._generate_evidence(label)
            
            return base_response
            
        except Exception as e:
            print(f"Analysis error: {str(e)}")  # Log error for debugging
            return self.response_templates['error']

    def run(self):
        """Main chatbot interaction loop"""
        print("\n" + "="*60)
        print("NEWS VERIFICATION CHATBOT".center(60))
        print("="*60)
        print(self.response_templates['help'])
        print("Type 'quit' to exit.\n" + "-"*60)
        
        while True:
            try:
                user_input = input("USER: ").strip()
                
                if user_input.lower() in ('quit', 'exit'):
                    print("\nBOT: Thank you for using our verification service!")
                    break
                    
                if user_input.lower() == 'help':
                    print("\nBOT:", self.response_templates['help'])
                    continue
                    
                if not user_input:
                    print("\nBOT: Please enter news text to analyze")
                    continue
                
                print("\nBOT: Analyzing content...", end='\r')
                response = self.analyze_news(user_input)
                print(" " * 30, end='\r')  # Clear loading message
                print("\nBOT:", response)
                print("-"*60)
                
            except KeyboardInterrupt:
                print("\n\nBOT: Session ended by user.")
                break
            except Exception as e:
                print("\nBOT: An error occurred. Please try again.")
                print(f"[System Error: {str(e)}]")

# ======================================================
# 13. MAIN EXECUTION FLOW
# ======================================================
if __name__ == "__main__":
    # Load model and data
    loaded_model, loaded_tokenizer = load_artifacts()
    current_model = loaded_model if loaded_model else model
    current_tokenizer = loaded_tokenizer if loaded_tokenizer else tokenizer
    
    if not current_model or not current_tokenizer:
        print("Error: No model available for predictions")
    else:
        # Initialize chatbot with model and datasets
        bot = NewsVerificationBot(
            model=current_model,
            tokenizer=current_tokenizer,
            fake_df=fake_df,
            true_df=true_df
        )
        bot.run()

    print("\n=== SYSTEM OFFLINE ===")