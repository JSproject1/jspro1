/* ==========================================================================
   LIVARTA — scroll-scrubbed room assembly (vanilla JS)
   Scroll position → progress (0..1) → every object's transform.
   Nothing here autoplays: stop scrolling and the scene stops; scroll up and it reverses.
   ========================================================================== */
(() => {
  'use strict';

  /* ---------- 1. Math helpers ---------- */
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const mapRange = (v, inMin, inMax, outMin, outMax) => lerp(outMin, outMax, clamp((v - inMin) / (inMax - inMin)));
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const easeInOutCubic = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  // Progress of the global timeline inside a [start, end] window, clamped 0..1
  const getLocalProgress = (p, start, end) => clamp((p - start) / (end - start));

  /* ---------- 2. Configuration (edit timing/poses here, not in the engine) ----------
     emerge   : [start,end]  item leaves the box (or fades in) and drifts to its "scatter" pose
     assemble : [start,end]  item travels from the scatter pose to its final spot (x:0,y:0,r:0,s:1)
     scatter  : pose while floating. x,y in 1600-wide stage units, r in degrees, s scale, sy extra Y scale
     fromBox  : true = starts at the box; false = starts at its scatter pose and just fades in
     depth    : parallax multiplier for travel (fg 1.1, mid 1, bg .85)                              */
  const FURNITURE = {
    rug:      { emerge: [.14, .30], assemble: [.30, .46], scatter: { x: 0,    y: 300,  r: 4,   s: .35 }, fromBox: true,  depth: 1.0 },
    sofa:     { emerge: [.16, .32], assemble: [.36, .56], scatter: { x: 120,  y: -260, r: 8,   s: .6 },  fromBox: true,  depth: 1.0 },
    cushions: { emerge: [.18, .34], assemble: [.48, .62], scatter: { x: -60,  y: -340, r: -25, s: .5 },  fromBox: true,  depth: 1.1 },
    table:    { emerge: [.18, .34], assemble: [.46, .60], scatter: { x: -40,  y: -200, r: -12, s: .5 },  fromBox: true,  depth: 1.1 },
    vases:    { emerge: [.20, .36], assemble: [.54, .66], scatter: { x: 60,   y: -360, r: 20,  s: .4 },  fromBox: true,  depth: 1.1 },
    sideL:    { emerge: [.17, .33], assemble: [.50, .62], scatter: { x: -420, y: -120, r: -14, s: .5 },  fromBox: true,  depth: 1.1 },
    lampL:    { emerge: [.17, .33], assemble: [.54, .66], scatter: { x: -380, y: -300, r: -18, s: .5 },  fromBox: true,  depth: 1.1 },
    sideR:    { emerge: [.17, .33], assemble: [.52, .64], scatter: { x: 420,  y: -140, r: 14,  s: .5 },  fromBox: true,  depth: 1.1 },
    cabL:     { emerge: [.16, .32], assemble: [.44, .58], scatter: { x: -520, y: 80,   r: -12, s: .8 },  fromBox: true,  depth: 1.1 },
    cabR:     { emerge: [.16, .32], assemble: [.44, .58], scatter: { x: 520,  y: 80,   r: 10,  s: .8 },  fromBox: true,  depth: 1.1 },
    plantL:   { emerge: [.20, .34], assemble: [.60, .72], scatter: { x: -400, y: 200,  r: -10, s: .6 },  fromBox: false, depth: 1.1 },
    plantR:   { emerge: [.20, .34], assemble: [.60, .72], scatter: { x: 400,  y: 150,  r: 10,  s: .6 },  fromBox: false, depth: 1.1 },
    pendC:    { emerge: [.26, .40], assemble: [.65, .76], scatter: { x: 0,    y: -420, r: 0,   s: 1 },  fromBox: false, depth: .9 },
    pendL:    { emerge: [.26, .40], assemble: [.67, .76], scatter: { x: 0,    y: -460, r: 0,   s: 1 },  fromBox: false, depth: .9 }
  };

  const BOX_CENTER = { x: 800, y: 600 };        // where items "come out" (stage units)
  const PARTICLE_COUNT = 26;
  const EXIT_START = .96;                       // raw scroll point where the scene starts releasing

  /* ---------- 3. Cached DOM references ---------- */
  const section = document.getElementById('room');
  const stage = document.getElementById('stage');
  const nav = document.getElementById('nav');
  const box = document.getElementById('box');
  const boxInner = box.querySelector('.box-inner');
  const boxGlow = box.querySelector('.box-glow');
  const cue = document.getElementById('cue');
  const hero = document.getElementById('hero');
  const shadeDark = document.querySelector('.shade-dark');
  const shadeWarm = document.querySelector('.shade-warm');
  const shadeHero = document.querySelector('.shade-hero');
  const heroParts = [...hero.querySelectorAll('[data-reveal]')].map(el => {
    const [start, end] = el.dataset.reveal.split(',').map(Number);
    return { el, start, end };
  });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileQuery = window.matchMedia('(max-width: 760px)');

  /* ---------- 4. Build items, planks and particles once ---------- */
  const items = Object.keys(FURNITURE).map((key, i) => {
    const el = stage.querySelector(`[data-item="${key}"]`);
    const cs = getComputedStyle(el);
    const n = name => parseFloat(cs.getPropertyValue(name));
    const cx = n('--x') + n('--w') / 2, cy = n('--y') + n('--h') / 2;
    return { el, cfg: FURNITURE[key], seed: i * 1.7,
             origin: { x: BOX_CENTER.x - cx, y: BOX_CENTER.y - cy, r: 0, s: .12 } };
  });

  const particleBox = document.getElementById('particles');
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const el = document.createElement('span');
    const size = 3 + Math.random() * 6;
    el.style.width = el.style.height = size + 'px';
    particleBox.appendChild(el);
    return { el, x: (Math.random() - .5) * 150, rise: 120 + Math.random() * 220,
             delay: Math.random() * .12, sway: 8 + Math.random() * 16, seed: Math.random() * 6.28 };
  });

  /* ---------- 5. Layout cache (never read layout inside the render loop) ---------- */
  let sectionTop = 0, scrollRange = 1, unit = 1, travel = 1, spin = 1;
  function measure() {
    sectionTop = section.offsetTop;
    scrollRange = Math.max(1, section.offsetHeight - window.innerHeight);
    unit = stage.offsetWidth / 1600;                 // stage units → px
    travel = mobileQuery.matches ? .55 : 1;          // shorter flights on small screens
    spin = mobileQuery.matches ? .5 : 1;             // gentler rotations
  }

  /* ---------- 6. Render: one function maps progress → all visuals ---------- */
  function renderItem(item, p) {
    const { cfg, origin, seed } = item;
    const pe = getLocalProgress(p, cfg.emerge[0], cfg.emerge[1]);
    const pa = getLocalProgress(p, cfg.assemble[0], cfg.assemble[1]);
    const eE = easeOutCubic(pe), eA = easeInOutCubic(pa);
    const sc = cfg.scatter, syScatter = sc.sy ?? 1;

    // Stage 1: box (or scatter pose) → floating scatter pose
    const from = cfg.fromBox ? origin : { x: sc.x * travel, y: sc.y * travel, r: sc.r, s: sc.s };
    let x = lerp(from.x, sc.x * travel, eE);
    let y = lerp(from.y, sc.y * travel, eE);
    let r = lerp(from.r, sc.r * spin, eE);
    let s = lerp(from.s, sc.s, eE);
    const sy = lerp(cfg.fromBox ? 1 : syScatter, syScatter, eE);

    // Stage 2: scatter pose → final pose
    x = lerp(x, 0, eA); y = lerp(y, 0, eA); r = lerp(r, 0, eA); s = lerp(s, 1, eA);
    const syFinal = lerp(sy, 1, eA);

    // Floating bob while in flight + tiny scale "settle"
    y += Math.sin(p * 38 + seed) * 6 * (eE * (1 - pa)) ;
    s *= 1 + .012 * Math.sin(Math.PI * pa);

    const d = unit * cfg.depth;
    item.el.style.transform =
      `translate3d(${(x * d).toFixed(2)}px, ${(y * d).toFixed(2)}px, 0) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)}, ${(s * syFinal).toFixed(4)})`;
    item.el.style.opacity = clamp(pe * 3).toFixed(3);
  }

  function renderBox(p) {
    const open = easeInOutCubic(getLocalProgress(p, .04, .18));
    const fade = 1 - getLocalProgress(p, .65, .75);
    const glow = Math.sin(Math.PI * getLocalProgress(p, .06, .46));
    const grow = lerp(1, 1.12, getLocalProgress(p, 0, .15)) * lerp(1, .72, getLocalProgress(p, .3, .62));
    box.style.setProperty('--open', open.toFixed(3));
    boxInner.style.transform =
      `translate(-50%, -78%) scale(${grow.toFixed(3)}) rotateY(${lerp(-6, 5, open).toFixed(2)}deg) rotateX(${lerp(0, -4, open).toFixed(2)}deg)`;
    boxGlow.style.opacity = (glow * .9).toFixed(3);
    box.style.opacity = fade.toFixed(3);
    box.style.visibility = fade <= 0 ? 'hidden' : 'visible';
  }

  function renderParticles(p) {
    for (const q of particles) {
      const t = getLocalProgress(p, .07 + q.delay, .44);
      q.el.style.opacity = (Math.sin(Math.PI * t) * .85).toFixed(3);
      q.el.style.transform =
        `translate3d(${(q.x * unit + Math.sin(t * 6 + q.seed) * q.sway).toFixed(1)}px, ${(-t * q.rise * unit).toFixed(1)}px, 0)`;
    }
  }

  function render(rawScroll) {
    const raw = clamp((rawScroll - sectionTop) / scrollRange);       // scrollbar position in this section
    const p = reduceMotion ? 1 : clamp(raw / EXIT_START);            // animation timeline (hold at 1 during exit)
    const exit = getLocalProgress(raw, EXIT_START, 1);               // 0 → 1 while the scene releases

    if (!reduceMotion) {
      for (const item of items) renderItem(item, p);
      renderBox(p);
      renderParticles(p);
    } else {
      for (const item of items) { item.el.style.transform = 'none'; item.el.style.opacity = 1; }
    }

    // Lighting: dim, cool room → warm, bright room → cinematic hero gradient → exit darkening
    const dim = lerp(.5, 0, easeOutCubic(getLocalProgress(p, 0, .82)));
    shadeDark.style.opacity = (dim + exit * .45).toFixed(3);
    shadeWarm.style.opacity = getLocalProgress(p, .5, .82).toFixed(3);
    shadeHero.style.opacity = getLocalProgress(p, .78, .95).toFixed(3);

    // Navbar + scroll cue
    nav.style.setProperty('--nav', (reduceMotion ? 1 : easeOutCubic(getLocalProgress(p, .7, .85))).toFixed(3));
    cue.style.opacity = (1 - getLocalProgress(p, .01, .06)).toFixed(3);

    // Hero copy: staged fade + rise, then lifts away during exit
    for (const part of heroParts) {
      const t = easeOutCubic(getLocalProgress(p, part.start, part.end));
      part.el.style.opacity = t.toFixed(3);
      part.el.style.transform = `translate3d(0, ${((1 - t) * 34).toFixed(1)}px, 0)`;
      part.el.style.visibility = t < .02 ? 'hidden' : 'visible';       // keeps hidden buttons out of tab order
    }
    hero.style.transform = `translate3d(0, ${(-exit * 70).toFixed(1)}px, 0)`;
    hero.style.opacity = (1 - exit * .6).toFixed(3);
  }

  /* ---------- 7. Scroll → rAF (passive listener, one frame at a time) ---------- */
  let latestScrollY = window.scrollY, ticking = false;
  function onFrame() { ticking = false; render(latestScrollY); }
  function requestRender() { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } }
  window.addEventListener('scroll', () => { latestScrollY = window.scrollY; requestRender(); }, { passive: true });
  window.addEventListener('resize', () => { measure(); latestScrollY = window.scrollY; requestRender(); });
  window.addEventListener('load', () => { measure(); requestRender(); });  // fonts/images may shift offsets
  mobileQuery.addEventListener('change', () => { measure(); requestRender(); });

  measure();
  render(window.scrollY);

  /* ---------- 8. Gentle reveal for the ordinary sections below the scene ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: .15 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }
})();

const loginBtn = document.getElementById("loginBtn");
const servicesSection = document.getElementById("services");
const hrServicesSection = document.getElementById("EandHRServices");
const servicesNav = document.getElementById("servicesNav");

const storedUser = localStorage.getItem("currentUser");

if (storedUser) {

    const currentUser = JSON.parse(storedUser);

    if (currentUser.role === "EMP" || currentUser.role === "HR") {

        servicesSection.style.display = "none";
        hrServicesSection.style.display = "block";
        servicesNav.href = "#EandHRServices";
        loginBtn.innerHTML = `Logout <span>↗</span>`;
        loginBtn.href = "#";
        loginBtn.addEventListener("click", function (e) {
            e.preventDefault();

            localStorage.removeItem("currentUser");

            window.location.reload();
        });
    }

} else {
    servicesSection.style.display = "block";
    hrServicesSection.style.display = "none";
    servicesNav.href = "#services";
    loginBtn.innerHTML = `Login <span>↗</span>`;
    loginBtn.href = "../html/login.html";
}
const employeesCard = document.getElementById("employeesCard");

if (storedUser) {

    const currentUser = JSON.parse(storedUser);

    if (currentUser.role === "EMP") {
        employeesCard.style.display = "none";
        document.getElementById("employeesCard").style.display = "none";
        document.getElementById("leaveTitle").textContent ="Leave Application";
        document.getElementById("leaveDescription").textContent ="Submit your leave request by selecting the leave type, dates and reason.";
        document.getElementById("leaveButton").textContent ="Apply for Leave";
        document.getElementById("policiesTitle").textContent ="Company Policies";
        document.getElementById("policiesDescription").textContent ="View the company policies and guidelines that apply to you.";
        document.getElementById("policiesButton").textContent = "View Policies";
        document.getElementById("tasksTitle").textContent ="My Tasks";
        document.getElementById("tasksDescription").textContent ="View your assigned tasks and update their status.";
        document.getElementById("tasksButton").textContent ="View My Tasks";
        document.getElementById("feedbackTitle").textContent ="Send Feedback";
        document.getElementById("feedbackDescription").textContent ="Share your feedback, suggestions or concerns with the HR department.";
        document.getElementById("feedbackButton").textContent ="Send Feedback";
        document.getElementById("meetingsTitle").textContent ="My Meetings";
        document.getElementById("meetingsDescription").textContent ="View your meetings and manage your meeting requests.";
        document.getElementById("meetingsButton").textContent ="View Meetings";

    }
    else if (currentUser.role === "HR") {
        employeesCard.style.display = "flex";
    }

}
