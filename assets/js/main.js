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
        content: '<p>A Proquitec vendeu à RAI International todos os direitos sobre a tecnologia Therpol, incluindo patentes, know-how de produção e marcas comerciais, com exclusividade nos territórios da União Europeia, Reino Unido, África, Oriente Médio e Subcontinente Indiano.</p><p>Therpol é um modificador de polímeros patenteado à base de borracha natural, desenvolvido para aumentar a resistência ao impacto e o desempenho mecânico de plásticos virgens e reciclados, com forte apelo ambiental.</p><p>RAI é uma empresa global de soluções em polímeros sediada em Dubai, líder no Oriente Médio e especializada na comercialização de materiais de alto desempenho em mercados internacionais estratégicos.</p><p>A transação marca o início da internacionalização da tecnologia Therpol, com expansão relevante em aplicações industriais e estratégias comerciais multirregionais.</p>'
      },
      venco: {
        title: 'Venco — Indústria de Saúde Animal',
        content: '<p>A Venco possui um amplo portfólio de Vacinas e outros Produtos de Origem Animal (FAP), que vende predominantemente no Brasil, e também em outros mercados da América do Sul e internacionais. Também possui uma pequena gama de vacinas e produtos farmacêuticos de produtos de animais de companhia (PAC), que são vendidos principalmente no mercado brasileiro. No geral, tem mais de 200 registros de produtos atuais. O Brasil é o quarto maior mercado de FAP no mundo, e Vacinas é a área terapêutica que mais cresce dentro da FAP no mundo.</p><p>A aquisição fornece à Dechra uma presença estrategicamente significativa nos mercados brasileiro e sul-americano em rápido crescimento. O site de Londrina, no estado do Paraná, abriga todas as funções de negócios da Venco, incluindo desenvolvimento de produtos, operações de fabricação, vendas e marketing e assuntos regulatórios. O local desfrutou de um período de investimento significativo recente em operações de manufatura, que melhorou consideravelmente as instalações que obtiveram licenças regulatórias para operar.</p><p>A Dechra investirá significativamente nos próximos 2 a 3 anos para desenvolver o negócio e sua presença na América do Sul, continuará desenvolvendo o pipeline e registros existentes da Venco, registrará os produtos relevantes da Dechra e estabelecerá a marca Dechra na região.</p>'
      },
      cultivar: {
        title: 'Cultivar — Revenda de Insumos Agrícolas',
        content: '<p>A Cultivar Agrícola é referência regional na distribuição de insumos agrícolas do Mato Grosso do Sul e Goiás. A Lavoro, holding do fundo Pátria Investimentos em parceria com o grupo Blackstone, é líder em distribuição de insumos agrícolas na América Latina. A aquisição marca a efetiva entrada da Lavoro no estado do Mato Grosso do Sul, passando a ter presença forte em todas as principais regiões produtoras de grãos do Brasil.</p><p>Os sócios da Cultivar continuam a frente da companhia e, com a parceria, a Lavoro apoiará o plano de crescimento através do suporte operacional e financeiro.</p>'
      },
      oralsin: {
        title: 'Oralsin — Clínicas Odontológicas',
        content: '<p>A Oral Sin Franquias, maior rede de clínicas de implantes dentários do Brasil, vendeu a totalidade do capital remanescente para o Grupo SMZTO, maior holding de franquias do Brasil.</p><p>A aquisição habilita a rede de clínicas odontológicas OdontoCompany, investida do Grupo SMZTO, consolidar-se como a maior do mundo totalizando 972 unidades, após ultrapassar a americana Heartland Dental Care que conta com 950 clínicas.</p><p>A Oral Sin Franquias, que manterá a operação independente e continuará sob o comando de Felipe Sapata, pretende faturar R$660 milhões com a rede para o ano de 2021. Já a rede combinada com a marca OdontoCompany pretende encerrar este ano com 1.769 unidades, R$100 milhões de EBITDA e uma receita combinada de R$2,26 bilhões.</p><p>Este é um movimento estratégico do Grupo SMZTO como parte do plano de realizar abertura de capital (IPO) da OdontoCompany em três anos, com a expectativa de aumento da capilaridade da rede para 4.000 clínicas e consequentemente ampliar substancialmente o porte da companhia. "Serão 2,6 mil da OdontoCompany, mais 700 da Oral Sin e mais uma aquisição que fizermos. Assim, chegaremos nesse patamar de 4 mil unidades" disse José Carlos Semenzato.</p>'
      },
      starnet: {
        title: 'Starnet — Provedor de Internet',
        content: '<p>A Starnet Telecom possui uma base de 20.130 assinantes e presta serviços de internet de banda larga com tecnologia de fibra óptica em seis municípios do interior do Estado de São Paulo.</p><p>A Desktop, companhia listada na B3, incialmente investida pelo fundo de private equity HIG, é uma das maiores plataformas de ISP do Brasil, sendo a maior plataforma ISP do interior do Estado de São Paulo. Em maio de 2021, a companhia já operava mais de 16.500 km de redes próprias de fibra ótica, contando com mais de 321 mil usuários ativos, em 53 cidades no interior do Estado de São Paulo.</p>'
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
