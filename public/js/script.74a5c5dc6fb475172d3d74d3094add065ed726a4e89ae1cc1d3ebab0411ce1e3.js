(function () {
    var primaryNav = document.querySelector(".narrow-nav:not(.narrow-nav-bottom)");
    if (!primaryNav) {
        return;
    }

    var navMark = primaryNav.querySelector(".nav-mark");
    if (!navMark) {
        return;
    }

    function syncPrimaryNavRows() {
        primaryNav.classList.remove("narrow-nav--stacked");

        if (window.innerWidth > 760) {
            document.documentElement.style.setProperty("--nav-height", primaryNav.offsetHeight + "px");
            return;
        }

        var otherItems = Array.from(primaryNav.querySelectorAll("a:not(.nav-mark), button"));
        var markTop = navMark.offsetTop;
        var hasWrapped = otherItems.some(function (item) {
            return item.offsetTop > markTop + 1;
        });

        if (hasWrapped) {
            primaryNav.classList.add("narrow-nav--stacked");
        }

        document.documentElement.style.setProperty("--nav-height", primaryNav.offsetHeight + "px");
    }

    window.addEventListener("resize", syncPrimaryNavRows);
    window.addEventListener("load", syncPrimaryNavRows);
    syncPrimaryNavRows();
})();

(function () {
    var aboutToggle = document.querySelector("[data-about-toggle]");
    var aboutPanel = document.querySelector("#about.about-panel");
    var aboutClose = document.querySelector("[data-about-close]");
    var aboutBackdrop = document.querySelector("[data-about-backdrop]");

    if (!aboutToggle || !aboutPanel || !aboutClose || !aboutBackdrop) {
        return;
    }

    function setOpenState(open) {
        document.body.classList.toggle("about-open", open);
        aboutToggle.setAttribute("aria-expanded", open ? "true" : "false");
        aboutPanel.setAttribute("aria-hidden", open ? "false" : "true");
        aboutBackdrop.hidden = !open;

        if (open) {
            aboutPanel.focus();
            if (window.location.hash !== "#about") {
                window.history.pushState(null, "", "#about");
            }
            return;
        }

        if (window.location.hash === "#about") {
            window.history.pushState(null, "", window.location.pathname + window.location.search);
        }
    }

    function syncFromHash() {
        setOpenState(window.location.hash === "#about");
    }

    aboutToggle.addEventListener("click", function (event) {
        event.preventDefault();
        setOpenState(!document.body.classList.contains("about-open"));
    });

    aboutClose.addEventListener("click", function () {
        setOpenState(false);
    });

    aboutBackdrop.addEventListener("click", function () {
        setOpenState(false);
    });

    window.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && document.body.classList.contains("about-open")) {
            setOpenState(false);
        }
    });

    window.addEventListener("hashchange", syncFromHash);
    syncFromHash();
})();

(function () {
    var carousel = document.querySelector("[data-carousel]");

    if (!carousel) {
        return;
    }

    // Defensive cleanup in case an old injected autoplay toggle is still present.
    Array.from(carousel.querySelectorAll("figcaption button, .carousel-autoplay-toggle")).forEach(function (btn) {
        if (btn && btn.parentNode) {
            btn.parentNode.removeChild(btn);
        }
    });

    var slides = Array.from(document.querySelectorAll("[data-carousel-slide]"));
    var viewport = carousel.querySelector("[data-carousel-viewport]");
    var prevBtn = carousel.querySelector("[data-carousel-prev]");
    var nextBtn = carousel.querySelector("[data-carousel-next]");
    var lightbox = document.querySelector("[data-lightbox]");
    var lightboxImage = document.querySelector("[data-lightbox-image]");
    var lightboxCaption = document.querySelector("[data-lightbox-caption]");
    var lightboxPrev = document.querySelector("[data-lightbox-prev]");
    var lightboxNext = document.querySelector("[data-lightbox-next]");
    var lightboxClose = document.querySelector("[data-lightbox-close]");
    var current = 0;
    var lightboxIndex = 0;

    function openLightbox(index) {
        lightboxIndex = index;
        renderLightbox(lightboxIndex);
        lightbox.hidden = false;
        document.documentElement.classList.add("lightbox-open");
        document.body.classList.add("lightbox-open");
    }

    function closeLightbox() {
        lightbox.hidden = true;
        document.documentElement.classList.remove("lightbox-open");
        document.body.classList.remove("lightbox-open");
    }

    function renderLightbox(index) {
        var slide = slides[index];
        var img = slide.querySelector("img");
        var caption = slide.querySelector("figcaption");
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt || "Vergrote archieffoto";
        lightboxCaption.textContent = caption ? caption.textContent.trim() : "";
    }

    function nextLightbox() {
        lightboxIndex = (lightboxIndex + 1) % slides.length;
        renderLightbox(lightboxIndex);
    }

    function prevLightbox() {
        lightboxIndex = (lightboxIndex - 1 + slides.length) % slides.length;
        renderLightbox(lightboxIndex);
    }

    function render(index) {
        slides.forEach(function (slide, i) {
            var active = i === index;
            slide.classList.toggle("is-active", active);
            slide.setAttribute("aria-hidden", active ? "false" : "true");
        });

        current = index;
    }

    function next() {
        render((current + 1) % slides.length);
    }

    function prev() {
        render((current - 1 + slides.length) % slides.length);
    }

    nextBtn.addEventListener("click", next);
    prevBtn.addEventListener("click", prev);

    viewport.addEventListener("click", function (event) {
        var image = event.target.closest("img");
        if (!image) { return; }
        var slide = image.closest("[data-carousel-slide]");
        if (!slide) { return; }
        var index = slides.indexOf(slide);
        if (index >= 0) { openLightbox(index); }
    });

    viewport.addEventListener("keydown", function (event) {
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            prev();
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            next();
        }
    });

    lightboxPrev.addEventListener("click", prevLightbox);
    lightboxNext.addEventListener("click", nextLightbox);
    lightboxClose.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", function (event) {
        if (event.target === lightbox) { closeLightbox(); }
    });

    window.addEventListener("keydown", function (event) {
        if (lightbox.hidden) { return; }
        if (event.key === "Escape") { closeLightbox(); }
        if (event.key === "ArrowLeft") { prevLightbox(); }
        if (event.key === "ArrowRight") { nextLightbox(); }
    });

    // Touch swipe navigation
    var touchStartX = 0;
    var touchStartY = 0;
    lightbox.addEventListener("touchstart", function (event) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    }, { passive: true });
    lightbox.addEventListener("touchend", function (event) {
        var dx = event.changedTouches[0].clientX - touchStartX;
        var dy = event.changedTouches[0].clientY - touchStartY;
        // Only treat as horizontal swipe if dominant axis is horizontal
        if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) { return; }
        if (dx < 0) { nextLightbox(); } else { prevLightbox(); }
    }, { passive: true });

    var randomIndex = Math.floor(Math.random() * slides.length);
    render(randomIndex);
})();

