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
      // Bei jedem Scrollen neu: rein = sichtbar, raus = wieder verstecken
      e.target.classList.toggle("visible", e.isIntersecting);
    }),
  { threshold: 0.12 }
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
if (quotes.length) {
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
}

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

// Grossansicht für 3D-Drucke: grosses Bild, weitere Bilder und getippter Text
const lightbox = document.querySelector(".lightbox");
if (lightbox) {
const lbImg = lightbox.querySelector(".lightbox__img");
const lbThumbs = lightbox.querySelector(".lightbox__thumbs");
const lbTyped = lightbox.querySelector(".lightbox__typed");
const lbPrev = lightbox.querySelector(".lightbox__nav--prev");
const lbNext = lightbox.querySelector(".lightbox__nav--next");
let lbImages = [], lbIndex = 0, typeTimer;

const showImage = (i) => {
  lbIndex = (i + lbImages.length) % lbImages.length;
  lbImg.classList.remove("swap");
  void lbImg.offsetWidth; // Animation neu starten
  lbImg.classList.add("swap");
  lbImg.src = lbImages[lbIndex];
  [...lbThumbs.children].forEach((t, n) => t.classList.toggle("active", n === lbIndex));
};

const typeText = (text) => {
  clearTimeout(typeTimer);
  lbTyped.textContent = "";
  let c = 0;
  const tick = () => {
    lbTyped.textContent = text.slice(0, ++c);
    if (c < text.length) typeTimer = setTimeout(tick, 22);
  };
  typeTimer = setTimeout(tick, 350);
};

document.querySelectorAll(".print").forEach((card) =>
  card.addEventListener("click", () => {
    lbImages = (card.dataset.images || card.querySelector("img")?.getAttribute("src") || "").split("|").filter(Boolean);
    if (!lbImages.length) return;
    lbImg.alt = card.querySelector("img")?.alt || "";
    lbThumbs.innerHTML = "";
    if (lbImages.length > 1) {
      lbImages.forEach((src, n) => {
        const b = document.createElement("button");
        b.setAttribute("aria-label", `Bild ${n + 1}`);
        b.style.backgroundImage = `url("${src}")`;
        b.addEventListener("click", () => showImage(n));
        lbThumbs.appendChild(b);
      });
    }
    lbPrev.hidden = lbNext.hidden = lbImages.length < 2;
    showImage(0);
    lightbox.querySelector(".lightbox__title").textContent = card.querySelector("h3").textContent;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    typeText(card.dataset.text || "");
  })
);
const closeLightbox = () => {
  lightbox.hidden = true;
  document.body.style.overflow = "";
  clearTimeout(typeTimer);
};
lbPrev.addEventListener("click", () => showImage(lbIndex - 1));
lbNext.addEventListener("click", () => showImage(lbIndex + 1));
lightbox.addEventListener("click", (e) => { if (e.target === lightbox || e.target.closest(".lightbox__close")) closeLightbox(); });
addEventListener("keydown", (e) => {
  if (lightbox.hidden) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight" && lbImages.length > 1) showImage(lbIndex + 1);
  if (e.key === "ArrowLeft" && lbImages.length > 1) showImage(lbIndex - 1);
});
}

// Sprachen: Klick zeigt einen kurzen, getippten Text
const langInfo = document.querySelector(".lang-info__typed");
let langTimer;
document.querySelectorAll(".langs button").forEach((btn) =>
  btn.addEventListener("click", () => {
    document.querySelectorAll(".langs button").forEach((b) => b.classList.toggle("active", b === btn));
    clearTimeout(langTimer);
    const text = btn.dataset.text;
    let c = 0;
    langInfo.textContent = "";
    const tick = () => {
      langInfo.textContent = text.slice(0, ++c);
      if (c < text.length) langTimer = setTimeout(tick, 22);
    };
    tick();
  })
);

// Zitate: Höhe an das längste Zitat anpassen, damit auf dem Handy nichts überlappt
const slides = document.querySelector(".quotes__slides");
if (slides) {
  const fitQuotes = () => {
    const max = Math.max(...[...slides.querySelectorAll(".quote")].map((q) => q.offsetHeight));
    slides.style.minHeight = max + "px";
  };
  addEventListener("resize", fitQuotes);
  document.fonts?.ready.then(fitQuotes);
  fitQuotes();
}

