(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  const navCta = document.querySelector(".nav-cta");
  const sections = document.querySelectorAll("section[id]");
  const navItems = document.querySelectorAll(".nav-links a");

  /* Sticky header on scroll */
  function handleScroll() {
    if (window.scrollY > 60) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
    updateActiveNav();
  }

  /* Highlight active nav link based on scroll position */
  function updateActiveNav() {
    const scrollPos = window.scrollY + 120;

    sections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute("id");

      if (scrollPos >= top && scrollPos < top + height) {
        navItems.forEach(function (link) {
          link.classList.remove("active");
          if (link.getAttribute("href") === "#" + id) {
            link.classList.add("active");
          }
        });
      }
    });
  }

  /* Mobile menu toggle */
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      const isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen);

      if (navCta) {
        navCta.classList.toggle("mobile-visible", isOpen);
      }
    });
  }

  /* Close mobile menu on link click */
  navItems.forEach(function (link) {
    link.addEventListener("click", function () {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      if (navCta) navCta.classList.remove("mobile-visible");
    });
  });

  /* Animate skill bars on scroll into view */
  function animateSkillBars() {
    const skillsBox = document.querySelector(".skills-box");
    if (!skillsBox) return;

    const rect = skillsBox.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.85;

    if (inView) {
      document.querySelectorAll(".skill-item").forEach(function (item) {
        const percent = item.getAttribute("data-percent");
        const fill = item.querySelector(".skill-fill");
        if (fill) fill.style.width = percent + "%";
      });
    }
  }

  /* Fade-in animation for cards */
  function animateOnScroll() {
    const elements = document.querySelectorAll(
      ".service-card, .timeline-item, .project-card, .education-card"
    );

    elements.forEach(function (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.classList.add("fade-in", "visible");
      } else {
        el.classList.add("fade-in");
      }
    });
  }

  /* Smooth scroll for anchor links */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      if (targetId === "#home" || this.classList.contains("back-to-top")) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  window.addEventListener("scroll", function () {
    handleScroll();
    animateSkillBars();
    animateOnScroll();
  });

  /* Initial run */
  handleScroll();
  animateSkillBars();
  animateOnScroll();
})();
