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
