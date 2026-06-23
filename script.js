/* ==========================
   ELEMENTS
========================== */

const loader = document.getElementById("loader");

const openingCover = document.getElementById("openingCover");

const enterWebsite = document.getElementById("enterWebsite");

const bgMusic = document.getElementById("bgMusic");

const shareAlbumButton = document.getElementById("shareAlbumButton");

const scrollProgress = document.getElementById("scrollProgress");

const musicToggle = document.getElementById("musicToggle");

const photoLightbox = document.getElementById("photoLightbox");

const lightboxImage = document.getElementById("lightboxImage");

const lightboxCaption = document.getElementById("lightboxCaption");

const lightboxClose = document.querySelector(".lightbox-close");

const lightboxPrev = document.querySelector(".lightbox-prev");

const lightboxNext = document.querySelector(".lightbox-next");

const lightboxDownload = document.getElementById("lightboxDownload");

function renderGalleryGrid(containerId, galleryKey, defaultClass) {
  const container = document.getElementById(containerId);
  const galleryItems = window.galleryData?.[galleryKey];

  if (!container || !Array.isArray(galleryItems)) {
    return;
  }

  container.innerHTML = "";
  container.classList.add(defaultClass);
  // If gallery data is empty for silentHeroes, try auto-detecting heroN.webp files
  if (
    Array.isArray(galleryItems) &&
    galleryItems.length === 0 &&
    galleryKey === "silentHeroes"
  ) {
    (async () => {
      let consecutiveMisses = 0;
      const max = 50;
      for (let i = 1; i <= max; i++) {
        const src = `images/heroes/hero${i}.webp`;
        // attempt to load sequentially
        // wait for load/error before continuing to next
        // stop after 6 consecutive misses
        // eslint-disable-next-line no-await-in-loop
        const found = await new Promise((resolve) => {
          const probe = new Image();
          probe.onload = () => {
            const img = document.createElement("img");
            img.src = src;
            img.alt = `Silent hero hero ${i}`;
            img.loading = "lazy";
            container.appendChild(img);
            updateLightboxPhotos();
            resolve(true);
          };
          probe.onerror = () => {
            resolve(false);
          };
          probe.src = src;
        });

        if (found) {
          consecutiveMisses = 0;
        } else {
          consecutiveMisses += 1;
        }

        if (consecutiveMisses >= 6) {
          break;
        }
      }
    })();

    return;
  }

  galleryItems.forEach((item) => {
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.alt || "Wedding album photo";
    container.appendChild(img);
  });
}

function initializeDynamicGalleries() {
  renderGalleryGrid("bestMomentsGrid", "bestMoments", "moments-grid");
  renderGalleryGrid("ceremonyGrid", "ceremony", "three-photo-grid");
  renderGalleryGrid("familyGrid", "family", "family-grid");
  renderGalleryGrid("receptionGrid", "reception", "reception-layout");
  renderGalleryGrid("silentHeroesGrid", "silentHeroes", "family-grid");
}

initializeDynamicGalleries();

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

/* ==========================
   LOADER
========================== */

window.addEventListener("load", () => {
  window.scrollTo(0, 0);

  setTimeout(() => {
    loader.style.opacity = "0";

    setTimeout(() => {
      loader.style.display = "none";

      openingCover.style.opacity = "1";

      openingCover.style.visibility = "visible";
    }, 1000);
  }, 1800);
});

/* ==========================
   ENTER ALBUM
========================== */

if (enterWebsite) {
  enterWebsite.addEventListener("click", () => {
    openingCover.style.opacity = "0";

    window.scrollTo(0, 0);

    setTimeout(() => {
      openingCover.style.display = "none";

      document.body.style.overflowY = "auto";

      if (musicToggle) {
        musicToggle.classList.add("is-visible");
      }
    }, 1000);

    if (bgMusic) {
      bgMusic
        .play()
        .then(() => {
          if (musicToggle) {
            musicToggle.classList.remove("is-muted");
          }
        })
        .catch(() => {
          if (musicToggle) {
            musicToggle.classList.add("is-muted");
          }
        });
    }
  });
}

/* ==========================
   MUSIC TOGGLE
========================== */

if (musicToggle && bgMusic) {
  musicToggle.classList.add("is-muted");

  musicToggle.addEventListener("click", () => {
    if (bgMusic.paused) {
      bgMusic
        .play()
        .then(() => {
          musicToggle.classList.remove("is-muted");
        })
        .catch(() => {});

      return;
    }

    bgMusic.pause();

    musicToggle.classList.add("is-muted");
  });
}

/* ==========================
   SCROLL PROGRESS
========================== */

function updateScrollProgress() {
  if (!scrollProgress) {
    return;
  }

  const scrollableHeight =
    document.documentElement.scrollHeight - window.innerHeight;

  const progress =
    scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;

  scrollProgress.style.width = `${Math.min(progress, 100)}%`;
}

window.addEventListener("scroll", updateScrollProgress, { passive: true });

window.addEventListener("resize", updateScrollProgress);

updateScrollProgress();

/* ==========================
   REVEAL ANIMATION
========================== */

