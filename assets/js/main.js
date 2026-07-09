/* JMB Advisors — interactions */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Header: solid on scroll ---- */
  var header = document.querySelector("[data-header]");
  var onScroll = function () {
    if (window.scrollY > 24) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile menu ---- */
  var toggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    if (open) {
      mobileNav.hidden = false;
      requestAnimationFrame(function () { mobileNav.classList.add("is-open"); });
      document.body.style.overflow = "hidden";
    } else {
      mobileNav.classList.remove("is-open");
      document.body.style.overflow = "";
      window.setTimeout(function () { if (toggle.getAttribute("aria-expanded") === "false") mobileNav.hidden = true; }, 320);
    }
  }

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setMenu(false); toggle.focus(); }
    });
  }

  /* ---- World map: keep pin tooltips inside the card near the edges ---- */
  var worldmap = document.querySelector(".worldmap");
  if (worldmap) {
    var mapPins = worldmap.querySelectorAll(".worldmap__pin");
    mapPins.forEach(function (pin) {
      var tooltip = pin.querySelector(".worldmap__tooltip");
      if (!tooltip) return;
      var reposition = function () {
        tooltip.style.marginLeft = "0px";
        var wrapRect = worldmap.getBoundingClientRect();
        var tipRect = tooltip.getBoundingClientRect();
        var pad = 6;
        if (tipRect.left < wrapRect.left) {
          tooltip.style.marginLeft = Math.round(wrapRect.left - tipRect.left + pad) + "px";
        } else if (tipRect.right > wrapRect.right) {
          tooltip.style.marginLeft = Math.round(wrapRect.right - tipRect.right - pad) + "px";
        }
      };
      pin.addEventListener("mouseenter", reposition);
      pin.addEventListener("focus", reposition);
    });
  }

  /* ---- Hero tombstone carousel ---- */
  var carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    var slides = carousel.querySelectorAll(".hero-carousel__slide");
    var dots = carousel.querySelectorAll("[data-carousel-dots] span");
    var current = 0;
    var total = slides.length;
    var timer = null;

    var goTo = function (i) {
      slides[current].classList.remove("is-active");
      if (dots[current]) dots[current].classList.remove("is-active");
      current = (i + total) % total;
      slides[current].classList.add("is-active");
      if (dots[current]) dots[current].classList.add("is-active");
    };

    var stop = function () { if (timer) { window.clearInterval(timer); timer = null; } };
    var start = function () {
      if (reduceMotion || total < 2) return;
      stop();
      timer = window.setInterval(function () { goTo(current + 1); }, 5000);
    };

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    carousel.addEventListener("focusin", stop);
    carousel.addEventListener("focusout", start);

    start();

    /* Enlarge logos when their white card has spare vertical room */
    var logoBoxes = carousel.querySelectorAll(".tombstone__logos");
    var fitLogos = function () {
      logoBoxes.forEach(function (box) {
        var slots = box.querySelectorAll(".tombstone__logo-slot");
        if (!slots.length) return;
        box.style.setProperty("--logo-scale", 1);
        var cs = window.getComputedStyle(box);
        var gap = parseFloat(cs.rowGap) || 0;
        var padding = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
        var natural = gap * (slots.length - 1);
        slots.forEach(function (slot) { natural += slot.scrollHeight; });
        var available = box.clientHeight - padding;
        var scale = available / natural;
        scale = Math.min(scale, 1.3);
        box.style.setProperty("--logo-scale", scale > 1.08 ? scale.toFixed(3) : 1);
      });
    };
    fitLogos();
    window.addEventListener("resize", fitLogos, { passive: true });
  }

  /* ---- Reveal on scroll ---- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in-view"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var siblings = Array.prototype.slice.call(
            el.parentElement ? el.parentElement.querySelectorAll(":scope > .reveal") : [el]
          );
          var idx = Math.max(0, siblings.indexOf(el));
          el.style.transitionDelay = Math.min(idx * 70, 420) + "ms";
          el.classList.add("in-view");
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }
})();
