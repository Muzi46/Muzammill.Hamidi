const finePointer = window.matchMedia("(pointer: fine)").matches;

// Intro: Logo kurz zeigen, dann nach oben wegschieben
const intro = document.querySelector(".intro");
setTimeout(() => {
  intro.classList.add("done");
  document.body.classList.remove("loading");
  document.body.classList.add("started");
  setTimeout(() => intro.remove(), 1000);
}, 1100);

// Aktuelles Jahr im Footer
document.getElementById("jahr").textContent = new Date().getFullYear();

// Mobiles Menü
const toggle = document.querySelector(".nav__toggle");
const links = document.querySelector(".nav__links");
toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
links.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", false);
  })
);

// Name Buchstabe für Buchstabe einblenden
document.querySelectorAll("[data-split]").forEach((el) => {
  const text = el.textContent;
  el.setAttribute("aria-label", text);
  el.textContent = "";
  let i = 0;
  text.split(" ").forEach((word, wi) => {
    const wordEl = document.createElement("span");
    wordEl.className = "word";
    wordEl.setAttribute("aria-hidden", "true");
    [...word].forEach((ch) => {
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = ch;
      span.style.animationDelay = `${0.15 + i++ * 0.04}s`;
      wordEl.appendChild(span);
    });
    if (wi) el.appendChild(document.createTextNode(" "));
    el.appendChild(wordEl);
  });
});

// Schreibmaschinen-Effekt
const typed = document.querySelector(".typed");
if (typed) {
  const words = typed.dataset.words.split("|");
  {
    let w = 0, c = 0, deleting = false;
    const tick = () => {
      const word = words[w];
      typed.textContent = word.slice(0, c);
      if (!deleting && c === word.length) { deleting = true; return setTimeout(tick, 1600); }
      if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; }
      c += deleting ? -1 : 1;
      setTimeout(tick, deleting ? 35 : 70);
    };
    setTimeout(tick, 1900);
  }
}

// Einblenden beim Scrollen (mit Verzögerung bei Gruppen)
document.querySelectorAll(".pillars, .stats, .work, .gallery, .langs").forEach((group) =>
  group.querySelectorAll(".reveal").forEach((el, i) => el.style.setProperty("--d", `${i * 0.1}s`))
);
const revealObserver = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("visible");
      revealObserver.unobserve(e.target);
    }),
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// Zahlen hochzählen
const countObserver = new IntersectionObserver((entries) =>
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.count;
    const prefix = el.dataset.prefix || "";
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / 1400, 1);
      el.textContent = prefix + Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    countObserver.unobserve(el);
  }),
  { threshold: 0.6 }
);
document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

// Scroll-Fortschritt
const progress = document.querySelector(".progress");
const onScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
};
addEventListener("scroll", onScroll, { passive: true });

// Parallax: Hintergrund und Foto bewegen sich beim Scrollen unterschiedlich schnell
const parallax = [
  [document.querySelector(".blob--1"), 0.35],
  [document.querySelector(".blob--2"), -0.2],
  [document.querySelector(".hero__photo"), 0.12],
  [document.querySelector(".marquee__track")?.parentElement, 0],
];
const onParallax = () => {
  const y = scrollY;
  parallax.forEach(([el, speed]) => { if (el && speed) el.style.translate = `0 ${y * speed}px`; });
};
addEventListener("scroll", () => requestAnimationFrame(onParallax), { passive: true });
onScroll();

// Zitate wechseln
const quotes = document.querySelectorAll(".quote");
const dots = document.querySelector(".quotes__dots");
let q = 0, quoteTimer;
const showQuote = (i) => {
  quotes[q].classList.remove("is-active");
  dots.children[q].setAttribute("aria-selected", "false");
  q = i;
  quotes[q].classList.add("is-active");
  dots.children[q].setAttribute("aria-selected", "true");
};
quotes.forEach((_, i) => {
  const b = document.createElement("button");
  b.setAttribute("role", "tab");
  b.setAttribute("aria-label", `Zitat ${i + 1}`);
  b.setAttribute("aria-selected", i === 0 ? "true" : "false");
  b.addEventListener("click", () => { showQuote(i); restartQuotes(); });
  dots.appendChild(b);
});
const restartQuotes = () => {
  clearInterval(quoteTimer);
  quoteTimer = setInterval(() => showQuote((q + 1) % quotes.length), 6000);
};
restartQuotes();

// Effekte nur mit Maus
if (finePointer) {
  // Licht folgt dem Mauszeiger
  const glow = document.querySelector(".cursor-glow");
  addEventListener("mousemove", (e) => {
    glow.style.opacity = 1;
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });

  // 3D-Kippen von Karten
  document.querySelectorAll(".tilt").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => (card.style.transform = ""));
  });

  // Magnetische Buttons
  document.querySelectorAll(".magnetic").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    });
    btn.addEventListener("mouseleave", () => (btn.style.transform = ""));
  });
}

// Grossansicht für 3D-Drucke
const lightbox = document.querySelector(".lightbox");
const closeLightbox = () => (lightbox.hidden = true);
document.querySelectorAll(".print").forEach((card) =>
  card.addEventListener("click", () => {
    lightbox.querySelector(".lightbox__img").innerHTML = card.querySelector(".print__img").outerHTML;
    lightbox.querySelector(".lightbox__title").textContent = card.dataset.title || card.querySelector("h3").textContent;
    lightbox.querySelector(".lightbox__text").textContent = card.dataset.text || "";
    lightbox.hidden = false;
  })
);
lightbox.addEventListener("click", (e) => { if (e.target === lightbox || e.target.closest(".lightbox__close")) closeLightbox(); });
addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });
