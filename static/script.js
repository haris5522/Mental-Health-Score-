<<<<<<< HEAD
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
=======
(() => {
  "use strict";

    // Local page on any port except 8000 (Live Server, VS Code preview, etc.) -> your FastAPI on port 8000
  // Page served by FastAPI itself (port 8000) or hosted online -> same site, no address needed
  const host = window.location.hostname;
  const isLocalHost =
    window.location.protocol === "file:" || host === "localhost" || host === "127.0.0.1";
  const isLocalDev = isLocalHost && window.location.port !== "8000";
  const API_BASE = isLocalDev ? "http://127.0.0.1:8000" : "";

  const form = document.getElementById("predict-form");
  const submitBtn = document.getElementById("submit-btn");
  const resetBtn = document.getElementById("reset-btn");
  const errorRetryBtn = document.getElementById("error-retry-btn");

  const stateIdle = document.getElementById("state-idle");
  const stateLoading = document.getElementById("state-loading");
  const stateResult = document.getElementById("state-result");
  const stateError = document.getElementById("state-error");

  const scoreNumberEl = document.getElementById("score-number");
  const scoreBandEl = document.getElementById("score-band");
  const scoreContextEl = document.getElementById("score-context");
  const gaugeFill = document.getElementById("gauge-fill");
  const errorLabelEl = document.getElementById("error-label");
  const errorCopyEl = document.getElementById("error-copy");

  const GAUGE_ARC_LENGTH = 314; // approx pi * r(100)

  // ---------------------------------------------------------
  // Draw tick marks on both gauges (0..10, every 2 units)
  // ---------------------------------------------------------
  function drawTicks() {
    document.querySelectorAll(".gauge-ticks").forEach((g) => {
      g.innerHTML = "";
      const cx = 120, cy = 140, rOuter = 100, rInner = 90;
      for (let i = 0; i <= 10; i += 2) {
        const angle = Math.PI - (i / 10) * Math.PI; // 180deg -> 0deg
        const x1 = cx + rOuter * Math.cos(angle);
        const y1 = cy - rOuter * Math.sin(angle);
        const x2 = cx + rInner * Math.cos(angle);
        const y2 = cy - rInner * Math.sin(angle);
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1.toFixed(1));
        line.setAttribute("y1", y1.toFixed(1));
        line.setAttribute("x2", x2.toFixed(1));
        line.setAttribute("y2", y2.toFixed(1));
        g.appendChild(line);
      }
    });
  }
  drawTicks();

  // ---------------------------------------------------------
  // Segmented control (stress_level) wiring
  // ---------------------------------------------------------
  const segGroup = document.getElementById("stress_level_group");
  const stressHiddenInput = document.getElementById("stress_level");
  segGroup.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      segGroup.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      stressHiddenInput.value = btn.dataset.value;
      clearFieldError(stressHiddenInput);
    });
  });

  // ---------------------------------------------------------
  // Field-level error helpers
  // ---------------------------------------------------------
  function fieldWrapper(input) {
    return input.closest(".field");
  }

  function setFieldError(input, message) {
    const wrap = fieldWrapper(input);
    if (!wrap) return;
    wrap.classList.add("field-error");
    const msgEl = wrap.querySelector(".error-msg");
    if (msgEl) msgEl.textContent = message;
  }

  function clearFieldError(input) {
    const wrap = fieldWrapper(input);
    if (!wrap) return;
    wrap.classList.remove("field-error");
    const msgEl = wrap.querySelector(".error-msg");
    if (msgEl) msgEl.textContent = "";
  }

  function clearAllErrors() {
    form.querySelectorAll(".field").forEach((f) => f.classList.remove("field-error"));
    form.querySelectorAll(".error-msg").forEach((m) => (m.textContent = ""));
  }

  // ---------------------------------------------------------
  // Client-side validation mirroring the StudentData model
  // ---------------------------------------------------------
  function validate(payload) {
    const errors = [];

    const numericChecks = [
      ["age", 10, 100],
      ["avg_daily_usage_hours", 0, 24],
      ["daily_unlocks", 0, Infinity],
      ["study_hours", 0, 24],
      ["physical_activity_hours", 0, 24],
      ["sleep_hours_per_night", 0, 24],
    ];

    numericChecks.forEach(([key, min, max]) => {
      const input = document.getElementById(key);
      const val = payload[key];
      if (val === "" || val === null || Number.isNaN(val)) {
        errors.push([input, "This field is required."]);
      } else if (val < min || val > max) {
        errors.push([input, `Must be between ${min} and ${max === Infinity ? "0+" : max}.`]);
      }
>>>>>>> fa09bc8 (Serve static site from root, add Dockerfile)
    });

    ["gender", "country", "academic_level", "most_used_platform", "purpose_of_use"].forEach((key) => {
      const input = document.getElementById(key);
      if (!payload[key] || String(payload[key]).trim() === "") {
        errors.push([input, "This field is required."]);
      }
    });

<<<<<<< HEAD
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
=======
    if (!payload.stress_level) {
      errors.push([stressHiddenInput, "Pick a stress level."]);
    }

    return errors;
  }

  // ---------------------------------------------------------
  // Gather form data into the exact StudentData shape
  // ---------------------------------------------------------
  function collectPayload() {
    const fd = new FormData(form);
    return {
      age: fd.get("age") === "" ? NaN : parseInt(fd.get("age"), 10),
      gender: fd.get("gender") || "",
      country: (fd.get("country") || "").trim(),
      academic_level: fd.get("academic_level") || "",
      most_used_platform: fd.get("most_used_platform") || "",
      purpose_of_use: fd.get("purpose_of_use") || "",
      avg_daily_usage_hours: fd.get("avg_daily_usage_hours") === "" ? NaN : parseFloat(fd.get("avg_daily_usage_hours")),
      daily_unlocks: fd.get("daily_unlocks") === "" ? NaN : parseInt(fd.get("daily_unlocks"), 10),
      study_hours: fd.get("study_hours") === "" ? NaN : parseFloat(fd.get("study_hours")),
      physical_activity_hours: fd.get("physical_activity_hours") === "" ? NaN : parseFloat(fd.get("physical_activity_hours")),
      sleep_hours_per_night: fd.get("sleep_hours_per_night") === "" ? NaN : parseFloat(fd.get("sleep_hours_per_night")),
      stress_level: fd.get("stress_level") || "",
    };
  }

  // ---------------------------------------------------------
  // UI state switching
  // ---------------------------------------------------------
  function showState(name) {
    [stateIdle, stateLoading, stateResult, stateError].forEach((el) => (el.hidden = true));
    ({ idle: stateIdle, loading: stateLoading, result: stateResult, error: stateError }[name]).hidden = false;
  }

  function setSubmitting(isSubmitting) {
    submitBtn.disabled = isSubmitting;
    submitBtn.classList.toggle("loading", isSubmitting);
  }

  function bandFor(score) {
    if (score < 4) {
      return {
        label: "Signal: strained",
        context: "Your responses suggest elevated strain right now. Small shifts in sleep or screen time can go a long way.",
      };
    }
    if (score < 7) {
      return {
        label: "Signal: balanced",
        context: "Your rhythm looks fairly steady, with some room to recover and reset.",
      };
    }
    return {
      label: "Signal: strong",
      context: "Your habits point to a well-supported, resilient baseline. Keep it up.",
    };
  }

  function renderResult(score) {
    const clamped = Math.max(0, Math.min(10, score));
    const { label, context } = bandFor(clamped);

    scoreNumberEl.textContent = score.toFixed(2);
    scoreBandEl.textContent = label;
    scoreContextEl.textContent = context;

    // reset then animate the arc fill on next frame
    gaugeFill.style.transition = "none";
    gaugeFill.style.strokeDashoffset = String(GAUGE_ARC_LENGTH);
    requestAnimationFrame(() => {
      gaugeFill.style.transition = "";
      const offset = GAUGE_ARC_LENGTH * (1 - clamped / 10);
      gaugeFill.style.strokeDashoffset = String(offset);
    });

    showState("result");
  }

  function renderError(label, copy) {
    errorLabelEl.textContent = label;
    errorCopyEl.textContent = copy;
    showState("error");
  }

  // ---------------------------------------------------------
  // Parse FastAPI / Pydantic 422 error responses into
  // field-level messages where possible
  // ---------------------------------------------------------
  function applyServerValidationErrors(detail) {
    if (!Array.isArray(detail)) return false;
    let matched = false;
    detail.forEach((err) => {
      const field = Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : null;
      const input = field ? document.getElementById(field) : null;
      const target = field === "stress_level" ? stressHiddenInput : input;
      if (target) {
        setFieldError(target, err.msg || "Invalid value.");
        matched = true;
      }
    });
    return matched;
  }

  // ---------------------------------------------------------
  // Submit handler
  // ---------------------------------------------------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAllErrors();

    const payload = collectPayload();
    const clientErrors = validate(payload);

    if (clientErrors.length > 0) {
      clientErrors.forEach(([input, msg]) => input && setFieldError(input, msg));
      clientErrors[0][0]?.focus?.();
      return;
    }

    setSubmitting(true);
    showState("loading");

    // Free hosting can take up to a minute to wake up, so wait up to 90 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (res.status === 422) {
        const body = await res.json().catch(() => null);
        const matched = body && applyServerValidationErrors(body.detail);
        renderError(
          "Check your inputs",
          matched
            ? "The API rejected a few fields. Details are marked on the form."
            : "The API rejected this submission. Please review your inputs and try again."
        );
        return;
      }

      if (!res.ok) {
        let detailMsg = `The API responded with status ${res.status}.`;
        const body = await res.json().catch(() => null);
        if (body && typeof body.detail === "string") detailMsg = body.detail;
        renderError("Prediction failed", detailMsg);
        return;
      }

      const data = await res.json();
      if (typeof data.predicted_mental_health_score !== "number") {
        renderError("Unexpected response", "The API responded, but the score was missing or malformed.");
        return;
      }

      renderResult(data.predicted_mental_health_score);
    } catch (err) {
      renderError(
        "Can't reach the server",
        isLocalDev
          ? "Could not connect to your local server. Make sure it is running (uvicorn main:app --reload) and try again."
          : "The server may be waking up (free hosting sleeps when idle). Wait about a minute and try again."
      );
    } finally {
      clearTimeout(timeoutId);
      setSubmitting(false);
    }
  });

  // live-clear errors as the user edits
  form.querySelectorAll("input, select").forEach((el) => {
    el.addEventListener("input", () => clearFieldError(el));
    el.addEventListener("change", () => clearFieldError(el));
  });

  resetBtn.addEventListener("click", () => {
    showState("idle");
  });

  errorRetryBtn.addEventListener("click", () => {
    showState("idle");
  });
})();
>>>>>>> fa09bc8 (Serve static site from root, add Dockerfile)
