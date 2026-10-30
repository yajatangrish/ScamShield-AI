
/* =========================================
   SCAMSHIELD AI
   Interactive features and demo scanner
   Note: This is a local rule-based demo,
   not a real AI detection service.
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const messageInput = document.getElementById("messageInput");
  const charCount = document.getElementById("charCount");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const sampleBtn = document.getElementById("sampleBtn");
  const clearBtn = document.getElementById("clearBtn");
  const scannerError = document.getElementById("scannerError");
  const scanLoading = document.getElementById("scanLoading");
  const resultsPanel = document.getElementById("resultsPanel");
  const resultTitle = document.getElementById("resultTitle");
  const riskBadge = document.getElementById("riskBadge");
  const resultSummary = document.getElementById("resultSummary");
  const warningList = document.getElementById("warningList");
  const recommendationList = document.getElementById("recommendationList");


  
  // ===== LIGHT / DARK MODE =====
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const themeLabel = document.getElementById("themeLabel");

  function applyTheme(theme) {
    const isDark = theme === "dark";

    document.body.classList.toggle("dark-mode", isDark);

    if (themeIcon) {
      themeIcon.textContent = isDark ? "☀️" : "🌙";
    }

    if (themeLabel) {
      themeLabel.textContent = isDark ? "Light mode" : "Dark mode";
    }

    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
      );
    }
  }

  let savedTheme = "light";

  try {
    savedTheme = localStorage.getItem("scamshield-theme") || "light";
  } catch (error) {
    console.warn("Theme preference could not be loaded.");
  }

  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = document.body.classList.contains("dark-mode")
        ? "light"
        : "dark";

      applyTheme(nextTheme);

      try {
        localStorage.setItem("scamshield-theme", nextTheme);
      } catch (error) {
        console.warn("Theme preference could not be saved.");
      }
    });
  }


  /* MOBILE NAVIGATION */

  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.textContent = isOpen ? "✕" : "☰";
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
      }
    });
  }

  /* CHARACTER COUNTER */

  function updateCharacterCount() {
    if (messageInput && charCount) {
      charCount.textContent =
        `${messageInput.value.length} / 5000 characters`;
    }
  }

  if (messageInput) {
    messageInput.addEventListener("input", () => {
      updateCharacterCount();
      hideError();
    });
  }

  updateCharacterCount();

  /* ERROR AND RESULT HELPERS */

  function hideError() {
    if (!scannerError) return;
    scannerError.textContent = "";
    scannerError.hidden = true;
  }

  function showError(message) {
    if (!scannerError) return;
    scannerError.textContent = message;
    scannerError.hidden = false;
  }

  function hideResults() {
    if (resultsPanel) resultsPanel.hidden = true;
    if (scanLoading) scanLoading.hidden = true;
  }

  function addListItem(list, message) {
    const item = document.createElement("li");
    item.textContent = message;
    list.appendChild(item);
  }

  function showList(list, items, fallback) {
    list.replaceChildren();

    if (items.length === 0) {
      addListItem(list, fallback);
      return;
    }

    items.forEach((item) => addListItem(list, item));
  }
/* PYTHON BACKEND CONNECTION */

