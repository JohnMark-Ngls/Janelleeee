const STORAGE_KEY = "janelle.messages";
const LABELS = { hearts: "Mga puso", fireworks: "Paputok", petals: "Rosas", stars: "Bituin", all: "Lahat" };
const FALLBACKS = [
    "Mahal kita, Janelle.",
    "Ikaw ang paborito kong dahilan para ngumiti.",
    "Ikaw ang pinakamagandang nangyari sa akin."
];

const $ = (id) => document.getElementById(id);
const messageEl = $("message");
const counterEl = $("counter");
const statusEl = $("status");
const listEl = $("letterList");
const revealEl = $("reveal");
const revealText = $("revealText");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let closeTimer = null;

/* ---------- storage ---------- */
function load() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(data) ? data : [];
    } catch (e) {
        return [];
    }
}

function store(items) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
        setStatus("Hindi ma-save sa browser na ito.");
    }
}

function setStatus(text) {
    statusEl.textContent = text;
    clearTimeout(setStatus.t);
    if (text) setStatus.t = setTimeout(() => (statusEl.textContent = ""), 3500);
}

function selectedEffect() {
    return document.querySelector('input[name="effect"]:checked').value;
}

/* ---------- listahan ng sulat ---------- */
function render() {
    const items = load();
    listEl.innerHTML = "";

    if (!items.length) {
        const li = document.createElement("li");
        li.className = "empty";
        li.textContent = "basahin mo lang yung mga nakasulat.";
        listEl.appendChild(li);
        return;
    }

    items.forEach((item) => {
        const li = document.createElement("li");
        li.className = "letter";

        const p = document.createElement("p");
        p.textContent = item.text;

        const meta = document.createElement("div");
        meta.className = "meta";
        const date = new Date(item.date);
        meta.textContent = date.toLocaleDateString("fil-PH", { year: "numeric", month: "long", day: "numeric" }) +
            " \u2022 " + (LABELS[item.effect] || "Mga puso");

        const row = document.createElement("div");
        row.className = "row";

        const replay = document.createElement("button");
        replay.type = "button";
        replay.className = "btn btn-primary btn-small";
        replay.textContent = "Ulitin";
        replay.addEventListener("click", () => showMessage(item.text, item.effect));

        const del = document.createElement("button");
        del.type = "button";
        del.className = "btn btn-ghost btn-small";
        del.textContent = "Burahin";
        del.addEventListener("click", () => {
            store(load().filter((m) => m.id !== item.id));
            render();
        });

        row.append(replay, del);
        li.append(p, meta, row);
        listEl.appendChild(li);
    });
}

/* ---------- animation ng mensahe ---------- */
function buildReveal(text) {
    revealText.innerHTML = "";
    const per = Math.min(70, 4500 / Math.max(text.length, 1));
    let i = 0;

    text.split(/\s+/).filter(Boolean).forEach((word) => {
        const w = document.createElement("span");
        w.className = "word";
        for (const ch of word) {
            const s = document.createElement("span");
            s.className = "ch";
            s.textContent = ch;
            s.style.animationDelay = (reduceMotion ? 0 : 0.5 + (i * per) / 1000) + "s";
            w.appendChild(s);
            i++;
        }
        revealText.appendChild(w);
        revealText.appendChild(document.createTextNode(" "));
    });
}

function closeReveal() {
    clearTimeout(closeTimer);
    revealEl.classList.remove("is-open");
    window.Effects.stop();
}

function showMessage(text, effect) {
    clearTimeout(closeTimer);
    const msg = text.trim() || FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
    const duration = Math.max(7000, Math.min(15000, 4000 + msg.length * 70));

    buildReveal(msg);
    revealEl.classList.add("is-open");
    window.Effects.stop();
    window.Effects.play(effect, duration);
    closeTimer = setTimeout(closeReveal, duration + 2200);
}

/* ---------- events ---------- */
messageEl.addEventListener("input", () => {
    counterEl.textContent = messageEl.value.length + " / 280";
});

$("play").addEventListener("click", () => showMessage(messageEl.value, selectedEffect()));

$("save").addEventListener("click", () => {
    const text = messageEl.value.trim();
    if (!text) {
        setStatus("Magsulat muna bago i-save.");
        messageEl.focus();
        return;
    }
    const items = load();
    items.unshift({ id: Date.now(), text, effect: selectedEffect(), date: new Date().toISOString() });
    store(items);
    render();
    messageEl.value = "";
    counterEl.textContent = "0 / 280";
    setStatus("Na-save na sa listahan.");
});

revealEl.addEventListener("click", closeReveal);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeReveal(); });

$("logout").addEventListener("click", () => {
    localStorage.removeItem("janelle.auth");
    location.href = "index.html";
});

render();
