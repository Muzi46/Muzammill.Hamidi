// Aktuelles Jahr im Footer
document.getElementById("jahr").textContent = new Date().getFullYear();

// Mobiles Menü öffnen/schliessen
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

// Sektionen beim Scrollen sanft einblenden
const sections = document.querySelectorAll(".section");
sections.forEach((s) => s.classList.add("reveal"));

const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    }),
  { threshold: 0.12 }
);
sections.forEach((s) => observer.observe(s));
