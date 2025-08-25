# lateral-phishing-detector
Lateral Phishing Detector 

# Lateral Phishing Detector (Chrome Extension + Flask Backend)

Implementation of a **lateral phishing detection system** combining a Python ML backend with a Chrome extension that provides an **interactive reflection warning system (IRWS)**.  
This project is based on research papers exploring **phishing detection and user-centered warning design**.

## 📌 Problem
- **Phishing** is one of the most common cyberattacks.  
- **Lateral phishing** is especially dangerous: attackers send malicious emails from **compromised but legitimate accounts**, bypassing traditional filters.  
- Existing defenses often **miss attacks** or produce too many **false positives** (ignored by users).  
- A major obstacle: **no public dataset** of real-world lateral phishing emails.

## ✨ Our Approach
- **Synthetic Dataset Creation:**  
  - Used the **Enron Email Dataset** as a base of legitimate corporate emails.  
  - Generated realistic **lateral phishing attacks** by prompting the **ChatGPT API** to craft malicious variations.  
  - Combined the two to build a labeled dataset (legitimate vs. lateral phishing).  

- **ML Backend (Python, Flask):**
  - Extracts features from email content & metadata:
    - Keywords (e.g., “credentials”, “password”)  
    - URL reputation and suspicious domains  
    - Recipient behavior (mass recipients, reply-chain anomalies)  
    - Attachments and other heuristics  
  - Trains a **Random Forest baseline** (extendable to stronger models).  
  - Exposes a `/predict` API endpoint.  

- **Chrome Extension (HTML/JS):**
  - Displays **step-by-step interactive prompts** instead of static banners.  
  - Uses **personalized reflection questions** to increase engagement and reduce “banner blindness.”  

- **Design Principles (from paper):**
  - Confidentiality & Integrity  
  - Comprehension & Memory Support  
  - Attention & Engagement  

## 🛠️ Tech Stack
- **Backend:** Python, Flask, scikit-learn, pandas, numpy, joblib, tldextract  
- **Frontend:** Chrome Extension (HTML, CSS, JavaScript)  
