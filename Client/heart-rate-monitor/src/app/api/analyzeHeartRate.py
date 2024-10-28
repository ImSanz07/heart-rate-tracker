# /api/analyzeHeartRate.py
from sklearn.cluster import KMeans
import numpy as np

def analyze_heart_rate(data):
    heart_rates = np.array([d['heartRate'] for d in data]).reshape(-1, 1)
    kmeans = KMeans(n_clusters=2, random_state=0).fit(heart_rates)
    
    # Identify normal and abnormal clusters
    clusters = kmeans.predict(heart_rates)
    cluster_centers = kmeans.cluster_centers_.flatten()
    
    # Assume the lower center is the "normal" cluster and higher is "abnormal"
    normal_rate = min(cluster_centers)
    abnormal_rate = max(cluster_centers)
    
    return {
        "normal_rate": normal_rate,
        "abnormal_rate": abnormal_rate,
        "insights": "Anomaly detection completed. Consult a doctor if abnormal rates are frequent."
    }
