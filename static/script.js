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

// Reset the result and
