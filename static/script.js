```javascript
// API configuration
// Live Server / local HTML -> local FastAPI
// Deployed website -> same-domain FastAPI
const isLocalDev =
  window.location.protocol === "file:" ||
  window.location.port === "5500";

const API_URL = isLocalDev
  ? "http://127.0.0.1:8000/predict"
  : "/predict";

// Main form elements
const form = document.getElementById("predict-form");
const submitButton = document.getElementById("submit-btn");
const btnLabel = submitButton.querySelector(".btn-label");

// Result states
const idleState = document.getElementById("state-idle");
const loadingState = document.getElementById("state-loading");
const resultState = document.getElementById("state-result");
const errorState = document.getElementById("state-error");

// Result elements
const scoreElement = document.getElementById("score-number");
const scoreBand = document.getElementById("score-band");
const scoreContext = document.getElementById("score-context");
const gaugeFill = document.getElementById("gauge-fill");
const errorCopy = document.getElementById("error-copy");

// Buttons
const resetButton = document.getElementById("reset-btn");
const retryButton = document.getElementById("error-retry-btn");

// Stress selection
const stressGroup = document.getElementById("stress_level_group");
const stressInput = document.getElementById("stress_level");

// SVG gauge configuration
const GAUGE_LENGTH = 314.16;

// Show one result state at a time
function showState(state) {
  idleState.hidden = state !== "idle";
  loadingState.hidden = state !== "loading";
  resultState.hidden = state !== "result";
  errorState.hidden = state !== "error";
}

// Display field-specific validation errors
function showFieldError(name, message) {
  const error = document.querySelector(
    `.error-msg[data-for="${name}"]`
  );

  if (error) {
    error.textContent = message;
  }
}

function clearFieldError(name) {
  showFieldError(name, "");
}

function clearAllErrors() {
  document.querySelectorAll(".error-msg").forEach((element) => {
    element.textContent = "";
  });
}

// Validate the form before sending data
function validateForm() {
  clearAllErrors();

  let valid = true;

  const fields = form.querySelectorAll(
    "input:not([type='hidden']), select"
  );

  fields.forEach((field) => {
    if (field.type === "number") {
      const value = field.value.trim();
      const number = Number(value);

      if (value === "" || !Number.isFinite(number)) {
        showFieldError(field.name, "Please enter a valid number.");
        valid = false;
        return;
      }

      if (field.min !== "" && number < Number(field.min)) {
        showFieldError(
          field.name,
          `Minimum value is ${field.min}.`
        );
        valid = false;
        return;
      }

      if (field.max !== "" && number > Number(field.max)) {
        showFieldError(
          field.name,
          `Maximum value is ${field.max}.`
        );
        valid = false;
        return;
      }

      if (field.step === "1" && !Number.isInteger(number)) {
        showFieldError(
          field.name,
          "Please enter a whole number."
        );
        valid = false;
        return;
      }
    } else if (field.required && !field.value.trim()) {
      showFieldError(field.name, "This field is required.");
      valid = false;
    }
  });

  if (!stressInput.value) {
    showFieldError("stress_level", "Please select a stress level.");
    valid = false;
  }

  return valid;
}

// Select a stress level
stressGroup.querySelectorAll(".seg-btn").forEach((button) => {
  button.addEventListener("click", () => {
    stressGroup.querySelectorAll(".seg-btn").forEach((item) => {
      item.classList.remove("active", "selected");
      item.setAttribute("aria-pressed", "false");
    });

    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");

    stressInput.value = button.dataset.value;
    clearFieldError("stress_level");
  });
});

// Remove field errors as the user edits their answers
form.querySelectorAll("input, select").forEach((field) => {
  field.addEventListener("input", () => {
    clearFieldError(field.name);
  });

  field.addEventListener("change", () => {
    clearFieldError(field.name);
  });
});

// Update the semicircular score gauge
function updateGauge(score) {
  const safeScore = Math.max(0, Math.min(10, score));
  const progress = safeScore / 10;

  gaugeFill.style.strokeDasharray =
    `${GAUGE_LENGTH} ${GAUGE_LENGTH}`;

  gaugeFill.style.strokeDashoffset =
    GAUGE_LENGTH * (1 - progress);
}

// Reset the result and form
function resetForm() {
  form.reset();
  clearAllErrors();

  stressInput.value = "";

  stressGroup.querySelectorAll(".seg-btn").forEach((button) => {
    button.classList.remove("active", "selected");
    button.setAttribute("aria-pressed", "false");
  });

  scoreElement.textContent = "0.0";
  scoreBand.textContent = "—";
  scoreContext.textContent = "";

  updateGauge(0);
  showState("idle");

  submitButton.disabled = false;
  btnLabel.textContent = "Read my signal";
}

// Submit the prediction request
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  const payload = {
    age: Number(document.getElementById("age").value),
    gender: document.getElementById("gender").value,
    country: document.getElementById("country").value.trim(),
    academic_level:
      document.getElementById("academic_level").value,
    most_used_platform:
      document.getElementById("most_used_platform").value,
    purpose_of_use:
      document.getElementById("purpose_of_use").value,
    avg_daily_usage_hours: Number(
      document.getElementById("avg_daily_usage_hours").value
    ),
    daily_unlocks: Number(
      document.getElementById("daily_unlocks").value
    ),
    study_hours: Number(
      document.getElementById("study_hours").value
    ),
    physical_activity_hours: Number(
      document.getElementById("physical_activity_hours").value
    ),
    sleep_hours_per_night: Number(
      document.getElementById("sleep_hours_per_night").value
    ),
    stress_level: stressInput.value
  };

  submitButton.disabled = true;
  btnLabel.textContent = "Reading your signal…";
  showState("loading");

  const controller = new AbortController();

  // Allow up to 90 seconds for a sleeping server to respond
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 90000);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    const result = await response.json();

    if (!response.ok) {
      const detail = Array.isArray(result.detail)
        ? result.detail
            .map((item) => {
              const field = item.loc?.slice(1).join(".") || "Input";
              return `${field}: ${item.msg}`;
            })
            .join("; ")
        : result.detail || "The prediction request failed.";

      throw new Error(detail);
    }

    const score = Number(
      result.predicted_mental_health_score
    );

    if (!Number.isFinite(score) || score < 0 || score > 10) {
      throw new Error(
        "The server returned an invalid score. Please check the model output."
      );
    }

    scoreElement.textContent = score.toFixed(2);
    updateGauge(score);

    // Neutral wording: the score alone does not establish a diagnosis.
    scoreBand.textContent = "Predicted score";
    scoreContext.textContent =
      "This is a model-generated estimate, not a clinical assessment.";

    showState("result");
  } catch (error) {
    if (error.name === "AbortError") {
      errorCopy.textContent =
        "The server took too long to respond. Please try again.";
    } else if (error instanceof TypeError) {
      errorCopy.textContent =
        "Could not connect to the prediction server. Please check your connection and try again.";
    } else {
      errorCopy.textContent = error.message;
    }

    showState("error");
  } finally {
    clearTimeout(timeoutId);
    submitButton.disabled = false;
    btnLabel.textContent = "Read my signal";
  }
});

// Reset and retry buttons
resetButton.addEventListener("click", resetForm);

retryButton.addEventListener("click", () => {
  showState("idle");
});

// Initial page state
showState("idle");
updateGauge(0);
```
