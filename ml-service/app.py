from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({
        "status": "ML Service is Online",
        "message": "This is an API service. Please use the Frontend (usually port 5173) to interact with the application."
    })

@app.route('/predict/diabetes', methods=['POST'])
def predict_diabetes():
    data = request.json
    # Basic logic for demonstration (Replace with actual model.predict)
    bmi = float(data.get('bmi', 0))
    sugar = float(data.get('sugar', 0))
    age = float(data.get('age', 0))
    
    risk_score = (bmi * 0.3 + sugar * 0.5 + age * 0.2) / 2
    risk_score = min(max(risk_score, 0), 100)
    
    recommendation = "Maintain a healthy diet and monitor sugar levels."
    if risk_score > 70:
        recommendation = "High risk! Consult a specialist immediately."
    elif risk_score > 40:
        recommendation = "Moderate risk. Consider reducing sugar intake and increasing exercise."

    return jsonify({
        "risk_score": round(risk_score, 2),
        "recommendation": recommendation
    })

@app.route('/predict/heart-disease', methods=['POST'])
def predict_heart_disease():
    data = request.json
    bp = float(data.get('blood_pressure', 0))
    cholesterol = float(data.get('cholesterol', 0))
    age = float(data.get('age', 0))
    
    risk_score = (bp * 0.4 + cholesterol * 0.4 + age * 0.2) / 2
    risk_score = min(max(risk_score, 0), 100)
    
    recommendation = "Keep a balanced diet and regular cardio exercise."
    if risk_score > 70:
        recommendation = "High risk! Avoid high-fat foods and consult a cardiologist."
    elif risk_score > 40:
        recommendation = "Moderate risk. Monitor your blood pressure and reduce salt intake."

    return jsonify({
        "risk_score": round(risk_score, 2),
        "recommendation": recommendation
    })

@app.route('/predict/hypertension', methods=['POST'])
def predict_hypertension():
    data = request.json
    bp = float(data.get('blood_pressure', 0))
    age = float(data.get('age', 0))
    
    risk_score = (bp * 0.7 + age * 0.3) / 1.5
    risk_score = min(max(risk_score, 0), 100)
    
    recommendation = "Reduce stress and salt intake."
    if risk_score > 70:
        recommendation = "High risk of hypertension! Consult a doctor."
    
    return jsonify({
        "risk_score": round(risk_score, 2),
        "recommendation": recommendation
    })

@app.route('/predict/anemia', methods=['POST'])
def predict_anemia():
    data = request.json
    hb = float(data.get('hemoglobin', 14))
    age = int(data.get('age', 30))
    gender = data.get('gender', 'Male')
    
    # Slightly more realistic thresholds
    threshold = 12 if gender == 'Female' else 13.5
    
    if hb < threshold - 2:
        risk_score = 85
        recommendation = "Severe Risk: Your hemoglobin levels are critically low. Immediate medical consultation and iron supplementation are required."
    elif hb < threshold:
        risk_score = 45
        recommendation = "Moderate Risk: Levels are slightly below normal. Increase iron-rich foods (spinach, red meat, lentils) and re-test in 4 weeks."
    else:
        risk_score = 10
        recommendation = "Healthy: Your hemoglobin levels are within the optimal range. Continue a balanced diet."

    return jsonify({
        "risk_score": round(risk_score, 2),
        "recommendation": recommendation,
        "status": "Success"
    })

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
