/*
  Auberge Sénégal – interactions légères
  - Menu mobile accessible
  - Lien actif selon la section visible
  - Animations "reveal" au scroll
  - Carrousel d’avis accessible
  - Formulaire : feedback + mailto (sans backend)
*/

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Sticky header elevation
  const header = document.querySelector("[data-elevate]");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-elevated", window.scrollY > 10);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile nav toggle
  const toggle = $(".nav-toggle");
  const nav = $("#primary-nav");

  function setNavOpen(open) {
    document.body.classList.toggle("nav-open", open);
    if (toggle) toggle.setAttribute("aria-expanded", String(open));
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = document.body.classList.contains("nav-open");
      setNavOpen(!isOpen);
    });

    // Close on nav link click
    $$("a.nav-link", nav).forEach((a) => {
      a.addEventListener("click", () => setNavOpen(false));
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setNavOpen(false);
    });

    // Close on outside click (mobile)
    document.addEventListener("click", (e) => {
      const isOpen = document.body.classList.contains("nav-open");
      if (!isOpen) return;
      if (toggle.contains(e.target)) return;
      if (nav.contains(e.target)) return;
      setNavOpen(false);
    });
  }

  // Reveal on scroll
  const revealEls = $$('[data-reveal]');
  if (revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 }
    );

    revealEls.forEach((el) => io.observe(el));
  }

  // Active nav link based on section visibility
  const sections = $$('section[id]');
  const links = $$('.nav-link');
  const byHash = new Map(links.map((a) => [a.getAttribute("href"), a]));

  if (sections.length && links.length) {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

        if (!visible) return;
        links.forEach((a) => a.removeAttribute("aria-current"));
        const href = `#${visible.target.id}`;
        const a = byHash.get(href);
        if (a) a.setAttribute("aria-current", "page");
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: [0.05, 0.15, 0.25] }
    );

    sections.forEach((s) => io.observe(s));
  }

  // Testimonials carousel
  const carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    const quotes = $$('.quote', carousel);
    const prevBtn = $('[data-prev]', carousel);
    const nextBtn = $('[data-next]', carousel);
    const dots = $$('.dot', carousel);

    let index = 0;
    let timer = null;

    function render(nextIndex) {
      index = (nextIndex + quotes.length) % quotes.length;
      quotes.forEach((q, i) => q.classList.toggle('is-active', i === index));
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === index);
        d.setAttribute('aria-selected', String(i === index));
      });
    }

    function start() {
      stop();
      timer = window.setInterval(() => render(index + 1), 6000);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    prevBtn?.addEventListener('click', () => {
      render(index - 1);
      start();
    });

    nextBtn?.addEventListener('click', () => {
      render(index + 1);
      start();
    });

    dots.forEach((d) => {
      d.addEventListener('click', () => {
        const i = Number(d.getAttribute('data-dot'));
        if (!Number.isNaN(i)) render(i);
        start();
      });
    });

    // Pause on hover/focus
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', start);

    render(0);
    start();
  }

  // Contact form -> mailto (no backend)
  const form = document.querySelector('[data-contact-form]');
  if (form) {
    const status = $('[data-form-status]', form);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = String(fd.get('name') || '').trim();
      const email = String(fd.get('email') || '').trim();
      const message = String(fd.get('message') || '').trim();

      if (!name || !email || !message) {
        if (status) status.textContent = 'Merci de compléter tous les champs.';
        return;
      }

      const subject = encodeURIComponent(`Demande – Auberge Sénégal (${name})`);
      const body = encodeURIComponent(
        `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`
      );

      const mailto = `mailto:contact@aubergesenegal.com?subject=${subject}&body=${body}`;
      window.location.href = mailto;

      if (status) status.textContent = 'Ouverture de votre client mail…';
      form.reset();
    });
  }
})();
