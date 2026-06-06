document.addEventListener("DOMContentLoaded", () => {
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);
    }

    const galleryEl  = document.getElementById("gallery-container");
    const teachersEl = document.getElementById("teachers-container");
    const modalEl    = document.getElementById("work-modal");

    if (galleryEl && typeof galleryData !== "undefined") {
        renderGallery(galleryData, galleryEl);
        animateCards(".gallery-item");
        initGalleryFilters();
    }

    if (teachersEl && typeof teachersData !== "undefined") {
        renderTeachers(teachersData, teachersEl);
    }

    if (modalEl) initModal(modalEl);

    initNavAnimation();
    initLandingAnimation();
    initPageHeaderAnimation();
    initSectionAnimations();
});


function renderGallery(data, container) {
    container.innerHTML = "";
    data.forEach((work) => {
        const card = makeWorkCard(work);
        card.style.opacity = "1";
        container.appendChild(card);
    });
}

function getPlaceholderImage(title, author, tall = false) {
    const h = tall ? 700 : 420;
    const safeTitle = String(title).replace(/[<>&"']/g, "");
    const safeAuthor = String(author).replace(/[<>&"']/g, "");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="${h}" viewBox="0 0 400 ${h}">
        <rect width="400" height="${h}" fill="#ffe4ec"/>
        <rect x="24" y="24" width="352" height="${h - 48}" rx="12" fill="#ffc8dc"/>
        <text x="200" y="${h / 2 - 10}" text-anchor="middle" fill="#880e4f" font-family="Arial,sans-serif" font-size="18" font-weight="600">${safeTitle}</text>
        <text x="200" y="${h / 2 + 18}" text-anchor="middle" fill="#8a5d72" font-family="Arial,sans-serif" font-size="14">${safeAuthor}</text>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function makeWorkCard(work) {
    const card = document.createElement("article");
    card.className = "gallery-item";
    card.dataset.semester = work.semester || "";

    card.innerHTML = `
        <img src="${work.thumbnail}" alt="${escapeHtml(work.title)} — ${escapeHtml(work.author)}" loading="lazy">
        <div class="card-body">
            <h3 class="card-title">${escapeHtml(work.title)}</h3>
            <p class="card-author">${escapeHtml(work.author)}</p>
            <p class="card-semester">${escapeHtml(work.semester)}</p>
        </div>
    `;

    const img = card.querySelector("img");
    if (img) {
        img.addEventListener("error", () => {
            if (!img.dataset.fallback) {
                img.dataset.fallback = "1";
                img.src = getPlaceholderImage(work.title, work.author);
                return;
            }
            card.classList.add("img-error");
            const placeholder = document.createElement("div");
            placeholder.className = "img-placeholder";
            placeholder.textContent = "Brak podglądu";
            img.replaceWith(placeholder);
        });
    }

    card.addEventListener("click", () => openModal(work));
    return card;
}

function animateCards(selector) {
    const cards = document.querySelectorAll(selector);
    if (cards.length === 0) return;

    cards.forEach((c) => {
        c.style.opacity = "1";
        c.style.transform = "none";
    });

    if (typeof gsap === "undefined") return;

    gsap.from(cards, {
        y: 16,
        duration: 0.6,
        stagger: 0.04,
        ease: "power2.out",
        clearProps: "transform",
    });
}


function initGalleryFilters() {
    const buttons = document.querySelectorAll(".filter-btn");
    const empty = document.getElementById("gallery-empty");
    if (buttons.length === 0) return;

    buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
            buttons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            const filter = btn.dataset.filter;
            const cards = document.querySelectorAll(".gallery-item");
            let visibleCount = 0;

            cards.forEach((card) => {
                const match = filter === "all" || card.dataset.semester === filter;
                card.classList.toggle("is-hidden", !match);
                if (match) visibleCount++;
            });

            if (empty) empty.classList.toggle("hidden", visibleCount > 0);

            if (typeof gsap !== "undefined") {
                const visible = document.querySelectorAll(".gallery-item:not(.is-hidden)");
                visible.forEach((c) => (c.style.opacity = "1"));
                gsap.from(visible, {
                    y: 10,
                    duration: 0.4,
                    stagger: 0.03,
                    ease: "power2.out",
                    clearProps: "transform",
                });
            }
        });
    });
}

function renderTeachers(data, container) {
    container.innerHTML = "";

    data.forEach((teacher) => {
        const card = document.createElement("article");
        card.className = "teacher-card";
        const websiteLink = teacher.website
            ? `<a href="${escapeHtml(teacher.website)}" class="teacher-website" target="_blank" rel="noopener">Strona prowadzącego &rarr;</a>`
            : "";

        card.innerHTML = `
            <img src="${teacher.photo}" alt="${escapeHtml(teacher.name)}" loading="lazy">
            <h3 class="teacher-name">${escapeHtml(teacher.name)}</h3>
            <p class="teacher-title">${escapeHtml(teacher.title)}</p>
            <p class="teacher-bio">${escapeHtml(teacher.bio)}</p>
            ${websiteLink}
        `;
        container.appendChild(card);
    });
}

function initModal(modal) {
    const closeBtn = modal.querySelector(".close-btn");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
    });
}

