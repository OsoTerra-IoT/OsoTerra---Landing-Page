const heroCarousel = document.querySelector("#ecosistema");

const floatingNavigation = document.querySelector("header .home-el-004");

if (floatingNavigation) {
  const syncNavigationGlass = () => {
    floatingNavigation.classList.toggle("is-scrolled", window.scrollY > 20);
  };

  syncNavigationGlass();
  window.addEventListener("scroll", syncNavigationGlass, { passive: true });
}

const primaryNavigation = document.querySelector("header .home-el-007");
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");

if (primaryNavigation && mobileMenuToggle) {
  const closeMobileMenu = () => {
    primaryNavigation.classList.remove("is-open");
    mobileMenuToggle.classList.remove("is-open");
    mobileMenuToggle.setAttribute("aria-expanded", "false");
    mobileMenuToggle.setAttribute("aria-label", "Abrir menú");
  };

  mobileMenuToggle.addEventListener("click", () => {
    const opening = !primaryNavigation.classList.contains("is-open");
    primaryNavigation.classList.toggle("is-open", opening);
    mobileMenuToggle.classList.toggle("is-open", opening);
    mobileMenuToggle.setAttribute("aria-expanded", String(opening));
    mobileMenuToggle.setAttribute(
      "aria-label",
      document.documentElement.lang === "en"
        ? opening
          ? "Close menu"
          : "Open menu"
        : opening
          ? "Cerrar menú"
          : "Abrir menú",
    );
  });

  primaryNavigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMobileMenu();
  });

  document.addEventListener("click", (event) => {
    if (
      primaryNavigation.classList.contains("is-open") &&
      !event.target.closest("header")
    ) {
      closeMobileMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1200) closeMobileMenu();
  });
}