async function analyseMessage(message) {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: message })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Analysis failed.");
  }

  const riskMap = {
    High: "high",
    Medium: "medium",
    Low: "low"
  };

  const titleMap = {
    High: "High concern — review carefully",
    Medium: "Potential warning signs found",
    Low: "Few known warning signs detected"
  };

  return {
    risk: riskMap[data.risk_level] || "uncertain",
    title: titleMap[data.risk_level] || "More information needed",
    summary:
      `${data.explanation} ${data.assessment_note} Risk points: ${data.score}.`,
    warnings: data.signals || [],
    recommendations: data.recommendation
      ? [data.recommendation]
      : [],
    highlightedPhrases: (data.evidence || [])
      .map(item => item.matched_text)
      .filter(Boolean)
  };
}

  /* DISPLAY RESULTS */

  function displayResults(result) {
    if (
      !resultsPanel ||
      !resultTitle ||
      !riskBadge ||
      !resultSummary ||
      !warningList ||
      !recommendationList
    ) {
      showError("Some scanner elements are missing from index.html.");
      return;
    }

    resultTitle.textContent = result.title;
    riskBadge.className = `risk-badge ${result.risk}`;

    const labels = {
      high: "High concern",
      medium: "Medium concern",
      low: "Lower concern",
      uncertain: "Insufficient information"
    };

    riskBadge.textContent = labels[result.risk];
    resultSummary.textContent = result.summary;

    showList(
      warningList,
      result.warnings,
      "No phrases from the demo's warning list were detected."
    );

    showList(
      recommendationList,
      result.recommendations,
      "Verify the employer, role, and contact details independently before taking action."
    );

    if (result.highlightedPhrases.length > 0) {
    // Remove matched phrases from the previous scan
    const resultBlock = warningList.parentElement;

    resultBlock
      .querySelectorAll(".matched-phrases-heading, .matched-phrases")
      .forEach((element) => element.remove());

    if (result.highlightedPhrases.length > 0) {
      const heading = document.createElement("h4");
      heading.className = "matched-phrases-heading";
      heading.textContent = "Matched phrases";

      const phraseContainer = document.createElement("div");
      phraseContainer.className = "matched-phrases";

      result.highlightedPhrases.forEach((phrase) => {
        const tag = document.createElement("span");
        tag.className = "matched-phrase";
        tag.textContent = phrase;
        phraseContainer.appendChild(tag);
      });

      resultBlock.appendChild(heading);
      resultBlock.appendChild(phraseContainer);
    }
}

    resultsPanel.hidden = false;
  }

 /* ANALYZE BUTTON */

if (analyzeBtn && messageInput) {
  analyzeBtn.addEventListener("click", async () => {
    const message = messageInput.value.trim();

    hideError();

    if (!message) {
      hideResults();
      showError("Please paste a message before starting the scan.");
      messageInput.focus();
      return;
    }

    if (message.length < 20) {
      hideResults();
      showError("Please enter at least 20 characters.");
      messageInput.focus();
      return;
    }

    resultsPanel.hidden = true;
    scanLoading.hidden = false;
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing...";

    try {
      const result = await analyseMessage(message);
      scanLoading.hidden = true;
      displayResults(result);
    } catch (error) {
      console.error("Scanner error:", error);
      showError(error.message || "Something went wrong.");
    } finally {
      scanLoading.hidden = true;
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = "Analyze Message ↗";
    }
  });
}
  /* SAMPLE MESSAGE BUTTON */

  if (sampleBtn && messageInput) {
    sampleBtn.addEventListener("click", () => {
      messageInput.value =
        "Congratulations! You have been selected for a remote job. " +
        "Earn ₹8000 daily with no experience required. " +
        "Pay a registration fee immediately to secure your position. " +
        "Limited time offer!";

      updateCharacterCount();
      hideError();
      hideResults();
      messageInput.focus();
    });
  }

  /* CLEAR BUTTON */

  if (clearBtn && messageInput) {
    clearBtn.addEventListener("click", () => {
      if (scanTimeout) {
        clearTimeout(scanTimeout);
        scanTimeout = null;
      }

      messageInput.value = "";
      updateCharacterCount();
      hideError();
      hideResults();

      if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "Analyze Message ↗";
      }

      messageInput.focus();
    });
  }

  /* SAFETY CHECKLIST PROGRESS */

  const checklist = document.getElementById("checklist");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");

  function updateChecklistProgress() {
    if (!checklist || !progressBar || !progressText) return;

    const boxes = Array.from(
      checklist.querySelectorAll('input[type="checkbox"]')
    );

    const completed = boxes.filter((box) => box.checked).length;
    const total = boxes.length;
    const percentage = total === 0 ? 0 : (completed / total) * 100;

    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${completed} of ${total} completed`;
  }

  if (checklist) {
    checklist.querySelectorAll('input[type="checkbox"]').forEach((box) => {
      box.addEventListener("change", updateChecklistProgress);
    });

    updateChecklistProgress();
  }

  /* INITIAL STATE */

  hideError();

  console.log(
    "ScamShield AI ready — local educational demo mode enabled."
  );
});