function openModal(work) {
    const modal = document.getElementById("work-modal");
    const body = document.getElementById("modal-body");
    if (!modal || !body) return;

    const technikaTag = work.technika
        ? `<span class="modal-technika">${escapeHtml(work.technika)}</span>`
        : "";

    const modalImg = work.fullImage || getPlaceholderImage(work.title, work.author, true);

    body.innerHTML = `
        <div class="modal-image-wrap">
            <img src="${modalImg}" alt="${escapeHtml(work.title)} — ${escapeHtml(work.author)}">
        </div>
        <div class="modal-details">
            <div class="modal-tags">
                <span class="modal-semester">${escapeHtml(work.semester)}</span>
                ${technikaTag}
            </div>
            <h2 class="modal-title">${escapeHtml(work.title)}</h2>
            <p class="modal-author">autor: ${escapeHtml(work.author)}</p>
            <p class="modal-description">${escapeHtml(work.description)}</p>
        </div>
    `;

    const modalImage = body.querySelector(".modal-image-wrap img");
    if (modalImage) {
        modalImage.addEventListener("error", () => {
            if (!modalImage.dataset.fallback) {
                modalImage.dataset.fallback = "1";
                modalImage.src = getPlaceholderImage(work.title, work.author, true);
            }
        });
    }

    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    if (typeof gsap !== "undefined") {
        gsap.fromTo(modal, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power2.out" });
        gsap.fromTo(
            modal.querySelector(".modal-content"),
            { scale: 0.92, opacity: 0, y: 20 },
            { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }
        );
    }
}

function closeModal() {
    const modal = document.getElementById("work-modal");
    const body = document.getElementById("modal-body");
    if (!modal || modal.classList.contains("hidden")) return;

    const content = modal.querySelector(".modal-content");

    const cleanup = () => {
        modal.classList.add("hidden");
        if (body) body.innerHTML = "";
        modal.style.opacity = "";
        modal.style.visibility = "";
        document.body.style.overflow = "";
    };

    if (typeof gsap !== "undefined" && content) {
        gsap.to(content, { scale: 0.94, opacity: 0, y: 10, duration: 0.25, ease: "power2.in" });
        gsap.to(modal, { autoAlpha: 0, duration: 0.3, ease: "power2.in", onComplete: cleanup });
    } else {
        cleanup();
    }
}

function initNavAnimation() {
    if (typeof gsap === "undefined") return;
    gsap.from(".main-nav", { y: -50, opacity: 0, duration: 0.6, ease: "power3.out" });
}

function initLandingAnimation() {
    if (typeof gsap === "undefined") return;
    if (!document.querySelector(".landing-hero")) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".hero-eyebrow",      { y: -16, opacity: 0, duration: 0.7 })
      .from(".hero-subtitle",     { y: 24,  opacity: 0, duration: 0.7 }, "-=0.3")
      .from(".hero-actions > *",  { y: 18,  opacity: 0, duration: 0.6, stagger: 0.1 }, "-=0.4");
}

function initPageHeaderAnimation() {
    if (typeof gsap === "undefined") return;
    if (!document.querySelector(".page-header")) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".page-header h1", { y: 30, opacity: 0, duration: 0.8 })
      .from(".page-header p",  { y: 20, opacity: 0, duration: 0.7 }, "-=0.4");
}

function initSectionAnimations() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.utils.toArray(".about-section li").forEach((li, i) => {
        gsap.from(li, {
            x: -30, opacity: 0, duration: 0.6, delay: i * 0.08, ease: "power3.out",
            scrollTrigger: { trigger: li, start: "top 92%", toggleActions: "play none none none" },
        });
    });

    gsap.utils.toArray(".teacher-card").forEach((card, i) => {
        gsap.from(card, {
            y: 40, opacity: 0, duration: 0.7, delay: i * 0.1, ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 88%", toggleActions: "play none none none" },
        });
    });

    gsap.utils.toArray(".specialization-card").forEach((card, i) => {
        gsap.from(card, {
            y: 40, opacity: 0, duration: 0.7, delay: i * 0.1, ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 88%", toggleActions: "play none none none" },
        });
    });

    gsap.utils.toArray(".direction-intro").forEach((p) => {
        gsap.from(p, {
            y: 20, opacity: 0, duration: 0.8, ease: "power3.out",
            scrollTrigger: { trigger: p, start: "top 90%", toggleActions: "play none none none" },
        });
    });
}


function escapeHtml(value) {
    if (value === undefined || value === null) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
