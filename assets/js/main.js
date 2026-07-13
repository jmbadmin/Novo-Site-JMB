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

  /* ---- Transactions page carousel (transacoes.html) ---- */
  var txCarousel = document.querySelector("[data-transactions-carousel]");
  if (txCarousel) {
    var txTrack = txCarousel.querySelector("[data-transactions-track]");
    var txItems = Array.prototype.slice.call(txTrack.children);
    var txPrev = txCarousel.querySelector("[data-transactions-prev]");
    var txNext = txCarousel.querySelector("[data-transactions-next]");
    var txIndex = 0;
    var txTimer = null;

    var txVisibleCount = function () {
      var w = window.innerWidth;
      if (w <= 560) return 1;
      if (w <= 820) return 2;
      return 3;
    };
    var txMaxIndex = function () { return Math.max(0, txItems.length - txVisibleCount()); };

    var txUpdate = function () {
      if (!txItems.length) return;
      var gap = parseFloat(window.getComputedStyle(txTrack).columnGap) || 0;
      var slideWidth = txItems[0].getBoundingClientRect().width + gap;
      txTrack.style.transform = "translateX(" + (-txIndex * slideWidth) + "px)";
    };
    var txGoTo = function (i) {
      txIndex = Math.max(0, Math.min(i, txMaxIndex()));
      txUpdate();
    };
    var txNextSlide = function () {
      txIndex = txIndex >= txMaxIndex() ? 0 : txIndex + 1;
      txUpdate();
    };
    var txPrevSlide = function () {
      txIndex = txIndex <= 0 ? txMaxIndex() : txIndex - 1;
      txUpdate();
    };
    var txStop = function () { if (txTimer) { window.clearInterval(txTimer); txTimer = null; } };
    var txStart = function () {
      if (reduceMotion || txItems.length <= txVisibleCount()) return;
      txStop();
      txTimer = window.setInterval(txNextSlide, 5000);
    };

    if (txNext) txNext.addEventListener("click", function () { txNextSlide(); txStart(); });
    if (txPrev) txPrev.addEventListener("click", function () { txPrevSlide(); txStart(); });
    txCarousel.addEventListener("mouseenter", txStop);
    txCarousel.addEventListener("mouseleave", txStart);
    txCarousel.addEventListener("focusin", txStop);
    txCarousel.addEventListener("focusout", txStart);
    window.addEventListener("resize", function () { txGoTo(txIndex); }, { passive: true });

    /* Touch / swipe support */
    var txTouchStartX = 0;
    var txTouchDeltaX = 0;
    var txTouching = false;

    txCarousel.addEventListener("touchstart", function (e) {
      txTouching = true;
      txTouchStartX = e.touches[0].clientX;
      txTouchDeltaX = 0;
      txStop();
    }, { passive: true });

    txCarousel.addEventListener("touchmove", function (e) {
      if (!txTouching) return;
      txTouchDeltaX = e.touches[0].clientX - txTouchStartX;
    }, { passive: true });

    txCarousel.addEventListener("touchend", function () {
      if (!txTouching) return;
      txTouching = false;
      var threshold = 40;
      if (txTouchDeltaX <= -threshold) txNextSlide();
      else if (txTouchDeltaX >= threshold) txPrevSlide();
      txTouchDeltaX = 0;
      txStart();
    });

    txUpdate();
    txStart();
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

  /* ---- Deal detail modal (transacoes.html) ---- */
  var dealModal = document.querySelector('[data-deal-modal]');
  if (dealModal) {
    var dealData = {
      therpol: {
        title: 'Therpol — Tecnologia em Polímeros',
        content: '<p>A Proquitec Therpol, empresa líder em modificadores de polímeros à base de borracha natural, realizou a venda exclusiva dos direitos sobre sua tecnologia para a RAI International, distribuidora global de polímeros plásticos.</p><p>Essa transação cross-border consolidou a posição da tecnologia Therpol nos mercados estratégicos internacionais, permitindo à RAI expandir seu portfólio em segmentos de alto valor agregado.</p><p>A JMB atuou como assessor financeiro exclusivo, navegando as complexidades da transferência de propriedade intelectual e estruturando a operação para maximizar o valor para todos os envolvidos.</p>'
      },
      venco: {
        title: 'Venco — Indústria de Saúde Animal',
        content: '<p>A Venco, empresa brasileira especializada em saúde animal, completou a venda de 100% de suas ações para a Dechra, multinacional inglesa líder global em produtos e serviços veterinários.</p><p>Essa aquisição representou uma oportunidade estratégica de consolidação do setor, permitindo à Dechra fortalecer sua presença na América Latina enquanto oferecia aos acionistas da Venco acesso aos recursos globais de uma corporação multinacional.</p><p>Como advisors sell-side exclusivos, a JMB gerenciou todo o processo de due diligence, negociação e fechamento da operação cross-border.</p>'
      },
      cultivar: {
        title: 'Cultivar — Revenda de Insumos Agrícolas',
        content: '<p>A Cultivar, distribuidora consolidada de insumos agrícolas, realizou a venda de participação majoritária para a Lavoro, holding de distribuição de insumos agrícolas do fundo Pátria.</p><p>A operação refletiu a força do negócio da Cultivar e o potencial de crescimento no setor agro, em um momento de consolidação estratégica do mercado de insumos no Brasil.</p><p>A JMB assessorou exclusivamente os acionistas da Cultivar em toda a estruturação e negociação, garantindo que os valores oferecidos refletissem o valor real do negócio e suas perspectivas de crescimento.</p>'
      },
      oralsin: {
        title: 'Oralsin — Clínicas Odontológicas',
        content: '<p>A Oralsin, rede estabelecida de clínicas odontológicas, completou a venda de 100% de suas ações para o Grupo SMZTO, holding de franquias que opera portas em múltiplos segmentos de saúde e bem-estar.</p><p>A transação permitiu à Oralsin acessar capital e expertise operacional para aceleração do crescimento, enquanto o SMZTO expandiu sua presença no setor de saúde bucal.</p><p>Como advisors sell-side, a JMB conduziu a estruturação financeira, due diligence comercial e negociação integral da transação, garantindo transição suave pós-fechamento.</p>'
      },
      starnet: {
        title: 'Starnet — Provedor de Internet',
        content: '<p>A Starnet, provedor estabelecido de acesso a internet em regiões estratégicas do Brasil, realizou a venda de 100% de suas ações para a Desktop, empresa operadora do fundo HIG Capital.</p><p>A operação consolidou a Starnet como ativo-chave no portfólio de telecom do HIG, refletindo a qualidade dos ativos de banda larga brasileiros e o potencial de consolidação do setor.</p><p>A JMB atuou como assessor financeiro exclusivo dos acionistas da Starnet, estruturando a operação e negociando os melhores termos possível com o adquirente, desde a fase de marketing até o fechamento final.</p>'
      }
    };

    var modalTitle = document.querySelector('#deal-title');
    var modalBody = document.querySelector('#deal-body');
    var detailBtns = document.querySelectorAll('.tombstone__detail-btn');

    var openDealModal = function (dealId) {
      if (dealData[dealId]) {
        modalTitle.textContent = dealData[dealId].title;
        modalBody.innerHTML = dealData[dealId].content;
        dealModal.hidden = false;
        document.body.style.overflow = 'hidden';
      }
    };

    var closeDealModal = function () {
      dealModal.hidden = true;
      document.body.style.overflow = '';
    };

    detailBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dealId = btn.getAttribute('data-deal-id');
        openDealModal(dealId);
      });
    });

    dealModal.querySelectorAll('[data-modal-close]').forEach(function (closer) {
      closer.addEventListener('click', closeDealModal);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !dealModal.hidden) {
        closeDealModal();
      }
    });
  }
})();
