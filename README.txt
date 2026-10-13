# Mental Health Predictor Frontend

Files:
- `index.html` — form and result panel
- `style.css` — responsive design and styling
- `script.js` — sends the form data to FastAPI

## Run it

1. Keep these three files in the same folder.
2. Start your FastAPI backend from the folder containing `main.py`:
   `uvicorn main:app --reload`
3. Open `index.html` in your browser, or use VS Code Live Server.
4. `script.js` expects the endpoint at `http://127.0.0.1:8000/predict`.

If your backend runs at another address, update `API_URL` in `script.js`.

The FastAPI backend must have CORS enabled. This UI expects the response:
`{"predicted_mental_health_score": 6.78}`

Note: This is a model prediction, not a medical diagnosis.
