
import pandas as pd
import numpy as np
import re
import torch
import os
import sys
import warnings
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, f1_score
from torch.utils.data import Dataset, DataLoader
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification, AdamW

# 忽略警告
warnings.filterwarnings('ignore')

# ==========================================
# 0. 設定與假資料生成 (防呆機制)
# ==========================================
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
DATA_PATH = "mbti_1.csv"
print(f"Using device: {DEVICE}")

def load_or_create_data():
    if os.path.exists(DATA_PATH):
        print(f"Loading dataset from {DATA_PATH}...")
        df = pd.read_csv(DATA_PATH)
    else:
        print("⚠️ Warning: mbti_1.csv not found. Generating DUMMY data for verification...")
        # 產生假資料讓程式能跑通
        dummy_types = ['INFJ', 'ENTP', 'INTP', 'INTJ', 'ENTJ', 'ENFP', 'ISFP', 'ISTP'] * 20
        dummy_posts = ["I love thinking about abstract concepts and the future. Logic is key."] * 160
        df = pd.DataFrame({'type': dummy_types, 'posts': dummy_posts})
    return df

# ==========================================
# 1. 資料前處理 (Preprocessing)
# ==========================================
def clean_text(text):
    """ 保留第一組原本優秀的清洗邏輯 """
    text = re.sub(r'http\S+', '', text)  # 移除網址
    text = re.sub(r'\|\|\|', ' ', text)  # 移除分隔符
    text = re.sub(r'[^a-zA-Z\s]', '', text) # 移除標點與數字
    return text.lower().strip()

def preprocess_labels(df):
    """ 將 16 型人格拆解為 4 個二元標籤 (0/1) """
    # 映射表: 0 為左邊 (I,N,F,J), 1 為右邊 (E,S,T,P)
    df['IE'] = df['type'].apply(lambda x: 0 if 'I' in x else 1)
    df['NS'] = df['type'].apply(lambda x: 0 if 'N' in x else 1)
    df['TF'] = df['type'].apply(lambda x: 0 if 'F' in x else 1) 
    df['JP'] = df['type'].apply(lambda x: 0 if 'J' in x else 1)
    return df

# ==========================================
# 2. 模型一：Baseline (TF-IDF + LinearSVC + GridSearchCV)
# ==========================================
def train_baseline(X_train, X_test, y_train, y_test, dimension_name):
    print(f"\n--- Training Baseline (LinearSVC) for {dimension_name} ---")
    
    # 建立 Pipeline: TF-IDF -> LinearSVC
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=5000, stop_words='english')),
        ('clf', LinearSVC(dual='auto', max_iter=1000))
    ])
    
    # 設定網格搜索參數 (兌現報告承諾)
    param_grid = {'clf__C': [0.1, 1, 10]}
    
    grid = GridSearchCV(pipeline, param_grid, cv=3, scoring='accuracy', n_jobs=-1)
    grid.fit(X_train, y_train)
    
    best_model = grid.best_estimator_
    preds = best_model.predict(X_test)
    
    acc = accuracy_score(y_test, preds)
    f1 = f1_score(y_test, preds, average='macro')
    
    print(f"Best Params: {grid.best_params_}")
    print(f"Accuracy: {acc:.4f}, F1-Score: {f1:.4f}")
    
    return best_model, acc, f1

# ==========================================
# 3. 模型二：Upgrade (DistilBERT Multi-label)
# ==========================================
class MBTIDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len=512):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = self.labels[idx]
        
        encoding = self.tokenizer.encode_plus(
            text,
            add_special_tokens=True,
            max_length=self.max_len,
            return_token_type_ids=False,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt',
        )
        
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(label, dtype=torch.float)
        }

def train_distilbert(X_train, X_test, y_train, y_test):
    print("\n--- Training Upgrade Model (DistilBERT Multi-label) ---")
    
    # 初始化 Tokenizer 與 模型
    # num_labels=4 表示我們一次輸出 [IE, NS, TF, JP] 四個機率
    try:
        tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
        model = DistilBertForSequenceClassification.from_pretrained(
            'distilbert-base-uncased', 
            num_labels=4, 
            problem_type="multi_label_classification"
        ).to(DEVICE)
    except Exception as e:
        print(f"Error loading DistilBERT: {e}")
        print("Ensure internet connection or local model is available.")
        sys.exit(1)
    
    # 建立 DataLoader
    # 降低 Batch Size 防止 4GB VRAM OOM
    BATCH_SIZE = 4 
    train_dataset = MBTIDataset(X_train, y_train, tokenizer)
    test_dataset = MBTIDataset(X_test, y_test, tokenizer)
    
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE)
    
    optimizer = AdamW(model.parameters(), lr=2e-5)
    
    # 訓練迴圈
    epochs = 3 
    print(f"Starting training for {epochs} epochs on {DEVICE}...")
    
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        batch_count = 0
        for batch in train_loader:
            input_ids = batch['input_ids'].to(DEVICE)
            mask = batch['attention_mask'].to(DEVICE)
            labels = batch['labels'].to(DEVICE)
            
            optimizer.zero_grad()
            outputs = model(input_ids, attention_mask=mask, labels=labels)
            loss = outputs.loss
            total_loss += loss.item()
            loss.backward()
            optimizer.step()
            
            batch_count += 1
            if batch_count % 50 == 0:
                print(f"Epoch {epoch+1}, Batch {batch_count}/{len(train_loader)}, Loss: {loss.item():.4f}", end='\r')
                
        avg_loss = total_loss / len(train_loader)
        print(f"\nEpoch {epoch+1}/{epochs} completed. Avg Loss: {avg_loss:.4f}")

    # 評估
    print("Evaluating...")
    model.eval()
    all_preds = []
    all_labels = []
    
    with torch.no_grad():
        for batch in test_loader:
            input_ids = batch['input_ids'].to(DEVICE)
            mask = batch['attention_mask'].to(DEVICE)
            labels = batch['labels'].to(DEVICE)
            
            outputs = model(input_ids, attention_mask=mask)
            # Sigmoid > 0.5 視為 1
            preds = torch.sigmoid(outputs.logits).cpu().numpy()
            all_preds.extend(preds > 0.5)
            all_labels.extend(labels.cpu().numpy())
            
    all_preds = np.array(all_preds)
    all_labels = np.array(all_labels)
    
    # 計算每個維度的分數
    results = {}
    dims = ['IE', 'NS', 'TF', 'JP']
    for i, dim in enumerate(dims):
        acc = accuracy_score(all_labels[:, i], all_preds[:, i])
        f1 = f1_score(all_labels[:, i], all_preds[:, i], average='macro')
        results[dim] = (acc, f1)
        
    return model, tokenizer, results

