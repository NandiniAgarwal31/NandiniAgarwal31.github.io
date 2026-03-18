// =========================
// Global cursor spotlight (whole site)
// =========================
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const root = document.documentElement;

  const setSpotlight = (clientX, clientY) => {
    const px = (clientX / window.innerWidth) * 100;
    const py = (clientY / window.innerHeight) * 100;
    root.style.setProperty("--gx", `${px}%`);
    root.style.setProperty("--gy", `${py}%`);
  };

  window.addEventListener(
    "pointermove",
    (e) => setSpotlight(e.clientX, e.clientY),
    { passive: true }
  );

  window.addEventListener("pointerleave", () => {
    root.style.setProperty("--gx", "50%");
    root.style.setProperty("--gy", "50%");
  });
})();

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Year in footer
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile nav toggle
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Resume download confirmation (navbar)
  const resumeLink = document.querySelector("[data-resume-download]");
  if (resumeLink instanceof HTMLAnchorElement) {
    resumeLink.addEventListener("click", (e) => {
      e.preventDefault();

      const ok = window.confirm("Download resume PDF to your device?");
      if (!ok) return;

      const href = resumeLink.getAttribute("href");
      if (!href) return;

      const a = document.createElement("a");
      a.href = href;
      a.download = "Nandini_Agarwal_Resume.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }

  // Contact scroll
  const contactLink = document.querySelector('.nav a[href="#contact"]');
  if (contactLink instanceof HTMLAnchorElement) {
    contactLink.addEventListener("click", (e) => {
      e.preventDefault();

      const contact = document.getElementById("contact");
      const footer = document.querySelector(".footer");
      if (!contact || !(footer instanceof HTMLElement)) return;

      const headerHRaw = getComputedStyle(document.documentElement)
        .getPropertyValue("--header-h")
        .trim();
      const headerH = Number.parseFloat(headerHRaw) || 58;
      const topPad = headerH + 8;

      const yContactTop = contact.offsetTop - topPad;
      const footerBottom = footer.offsetTop + footer.offsetHeight;
      const yFooterBottomInView = footerBottom - window.innerHeight + 8;

      const y = Math.max(yContactTop, yFooterBottomInView, 0);
      window.scrollTo({ top: y, behavior: "smooth" });

      history.replaceState(null, "", "#contact");
    });
  }

  // =========================
  // Experience cards: mouse-follow spotlight (per card)
  // =========================
  if (!reduceMotion) {
    document.querySelectorAll(".experience-card").forEach((card) => {
      const spotlight = card.querySelector(".experience-card-spotlight");
      if (!spotlight) return;

      const updateSpotlight = (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--mx", `${x}%`);
        card.style.setProperty("--my", `${y}%`);
      };

      card.addEventListener("pointermove", updateSpotlight, { passive: true });
      card.addEventListener("pointerleave", () => {
        card.style.removeProperty("--mx");
        card.style.removeProperty("--my");
      });
    });
  }

  // =========================
  // Active nav link detection
  // =========================
  const navLinks = document.querySelectorAll(".nav a[href^='#']");
  const sections = document.querySelectorAll("section[id]");

  if (navLinks.length > 0 && sections.length > 0) {
    const updateActiveNav = () => {
      const scrollY = window.scrollY;
      const headerH = Number.parseFloat(
        getComputedStyle(document.documentElement)
          .getPropertyValue("--header-h")
          .trim()
      ) || 58;
      const offset = headerH + 80;

      let currentSection = "home";

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const sectionTop = section.offsetTop;
        if (scrollY + offset >= sectionTop) {
          currentSection = section.id;
          break;
        }
      }

      navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (href === `#${currentSection}`) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });

      const viewportTop = scrollY + (headerH || 0);
      sections.forEach((sec) => {
        const rect = sec.getBoundingClientRect();
        const sectionBottom = rect.bottom + scrollY;
        if (sectionBottom < viewportTop + 80) {
          sec.classList.add("section-past");
        } else {
          sec.classList.remove("section-past");
        }
      });
    };

    updateActiveNav();

    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            updateActiveNav();
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        setTimeout(updateActiveNav, 100);
      });
    });
  }

  // =========================
  // Scroll reveal
  // =========================
  const revealEls = document.querySelectorAll(".reveal");

  revealEls.forEach((el) => {
    const d = el.getAttribute("data-delay");
    if (d) el.style.transitionDelay = `${Number(d)}ms`;
  });

  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealEls.forEach((el) => el.classList.add("in-view"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const ent of entries) {
          if (ent.isIntersecting) {
            ent.target.classList.add("in-view");
            io.unobserve(ent.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  if (reduceMotion) return;

  // =========================
  // Skills tilt
  // =========================
  const skillCards = document.querySelectorAll("[data-tilt]");
  skillCards.forEach((card) => {
    let rect = null;

    card.addEventListener("pointerenter", () => {
      rect = card.getBoundingClientRect();
    });

    card.addEventListener("pointermove", (ev) => {
      if (!rect) rect = card.getBoundingClientRect();

      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      const px = x / rect.width;
      const py = y / rect.height;

      card.style.setProperty("--mx", `${px * 100}%`);
      card.style.setProperty("--my", `${py * 100}%`);

      const rotateY = (px - 0.5) * 16;
      const rotateX = (0.5 - py) * 16;

      card.style.transform =
        `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.02)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
      card.style.removeProperty("--mx");
      card.style.removeProperty("--my");
      rect = null;
    });

    const invalidate = () => (rect = null);
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate, { passive: true });
  });

  // =========================
  // Project cards: mouse-follow spotlight
  // =========================
  const projectCards = document.querySelectorAll(".project-card");
  projectCards.forEach((card) => {
    const spotlight = card.querySelector(".project-card-spotlight");
    if (!spotlight) return;

    const updateSpotlight = (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", `${x}%`);
      card.style.setProperty("--my", `${y}%`);
    };

    card.addEventListener("pointermove", updateSpotlight, { passive: true });
    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--mx");
      card.style.removeProperty("--my");
    });
  });

  // =========================
  // Generic cursor spotlight
  // =========================
  document.querySelectorAll(".has-spotlight").forEach((el) => {
    const spotlight = el.querySelector(".spotlight");
    if (!spotlight) return;

    const updateSpotlight = (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--mx", `${x}%`);
      el.style.setProperty("--my", `${y}%`);
    };

    el.addEventListener("pointermove", updateSpotlight, { passive: true });
    el.addEventListener("pointerleave", () => {
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
    });
  });

  // =========================
  // Education accordion
  // =========================
  document.querySelectorAll(".edu-trigger").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".edu-card");
      const isOpen = card.classList.contains("open");
      document.querySelectorAll(".edu-card").forEach((c) => c.classList.remove("open"));
      if (!isOpen) card.classList.add("open");
    });
  });

});
