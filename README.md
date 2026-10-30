# ScamShield AI — Detection Engine (MVP v0.1)

This folder contains a beginner-friendly, explainable rule-based baseline for the ScamShield AI hackathon project.

## Files

- `detector.py` — detection rules, weighted scoring, evidence, and safety recommendations.
- `test_detector.py` — seven small tests covering suspicious, ordinary, negated, repeated, and empty inputs.

## Requirements

Python 3.10 or newer. The detector uses only Python's standard library; no external package or API key is needed.

## Run the tests

Open a terminal in this folder and run:

```bash
python -m unittest -v
```

On Windows, this may also work:

```powershell
py -m unittest -v
```

## Use it from the Flask backend

```python
from detector import analyze_message

result = analyze_message("Pay a fee to unlock your earning tasks.")
print(result)
```

The Flask teammate should catch `ValueError` for blank/oversized input and convert it to an HTTP 400 response. Keep the agreed API response keys stable for the React teammate.

## Current scoring design

- Upfront job/registration fee: 3 points
- Payment/deposit to unlock tasks or earnings: 4 points
- Request for sensitive credentials: 4 points
- Unusually attractive/guaranteed earnings claim: 2 points
- Pressure to act immediately: 1 point

Provisional thresholds: 0–2 Low, 3–5 Medium, 6+ High. These are prototype choices, not scientifically validated probabilities. A score is not proof of fraud. A Low result does not guarantee an offer is safe.

## Current limitations

- The baseline uses phrase/pattern rules, so new wording may evade detection.
- It does not verify company registration, websites, or email domains.
- It does not yet use an LLM or a trained classifier.
- Results should be described as warning indicators, not definitive accusations.
- The module does not store or transmit user messages.

## Next planned phase

After the backend and frontend integration works, evaluate the rule set with a labelled set of examples. Only then consider an AI classifier as a supplementary signal. Do not let an LLM invent evidence: every displayed warning should be tied to text or a verified lookup result.
