// This is a playful client-side gate, not a secure authentication system.
const LOGIN_EMAIL = "janelle";
const LOGIN_PASSWORD = "iloveyou";
const form = document.getElementById("loginForm");
const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");
const errorEl = document.getElementById("error");
const inner = document.getElementById("loginInner");
const toggle = document.getElementById("togglePass");

toggle.addEventListener("click", () => {
    const show = passEl.type === "password";
    passEl.type = show ? "text" : "password";
    toggle.textContent = show ? "Hide" : "Show";
    toggle.setAttribute("aria-pressed", String(show));
});
form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (emailEl.value.trim().toLowerCase() !== LOGIN_EMAIL || passEl.value !== LOGIN_PASSWORD) {
        errorEl.textContent = "That doesn't look quite right. Try again, love.";
        form.classList.remove("shake");
        void form.offsetWidth;
        form.classList.add("shake");
        return;
    }
    errorEl.textContent = "";
    localStorage.setItem("janelle.auth", "yes");
    inner.classList.add("is-in");
    window.Effects.play(["hearts", "petals"], 1000);
    setTimeout(() => { location.href = "love.html"; }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1100);
});
