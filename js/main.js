/* levinkaus.de — progressive enhancement only; the page works without it. */

// Loaded synchronously in <head> so CSS can rely on .js before first paint.
document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    var menu = document.getElementById("nav-menu");
    var toggle = document.querySelector(".nav__toggle");

    /* Mobile menu
     * ------------------------------------------------------ */
    function setMenu(open) {
        if (!menu || !toggle) return;
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? toggle.dataset.labelClose : toggle.dataset.labelOpen);
        menu.classList.toggle("is-open", open);
    }

    if (toggle) {
        toggle.addEventListener("click", function () {
            setMenu(toggle.getAttribute("aria-expanded") !== "true");
        });

        menu.addEventListener("click", function (event) {
            if (event.target.closest("a[href^='#']")) setMenu(false);
        });

        window.matchMedia("(min-width: 60.0625em)").addEventListener("change", function () {
            setMenu(false);
        });
    }

    /* Language switcher: the native select opens the system menu,
     * choosing a language keeps the current section (#hash)
     * ------------------------------------------------------ */
    var langSelect = document.querySelector(".lang__select");

    if (langSelect) {
        langSelect.addEventListener("change", function () {
            var target = new URL(langSelect.value, window.location.href);
            // Opened straight from disk there is no web server to resolve "de/" to "de/index.html"
            if (window.location.protocol === "file:" && target.pathname.slice(-1) === "/") {
                target.pathname += "index.html";
            }
            target.search = "";
            target.hash = window.location.hash;
            window.location.href = target.href;
        });

        // Coming back via the browser's back button must show the current language again
        window.addEventListener("pageshow", function () {
            Array.prototype.forEach.call(langSelect.options, function (option) {
                if (option.defaultSelected) langSelect.value = option.value;
            });
        });
    }

    /* Escape closes the mobile menu and returns focus
     * ------------------------------------------------------ */
    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") return;

        if (toggle && toggle.getAttribute("aria-expanded") === "true") {
            setMenu(false);
            toggle.focus();
        }
    });

    /* Email: assembled here so the address is not in the HTML source
     * ------------------------------------------------------ */
    document.querySelectorAll("[data-email-user]").forEach(function (el) {
        var address = el.dataset.emailUser + "@" + el.dataset.emailDomain;
        var link = document.createElement("a");
        link.href = "mailto:" + address;
        link.className = el.className;
        link.textContent = el.dataset.emailLabel || address;
        el.replaceWith(link);
    });

    /* Badge filter: without JS every badge stays visible
     * ------------------------------------------------------ */
    document.querySelectorAll(".badges").forEach(function (section) {
        var buttons = section.querySelectorAll("[data-filter]");
        var items = section.querySelectorAll("[data-tags]");
        var status = section.querySelector("[role='status']");

        function apply(filter, announce) {
            var shown = 0;
            items.forEach(function (item) {
                var match = filter === "all" || item.dataset.tags.split(" ").indexOf(filter) !== -1;
                item.hidden = !match;
                if (match) shown++;
            });
            buttons.forEach(function (button) {
                button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
            });
            if (announce && status) {
                status.textContent = section.dataset.status.replace("{n}", shown).replace("{total}", items.length);
            }
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                apply(button.dataset.filter, true);
            });
        });

        var initial = section.querySelector("[data-filter][aria-pressed='true']");
        apply(initial ? initial.dataset.filter : "all", false);
    });

    if (!("IntersectionObserver" in window)) {
        document.querySelectorAll(".reveal").forEach(function (el) {
            el.classList.add("is-visible");
        });
        return;
    }

    /* Reveal on scroll
     * ------------------------------------------------------ */
    var revealer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealer.unobserve(entry.target);
        });
    }, { rootMargin: "0px 0px -10% 0px" });

    document.querySelectorAll(".reveal").forEach(function (el) {
        revealer.observe(el);
    });

    /* Highlight the section currently in view
     * ------------------------------------------------------ */
    var navLinks = document.querySelectorAll(".nav__links a[href^='#']");

    var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            navLinks.forEach(function (link) {
                link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
            });
        });
    }, { rootMargin: "-45% 0px -50% 0px" });

    navLinks.forEach(function (link) {
        var section = document.querySelector(link.getAttribute("href"));
        if (section) spy.observe(section);
    });
});
