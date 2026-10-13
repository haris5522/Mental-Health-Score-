// API address:
// - Opened with Live Server (port 5500) or as a local file -> uses your local FastAPI
// - Served by FastAPI itself (local port 8000 or online on Render) -> uses the same site
const isLocalDev =
  window.location.protocol === "file:" || window.location.port === "5500";

const API_URL = isLocalDev ? "http://127.0.0.1:8000/predict" : "/predict";

const form = document.getElementById("prediction-form");
const submitButton = document.getElementById("submit-btn");
const scoreElement = document.getElementById("score");
const statusElement = document.getElementById("status");
const errorElement = document.getElementById("error-message");

function showError(message) {
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

function hideError() {
  errorElement.textContent = "";
  errorElement.style.display = "none";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideError();

  const payload = {
    age: Number(document.getElementById("age").value),
    gender: document.getElementById("gender").value,
    country: document.getElementById("country").value.trim(),
    academic_level: document.getElementById("academic_level").value,
    most_used_platform: document.getElementById("most_used_platform").value,
    purpose_of_use: document.getElementById("purpose_of_use").value,
    avg_daily_usage_hours: Number(document.getElementById("avg_daily_usage_hours").value),
    daily_unlocks: Number(document.getElementById("daily_unlocks").value),
    study_hours: Number(document.getElementById("study_hours").value),
    physical_activity_hours: Number(document.getElementById("physical_activity_hours").value),
    sleep_hours_per_night: Number(document.getElementById("sleep_hours_per_night").value),
    stress_level: document.getElementById("stress_level").value
  };

  submitButton.disabled = true;
  submitButton.textContent = "Predicting…";
  statusElement.textContent = "Sending your details to the prediction model…";

  // Free hosting can take up to a minute to wake up, so wait up to 90 seconds
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    const result = await response.json();

    if (!response.ok) {
      const detail = Array.isArray(result.detail)
        ? result.detail
            .map((item) => `${item.loc?.slice(1).join(".") || "Input"}: ${item.msg}`)
            .join("; ")
        : (result.detail || "The API rejected the submitted data.");
      throw new Error(detail);
    }

    const score = Number(result.predicted_mental_health_score);
    if (!Number.isFinite(score)) {
      throw new Error("The API response did not contain a valid prediction.");
    }

    scoreElement.textContent = score.toFixed(2);
    statusElement.textContent = "Prediction received successfully.";
  } catch (error) {
    statusElement.textContent = "Prediction could not be completed.";
    if (error.name === "AbortError") {
      showError("The server took too long to respond. Please try again in a minute.");
    } else if (error instanceof TypeError) {
      showError(
        isLocalDev
          ? "Could not connect to FastAPI. Make sure it is running (uvicorn main:app --reload) at " + API_URL
          : "Could not reach the server. It may be waking up (free hosting sleeps when idle). Wait about a minute and try again."
      );
    } else {
      showError(error.message);
    }
  } finally {
    clearTimeout(timeoutId);
    submitButton.disabled = false;
    submitButton.textContent = "✧  Predict Mental Health Score";
  }
});