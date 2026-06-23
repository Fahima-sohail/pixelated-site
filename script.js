/* ═══════════════════════════════════════════════════════════════
   BIRTHDAY SITE – script.js
   ═══════════════════════════════════════════════════════════════ */

/* ── PASSCODE ─────────────────────────────────────────────────
   Change this to the actual birthday date in DDMMYYYY format  */
const SECRET = "26062006";

function checkCode() {
    const inp = document.getElementById("codeInput");
    const err = document.getElementById("codeErr");
    if (inp.value === SECRET) {
        err.style.display = "none";
        sfx("success");
        confettiBurst(52);
        setTimeout(() => gotoPage(2), 320);
    } else {
        sfx("error");
        err.style.display = "block";
        inp.value = "";
        inp.focus();
    }
}
document.getElementById("codeInput").addEventListener("keydown", e => {
    if (e.key === "Enter") checkCode();
});

/* ── NAVIGATION ───────────────────────────────────────────────── */
function gotoPage(n) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById("page" + n).classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
    sfx("click");
    if (n === 4) confettiBurst(64);
}

/* ── MACBOOK FLIP ─────────────────────────────────────────────── */
let macOpen = false;
function flipMac() {
    macOpen = !macOpen;
    document.getElementById("macFlipper").classList.toggle("flipped", macOpen);
    sfx("flip");
    confettiBurst(macOpen ? 68 : 24);
}

/* ── GALLERY / LIZARD ─────────────────────────────────────────── */
let activeCard = 0;

/* Pre-load the actual lizard.click lizard.wav */
const lizardAudio = new Audio("assets/lizard.wav");
lizardAudio.preload = "auto";

function lizardGo() {
    const btn   = document.getElementById("lizardBtn");
    const cards = [...document.querySelectorAll(".photo-card")];

    /* play the real lizard.click sound */
    lizardAudio.pause();
    lizardAudio.currentTime = 0;
    lizardAudio.play().catch(() => {
        /* If blocked, fall back to synth sound */
        synthLizard();
    });

    /* button bounce */
    btn.classList.remove("hop");
    void btn.offsetHeight;
    btn.classList.add("hop");

    /* shuffle cards */
    cards[activeCard].classList.remove("active");
    activeCard = (activeCard + 1) % cards.length;
    cards[activeCard].classList.add("active");

    confettiBurst(18);
}

/* ── AUDIO ENGINE ─────────────────────────────────────────────── */
let _ac;
function ac() {
    if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
    if (_ac.state === "suspended") _ac.resume();
    return _ac;
}

function sfx(kind) {
    switch (kind) {
        case "click":
            _tone(700, 0.04, "square", 0.05);
            break;
        case "success":
            _tone(523, 0.07);
            setTimeout(() => _tone(659, 0.08), 82);
            setTimeout(() => _tone(784, 0.14), 162);
            break;
        case "error":
            _tone(180, 0.12, "sawtooth", 0.05);
            setTimeout(() => _tone(140, 0.12, "sawtooth", 0.05), 95);
            break;
        case "flip":
            _tone(440, 0.06, "sine", 0.04);
            setTimeout(() => _tone(880, 0.1, "sine", 0.05), 70);
            break;
    }
}

function _tone(freq, dur, type = "square", vol = 0.07) {
    try {
        const ctx = ac(), t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g   = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(t); osc.stop(t + dur + 0.01);
    } catch (e) {}
}