(function () {
    var publicationsSection = document.querySelector("#publications");

    if (!publicationsSection) {
        return;
    }

    var items = Array.from(publicationsSection.querySelectorAll("[data-publication-item]"));
    var contextToggleBtn = document.querySelector("[data-context-publications-toggle]");
    var bottomNav = document.querySelector(".narrow-nav-bottom");

    if (!items.length || !contextToggleBtn || !bottomNav) {
        return;
    }

    var expanded = false;
    var collapsedCount = 5;
    var inPublicationsView = false;
    var atVisibleListEnd = false;
    var hasStartedScroll = false;

    function computeCollapsedCount() {
        if (window.innerWidth < 700) {
            return 3;
        }

        if (window.innerWidth < 1100) {
            return 5;
        }

        return 7;
    }

    function updateContextBar() {
        var sectionRect = publicationsSection.getBoundingClientRect();
        var sectionThresholdTop = window.innerHeight * 0.82;
        var sectionThresholdBottom = window.innerHeight * 0.18;
        var canExpand = items.length > collapsedCount;
        var lastVisibleItem = null;

        hasStartedScroll = window.scrollY > 16;
        inPublicationsView =
            sectionRect.top < sectionThresholdTop && sectionRect.bottom > sectionThresholdBottom;

        for (var i = items.length - 1; i >= 0; i -= 1) {
            if (!items[i].hidden) {
                lastVisibleItem = items[i];
                break;
            }
        }

        if (lastVisibleItem) {
            var lastRect = lastVisibleItem.getBoundingClientRect();
            atVisibleListEnd = lastRect.bottom <= window.innerHeight - 8;
        } else {
            atVisibleListEnd = false;
        }

        var showBottomNav = hasStartedScroll && inPublicationsView;
        bottomNav.classList.toggle("is-visible", showBottomNav);

        if (!showBottomNav || !canExpand || (!atVisibleListEnd && !expanded)) {
            contextToggleBtn.hidden = true;
            return;
        }

        contextToggleBtn.hidden = false;
        contextToggleBtn.setAttribute("aria-expanded", expanded ? "true" : "false");

        if (expanded) {
            contextToggleBtn.textContent = "Minder publicaties tonen";
            return;
        }

        var hiddenCount = Math.max(0, items.length - collapsedCount);
        contextToggleBtn.textContent = "Meer publicaties tonen (" + hiddenCount + ")";
    }

    function render() {
        var visibleCount = expanded ? items.length : collapsedCount;

        items.forEach(function (item, index) {
            var visible = index < visibleCount;
            item.hidden = !visible;
            item.setAttribute("aria-hidden", visible ? "false" : "true");
        });

        updateContextBar();
    }

    contextToggleBtn.addEventListener("click", function () {
        expanded = !expanded;
        render();
    });

    window.addEventListener("scroll", updateContextBar, { passive: true });

    window.addEventListener("resize", function () {
        var nextCollapsedCount = computeCollapsedCount();
        if (nextCollapsedCount !== collapsedCount) {
            collapsedCount = nextCollapsedCount;
            render();
            return;
        }

        updateContextBar();
    });

    collapsedCount = computeCollapsedCount();
    render();
})();