# ==========================================
# 4. 主程式與結果比較
# ==========================================
def predict_mbti_text(text, model, tokenizer):
    """ Demo Function: 輸入一句話，輸出 MBTI """
    model.eval()
    cleaned = clean_text(text)
    encoding = tokenizer.encode_plus(
        cleaned, max_length=512, padding='max_length', truncation=True, return_tensors='pt'
    )
    input_ids = encoding['input_ids'].to(DEVICE)
    mask = encoding['attention_mask'].to(DEVICE)
    
    with torch.no_grad():
        outputs = model(input_ids, attention_mask=mask)
        probs = torch.sigmoid(outputs.logits).cpu().numpy()[0]
    
    # 0.5 為閾值: 0=左邊特質, 1=右邊特質
    # Mapping: 0->(I,N,F,J), 1->(E,S,T,P)
    res = ""
    res += "E" if probs[0] > 0.5 else "I"
    res += "S" if probs[1] > 0.5 else "N"
    res += "T" if probs[2] > 0.5 else "F"
    res += "P" if probs[3] > 0.5 else "J"
    
    return res, probs

if __name__ == "__main__":
    # A. 載入與處理
    df = load_or_create_data()
    df['clean_posts'] = df['posts'].apply(clean_text)
    df = preprocess_labels(df)
    
    # 只使用部分資料進行快速演示 (如果資料量太大)
    # 但為了完整性，這裡使用全部或較大比例
    # df = df.sample(frac=0.5, random_state=42) 
    
    print(f"Total samples: {len(df)}")
    
    # 分層抽樣 (Stratified based on original 16 types)
    try:
        X_train, X_test, y_train_full, y_test_full = train_test_split(
            df['clean_posts'], df[['IE', 'NS', 'TF', 'JP', 'type']], 
            test_size=0.2, random_state=42, stratify=df['type']
        )
    except ValueError:
        # 如果某些類別樣本太少無法分層，就隨機分
        print("Warning: Stratified split failed (small dataset?), using random split.")
        X_train, X_test, y_train_full, y_test_full = train_test_split(
            df['clean_posts'], df[['IE', 'NS', 'TF', 'JP', 'type']], 
            test_size=0.2, random_state=42
        )
    
    # B. 訓練 Baseline (LinearSVC)
    baseline_metrics = {}
    dims = ['IE', 'NS', 'TF', 'JP']
    
    print("\n======== PART 1: Baseline (LinearSVC + GridSearchCV) ========")
    for dim in dims:
        _, acc, f1 = train_baseline(X_train, X_test, y_train_full[dim], y_test_full[dim], dim)
        baseline_metrics[dim] = {'acc': acc, 'f1': f1}
        
    # C. 訓練 Upgrade (DistilBERT)
    print("\n======== PART 2: Upgrade (DistilBERT Multi-label) ========")
    # 準備 numpy array 給 Dataset
    y_train_bert = y_train_full[dims].values
    y_test_bert = y_test_full[dims].values
    
    bert_model, bert_tokenizer, bert_metrics = train_distilbert(
        X_train.tolist(), X_test.tolist(), y_train_bert, y_test_bert
    )
    
    # D. 最終比較表
    print("\n======== FINAL COMPARISON ========")
    print(f"{'Dim':<5} | {'Base Acc':<10} | {'BERT Acc':<10} | {'Improvement':<12}")
    print("-" * 45)
    for dim in dims:
        base_acc = baseline_metrics[dim]['acc']
        bert_acc = bert_metrics[dim][0]
        imp = (bert_acc - base_acc) * 100
        print(f"{dim:<5} | {base_acc:.4f}     | {bert_acc:.4f}     | {imp:+.2f}%")
        
    # E. Demo
    sample_text = "I really enjoy spending time alone reading books and thinking about the universe."
    pred_type, probs = predict_mbti_text(sample_text, bert_model, bert_tokenizer)
    print(f"\n[Demo] Input: '{sample_text}'")
    print(f"[Demo] Predicted: {pred_type} (Probabilities: {probs})")