// Kicker-Texte werden beim Erscheinen "entschlüsselt"
const scrambleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&";
const scramble = (el) => {
  const final = el.dataset.final || (el.dataset.final = el.textContent);
  let frame = 0;
  clearInterval(el._scr);
  el._scr = setInterval(() => {
    el.textContent = [...final].map((ch, i) =>
      i < frame / 2 || ch === " " ? ch : scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
    ).join("");
    if (++frame > final.length * 2) { clearInterval(el._scr); el.textContent = final; }
  }, 35);
};
const kickerObserver = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && scramble(e.target)),
  { threshold: 0.8 }
);
document.querySelectorAll(".kicker").forEach((k) => kickerObserver.observe(k));

// Klick-Welle auf Buttons
document.querySelectorAll(".btn, .langs button").forEach((btn) =>
  btn.addEventListener("click", (e) => {
    const r = btn.getBoundingClientRect();
    const size = Math.max(r.width, r.height);
    const wave = document.createElement("span");
    wave.className = "ripple";
    wave.style.width = wave.style.height = size + "px";
    wave.style.left = e.clientX - r.left - size / 2 + "px";
    wave.style.top = e.clientY - r.top - size / 2 + "px";
    btn.style.position = btn.style.position || "relative";
    btn.style.overflow = "hidden";
    btn.appendChild(wave);
    setTimeout(() => wave.remove(), 650);
  })
);

// Nach-oben-Button mit Fortschrittsring und aktiver Menüpunkt
const toTop = document.querySelector(".to-top");
const ring = document.querySelector(".to-top__ring");
const navLinks = [...document.querySelectorAll('.nav__links a[href^="#"]:not(.btn)')];
const sections = navLinks.map((a) => document.getElementById(a.getAttribute("href").slice(1)));
const onScrollExtras = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? scrollY / max : 0;
  toTop.classList.toggle("show", scrollY > innerHeight * 0.6);
  ring.style.strokeDashoffset = 132 * (1 - p);
  let current = -1;
  sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) current = i; });
  navLinks.forEach((a, i) => a.classList.toggle("active", i === current));
};
addEventListener("scroll", () => requestAnimationFrame(onScrollExtras), { passive: true });
toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
onScrollExtras();

// Basketball antippen = Wurf mit "Swish!"
const ball = document.querySelector(".ball");
const swish = document.querySelector(".swish");
if (ball) {
  ball.addEventListener("click", () => {
    ball.classList.remove("shoot"); swish.classList.remove("show");
    void ball.offsetWidth;
    ball.classList.add("shoot"); swish.classList.add("show");
  });
  ball.addEventListener("animationend", (e) => { if (e.animationName === "shoot") ball.classList.remove("shoot"); });
}

// Mini-Avatar: läuft beim Scrollen mit und macht je nach Bereich etwas anderes
const avatar = document.querySelector(".avatar");
if (avatar) {
  const bubble = avatar.querySelector(".avatar__bubble");
  const poses = [
    ["start", "wave", "Hi! 👋"],
    ["ueber-mich", "wave", "Das bin ich!"],
    ["arbeit", "type", "Am Automatisieren …"],
    ["schule", "write", "Do & Fr: Schule ✏️"],
    ["basketball", "shoot", "Swish! 🏀"],
    ["3d-druck", "print", "Druckt gerade …"],
    ["kontakt", "wave", "Schreib mir! ✉️"],
  ].map(([id, pose, text]) => ({ el: document.getElementById(id), pose, text }));
  let current = null, walkTimer, talkTimer, lastY = scrollY;

  const say = (text) => {
    bubble.textContent = text;
    avatar.classList.add("talk");
    clearTimeout(talkTimer);
    talkTimer = setTimeout(() => avatar.classList.remove("talk"), 2600);
  };
  const place = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? scrollY / max : 0;
    const room = innerWidth - avatar.offsetWidth - (innerWidth < 760 ? 80 : 110);
    avatar.style.setProperty("--x", 16 + p * Math.max(room - 16, 0) + "px");
  };
  const settle = () => {
    let found = poses[0];
    poses.forEach((s) => { if (s.el && s.el.getBoundingClientRect().top < innerHeight * 0.5) found = s; });
    avatar.classList.remove("flip");
    avatar.dataset.pose = found.pose;
    if (found !== current) { current = found; say(found.text); }
  };
  addEventListener("scroll", () => {
    avatar.classList.toggle("flip", scrollY < lastY);
    lastY = scrollY;
    avatar.dataset.pose = "walk";
    place();
    clearTimeout(walkTimer);
    walkTimer = setTimeout(settle, 450);
  }, { passive: true });
  addEventListener("resize", place);
  avatar.addEventListener("click", () => say(current ? current.text : "Hi! 👋"));
  place();
  setTimeout(settle, 1600);
}
