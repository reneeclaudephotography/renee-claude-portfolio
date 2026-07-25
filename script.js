/* =========================================================
   RC PORTFOLIO — SCRIPT.JS
   Renée-Claude Giguère
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("site-header");
    const languageToggle = document.getElementById("language-toggle");
    const menuToggle = document.getElementById("menu-toggle");
    const nav = document.getElementById("main-navigation");
    const navLinks = document.querySelectorAll(".navbar a");
    const footerYear = document.getElementById("current-year");
    const backToTop = document.getElementById("back-to-top");

    /* ---------------------------------------------------------
       1. Current year
    --------------------------------------------------------- */

    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }

    /* ---------------------------------------------------------
       2. Header scroll state + Back to top
    --------------------------------------------------------- */

    const updateScrollUI = () => {
        const scrolled = window.scrollY > 30;

        if (header) {
            header.classList.toggle("scrolled", scrolled);
        }

        if (backToTop) {
            backToTop.classList.toggle("visible", window.scrollY > 520);
        }
    };

    updateScrollUI();
    window.addEventListener("scroll", updateScrollUI, { passive: true });

    /* ---------------------------------------------------------
       3. Mobile menu
    --------------------------------------------------------- */

    const setMenuState = (open) => {
        if (!menuToggle || !nav) return;

        menuToggle.classList.toggle("is-open", open);
        nav.classList.toggle("open", open);

        menuToggle.setAttribute("aria-expanded", String(open));
        menuToggle.setAttribute(
            "aria-label",
            open ? "Close navigation menu" : "Open navigation menu"
        );
    };

    if (menuToggle && nav) {
        menuToggle.addEventListener("click", () => {
            const isOpen = nav.classList.contains("open");
            setMenuState(!isOpen);
        });

        navLinks.forEach((link) => {
            link.addEventListener("click", () => setMenuState(false));
        });

        document.addEventListener("click", (event) => {
            const clickedInsideNav = nav.contains(event.target);
            const clickedMenuButton = menuToggle.contains(event.target);

            if (!clickedInsideNav && !clickedMenuButton) {
                setMenuState(false);
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 1080) {
                setMenuState(false);
            }
        });
    }

    /* ---------------------------------------------------------
       4. Language toggle
    --------------------------------------------------------- */

    const STORAGE_KEY = "rc-portfolio-language";
    const supportedLanguages = ["en", "fr"];

    const getStoredLanguage = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return supportedLanguages.includes(saved) ? saved : null;
        } catch {
            return null;
        }
    };

    let currentLanguage = getStoredLanguage() || "en";

    const applyLanguage = (language) => {
        currentLanguage = supportedLanguages.includes(language)
            ? language
            : "en";

        document.documentElement.lang = currentLanguage;

        document.querySelectorAll("[data-en][data-fr]").forEach((element) => {
            const translatedText = element.dataset[currentLanguage];

            if (typeof translatedText === "string") {
                element.textContent = translatedText;
            }
        });

        if (languageToggle) {
            const nextLanguage = currentLanguage === "en" ? "fr" : "en";

            languageToggle.textContent = nextLanguage.toUpperCase();
            languageToggle.setAttribute(
                "aria-label",
                nextLanguage === "fr"
                    ? "Switch website language to French"
                    : "Passer le site en anglais"
            );
        }

        try {
            localStorage.setItem(STORAGE_KEY, currentLanguage);
        } catch {
            // localStorage can be unavailable in some private browsing contexts.
        }
    };

    applyLanguage(currentLanguage);

    if (languageToggle) {
        languageToggle.addEventListener("click", () => {
            applyLanguage(currentLanguage === "en" ? "fr" : "en");
        });
    }

    /* ---------------------------------------------------------
       5. Active navigation state
    --------------------------------------------------------- */

    const sections = Array.from(
        document.querySelectorAll("main section[id]")
    );

    const updateActiveNavigation = () => {
        if (!sections.length || !navLinks.length) return;

        const scrollPosition = window.scrollY + 150;
        let activeId = sections[0].id;

        sections.forEach((section) => {
            if (section.offsetTop <= scrollPosition) {
                activeId = section.id;
            }
        });

        navLinks.forEach((link) => {
            const targetId = link.getAttribute("href")?.replace("#", "");
            link.classList.toggle("active", targetId === activeId);
        });
    };

    updateActiveNavigation();
    window.addEventListener("scroll", updateActiveNavigation, {
        passive: true
    });

    /* ---------------------------------------------------------
       6. Reveal-on-scroll animations
    --------------------------------------------------------- */

    const revealTargets = document.querySelectorAll(
        [
            ".value-card",
            ".fact-card",
            ".timeline-item",
            ".recognition-card",
            ".featured-recognition",
            ".recognition-quote",
            ".expertise-card",
            ".education-card",
            ".contact-card"
        ].join(",")
    );

    revealTargets.forEach((element) => element.classList.add("reveal"));

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
        revealTargets.forEach((element) => element.classList.add("visible"));
    } else {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px"
            }
        );

        revealTargets.forEach((element) => revealObserver.observe(element));
    }

    /* ---------------------------------------------------------
       7. Smooth anchor handling
       Keeps fixed header from covering section headings.
    --------------------------------------------------------- */

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetSelector = link.getAttribute("href");

            if (!targetSelector || targetSelector === "#") return;

            const target = document.querySelector(targetSelector);

            if (!target) return;

            event.preventDefault();

            const headerOffset = header ? header.offsetHeight + 12 : 0;
            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                headerOffset;

            window.scrollTo({
                top: targetPosition,
                behavior: reducedMotion ? "auto" : "smooth"
            });

            history.replaceState(null, "", targetSelector);
        });
    });

    /* ---------------------------------------------------------
       8. Escape key closes mobile navigation
    --------------------------------------------------------- */

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setMenuState(false);
        }
    });
});
