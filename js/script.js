
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initScrollEffects();
  initReveal();
  initTypingDemo();
  initSteps();
  initModelFilter();
  initCopyButtons();
  setYear();
});

/* ---------- Responsive navbar ---------- */
function initNavbar() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;

  const close = () => {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  // Close menu after choosing a link or pressing Escape
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  window.addEventListener("resize", () => { if (window.innerWidth > 768) close(); });
}

/* ---------- Header shadow + back-to-top ---------- */
function initScrollEffects() {
  const header = document.querySelector(".header");
  const backBtn = document.querySelector(".back-to-top");

  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 10);
    if (backBtn) backBtn.classList.toggle("show", y > 500);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backBtn) {
    backBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
}

/* ---------- Reveal elements on scroll ---------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((el) => observer.observe(el));
}

/* ---------- Hero typing animation (home page) ---------- */
function initTypingDemo() {
  const el = document.getElementById("typed-text");
  if (!el) return;
  const text = "AI is when computers learn from examples so they can understand language, spot patterns and help solve problems — a bit like how people learn from experience.";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = text;
    return;
  }
  let i = 0;
  const type = () => {
    if (i <= text.length) {
      el.textContent = text.slice(0, i++);
      setTimeout(type, 28);
    } else {
      setTimeout(() => { i = 0; type(); }, 4000); // loop
    }
  };
  setTimeout(type, 600);
}

/* ---------- Interactive "How LLM Works" steps ---------- */
const STEP_DATA = [
  {
    title: "1. Input",
    text: "The user types a prompt — a question or instruction written in plain language. This is everything the model has to work with.",
    example: 'Prompt:\n"The capital of France is"'
  },
  {
    title: "2. Tokenization",
    text: "The text is broken into smaller pieces called tokens (whole words or parts of words). Each token is converted into numbers, called embeddings, that the model can process.",
    example: '["The", " capital", " of", " France", " is"]\n      ↓\n[ 464, 3139, 286, 4881, 318 ]  (example IDs)'
  },
  {
    title: "3. Processing",
    text: "The tokens pass through many layers of a Transformer neural network. The attention mechanism helps the model understand how each token relates to the others in the context.",
    example: '"capital"  ←→  "France"\n   attention links related words\n   across many network layers'
  },
  {
    title: "4. Prediction",
    text: "Based on the patterns it learned in training, the model calculates the probability of each possible next token and selects one.",
    example: 'Next-token probabilities:\n " Paris"   ████████████  92%\n " a"       █             3%\n " the"     █             2%'
  },
  {
    title: "5. Output",
    text: "The chosen token is added to the text and the process repeats, one token at a time, until a full response is generated and shown to the user.",
    example: 'Response:\n"The capital of France is Paris."'
  }
];

function initSteps() {
  const steps = document.querySelectorAll(".step");
  const title = document.getElementById("step-title");
  const text = document.getElementById("step-text");
  const example = document.getElementById("step-example");
  const prev = document.getElementById("step-prev");
  const next = document.getElementById("step-next");
  if (!steps.length || !title) return;

  let current = 0;

  const show = (index) => {
    current = (index + STEP_DATA.length) % STEP_DATA.length;
    steps.forEach((s, i) => {
      s.classList.toggle("active", i === current);
      s.setAttribute("aria-selected", String(i === current));
    });
    const d = STEP_DATA[current];
    title.textContent = d.title;
    text.textContent = d.text;
    example.innerHTML = "";
    const pre = document.createElement("pre");
    pre.style.whiteSpace = "pre-wrap";
    pre.style.margin = "0";
    pre.style.font = "inherit";
    pre.textContent = d.example;
    example.appendChild(pre);
  };

  steps.forEach((s) => s.addEventListener("click", () => show(Number(s.dataset.step))));
  if (prev) prev.addEventListener("click", () => show(current - 1));
  if (next) next.addEventListener("click", () => show(current + 1));

  show(0);
}

/* ---------- Model search + filter (models page) ---------- */
function initModelFilter() {
  const cards = document.querySelectorAll(".model-card");
  const search = document.getElementById("model-search");
  const buttons = document.querySelectorAll(".filter-btn");
  const empty = document.getElementById("no-results");
  if (!cards.length) return;

  let activeFilter = "all";

  const apply = () => {
    const q = (search ? search.value : "").trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const matchesFilter = activeFilter === "all" || card.dataset.category.split(" ").includes(activeFilter);
      const matchesSearch = !q || card.textContent.toLowerCase().includes(q);
      const show = matchesFilter && matchesSearch;
      card.classList.toggle("hidden", !show);
      if (show) { visible++; card.classList.add("visible"); }
    });
    if (empty) empty.style.display = visible ? "none" : "block";
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      apply();
    });
  });
  if (search) search.addEventListener("input", apply);
}

/* ---------- Copy model information ---------- */
function initCopyButtons() {
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const value = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
        showToast("Model information copied!");
      } catch {
        // Fallback for browsers/contexts without the Clipboard API
        const ta = document.createElement("textarea");
        ta.value = value;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); showToast("Model information copied!"); }
        catch { showToast("Copy not supported in this browser."); }
        ta.remove();
      }
    });
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ---------- Footer year ---------- */
function setYear() {
  document.querySelectorAll(".year").forEach((el) => { el.textContent = new Date().getFullYear(); });
}
