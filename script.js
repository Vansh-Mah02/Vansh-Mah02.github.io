/* =====================================================
   Netflix Clone — script.js
   Covers:
   1. Email validation (hero + bottom CTA)
   2. Sticky / scroll-aware header
   3. FAQ accordion with smooth animation
   4. Top-10 row — keyboard / arrow-button navigation
   5. Language switcher (header + footer)
   6. Card entrance animations (Intersection Observer)
   7. Toast notification system
   8. Scroll-to-top button
   9. Hero background subtle parallax
  10. Top-10 item hover ripple effect
===================================================== */

(function () {
  "use strict";

  /* ─────────────────────────────────────────────────
     UTILITY HELPERS
  ───────────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  /* ─────────────────────────────────────────────────
     1. TOAST NOTIFICATION SYSTEM
  ───────────────────────────────────────────────── */
  function createToastContainer() {
    const existing = $("#toast-container");
    if (existing) return existing;

    const container = document.createElement("div");
    container.id = "toast-container";
    Object.assign(container.style, {
      position: "fixed",
      top: "80px",
      right: "20px",
      zIndex: "9999",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      pointerEvents: "none",
    });
    document.body.appendChild(container);
    return container;
  }

  function showToast(message, type = "success", duration = 3500) {
    const container = createToastContainer();

    const toast = document.createElement("div");
    const colors = {
      success: { bg: "#e50914", icon: "✓" },
      error: { bg: "#b00020", icon: "✕" },
      info: { bg: "#1a1a2e", icon: "ℹ" },
    };
    const { bg, icon } = colors[type] || colors.info;

    Object.assign(toast.style, {
      background: bg,
      color: "#fff",
      padding: "14px 20px",
      borderRadius: "6px",
      fontSize: "0.95rem",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
      opacity: "0",
      transform: "translateX(40px)",
      transition: "opacity 0.3s ease, transform 0.3s ease",
      pointerEvents: "auto",
      minWidth: "260px",
      maxWidth: "340px",
    });

    toast.innerHTML = `<span style="font-size:1.1rem;font-weight:700">${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(0)";
      });
    });

    // Animate out & remove
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(40px)";
      setTimeout(() => toast.remove(), 350);
    }, duration);
  }

  /* ─────────────────────────────────────────────────
     2. EMAIL VALIDATION — HERO & BOTTOM CTA
  ───────────────────────────────────────────────── */
  function addEmailValidation(inputEl, buttonEl) {
    if (!inputEl || !buttonEl) return;

    // Visual error state helper
    function setError(msg) {
      inputEl.style.border = "2px solid #e50914";
      inputEl.style.outline = "none";
      showToast(msg, "error");
    }
    function clearError() {
      inputEl.style.border = "";
    }

    inputEl.addEventListener("input", clearError);

    buttonEl.addEventListener("click", function (e) {
      e.preventDefault();
      const val = inputEl.value.trim();

      if (!val) {
        setError("Please enter your email address.");
        inputEl.focus();
        return;
      }
      if (!isValidEmail(val)) {
        setError("Please enter a valid email address.");
        inputEl.focus();
        return;
      }

      // Simulate redirect to sign-up with email pre-filled
      clearError();
      showToast("Redirecting to Netflix sign-up…", "success");
      setTimeout(() => {
        const encoded = encodeURIComponent(val);
        window.location.href = `https://www.netflix.com/in/signup?email=${encoded}`;
      }, 1200);
    });

    // Also trigger on Enter key
    inputEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter") buttonEl.click();
    });
  }

  // Hero email box
  const heroInput = $(".email-box input[type='email']");
  const heroBtn = $(".email-box .GS");
  addEmailValidation(heroInput, heroBtn);

  // Bottom CTA email box
  const ctaInput = $(".em-btn");
  const ctaBtn = $(".GS-btn");
  addEmailValidation(ctaInput, ctaBtn);

  /* ─────────────────────────────────────────────────
     3. STICKY / SCROLL-AWARE HEADER
  ───────────────────────────────────────────────── */
  const header = $("header");
  if (header) {
    // Start transparent over hero; solidify on scroll
    let lastScroll = 0;

    function updateHeader() {
      const scrollY = window.scrollY;

      if (scrollY > 10) {
        header.style.background = "rgba(0,0,0,0.95)";
        header.style.backdropFilter = "blur(4px)";
        header.style.boxShadow = "0 2px 20px rgba(0,0,0,0.6)";
        header.style.position = "fixed";
        header.style.top = "0";
      } else {
        header.style.background = "transparent";
        header.style.backdropFilter = "none";
        header.style.boxShadow = "none";
        header.style.position = "absolute";
      }

      // Hide header when scrolling fast downward, show on upward
      if (scrollY > 200) {
        if (scrollY > lastScroll + 8) {
          header.style.transform = "translateY(-100%)";
          header.style.transition = "transform 0.3s ease";
        } else if (scrollY < lastScroll - 4) {
          header.style.transform = "translateY(0)";
          header.style.position = "fixed";
        }
      } else {
        header.style.transform = "translateY(0)";
      }

      lastScroll = scrollY;
    }

    // Ensure smooth transition from the start
    header.style.transition =
      "background 0.4s ease, box-shadow 0.4s ease, transform 0.3s ease";
    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();
  }

  /* ─────────────────────────────────────────────────
     4. FAQ ACCORDION — smooth animation + one-open
  ───────────────────────────────────────────────── */
  const allDetails = $$(".faq details");

  allDetails.forEach((detail) => {
    const summary = $("summary", detail);
    const answer = $(".answer", detail);
    if (!answer) return;

    // Wrap answer content for animation
    answer.style.overflow = "hidden";
    answer.style.transition = "max-height 0.38s ease, padding 0.38s ease";
    answer.style.maxHeight = "0";
    answer.style.padding = "0 22px";

    // Prevent default <details> toggle; handle manually
    summary.addEventListener("click", function (e) {
      e.preventDefault();
      const isOpen = detail.hasAttribute("open");

      // Close all others
      allDetails.forEach((d) => {
        if (d !== detail && d.hasAttribute("open")) {
          const a = $(".answer", d);
          if (a) {
            a.style.maxHeight = "0";
            a.style.padding = "0 22px";
          }
          d.removeAttribute("open");
        }
      });

      if (isOpen) {
        answer.style.maxHeight = "0";
        answer.style.padding = "0 22px";
        setTimeout(() => detail.removeAttribute("open"), 380);
      } else {
        detail.setAttribute("open", "");
        // Measure natural height
        answer.style.maxHeight = answer.scrollHeight + 44 + "px";
        answer.style.padding = "22px";
      }
    });
  });

  /* ─────────────────────────────────────────────────
     5. TOP-10 ROW — Arrow navigation buttons
  ───────────────────────────────────────────────── */
  const top10 = $(".top10");
  if (top10) {
    const section = top10.closest("section") || top10.parentElement;

    // Create left & right arrow buttons
    function createArrow(direction) {
      const btn = document.createElement("button");
      btn.innerHTML = direction === "left" ? "&#8592;" : "&#8594;";
      btn.setAttribute("aria-label", direction === "left" ? "Scroll left" : "Scroll right");
      Object.assign(btn.style, {
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        [direction]: "10px",
        zIndex: "5",
        background: "rgba(0,0,0,0.75)",
        color: "#fff",
        border: "2px solid rgba(255,255,255,0.3)",
        borderRadius: "50%",
        width: "48px",
        height: "48px",
        fontSize: "1.4rem",
        cursor: "pointer",
        transition: "background 0.2s ease, opacity 0.2s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: "1",
        opacity: "0",
      });

      btn.addEventListener("mouseover", () => {
        btn.style.background = "rgba(229,9,20,0.9)";
      });
      btn.addEventListener("mouseout", () => {
        btn.style.background = "rgba(0,0,0,0.75)";
      });

      return btn;
    }

    // Wrap top10 in a relative container so arrows can be positioned
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    top10.parentNode.insertBefore(wrapper, top10);
    wrapper.appendChild(top10);

    const leftArrow = createArrow("left");
    const rightArrow = createArrow("right");
    wrapper.appendChild(leftArrow);
    wrapper.appendChild(rightArrow);

    const SCROLL_AMOUNT = 560;

    leftArrow.addEventListener("click", () => {
      top10.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
    });
    rightArrow.addEventListener("click", () => {
      top10.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
    });

    // Show/hide arrows on hover of the wrapper
    wrapper.addEventListener("mouseenter", () => {
      updateArrowVisibility();
      leftArrow.style.transition = "opacity 0.25s ease, background 0.2s ease";
      rightArrow.style.transition = "opacity 0.25s ease, background 0.2s ease";
    });
    wrapper.addEventListener("mouseleave", () => {
      leftArrow.style.opacity = "0";
      rightArrow.style.opacity = "0";
    });

    function updateArrowVisibility() {
      const atStart = top10.scrollLeft <= 10;
      const atEnd =
        top10.scrollLeft + top10.clientWidth >= top10.scrollWidth - 10;
      leftArrow.style.opacity = atStart ? "0" : "1";
      rightArrow.style.opacity = atEnd ? "0" : "1";
    }

    top10.addEventListener("scroll", updateArrowVisibility, { passive: true });
    updateArrowVisibility();

    // ── Touch / drag-to-scroll on desktop ──
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;

    top10.addEventListener("mousedown", (e) => {
      isDown = true;
      top10.style.cursor = "grabbing";
      startX = e.pageX - top10.offsetLeft;
      scrollStart = top10.scrollLeft;
    });
    ["mouseleave", "mouseup"].forEach((ev) => {
      top10.addEventListener(ev, () => {
        isDown = false;
        top10.style.cursor = "grab";
      });
    });
    top10.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - top10.offsetLeft;
      top10.scrollLeft = scrollStart - (x - startX);
    });
    top10.style.cursor = "grab";
  }

  /* ─────────────────────────────────────────────────
     6. LANGUAGE SWITCHER (sync header ↔ footer)
  ───────────────────────────────────────────────── */
  const langSelects = $$(".trans-btn select");

  const translations = {
    English: {
      h1: "Unlimited movies, shows, and more",
      sub1: "Starts at ₹149. Cancel at any time.",
      sub2: "Ready to watch? Enter your email to create or restart your membership.",
      gsBtn: "Get Started >",
      tn: "Trending Now",
      mr: "More reasons to join",
      hf: "Frequently Asked Questions",
      ready: "Ready to watch? Enter your Email to create or restart your membership.",
      call: "Questions? Call ",
      emailPh: "Email address",
    },
    "हिन्दी": {
      h1: "असीमित फिल्में, शोज़ और भी बहुत कुछ",
      sub1: "₹149 से शुरू। कभी भी रद्द करें।",
      sub2: "देखने के लिए तैयार हैं? सदस्यता बनाने के लिए अपना ईमेल दर्ज करें।",
      gsBtn: "शुरू करें >",
      tn: "अभी ट्रेंडिंग",
      mr: "जुड़ने के और कारण",
      hf: "अक्सर पूछे जाने वाले प्रश्न",
      ready: "देखने के लिए तैयार हैं? अपनी सदस्यता बनाने के लिए ईमेल दर्ज करें।",
      call: "प्रश्न? कॉल करें ",
      emailPh: "ईमेल पता",
    },
  };

  function applyLanguage(lang) {
    const t = translations[lang];
    if (!t) return;

    const h1 = $(".hero-content h1");
    if (h1) h1.textContent = t.h1;

    const heroParagraphs = $$(".hero-content p");
    if (heroParagraphs[0]) heroParagraphs[0].textContent = t.sub1;
    if (heroParagraphs[2]) heroParagraphs[2].textContent = t.sub2;

    $$(".GS").forEach((b) => (b.textContent = t.gsBtn));
    $$(".GS-btn").forEach((b) => (b.textContent = t.gsBtn));

    const tn = $(".TN");
    if (tn) tn.textContent = t.tn;

    const mr = $(".MR");
    if (mr) mr.textContent = t.mr;

    const hf = $(".HF");
    if (hf) hf.textContent = t.hf;

    const ready = $(".ready");
    if (ready) ready.textContent = t.ready;

    $$("input[type='email']").forEach((i) => (i.placeholder = t.emailPh));

    const callEl = $(".call");
    if (callEl) {
      const phoneLink = $(".phn", callEl);
      if (phoneLink) {
        callEl.childNodes[0].textContent = t.call;
      }
    }

    // Sync all selects
    langSelects.forEach((sel) => (sel.value = lang));
  }

  langSelects.forEach((sel) => {
    sel.addEventListener("change", function () {
      applyLanguage(this.value);
    });
  });

  /* ─────────────────────────────────────────────────
     7. CARD ENTRANCE ANIMATIONS (Intersection Observer)
  ───────────────────────────────────────────────── */
  const animatables = $$(".card, .top10-item, .faq details");

  animatables.forEach((el, i) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(28px)";
    el.style.transition = `opacity 0.55s ease ${i * 0.08}s, transform 0.55s ease ${i * 0.08}s`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  animatables.forEach((el) => observer.observe(el));

  /* ─────────────────────────────────────────────────
     8. SCROLL-TO-TOP BUTTON
  ───────────────────────────────────────────────── */
  const scrollBtn = document.createElement("button");
  scrollBtn.innerHTML = "&#8679;";
  scrollBtn.setAttribute("aria-label", "Scroll to top");
  Object.assign(scrollBtn.style, {
    position: "fixed",
    bottom: "30px",
    right: "24px",
    zIndex: "999",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "#e50914",
    color: "#fff",
    border: "none",
    fontSize: "1.6rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: "0",
    transform: "scale(0.7)",
    transition: "opacity 0.3s ease, transform 0.3s ease, background 0.2s ease",
    boxShadow: "0 4px 16px rgba(229,9,20,0.4)",
    lineHeight: "1",
  });
  scrollBtn.addEventListener("mouseover", () => {
    scrollBtn.style.background = "#b00010";
  });
  scrollBtn.addEventListener("mouseout", () => {
    scrollBtn.style.background = "#e50914";
  });
  scrollBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.body.appendChild(scrollBtn);

  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > 500) {
        scrollBtn.style.opacity = "1";
        scrollBtn.style.transform = "scale(1)";
      } else {
        scrollBtn.style.opacity = "0";
        scrollBtn.style.transform = "scale(0.7)";
      }
    },
    { passive: true }
  );

  /* ─────────────────────────────────────────────────
     9. HERO BACKGROUND SUBTLE PARALLAX
  ───────────────────────────────────────────────── */
  const hero = $(".hero");
  if (hero && window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
    window.addEventListener(
      "scroll",
      () => {
        const scrolled = window.scrollY;
        if (scrolled < window.innerHeight) {
          hero.style.backgroundPositionY = `calc(center + ${scrolled * 0.25}px)`;
        }
      },
      { passive: true }
    );
  }

  /* ─────────────────────────────────────────────────
    10. TOP-10 ITEM — Play-icon overlay on hover
  ───────────────────────────────────────────────── */
  $$(".top10-item").forEach((item) => {
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "absolute",
      inset: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.45)",
      borderRadius: "8px",
      opacity: "0",
      transition: "opacity 0.25s ease",
      pointerEvents: "none",
      zIndex: "2",
    });

    const playIcon = document.createElement("div");
    Object.assign(playIcon.style, {
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      border: "3px solid #fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    });
    playIcon.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="white" style="margin-left:4px">
      <polygon points="5,3 19,12 5,21"/>
    </svg>`;

    overlay.appendChild(playIcon);
    item.appendChild(overlay);

    item.addEventListener("mouseenter", () => {
      overlay.style.opacity = "1";
    });
    item.addEventListener("mouseleave", () => {
      overlay.style.opacity = "0";
    });
  });

  /* ─────────────────────────────────────────────────
    11. COOKIE PREFERENCES MODAL (footer link)
  ───────────────────────────────────────────────── */
  const cookieLink = $$("footer a").find(
    (a) => a.textContent.trim() === "Cookie Preferences"
  );

  if (cookieLink) {
    cookieLink.addEventListener("click", function (e) {
      e.preventDefault();

      // Simple modal
      const overlay = document.createElement("div");
      Object.assign(overlay.style, {
        position: "fixed",
        inset: "0",
        background: "rgba(0,0,0,0.75)",
        zIndex: "10000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      });

      const modal = document.createElement("div");
      Object.assign(modal.style, {
        background: "#141414",
        color: "#fff",
        borderRadius: "10px",
        padding: "36px",
        maxWidth: "480px",
        width: "100%",
        fontFamily: "Arial, sans-serif",
        boxShadow: "0 8px 40px rgba(0,0,0,0.8)",
      });

      modal.innerHTML = `
        <h2 style="font-size:1.4rem;margin-bottom:18px">Cookie Preferences</h2>
        <p style="color:#ccc;margin-bottom:24px;line-height:1.6">
          Netflix uses cookies and similar technologies to personalise content,
          improve our services, and provide a better experience. You can manage
          your preferences below.
        </p>
        <label style="display:flex;align-items:center;gap:12px;margin-bottom:14px;cursor:pointer">
          <input type="checkbox" checked disabled style="width:18px;height:18px;accent-color:#e50914">
          <span><strong>Essential Cookies</strong> — Required for the service to work.</span>
        </label>
        <label style="display:flex;align-items:center;gap:12px;margin-bottom:14px;cursor:pointer">
          <input type="checkbox" id="analyticsCookie" checked style="width:18px;height:18px;accent-color:#e50914">
          <span><strong>Analytics Cookies</strong> — Help us improve Netflix.</span>
        </label>
        <label style="display:flex;align-items:center;gap:12px;margin-bottom:28px;cursor:pointer">
          <input type="checkbox" id="adsCookie" style="width:18px;height:18px;accent-color:#e50914">
          <span><strong>Advertising Cookies</strong> — Personalise ads outside Netflix.</span>
        </label>
        <div style="display:flex;gap:12px">
          <button id="saveCookies" style="flex:1;padding:13px;background:#e50914;color:#fff;border:none;border-radius:5px;font-size:1rem;cursor:pointer;font-weight:600">Save Preferences</button>
          <button id="closeCookies" style="flex:1;padding:13px;background:#444;color:#fff;border:none;border-radius:5px;font-size:1rem;cursor:pointer">Cancel</button>
        </div>
      `;

      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      document.body.style.overflow = "hidden";

      function closeModal() {
        overlay.remove();
        document.body.style.overflow = "";
      }

      $("#saveCookies", modal).addEventListener("click", () => {
        closeModal();
        showToast("Cookie preferences saved!", "success");
      });
      $("#closeCookies", modal).addEventListener("click", closeModal);
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal();
      });
      document.addEventListener("keydown", function esc(e) {
        if (e.key === "Escape") {
          closeModal();
          document.removeEventListener("keydown", esc);
        }
      });
    });
  }

  /* ─────────────────────────────────────────────────
    12. HEADER SCROLL-PROGRESS BAR
  ───────────────────────────────────────────────── */
  const progressBar = document.createElement("div");
  Object.assign(progressBar.style, {
    position: "fixed",
    top: "0",
    left: "0",
    height: "3px",
    width: "0%",
    background: "#e50914",
    zIndex: "10001",
    transition: "width 0.1s linear",
    pointerEvents: "none",
  });
  document.body.appendChild(progressBar);

  window.addEventListener(
    "scroll",
    () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = pct + "%";
    },
    { passive: true }
  );

  /* ─────────────────────────────────────────────────
    DONE — All features initialised
  ───────────────────────────────────────────────── */
  console.log("%cNetflix Clone JS loaded ✓", "color:#e50914;font-weight:700;font-size:14px");
})();