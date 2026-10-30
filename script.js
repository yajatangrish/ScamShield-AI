
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

  /* THREE.JS HERO SHIELD */

  function initializeHeroShield() {
    const heroArt = document.getElementById("heroArt");
    const canvas = document.getElementById("heroCanvas");

    if (!heroArt || !canvas || !window.THREE) return;

    try {
      const THREE = window.THREE;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
      camera.position.z = 5.8;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      if ("outputColorSpace" in renderer) {
        renderer.outputColorSpace = THREE.SRGBColorSpace;
      } else {
        renderer.outputEncoding = THREE.sRGBEncoding;
      }
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.82;

      const resizeRenderer = () => {
        const bounds = heroArt.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        renderer.setSize(bounds.width, bounds.height, false);
        camera.aspect = bounds.width / bounds.height;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      };

      scene.add(new THREE.AmbientLight(0xd9e8ff, 0.34));

      const keyLight = new THREE.DirectionalLight(0xe4efff, 1.55);
      keyLight.position.set(-3, 4, 5);
      scene.add(keyLight);

      const rimLight = new THREE.PointLight(0x75a9ef, 8, 12);
      rimLight.position.set(3, -1, 3);
      scene.add(rimLight);

      const shieldShape = new THREE.Shape();
      shieldShape.moveTo(-0.76, 1.08);
      shieldShape.quadraticCurveTo(-0.88, 1.08, -0.88, 0.94);
      shieldShape.lineTo(-0.78, 0.1);
      shieldShape.quadraticCurveTo(-0.7, -0.63, 0, -1.08);
      shieldShape.quadraticCurveTo(0.7, -0.63, 0.78, 0.1);
      shieldShape.lineTo(0.88, 0.94);
      shieldShape.quadraticCurveTo(0.88, 1.08, 0.76, 1.08);
      shieldShape.closePath();

      const shieldGroup = new THREE.Group();
      shieldGroup.scale.y = 0.82;
      const shieldGeometry = new THREE.ExtrudeGeometry(shieldShape, {
        depth: 0.24,
        bevelEnabled: true,
        bevelSegments: 8,
        steps: 1,
        bevelSize: 0.11,
        bevelThickness: 0.1,
        curveSegments: 16
      });
      shieldGeometry.center();

      const outerShield = new THREE.Mesh(
        shieldGeometry.clone(),
        new THREE.MeshPhysicalMaterial({
          color: 0x050b16,
          metalness: 0.48,
          roughness: 0.3,
          clearcoat: 0.55,
          clearcoatRoughness: 0.24
        })
      );
      outerShield.scale.set(1.065, 1.055, 1);
      outerShield.position.z = -0.16;
      shieldGroup.add(outerShield);

      const shield = new THREE.Mesh(
        shieldGeometry,
        new THREE.MeshPhysicalMaterial({
          color: 0x031126,
          metalness: 0.68,
          roughness: 0.24,
          clearcoat: 0.95,
          clearcoatRoughness: 0.16
        })
      );
      shieldGroup.add(shield);

      const insetGeometry = new THREE.ExtrudeGeometry(shieldShape, {
        depth: 0.045,
        bevelEnabled: true,
        bevelSegments: 5,
        bevelSize: 0.045,
        bevelThickness: 0.035,
        curveSegments: 16
      });
      insetGeometry.scale(0.72, 0.72, 0.72);
      insetGeometry.center();

      const inset = new THREE.Mesh(
        insetGeometry,
        new THREE.MeshPhysicalMaterial({
          color: 0x030d1d,
          metalness: 0.55,
          roughness: 0.26,
          clearcoat: 0.85,
          clearcoatRoughness: 0.2
        })
      );
      inset.position.z = 0.16;
      shieldGroup.add(inset);

      const check = new THREE.Group();
      const checkMaterial = new THREE.MeshStandardMaterial({
        color: 0xf6f9ff,
        roughness: 0.24,
        metalness: 0.18,
        emissive: 0x12243a,
        emissiveIntensity: 0.08
      });
      const checkPoints = [
        new THREE.Vector3(-0.4, 0.015, 0.36),
        new THREE.Vector3(-0.12, -0.27, 0.36),
        new THREE.Vector3(0.4, 0.28, 0.36)
      ];
      const checkRadius = 0.048;

      for (let index = 0; index < checkPoints.length - 1; index += 1) {
        const start = checkPoints[index];
        const end = checkPoints[index + 1];
        const direction = new THREE.Vector3().subVectors(end, start);
        const segment = new THREE.Mesh(
          new THREE.CylinderGeometry(
            checkRadius,
            checkRadius,
            direction.length(),
            12
          ),
          checkMaterial
        );
        segment.position.copy(start).add(end).multiplyScalar(0.5);
        segment.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction.normalize()
        );
        check.add(segment);
      }

      checkPoints.forEach((point) => {
        const joint = new THREE.Mesh(
          new THREE.SphereGeometry(checkRadius, 12, 8),
          checkMaterial
        );
        joint.position.copy(point);
        check.add(joint);
      });
      check.scale.set(0.84, 0.84, 0.84);
      shieldGroup.add(check);
      scene.add(shieldGroup);

      const orbit = new THREE.Mesh(
        new THREE.TorusGeometry(1.55, 0.009, 8, 140),
        new THREE.MeshBasicMaterial({
          color: 0x416b9e,
          transparent: true,
          opacity: 0.58
        })
      );
      orbit.rotation.set(1.03, 0.28, -0.22);
      scene.add(orbit);

      const orbitAccent = new THREE.Mesh(
        new THREE.TorusGeometry(1.82, 0.006, 6, 140),
        new THREE.MeshBasicMaterial({
          color: 0x83a9d2,
          transparent: true,
          opacity: 0.34
        })
      );
      orbitAccent.rotation.set(0.84, -0.48, 0.35);
      scene.add(orbitAccent);

      const particlePositions = [];
      for (let index = 0; index < 110; index += 1) {
        const radius = 1.65 + Math.random() * 0.75;
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 3.8;
        particlePositions.push(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius * 0.45
        );
      }

      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(particlePositions, 3)
      );
      const particles = new THREE.Points(
        particleGeometry,
        new THREE.PointsMaterial({
          color: 0x8db8eb,
          size: 0.025,
          transparent: true,
          opacity: 0.72,
          sizeAttenuation: true
        })
      );
      scene.add(particles);

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const clock = new THREE.Clock();
      let isVisible = true;
      let animationFrame = 0;
      let pointerX = 0;
      let pointerY = 0;

      const animate = () => {
        if (!isVisible || document.hidden) {
          animationFrame = 0;
          return;
        }

        const elapsed = clock.getElapsedTime();
        shieldGroup.rotation.y +=
          ((pointerX * 0.35 + Math.sin(elapsed * 0.55) * 0.16) -
            shieldGroup.rotation.y) * 0.035;
        shieldGroup.rotation.x +=
          ((pointerY * 0.2 + Math.sin(elapsed * 0.8) * 0.045) -
            shieldGroup.rotation.x) * 0.035;
        shieldGroup.position.y = Math.sin(elapsed * 0.9) * 0.09;
        orbit.rotation.z += 0.0015;
        orbitAccent.rotation.z -= 0.001;
        particles.rotation.y += 0.0008;

        renderer.render(scene, camera);
        animationFrame = window.requestAnimationFrame(animate);
      };

      const startAnimation = () => {
        if (!reducedMotion && isVisible && !document.hidden && !animationFrame) {
          animationFrame = window.requestAnimationFrame(animate);
        }
      };

      const observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          resizeRenderer();
          startAnimation();
        } else if (animationFrame) {
          window.cancelAnimationFrame(animationFrame);
          animationFrame = 0;
        }
      });
      observer.observe(heroArt);

      heroArt.addEventListener("pointermove", (event) => {
        const bounds = heroArt.getBoundingClientRect();
        pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
        pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      });
      heroArt.addEventListener("pointerleave", () => {
        pointerX = 0;
        pointerY = 0;
      });
      document.addEventListener("visibilitychange", startAnimation);
      window.addEventListener("resize", resizeRenderer);

      resizeRenderer();
      heroArt.classList.add("has-three");
      startAnimation();
    } catch (error) {
      console.warn("The animated hero illustration could not be initialized.", error);
    }
  }

  // ===== LIGHT / DARK MODE =====
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const themeLabel = document.getElementById("themeLabel");

  function applyTheme(theme) {
    const isDark = theme === "dark";

    document.body.classList.toggle("dark-mode", isDark);

    if (themeIcon) {
      themeIcon.innerHTML = isDark
        ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
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
      menuToggle.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
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
/* MESSAGE ANALYSIS */

const analysisRules = [
  {
    key: "task_deposit",
    label: "Payment or deposit to unlock tasks/earnings",
    weight: 4,
    reason: "The message appears to ask for money, a recharge, or a deposit before tasks or earnings can be accessed.",
    patterns: [
      /\b(?:deposit|recharge|top\s*up|top-up)\b.{0,55}\b(?:unlock|activate|release|start)\b.{0,35}\b(?:tasks?|earning|withdraw(?:al)?|account)\b/i,
      /\b(?:unlock|activate|release)\b.{0,35}\b(?:tasks?|earning|withdraw(?:al)?|account)\b.{0,55}\b(?:deposit|recharge|top\s*up|top-up)\b/i,
      /\bpay\b.{0,30}\b(?:to\s+)?(?:unlock|activate|release)\b.{0,35}\b(?:tasks?|earning|withdraw(?:al)?|account)\b/i,
      /\bpay\b.{0,30}\bto\s+withdraw\b.{0,25}\b(?:earnings?|balance|money)\b/i
    ]
  },
  {
    key: "upfront_payment",
    label: "Upfront job/registration fee request",
    weight: 3,
    reason: "The message mentions a fee, charge, or deposit connected with applying for or starting a job.",
    patterns: [
      /\b(?:registration|application|processing|training|security|joining|activation|verification)\s+(?:fee|fees|charge|charges|payment|deposit)\b/i,
      /\bpay\b.{0,25}\b(?:registration|application|processing|training|security|joining|activation)\s+(?:fee|charge|amount)\b/i,
      /\b(?:refundable|non[- ]refundable)\s+(?:deposit|fee)\b/i
    ]
  },
  {
    key: "sensitive_information",
    label: "Request for sensitive credentials or financial details",
    weight: 4,
    reason: "The message appears to request an OTP, password, UPI PIN, CVV, or similar credential.",
    patterns: [
      /\b(?:share|send|provide|tell|give|reveal)\s+(?:(?:us|me)\s+|to\s+(?:us|me)\s+)?(?:your\s+)?(?:otp|one[- ]time password|upi\s*pin|password|cvv|card\s+pin)\b/i,
      /\b(?:otp|one[- ]time password|upi\s*pin|cvv|card\s+pin)\b.{0,30}\b(?:send|share|tell|provide)\b/i
    ]
  },
  {
    key: "unrealistic_earnings",
    label: "Unusually attractive or guaranteed earnings claim",
    weight: 2,
    reason: "The message makes a high or guaranteed earnings claim that should be independently checked.",
    patterns: [
      /\b(?:earn|make|get)\s+(?:up\s+to\s+)?(?:₹|rs\.?\s*|inr\s*)\s*[\d,]+\s*(?:per\s+day|a\s+day|\/\s*day|daily)\b/i,
      /\b(?:guaranteed|fixed|assured)\s+(?:high\s+)?(?:income|earnings|salary|profit)\b/i,
      /\b(?:no\s+experience|without\s+experience)\b.{0,45}\b(?:huge|unlimited|easy|high)\s+(?:income|earnings|salary)\b/i
    ]
  },
  {
    key: "urgency_pressure",
    label: "Pressure to act or pay immediately",
    weight: 1,
    reason: "The message uses a time pressure or last-chance statement that may discourage careful verification.",
    patterns: [
      /\b(?:pay|transfer|send|respond|act|register|apply)\b.{0,30}\b(?:immediately|right now|within\s+(?:the\s+)?next\s+\d+\s*(?:minutes?|hours?)|today only)\b/i,
      /\b(?:limited time|last chance|only a few minutes|offer expires today)\b/i
    ]
  }
];

function isNegatedCredentialRequest(text, matchStart) {
  const prefix = text.slice(Math.max(0, matchStart - 55), matchStart);
  return /\b(?:do\s+not|don't|never|avoid|must\s+not|should\s+not)\s+(?:ever\s+)?$/.test(prefix);
}

function analyseMessageLocally(message) {
  const normalized = message.normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();
  const detected = [];

  analysisRules.forEach((rule) => {
    for (const pattern of rule.patterns) {
      const match = pattern.exec(normalized);
      if (!match) continue;
      if (
        rule.key === "sensitive_information" &&
        isNegatedCredentialRequest(normalized, match.index)
      ) {
        continue;
      }

      detected.push({
        key: rule.key,
        label: rule.label,
        weight: rule.weight,
        reason: rule.reason,
        matched_text: match[0].slice(0, 140)
      });
      break;
    }
  });

  const score = detected.reduce((total, item) => total + item.weight, 0);
  const riskLevel = score >= 6 ? "High" : score >= 3 ? "Medium" : "Low";
  const explanation = detected.length
    ? `The message contains these warning indicators: ${detected.map((item) => item.label).join("; ")}.`
    : "No warning patterns from the current prototype rules were detected in this text.";
  const keys = new Set(detected.map((item) => item.key));
  const recommendations = [];

  if (keys.has("task_deposit") || keys.has("upfront_payment")) {
    recommendations.push("Do not pay a registration fee or deposit until the employer and offer have been independently verified.");
  }
  if (keys.has("sensitive_information")) {
    recommendations.push("Never share an OTP, password, UPI PIN, CVV, or card PIN with a recruiter or unknown contact.");
  }
  if (keys.has("unrealistic_earnings")) {
    recommendations.push("Check the pay, duties, and employment terms through independently found official company contact details.");
  }
  if (keys.has("urgency_pressure")) {
    recommendations.push("Pause and verify the offer independently instead of responding under time pressure.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Verify the employer, job description, contact details, and payment terms through independently found official sources.");
  }

  const titles = {
    High: "High concern — review carefully",
    Medium: "Potential warning signs found",
    Low: "Few known warning signs detected"
  };
  const assessmentNote = detected.length
    ? "This is a screening estimate, not proof that the offer is fraudulent."
    : "No matched warning pattern does not mean the offer is genuine or safe. The text may not contain enough information to assess it.";
  const riskMap = { High: "high", Medium: "medium", Low: "low" };

  return {
    risk: riskMap[riskLevel],
    title: titles[riskLevel],
    summary: `${explanation} ${assessmentNote} Risk points: ${score}.`,
    warnings: detected.map((item) => item.label),
    recommendations,
    highlightedPhrases: detected.map((item) => item.matched_text)
  };
}

async function analyseMessage(message) {
  if (window.location.protocol === "file:" || window.location.port !== "5000") {
    return analyseMessageLocally(message);
  }

  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Analysis failed.");
  }

  const riskMap = { High: "high", Medium: "medium", Low: "low" };
  const titleMap = {
    High: "High concern — review carefully",
    Medium: "Potential warning signs found",
    Low: "Few known warning signs detected"
  };

  return {
    risk: riskMap[data.risk_level] || "uncertain",
    title: titleMap[data.risk_level] || "More information needed",
    summary: `${data.explanation} ${data.assessment_note} Risk points: ${data.score}.`,
    warnings: data.signals || [],
    recommendations: data.recommendation ? [data.recommendation] : [],
    highlightedPhrases: (data.evidence || [])
      .map((item) => item.matched_text)
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