/* Synthesised fallback if audio file blocked */
function synthLizard() {
    try {
        const ctx = ac(), now = ctx.currentTime;
        function chirp(t, f0, f1, dur) {
            const osc = ctx.createOscillator();
            const g   = ctx.createGain();
            const ws  = ctx.createWaveShaper();
            const c   = new Float32Array(256);
            for (let i = 0; i < 256; i++) {
                const x = (i * 2) / 256 - 1;
                c[i] = Math.sign(x) * (1 - Math.exp(-Math.abs(x) * 5));
            }
            ws.curve = c;
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(f0, t);
            osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
            g.gain.setValueAtTime(0.2, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + dur + 0.02);
            osc.connect(ws); ws.connect(g); g.connect(ctx.destination);
            osc.start(t); osc.stop(t + dur + 0.05);
        }
        chirp(now,        1400, 300, 0.07);
        chirp(now + 0.10, 1900, 260, 0.06);
        chirp(now + 0.20, 1100, 320, 0.05);
    } catch (e) {}
}

/* ── CONFETTI ─────────────────────────────────────────────────── */
const CONF_COLORS = [
    "#e84cb8","#ff69b4","#ffd56d",
    "#9fbea5","#c084fc","#ffffff","#ffd6e9"
];
const CONF_SHAPES = ["square", "circle", "star"];

function confettiBurst(n = 44) {
    for (let i = 0; i < n; i++) {
        const p    = document.createElement("div");
        const size = 8 + Math.random() * 9;
        const shape = CONF_SHAPES[Math.floor(Math.random() * CONF_SHAPES.length)];
        const color = CONF_COLORS[Math.floor(Math.random() * CONF_COLORS.length)];

        p.className = "confetti-piece";
        p.style.cssText = `
            left: ${Math.random() * 100}vw;
            width: ${size}px;
            height: ${size}px;
            background: ${shape === "star" ? "transparent" : color};
            border-radius: ${shape === "circle" ? "50%" : "2px"};
            ${shape === "star" ? `clip-path: polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%); background:${color};` : ""}
            --dx: ${Math.random() * 300 - 150}px;
            animation-duration: ${1.5 + Math.random() * 1.4}s;
            animation-delay: ${Math.random() * 0.2}s;
        `;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 3600);
    }
}

/* ══════════════════════════════════════════════════════════════
   ──────────── HOW TO ADD YOUR PHOTOS ─────────────────────────
   ══════════════════════════════════════════════════════════════

   1. Put your images in the  assets/  folder alongside this file:
         assets/cover.jpg      ← polaroid on page 1
         assets/photo1.jpg     ← gallery card 1
         assets/photo2.jpg     ← gallery card 2
         assets/photo3.jpg     ← gallery card 3
         assets/photo4.jpg     ← gallery card 4

   2. Uncomment the calls at the bottom of this file and fill in
      the correct filenames.

   3. Optionally call setLetter([...]) to change the message text.

   ══════════════════════════════════════════════════════════════ */

function setCoverPhoto(src) {
    const slot = document.getElementById("polaroidSlot");
    slot.innerHTML = `<img src="${src}" alt="Cover">`;
}

function setGalleryPhotos(srcs, captions) {
    document.querySelectorAll(".photo-card").forEach((card, i) => {
        if (srcs && srcs[i]) {
            const slot = card.querySelector(".photo-slot");
            slot.style.background = "none";
            slot.innerHTML = `<img src="${srcs[i]}" alt="photo">`;
        }
        if (captions && captions[i]) {
            card.querySelector(".photo-caption").textContent = captions[i];
        }
    });
}

function setLetter(paragraphs) {
    const el = document.getElementById("msgScroll");
    el.innerHTML =
        `<h2 class="bubble">Happy Birthday ♡</h2>` +
        [].concat(paragraphs).map(p => `<p>${p}</p>`).join("");
}

/* ── Uncomment & fill in your details: ───────────────────────

setCoverPhoto("assets/cover.jpg");

setGalleryPhotos(
    ["assets/photo1.jpg", "assets/photo2.jpg", "assets/photo3.jpg", "assets/photo4.jpg"],
    ["day at the sea", "tiny chaos", "favorite lore", "besties"]
);

setLetter([
    "Your first paragraph here.",
    "Second paragraph...",
    "Third paragraph..."
]);

──────────────────────────────────────────────────────────── */
