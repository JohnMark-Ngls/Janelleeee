const STORAGE_KEY = "janelle.messages";
const LABELS = { hearts: "Hearts", fireworks: "Fireworks", petals: "Petals", stars: "Stars", all: "Everything" };
const INSPIRATION = [
    "You are my favorite reason to smile.",
    "Every day feels a little brighter with you in it.",
    "If I could choose anyone, I would still choose you.",
    "You make ordinary moments feel like magic.",
    "Home is wherever I am with you.",
    "Loving you is my favorite little adventure."
];
const REMINDERS = [
    "You make ordinary days feel a little more magical.",
    "You are loved more than words could ever say.",
    "The world is a little brighter because you're in it.",
    "My favorite place is right here with you."
];
const $ = (id) => document.getElementById(id);
const messageEl = $("message"), counterEl = $("counter"), statusEl = $("status"), listEl = $("letterList");
const revealEl = $("reveal"), revealText = $("revealText"), closeButton = $("closeReveal");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let closeTimer, statusTimer, lastFocus, editingId = null, filter = "all", inspirationIndex = -1, quoteIndex = 0;

function load() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(data) ? data.filter((item) => item && typeof item.text === "string") : [];
    } catch { return []; }
}
function store(items) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); return true; }
    catch { setStatus("Your note couldn't be saved in this browser."); return false; }
}
function setStatus(text) {
    statusEl.textContent = text;
    clearTimeout(statusTimer);
    if (text) statusTimer = setTimeout(() => { statusEl.textContent = ""; }, 4000);
}
function selectedEffect() { return document.querySelector('input[name="effect"]:checked').value; }
function updateCounter() { counterEl.textContent = `${messageEl.value.length} / 500`; }
function button(label, className, action) {
    const el = document.createElement("button");
    el.type = "button"; el.className = className; el.textContent = label; el.addEventListener("click", action);
    return el;
}
function render() {
    const items = load();
    $("noteCount").textContent = items.length;
    const query = $("search").value.trim().toLowerCase();
    const shown = items.filter((item) => (filter === "all" || item.favorite) && item.text.toLowerCase().includes(query));
    listEl.replaceChildren();
    if (!shown.length) {
        const empty = document.createElement("li"); empty.className = "empty";
        const icon = document.createElement("span"); icon.className = "empty-icon"; icon.textContent = "♡";
        const title = document.createElement("strong"); title.textContent = items.length ? "No notes found" : "Your story starts here";
        const description = document.createElement("p"); description.textContent = items.length ? "Try another search or filter." : "Save a little note and it will be waiting for you here.";
        empty.append(icon, title, description); listEl.appendChild(empty); return;
    }
    shown.forEach((item) => {
        const li = document.createElement("li"); li.className = "letter";
        const top = document.createElement("div"); top.className = "letter-top";
        const tag = document.createElement("span"); tag.className = "letter-tag"; tag.textContent = "♡  A LITTLE LOVE NOTE";
        const favorite = button(item.favorite ? "♥" : "♡", "favorite", () => {
            const current = load(); const target = current.find((entry) => entry.id === item.id);
            if (target) { target.favorite = !target.favorite; if (store(current)) render(); }
        });
        favorite.setAttribute("aria-label", item.favorite ? "Remove from favorites" : "Add to favorites");
        favorite.setAttribute("aria-pressed", String(!!item.favorite)); top.append(tag, favorite);
        const text = document.createElement("p"); text.className = "letter-text"; text.textContent = item.text;
        const meta = document.createElement("div"); meta.className = "meta";
        const date = new Date(item.date);
        meta.textContent = `${Number.isNaN(date.getTime()) ? "Saved note" : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}  ·  ${LABELS[item.effect] || "Hearts"}`;
        const row = document.createElement("div"); row.className = "letter-actions";
        const replay = button("Play ↗", "letter-play", () => showMessage(item.text, item.effect));
        const edit = button("Edit", "letter-action", () => {
            editingId = item.id; messageEl.value = item.text; updateCounter();
            const radio = document.querySelector(`input[name="effect"][value="${LABELS[item.effect] ? item.effect : "hearts"}"]`);
            radio.checked = true; $("save").innerHTML = "♡ &nbsp; Update note";
            setStatus("Editing your note. Save it when you're ready."); messageEl.focus(); messageEl.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        });
        const del = button("Delete", "letter-action", () => {
            if (store(load().filter((entry) => entry.id !== item.id))) {
                if (editingId === item.id) resetComposer();
                render(); setStatus("Note deleted.");
            }
        });
        row.append(replay, edit, del); li.append(top, text, meta, row); listEl.appendChild(li);
    });
}
function resetComposer() { editingId = null; messageEl.value = ""; updateCounter(); $("save").innerHTML = "♡ &nbsp; Save note"; }
function buildReveal(text) {
    revealText.replaceChildren();
    const per = Math.min(70, 4500 / Math.max(text.length, 1)); let i = 0;
    text.split(/\s+/).filter(Boolean).forEach((word) => {
        const wrapper = document.createElement("span"); wrapper.className = "word";
        for (const character of word) {
            const span = document.createElement("span"); span.className = "ch"; span.textContent = character;
            span.style.animationDelay = (reduceMotion ? 0 : 0.3 + (i * per) / 1000) + "s"; wrapper.appendChild(span); i++;
        }
        revealText.append(wrapper, document.createTextNode(" "));
    });
}
function closeReveal() {
    if (revealEl.hidden) return;
    clearTimeout(closeTimer); revealEl.classList.remove("is-open"); revealEl.hidden = true; window.Effects.stop();
    if (lastFocus) lastFocus.focus();
}
function showMessage(text, effect) {
    clearTimeout(closeTimer); lastFocus = document.activeElement;
    const msg = text.trim() || INSPIRATION[Math.floor(Math.random() * INSPIRATION.length)];
    const duration = Math.max(7000, Math.min(15000, 4000 + msg.length * 70));
    buildReveal(msg); revealEl.hidden = false; revealEl.classList.add("is-open"); closeButton.focus();
    window.Effects.stop(); if (!reduceMotion) window.Effects.play(effect || "hearts", duration);
    closeTimer = setTimeout(closeReveal, duration + 2200);
}
messageEl.addEventListener("input", updateCounter);
$("inspire").addEventListener("click", () => {
    inspirationIndex = (inspirationIndex + 1) % INSPIRATION.length;
    messageEl.value = INSPIRATION[inspirationIndex]; updateCounter(); messageEl.focus();
});
$("nextQuote").addEventListener("click", () => { quoteIndex = (quoteIndex + 1) % REMINDERS.length; $("quoteText").textContent = REMINDERS[quoteIndex]; });
$("play").addEventListener("click", () => showMessage(messageEl.value, selectedEffect()));
$("save").addEventListener("click", () => {
    const text = messageEl.value.trim();
    if (!text) { setStatus("Write a little note before saving."); messageEl.focus(); return; }
    const items = load();
    if (editingId !== null) {
        const item = items.find((entry) => entry.id === editingId);
        if (item) { item.text = text; item.effect = selectedEffect(); }
        else { setStatus("This note is no longer available."); return; }
    } else {
        items.unshift({ id: Date.now() + Math.random(), text, effect: selectedEffect(), date: new Date().toISOString(), favorite: false });
    }
    if (store(items)) { const wasEditing = editingId !== null; resetComposer(); render(); setStatus(wasEditing ? "Your note has been updated. ♡" : "Your note has been saved. ♡"); }
});
document.querySelectorAll(".filter").forEach((el) => el.addEventListener("click", () => {
    filter = el.dataset.filter;
    document.querySelectorAll(".filter").forEach((button) => { const active = button === el; button.classList.toggle("active", active); button.setAttribute("aria-pressed", String(active)); });
    render();
}));
$("search").addEventListener("input", render);
revealEl.addEventListener("click", closeReveal);
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeReveal(); if (event.key === "Tab" && !revealEl.hidden) { event.preventDefault(); closeButton.focus(); } });
$("logout").addEventListener("click", () => { localStorage.removeItem("janelle.auth"); location.href = "index.html"; });
render();
