# 🛡️ ScamShield AI — Scam Detection Engine

**Detect suspicious job offers. Understand the warning signs. Stay protected.**

ScamShield AI is a scam-message screening project designed to identify potential job and task-based scams through an explainable, rule-based detection engine.

The system analyses message content, identifies suspicious patterns, calculates a risk score, and provides understandable warnings and safety recommendations.

> **Project Status:** MVP – Rule-Based Detection Engine v0.1

---

## 🚀 Key Features

- **Suspicious Message Detection:** Identifies potentially fraudulent job and task-related messages.
- **Weighted Risk Scoring:** Assigns scores based on the seriousness of detected warning signs.
- **Risk Classification:** Categorises messages into Low, Medium, and High risk levels.
- **Explainable Results:** Highlights the suspicious indicators behind each assessment.
- **Safety Recommendations:** Provides practical guidance based on detected warning signs.
- **Input Validation:** Handles blank and excessively long messages.
- **Privacy-Conscious Design:** The detection module does not store or transmit submitted messages.

## 🔍 What Does It Detect?

The current engine checks for five major warning indicators:

| Detection Category | Risk Score |
|---|---:|
| Upfront job or registration fee | +3 |
| Payment to unlock tasks or earnings | +4 |
| Requests for sensitive credentials | +4 |
| Unrealistic or guaranteed earnings | +2 |
| Urgency or pressure tactics | +1 |

## 📊 Risk Classification

The engine calculates a total score based on the detected indicators.

| Score | Risk Level |
|---|---|
| 0–2 | 🟢 Low |
| 3–5 | 🟡 Medium |
| 6+ | 🔴 High |

*Note: These thresholds are provisional prototype settings, not scientifically validated fraud probabilities. A risk score is not proof of fraud.*

## ⚙️ How It Works

1. User submits a job-related message.
2. The detection engine analyses the message.
3. Suspicious patterns are identified.
4. Each detected indicator contributes to the risk score.
5. The engine determines the risk category.
6. Evidence and safety recommendations are generated.

## 🧰 Technology Stack

- **Language:** Python
- **Detection Approach:** Explainable Rule-Based Detection
- **Testing:** Python unittest
- **Dependencies:** Python Standard Library

No external package or API key is required for the current detection engine.

## 📁 Project Structure

```text
scamshield_ai_detection/
│
├── detector.py
├── test_detector.py
├── README.md
└── .gitignore
```

| File | Purpose |
|---|---|
| `detector.py` | Detection rules, scoring, evidence and recommendations |
| `test_detector.py` | Automated tests for detection behaviour |
| `README.md` | Project documentation |
| `.gitignore` | Excludes unnecessary files from Git |

## 💻 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yajatangrish/ScamShield-AI.git
```

### 2. Open the detection engine folder

```bash
cd ScamShield-AI/scamshield_ai_detection
```

### 3. Check your Python version

Python 3.10 or newer is required.

```bash
python --version
```

### 4. Run the test suite

```bash
python -m unittest -v
```

On Windows, you can also use:

```powershell
py -m unittest -v
```

## 🧪 Using the Detection Engine

Import the detection function into your Python application:

```python
from detector import analyze_message

message = "Pay a fee to unlock your earning tasks."

result = analyze_message(message)

print(result)
```

The function returns a structured result containing the risk assessment and supporting information.

**Integration note:** The backend should handle `ValueError` for invalid input and return an appropriate HTTP 400 response. Keep the agreed API response keys stable during frontend integration.

## ⚠️ Current Limitations

- Detection relies on predefined patterns and may miss unfamiliar scam wording.
- The engine does not independently verify company registration, websites, or email domains.
- No trained machine learning classifier or LLM is currently implemented.
- Results are warning indicators, not definitive fraud accusations.
- A Low-risk result does not guarantee that a job offer is legitimate.

## 🔮 Future Development

Planned improvements include:

- Integration with the application backend and frontend.
- Creation of a labelled dataset of legitimate and suspicious messages.
- Evaluation using Precision, Recall, F1-score and false-positive rate.
- Development of an AI/ML classifier as a supplementary detection signal.
- Improved detection of new and evolving scam techniques.

Any future AI-generated warning should be supported by message evidence or verified external information.

## 👥 Project

**ScamShield AI** is being developed as a hackathon project to make identifying suspicious job offers easier and more understandable.

Our goal is simple:

**Recognise the warning signs. Make informed decisions. Stay safe.**

---

*Disclaimer: ScamShield AI is an educational screening prototype. It should not be treated as a replacement for independent verification or professional advice.*
