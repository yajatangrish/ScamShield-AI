
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

  /* DEMO SCAM CHECKS */

  const indicators = [
    {
      name: "Upfront payment request",
      phrases: [
        "registration fee",
        "pay a fee",
        "upfront payment",
        "security deposit",
        "processing fee",
        "pay to start",
        "pay first",
        "training fee",
        "deposit money"
      ],
      warning:
        "The message asks for an upfront payment or fee.",
      advice:
        "Do not pay to secure a job. Verify the employer independently."
    },
    {
      name: "Unrealistic income promise",
      phrases: [
        "earn ₹",
        "earn rs",
        "guaranteed income",
        "easy money",
        "earn daily",
        "no experience required",
        "work 1 hour",
        "high income",
        "make money fast",
        "get rich"
      ],
      warning:
        "The message may promise unusually high earnings or easy money.",
      advice:
        "Check whether the pay, duties, and experience requirements are realistic."
    },
    {
      name: "Urgency or pressure",
      phrases: [
        "act now",
        "limited time",
        "immediately",
        "urgent",
        "last chance",
        "offer expires",
        "within 24 hours",
        "hurry",
        "right now"
      ],
      warning:
        "The message uses urgency or pressure to encourage a quick decision.",
      advice:
        "Take your time. A legitimate opportunity should allow reasonable verification."
    },
    {
      name: "Sensitive information request",
      phrases: [
        "share your otp",
        "send otp",
        "password",
        "bank details",
        "card number",
        "upi pin",
        "banking pin",
        "verification code",
        "aadhaar number",
        "pan card details"
      ],
      warning:
        "The message may request sensitive personal, banking, or account information.",
      advice:
        "Never share an OTP, password, UPI PIN, or banking credentials."
    },
    {
      name: "Suspicious link or contact",
      phrases: [
        "click this link",
        "click the link",
        "unknown link",
        "telegram me",
        "whatsapp me",
        "contact on telegram",
        "download this app",
        "install this app"
      ],
      warning:
        "The message directs you to an external link, app, or informal contact channel.",
      advice:
        "Avoid unknown links and verify the contact through the company's official website."
    },
    {
      name: "Unverified job offer",
      phrases: [
        "you are selected",
        "selected without interview",
        "job confirmed",
        "instant hiring",
        "no interview needed",
        "congratulations you won",
        "you have won"
      ],
      warning:
        "The message may offer a job or reward without a clear verification process.",
      advice:
        "Confirm the job opening and recruitment process through official company channels."
    }
  ];

  function analyseMessage(message) {
    const normalized = message.toLowerCase();
    const matchedIndicators = [];
    const warnings = [];
    const recommendations = [];
    const highlightedPhrases = [];

    indicators.forEach((indicator) => {
      const matchedPhrases = indicator.phrases.filter((phrase) =>
        normalized.includes(phrase)
      );

      if (matchedPhrases.length > 0) {
        matchedIndicators.push(indicator.name);
        warnings.push(indicator.warning);
        recommendations.push(indicator.advice);

        matchedPhrases.forEach((phrase) => {
          if (!highlightedPhrases.includes(phrase)) {
            highlightedPhrases.push(phrase);
          }
        });
      }
    });

    const hasMoneyOrCredentialRisk =
      matchedIndicators.includes("Upfront payment request") ||
      matchedIndicators.includes("Sensitive information request");

    let risk = "uncertain";
    let title = "More information needed";
    let summary =
      "The demo did not find enough of its known warning phrases to make a useful assessment. This does not mean the message is safe.";

    if (hasMoneyOrCredentialRisk || matchedIndicators.length >= 3) {
      risk = "high";
      title = "High concern — review carefully";
      summary =
        "Several concerning indicators were found. Do not pay, share sensitive details, or follow suspicious instructions until you have verified the offer.";
    } else if (matchedIndicators.length >= 1) {
      risk = "medium";
      title = "Potential warning signs found";
      summary =
        "The message contains one or more phrases associated with common scam tactics. Review the findings and verify the sender independently.";
    } else if (message.trim().length >= 80) {
      risk = "low";
      title = "Few known warning signs detected";
      summary =
        "The demo did not match its limited list of common warning phrases. This is not proof that the message is legitimate or safe.";
    }

    return {
      risk,
      title,
      summary,
      warnings,
      recommendations,
      highlightedPhrases
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

  let scanTimeout = null;

  if (analyzeBtn && messageInput) {
    analyzeBtn.addEventListener("click", () => {
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
        showError(
          "Please enter a little more text (at least 20 characters) for this demo review."
        );
        messageInput.focus();
        return;
      }

      if (scanTimeout) {
        clearTimeout(scanTimeout);
      }

      resultsPanel.hidden = true;
      scanLoading.hidden = false;
      analyzeBtn.disabled = true;
      analyzeBtn.textContent = "Analyzing...";

      scanTimeout = setTimeout(() => {
        try {
          const result = analyseMessage(message);
          scanLoading.hidden = true;
          displayResults(result);
        } catch (error) {
          console.error("Scanner error:", error);
          showError("Something went wrong. Please try again.");
        } finally {
          analyzeBtn.disabled = false;
          analyzeBtn.textContent = "Analyze Message ↗";
          scanTimeout = null;
        }
      }, 850);
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