if (primaryNavigation) {
  const navigationLinks = [...primaryNavigation.querySelectorAll("a[href]")];
  const currentPath = window.location.pathname.replace(/\/$/, "");
  const topNavigationLink = navigationLinks.find((link) => {
    const url = new URL(link.href, window.location.href);
    return url.pathname.replace(/\/$/, "") === currentPath && url.hash === "#top";
  });
  const sectionLinks = navigationLinks
    .map((link) => {
      const url = new URL(link.href, window.location.href);
      const linkPath = url.pathname.replace(/\/$/, "");
      const section =
        linkPath === currentPath && url.hash && url.hash !== "#top"
          ? document.querySelector(url.hash)
          : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  const activateLink = (activeLink) => {
    navigationLinks.forEach((link) => {
      if (link === activeLink) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  if (sectionLinks.length) {
    let scheduled = false;
    let lockedLink = null;
    let lockTimeout;

    const releaseActiveLock = () => {
      lockedLink = null;
      updateActiveSection();
    };

    const scheduleActiveUnlock = (delay = 180) => {
      window.clearTimeout(lockTimeout);
      lockTimeout = window.setTimeout(releaseActiveLock, delay);
    };

    const updateActiveSection = () => {
      if (lockedLink) {
        scheduled = false;
        return;
      }

      if (window.scrollY <= 20 && topNavigationLink) {
        activateLink(topNavigationLink);
        scheduled = false;
        return;
      }

      const headerHeight =
        document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      const activationLine = window.matchMedia("(min-width: 1200px)").matches
        ? window.innerHeight * 0.28
        : headerHeight + 64;
      const marker = window.scrollY + activationLine;
      let active = topNavigationLink
        ? { link: topNavigationLink, section: document.body }
        : sectionLinks[0];

      const reachedPageBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 8;

      if (reachedPageBottom) {
        active = sectionLinks.at(-1);
      } else {
        sectionLinks.forEach((item) => {
          if (item.section.offsetTop <= marker) active = item;
        });
      }

      activateLink(active.link);
      scheduled = false;
    };

    const lockActiveLink = (link) => {
      lockedLink = link;
      activateLink(link);
      scheduleActiveUnlock(1200);
    };

    const getHeading = (section) => section.querySelector("h1, h2");

    const getLayoutTop = (element) => {
      let top = 0;
      let current = element;

      while (current) {
        top += current.offsetTop;
        current = current.offsetParent;
      }

      return top;
    };

    const getSectionNavigationTop = (section) => {
      const scrollPadding =
        Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const scrollMargin =
        Number.parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
      const headerBottom =
        document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;

      return Math.max(scrollPadding + scrollMargin, headerBottom + 20);
    };

    const desktopSectionPositions = {
      capacidades: 0.19,
      faq: 0.19,
      equipo: 0.235,
      contacto: 0.205,
    };

    const scrollToSection = (section, behavior = "smooth") => {
      const heading = getHeading(section);
      if (!heading) {
        section.scrollIntoView({ behavior, block: "start" });
        return;
      }

      const compactNavigation = window.matchMedia("(max-width: 1199px)").matches;
      const headerHeight =
        document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      let viewportTop;

      if (section.id === "planes") {
        viewportTop = compactNavigation
          ? getSectionNavigationTop(section)
          : headerHeight + 24;
      } else if (compactNavigation) {
        const safeTop = getSectionNavigationTop(section);
        const centeredTop = (window.innerHeight - section.offsetHeight) / 2;
        viewportTop =
          section.id === "contacto"
            ? Math.max(safeTop, centeredTop)
            : safeTop;
      } else {
        viewportTop =
          window.innerHeight * (desktopSectionPositions[section.id] ?? 0.19);
      }

      const targetTop = getLayoutTop(section) - viewportTop;
      window.scrollTo({ top: Math.max(0, targetTop), behavior });
    };

    const topScrollLinks = [...document.querySelectorAll("header a[href]")].filter(
      (link) => {
        const url = new URL(link.href, window.location.href);
        const linkPath = url.pathname.replace(/\/$/, "");
        return (
          linkPath === currentPath &&
          ["#top", "#ecosistema", "#"].includes(url.hash)
        );
      },
    );

    topScrollLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        if (topNavigationLink) lockActiveLink(topNavigationLink);
        primaryNavigation.classList.remove("is-open");
        mobileMenuToggle?.classList.remove("is-open");
        mobileMenuToggle?.setAttribute("aria-expanded", "false");
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}`,
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    sectionLinks.forEach(({ link, section }) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        lockActiveLink(link);
        window.history.pushState(null, "", link.hash);
        scrollToSection(section);
      });
    });

    document.querySelectorAll("#faq details").forEach((detail) => {
      detail.addEventListener("toggle", () => {
        const faqItem = sectionLinks.find(({ section }) => section.id === "faq");
        if (faqItem) lockActiveLink(faqItem.link);

        window.setTimeout(() => {
          if (detail.open) {
            const headerBottom =
              document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
            const bounds = detail.getBoundingClientRect();
            const upperLimit = headerBottom + 20;
            const lowerLimit = window.innerHeight - 24;
            let adjustment = 0;

            if (bounds.bottom > lowerLimit) adjustment = bounds.bottom - lowerLimit;
            if (bounds.top < upperLimit) adjustment = bounds.top - upperLimit;

            if (Math.abs(adjustment) > 1) {
              window.scrollBy({ top: adjustment, behavior: "smooth" });
            }
          }

          scheduleActiveUnlock(240);
        }, 380);
      });
    });

    window.addEventListener(
      "scroll",
      () => {
        if (lockedLink) {
          scheduleActiveUnlock();
          return;
        }
        if (!scheduled) {
          scheduled = true;
          window.requestAnimationFrame(updateActiveSection);
        }
      },
      { passive: true },
    );
    window.addEventListener("resize", updateActiveSection);
    const hashLink = sectionLinks.find(
      ({ link }) => new URL(link.href, window.location.href).hash === window.location.hash,
    );
    if (hashLink && window.location.hash) {
      lockActiveLink(hashLink.link);
      window.requestAnimationFrame(() => scrollToSection(hashLink.section, "auto"));
    } else updateActiveSection();
  }
}

if (heroCarousel) {
  const slides = [...heroCarousel.querySelectorAll(".hero-slide")];
  const previous = heroCarousel.querySelector(
    '[data-carousel-control="previous"]',
  );
  const next = heroCarousel.querySelector('[data-carousel-control="next"]');
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let activeSlide = 0;
  let autoplay;

  const setActiveControl = (direction) => {
    previous.classList.toggle("is-active", direction === "previous");
    next.classList.toggle("is-active", direction === "next");
  };

  const showSlide = (index, direction = "next") => {
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });
    setActiveControl(direction);
  };

  const pauseAutoplay = () => clearInterval(autoplay);
  const startAutoplay = () => {
    pauseAutoplay();
    if (!document.hidden && !reduceMotion && slides.length > 1) {
      autoplay = setInterval(() => showSlide(activeSlide + 1, "next"), 6500);
    }
  };

  if (slides.length > 1 && previous && next) {
    previous.addEventListener("click", () => {
      showSlide(activeSlide - 1, "previous");
      startAutoplay();
    });
    next.addEventListener("click", () => {
      showSlide(activeSlide + 1, "next");
      startAutoplay();
    });
    heroCarousel.addEventListener("mouseenter", pauseAutoplay);
    heroCarousel.addEventListener("mouseleave", startAutoplay);
    heroCarousel.addEventListener("focusin", pauseAutoplay);
    heroCarousel.addEventListener("focusout", (event) => {
      if (!heroCarousel.contains(event.relatedTarget)) startAutoplay();
    });
    document.addEventListener("visibilitychange", startAutoplay);
    setActiveControl("next");
    startAutoplay();
  }
}

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  const reveal = (selector, trigger, options = {}) => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    gsap.from(elements, {
      opacity: 0,
      y: 35,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.12,
      scrollTrigger: {
        trigger,
        start: "top 82%",
        once: true,
      },
      ...options,
    });
  };

  const hero = document.querySelector("#ecosistema");
  if (hero) {
    const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTimeline
      .from("nav", { opacity: 0, y: -20, duration: 0.8 })
      .from(
        "#hero-title, #ecosistema .hero-intro > p, #ecosistema .hero-action",
        {
          opacity: 0,
          y: 40,
          duration: 0.9,
          stagger: 0.15,
        },
      );
  }

  reveal("#beneficios .animation-grid > div", "#beneficios", {
    y: 50,
    duration: 0.8,
    stagger: 0.2,
  });
  reveal("#capacidades > div > div:first-child", "#capacidades", {
    scale: 0.96,
    y: 0,
  });
  reveal("#capacidades > div > div:nth-child(2) > div > div", "#capacidades", {
    x: 35,
    y: 0,
    stagger: 0.12,
  });
  const processSteps = [
    ...document.querySelectorAll("#proceso [data-process-step]"),
  ];
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (processSteps.length === 4 && !reducedMotion) {
    gsap.set(processSteps, { autoAlpha: 0, y: 36, scale: 0.96 });

    const processTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "#proceso",
        start: "top 80%",
        endTrigger: processSteps[3],
        end: "bottom 65%",
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });

    processSteps.forEach((step, index) => {
      processTimeline.to(
        step,
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.75,
          ease: "none",
        },
        index * 0.85,
      );
    });

    reveal("#proceso .process-photo", "#proceso .process-photo", { y: 25 });
  }
  reveal("#planes > div.animation-grid > div", "#planes", {
    y: 30,
    stagger: 0.14,
  });
  reveal("#faq details", "#faq", { y: 30, stagger: 0.12 });
  reveal(".cta-banner > div", ".cta-banner", { y: 30 });

}
