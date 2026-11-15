/* ====== DITO MO PALITAN ANG LOGIN ====== */
const LOGIN_EMAIL = "janelle";
const LOGIN_PASSWORD = "iloveyou";
/* ======================================= */

const form = document.getElementById("loginForm");
const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");
const errorEl = document.getElementById("error");
const inner = document.getElementById("loginInner");
const toggle = document.getElementById("togglePass");

toggle.addEventListener("click", () => {
    const show = passEl.type === "password";
    passEl.type = show ? "text" : "password";
    toggle.textContent = show ? "Itago" : "Ipakita";
    toggle.setAttribute("aria-pressed", String(show));
});

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const okEmail = emailEl.value.trim().toLowerCase() === LOGIN_EMAIL;
    const okPass = passEl.value === LOGIN_PASSWORD;

    if (!okEmail || !okPass) {
        errorEl.textContent = "Mali ang email o password. Subukan ulit, mahal.";
        form.classList.remove("shake");
        void form.offsetWidth; // i-restart ang animation
        form.classList.add("shake");
        return;
    }

    errorEl.textContent = "";
    localStorage.setItem("janelle.auth", "yes");
    inner.classList.add("is-in");
    window.Effects.play(["hearts", "petals"], 1500);
    setTimeout(() => { location.href = "love.html"; }, 1700);
});