const revealElements = document.querySelectorAll(`
    .hero-cover-content,
    .quote-inner,
    .section-heading,
    .wedding-day-layout,
    .gallery-grid,
    .film-section video,
    .reception-layout,
    .thank-you-section > *,
    .share-section button,
    .site-footer > *
`);

revealElements.forEach((element, index) => {
  element.classList.add("reveal");

  if (index % 3 === 1) {
    element.classList.add("reveal-delay-1");
  }

  if (index % 3 === 2) {
    element.classList.add("reveal-delay-2");
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");

        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
  },
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});

/* ==========================
   PHOTO LIGHTBOX
========================== */

let lightboxPhotos = [];

function updateLightboxPhotos() {
  lightboxPhotos = Array.from(
    document.querySelectorAll(`
      .hero-cover > img,
      .wedding-day-layout img,
      .gallery-grid img,
      .reception-layout img
    `),
  );
}

updateLightboxPhotos();

let currentPhotoIndex = 0;

function showPhoto(index) {
  updateLightboxPhotos();
  if (!photoLightbox || !lightboxImage || lightboxPhotos.length === 0) {
    return;
  }

  currentPhotoIndex = (index + lightboxPhotos.length) % lightboxPhotos.length;

  const selectedPhoto = lightboxPhotos[currentPhotoIndex];

  lightboxImage.src = selectedPhoto.currentSrc || selectedPhoto.src;

  lightboxImage.alt = selectedPhoto.alt || "Wedding album photo";

  if (lightboxCaption) {
    lightboxCaption.textContent = selectedPhoto.alt || "";
  }

  if (lightboxDownload) {
    const src = lightboxImage.src || "";
    lightboxDownload.href = src;
    try {
      const parts = src.split(/\//);
      lightboxDownload.download = parts[parts.length - 1] || "photo.jpg";
    } catch (e) {
      lightboxDownload.download = "photo.jpg";
    }
  }

  photoLightbox.classList.add("is-open");

  photoLightbox.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";
}

function closePhoto() {
  if (!photoLightbox) {
    return;
  }

  photoLightbox.classList.remove("is-open");

  photoLightbox.setAttribute("aria-hidden", "true");

  lightboxImage.removeAttribute("src");

  document.body.style.overflow = "";

  document.body.style.overflowY = "auto";
}

function showNextPhoto() {
  showPhoto(currentPhotoIndex + 1);
}

function showPreviousPhoto() {
  showPhoto(currentPhotoIndex - 1);
}

lightboxPhotos.forEach((photo, index) => {
  photo.addEventListener("click", () => {
    showPhoto(index);
  });
});

document.addEventListener("click", (event) => {
  const clickedPhoto = event.target.closest(`
        .hero-cover,
        .hero-cover > img,
        .wedding-day-layout img,
        .gallery-grid img,
        .reception-layout img
    `);

  if (!clickedPhoto) {
    return;
  }

  const photoElement = clickedPhoto.classList.contains("hero-cover")
    ? clickedPhoto.querySelector("img")
    : clickedPhoto;

  const photoIndex = lightboxPhotos.indexOf(photoElement);

  if (photoIndex >= 0) {
    showPhoto(photoIndex);
  }
});

if (lightboxClose) {
  lightboxClose.addEventListener("click", closePhoto);
}

if (lightboxNext) {
  lightboxNext.addEventListener("click", showNextPhoto);
}

if (lightboxPrev) {
  lightboxPrev.addEventListener("click", showPreviousPhoto);
}

if (photoLightbox) {
  photoLightbox.addEventListener("click", (event) => {
    if (event.target === photoLightbox) {
      closePhoto();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (!photoLightbox || !photoLightbox.classList.contains("is-open")) {
    return;
  }

  if (event.key === "Escape") {
    closePhoto();
  }

  if (event.key === "ArrowRight") {
    showNextPhoto();
  }

  if (event.key === "ArrowLeft") {
    showPreviousPhoto();
  }
});

/* ==========================
   SHARE ALBUM
========================== */

if (shareAlbumButton) {
  shareAlbumButton.addEventListener("click", () => {
    const shareData = {
      title: "Bana & Bella Wedding Album",
      text: "Bana & Bella Wedding Album",
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});

      return;
    }

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          shareAlbumButton.querySelector("span").textContent = "Link Copied";

          setTimeout(() => {
            shareAlbumButton.querySelector("span").textContent = "Share Album";
          }, 1800);
        })
        .catch(() => {});
    }
  });
}

/* ==========================
   AUTO-REFRESH GALLERY DATA
========================== */

let lastGalleryDataCheck = Date.now();

setInterval(() => {
  fetch("gallery-data.js", { cache: "no-store" })
    .then((response) => response.text())
    .then((text) => {
      // Parse the new data
      const newData = {};
      const match = text.match(/window\.galleryData\s*=\s*({[\s\S]*?});/);
      if (match) {
        try {
          eval(`newData = ${match[1]}`);
          // Check if data has changed
          if (JSON.stringify(newData) !== JSON.stringify(window.galleryData)) {
            console.log("📸 Gallery data updated! Refreshing galleries...");
            window.galleryData = newData;
            initializeDynamicGalleries();
            updateLightboxPhotos();
          }
        } catch (e) {
          console.error("Error parsing gallery data:", e);
        }
      }
    })
    .catch(() => {});
}, 2000); // Check every 2 seconds
