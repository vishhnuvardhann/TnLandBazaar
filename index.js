/* ========================================
   TNLandBazaar — Professional Site JS
   Navigation, Tabs, Carousel, Forms
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Navbar Scroll Effect ─────────────────────
  const mainNav = document.getElementById('main-nav');

  const handleScroll = () => {
    mainNav.classList.toggle('scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ─── Mobile Navigation ────────────────────────
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileClose = document.getElementById('mobile-close');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const mobileLinks = mobileNav.querySelectorAll('.mobile-nav-link');

  const openMobile = () => {
    mobileNav.classList.add('active');
    mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeMobile = () => {
    mobileNav.classList.remove('active');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  mobileToggle.addEventListener('click', openMobile);
  mobileClose.addEventListener('click', closeMobile);
  mobileOverlay.addEventListener('click', closeMobile);
  mobileLinks.forEach(l => l.addEventListener('click', closeMobile));

  // ─── Smooth Scroll ────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        closeMobile();
        const offset = mainNav.offsetHeight + 20;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ─── Hero Tabs ────────────────────────────────
  const tabs = document.querySelectorAll('.hero-tab');
  const panels = document.querySelectorAll('.hero-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      panels.forEach(p => {
        p.classList.remove('active');
        if (p.id === `panel-${target}`) {
          p.classList.add('active');
        }
      });
    });
  });

  // ─── Scroll Reveal ────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  // ─── Translation Engine ───────────────────────
  let currentLang = 'en';
  try { currentLang = localStorage.getItem('tn_agri_lang') || 'en'; } catch (e) {}

  const updateTranslations = (lang) => {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (TRANSLATIONS[key] && TRANSLATIONS[key][lang]) {
        el.innerHTML = TRANSLATIONS[key][lang];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (TRANSLATIONS[key] && TRANSLATIONS[key][lang]) {
        el.placeholder = TRANSLATIONS[key][lang];
      }
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    document.documentElement.lang = lang;
    document.documentElement.classList.add('i18n-loaded');
  };

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLang = btn.dataset.lang;
      try { localStorage.setItem('tn_agri_lang', currentLang); } catch (e) {}
      updateTranslations(currentLang);
    });
  });

  if (typeof TRANSLATIONS !== 'undefined') {
    updateTranslations(currentLang);
  }

  // ─── Testimonials Carousel ────────────────────
  const slides = document.querySelectorAll('.testimonial-slide');
  const prevBtn = document.getElementById('t-prev');
  const nextBtn = document.getElementById('t-next');
  let current = 0;
  let autoplay;

  const goTo = (i) => {
    if (i < 0) i = slides.length - 1;
    if (i >= slides.length) i = 0;
    slides.forEach(s => s.classList.remove('active'));
    slides[i].classList.add('active');
    current = i;
  };

  const startAutoplay = () => {
    autoplay = setInterval(() => goTo(current + 1), 6000);
  };

  const resetAutoplay = () => {
    clearInterval(autoplay);
    startAutoplay();
  };

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => { goTo(current - 1); resetAutoplay(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); resetAutoplay(); });
  }

  startAutoplay();

  // ─── Listing ID Generator ───────────────────────
  function generateListingId(typeCode) {
    const year = new Date().getFullYear();
    let leads = [];
    try { leads = JSON.parse(localStorage.getItem('leads') || '[]'); } catch (e) {}
    // Count existing leads with the same type code
    const count = leads.filter(l => l.typeCode === typeCode).length;
    const seq = String(count + 1).padStart(4, '0');
    return `TNAB-${typeCode}-${year}-${seq}`;
  }

  // ─── Lead Storage Helper ──────────────────────
  function saveLead(data) {
    try {
      let leads = [];
      try { leads = JSON.parse(localStorage.getItem('leads') || '[]'); } catch (e) {}
      leads.push({
        ...data,
        date: new Date().toISOString()
      });
      try { localStorage.setItem('leads', JSON.stringify(leads)); } catch (e) {}
    } catch (e) {
      console.warn('Could not save lead:', e);
    }
  }

  // ─── Search Form → WhatsApp ───────────────────
  const searchForm = document.getElementById('search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = document.getElementById('search-place').value.trim();
      if (!query) return;

      saveLead({ name: '—', phone: '—', city: query, interest: 'Searching land', category: 'buying' });

      const msg = currentLang === 'ta'
        ? `வணக்கம், "${query}" பகுதியில் நிலம் தேடுகிறேன். தயவுசெய்து உதவுங்கள்.`
        : `Hi, I'm looking for land in "${query}". Please help me find available listings.`;
      window.open(`https://wa.me/919363752553?text=${encodeURIComponent(msg)}`, '_blank');
    });
  }

  // ─── Type code labels ─────────────────────────
  const TYPE_LABELS = {
    'AG': { en: 'Agricultural Land', ta: 'விவசாய நிலம்' },
    'DL': { en: 'Dry Land', ta: 'வறண்ட நிலம்' },
    'PL': { en: 'Plot / Vacant Land', ta: 'மனை / காலி நிலம்' },
    'OT': { en: 'Other', ta: 'பிற' }
  };

  // ─── Sell Form → WhatsApp ─────────────────────
  const sellForm = document.getElementById('sell-form');
  if (sellForm) {
    sellForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(sellForm);
      const name = fd.get('name') || '';
      const phone = fd.get('phone') || '';
      const address = fd.get('address') || '';
      const typeCode = fd.get('landtype') || 'OT';

      if (!name || !phone || !address) {
        shakeEl(sellForm);
        return;
      }

      // Generate unique listing ID
      const listingId = generateListingId(typeCode);
      const typeLabel = (TYPE_LABELS[typeCode] || TYPE_LABELS['OT'])[currentLang] || typeCode;

      const msg = currentLang === 'ta'
        ? `வணக்கம், எனது நிலத்தை விற்க விரும்புகிறேன்.\n\n📋 *விவரங்கள்:*\n• பதிவு எண்: ${listingId}\n• நில வகை: ${typeLabel}\n• பெயர்: ${name}\n• தொலைபேசி: ${phone}\n• இருப்பிடம்: ${address}\n\nதயவுசெய்து ஆலோசனை வழங்கவும்.`
        : `Hi, I'd like to sell my land.\n\n📋 *Details:*\n• Listing ID: ${listingId}\n• Land Type: ${typeLabel}\n• Name: ${name}\n• Phone: ${phone}\n• Location: ${address}\n\nPlease provide a consultation.`;

      saveLead({
        listingId,
        typeCode,
        typeLabel: (TYPE_LABELS[typeCode] || TYPE_LABELS['OT'])['en'],
        name,
        phone,
        city: address,
        interest: 'Selling land',
        category: 'selling',
        status: 'active'
      });

      window.open(`https://wa.me/919363752553?text=${encodeURIComponent(msg)}`, '_blank');
      sellForm.reset();
      showModal(listingId);
    });
  }

  // ─── Estimate Form → WhatsApp ─────────────────
  const estimateForm = document.getElementById('estimate-form');
  const estimateBtn = document.getElementById('estimate-btn');

  const handleEstimate = () => {
    const loc = document.getElementById('estimate-address').value.trim();
    if (!loc) return;
    const msg = currentLang === 'ta'
      ? `வணக்கம், எனது நிலத்தின் மதிப்பை அறிய விரும்புகிறேன்.\n\n📍 இருப்பிடம்: ${loc}\n\nதயவுசெய்து இலவச மதிப்பீட்டை வழங்கவும்.`
      : `Hi, I'd like to know the value of my land.\n\n📍 Location: ${loc}\n\nPlease provide a free estimate.`;
    saveLead({ name: '—', phone: '—', city: loc, interest: 'Land estimate', category: 'buying' });

    window.open(`https://wa.me/919363752553?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (estimateForm) {
    estimateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleEstimate();
    });
  }
  if (estimateBtn) {
    estimateBtn.addEventListener('click', handleEstimate);
  }

  // ─── Footer Contact Form ──────────────────────
  const footerForm = document.getElementById('footer-form');
  if (footerForm) {
    footerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(footerForm);
      const fname = fd.get('fname') || '';
      const lname = fd.get('lname') || '';
      const email = fd.get('email') || '';
      const phone = fd.get('phone') || '';
      const interest = fd.get('interest') || '';
      const message = fd.get('message') || '';

      if (!fname || !email || !phone) {
        shakeEl(footerForm);
        return;
      }

      const interestLabels = {
        'buyer': 'Buying land',
        'seller': 'Selling land',
        'both': 'Buying and selling',
        'valuation': 'Land valuation',
        'other': 'Other'
      };

      const msg = [
        `Hi TNLandBazaar,`,
        ``,
        `📋 *Contact Details:*`,
        `• Name: ${fname} ${lname}`,
        `• Email: ${email}`,
        `• Phone: ${phone}`,
        `• Interest: ${interestLabels[interest] || interest}`,
        message ? `• Message: ${message}` : '',
        ``,
        `Please get back to me. Thank you!`
      ].filter(Boolean).join('\n');

      const interestLabel = interestLabels[interest] || interest;
      const cat = (interest === 'seller') ? 'selling' : 'buying';
      saveLead({ name: `${fname} ${lname}`.trim(), phone, city: '—', interest: interestLabel, category: cat, status: 'active' });

      window.open(`https://wa.me/919363752553?text=${encodeURIComponent(msg)}`, '_blank');
      footerForm.reset();
      showModal();
    });
  }

  // ─── Modal ────────────────────────────────────
  const modal = document.getElementById('success-modal');
  const modalCloseBtn = document.getElementById('modal-close');
  const modalTextEl = modal?.querySelector('.modal-text');
  const modalListingIdEl = document.getElementById('modal-listing-id');

  const showModal = (listingId) => {
    if (listingId && modalTextEl) {
      const tpl = (TRANSLATIONS['modal.listingSuccess'] && TRANSLATIONS['modal.listingSuccess'][currentLang])
        || TRANSLATIONS['modal.listingSuccess']['en']
        || 'Your listing ID is {id} — save this for reference';
      modalTextEl.textContent = tpl.replace('{id}', listingId);
      modalTextEl.classList.add('modal-text--listing-id');
    } else if (modalTextEl) {
      modalTextEl.classList.remove('modal-text--listing-id');
      if (TRANSLATIONS['modal.text']) {
        modalTextEl.textContent = TRANSLATIONS['modal.text'][currentLang] || TRANSLATIONS['modal.text']['en'];
      }
    }
    if (modalListingIdEl) modalListingIdEl.style.display = 'none';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const hideModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', hideModal);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });

  // ─── Utility: Shake ───────────────────────────
  function shakeEl(el) {
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = 'shake 0.5s ease-out';
    setTimeout(() => { el.style.animation = ''; }, 500);
  }

  const shakeCSS = document.createElement('style');
  shakeCSS.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-8px); }
      40% { transform: translateX(8px); }
      60% { transform: translateX(-5px); }
      80% { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(shakeCSS);

  // ─── Keyboard (ESC) ──────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideModal();
      closeMobile();
    }
  });

  // ─── Dynamic Listings Renderer ─────────────────
  const DEMO_LISTINGS = [
    { id:'d1', price:'₹45,00,000', district:'Dindigul', taluk:'Vedasandur', village:'Vedasandur', landType:['Agriculture'], landIcon:'🌾', area:'5 Acres', feature:['Well Water'], featureIcon:'💧', badge:'active', image:'assets/listing-1.png', dateAdded:'2026-05-15T10:00:00Z' },
    { id:'d2', price:'₹18,00,000', district:'Dindigul', taluk:'Natham', village:'Natham', landType:['Dry Land','Vacant Plot'], landIcon:'🏜️', area:'3 Acres', feature:['Road Access'], featureIcon:'🛤️', badge:'active', image:'assets/listing-2.png', dateAdded:'2026-06-01T10:00:00Z' },
    { id:'d3', price:'₹72,00,000', district:'Dindigul', taluk:'Palani', village:'Palani', landType:['Paddy Land'], landIcon:'🌾', area:'8 Acres', feature:['Canal Water','Electricity'], featureIcon:'💧', badge:'active', image:'assets/listing-3.png', dateAdded:'2026-05-20T10:00:00Z' },
    { id:'d4', price:'₹1,20,00,000', district:'Dindigul', taluk:'Oddanchatram', village:'Oddanchatram', landType:['Coconut Farm'], landIcon:'🌴', area:'10 Acres', feature:['Bore Well','Fenced'], featureIcon:'💧', badge:'active', image:'assets/listing-4.png', dateAdded:'2026-04-10T10:00:00Z' },
    { id:'d5', price:'₹54,00,000', district:'Dindigul', taluk:'Dindigul', village:'Dindigul', landType:['Mango Orchard'], landIcon:'🥭', area:'6 Acres', feature:['Well Water'], featureIcon:'💧', badge:'sold', image:'assets/listing-5.png', dateAdded:'2026-03-01T10:00:00Z' },
    { id:'d6', price:'₹32,00,000', district:'Dindigul', taluk:'Vedasandur', village:'Kariyapatti', landType:['Vacant Plot'], landIcon:'🏠', area:'2 Acres', feature:['NH Access','Electricity'], featureIcon:'🛤️', badge:'active', image:'assets/listing-6.png', dateAdded:'2026-06-05T10:00:00Z' }
  ];
  function formatPublicLocation(l) {
    const parts = [];
    if (l.district) parts.push(`District: ${l.district}`);
    if (l.taluk) parts.push(`Taluk: ${l.taluk}`);
    if (l.village) parts.push(`Village: ${l.village}`);
    return parts.length ? parts.join(' · ') : '—';
  }

  // ─── Cross-page sync: Import listings from URL hash (admin → main site) ───
  // When using file:// protocol, localStorage is isolated per page.
  // The admin panel encodes listings into the "View Site" link hash.
  try {
    const hash = window.location.hash;
    if (hash.startsWith('#listings-data=')) {
      const encoded = hash.slice('#listings-data='.length);
      const imported = JSON.parse(decodeURIComponent(encoded));
      if (Array.isArray(imported) && imported.length > 0) {
        localStorage.setItem('listings', JSON.stringify(imported));
        // Clean the hash so bookmarks/refresh don't re-import stale data
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  } catch (e) {
    console.warn('Could not import listings from URL:', e);
  }

  // Seed demo listings if none exist
  try {
    if (!localStorage.getItem('listings')) {
      localStorage.setItem('listings', JSON.stringify(DEMO_LISTINGS));
    }
  } catch (err) {
    console.warn('localStorage not accessible:', err);
  }

  // Helper: normalize landType/feature to arrays for backward compat
  function toArr(v) { return Array.isArray(v) ? v : (v ? [v] : []); }

  function renderListings() {
    const grid = document.getElementById('listings-grid');
    if (!grid) return;

    let listings = [];
    try { listings = JSON.parse(localStorage.getItem('listings') || '[]'); } catch { listings = []; }
    if (listings.length === 0) {
      listings = DEMO_LISTINGS;
    }

    // Only show non-sold on main site
    const visible = listings.filter(l => l.badge !== 'sold');

    if (visible.length === 0) {
      grid.innerHTML = '<p style="text-align:center; color:#999; padding:40px 0; grid-column:1/-1;">No listings available at this time.</p>';
      return;
    }

    const esc = (s) => { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; };

    grid.innerHTML = visible.map(l => {
      const types = toArr(l.landType);
      const feats = toArr(l.feature);
      const locationDetail = formatPublicLocation(l);
      const typeMeta = types.map(t => `<span class="listing-meta-item"><span class="listing-meta-icon">${l.landIcon || '🌾'}</span> ${esc(t)}</span>`).join('');
      const featMeta = feats.map(f => `<span class="listing-meta-item"><span class="listing-meta-icon">${l.featureIcon || '💧'}</span> ${esc(f)}</span>`).join('');
      const locationPills = locationDetail.split(' · ').map(part => `<span class="listing-location-pill">${esc(part)}</span>`).join('');

      return `<div class="listing-card reveal" data-listing-id="${esc(l.id)}" data-location-detail="${esc(locationDetail)}">
        <div class="listing-card-img">
          <img src="${esc(l.image)}" alt="${esc(types[0] || 'Land')} in ${esc(locationDetail)}" loading="lazy" />
          <span class="listing-badge listing-badge--active">Active</span>
        </div>
        <div class="listing-card-body">
          <div class="listing-price">${esc(l.price)}</div>
          <div class="listing-location">📍 ${esc(locationDetail)}</div>
          <div class="listing-location-detail">${locationPills}</div>
          <div class="listing-meta">
            ${typeMeta}
            <span class="listing-meta-item"><span class="listing-meta-icon">📐</span> ${esc(l.area)}</span>
            ${featMeta}
          </div>
        </div>
      </div>`;
    }).join('');

    // Re-observe for scroll reveal
    grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Click → WhatsApp + track click
    grid.querySelectorAll('.listing-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.listingId;
        // Track click count
        if (id) {
          try {
            let clicks = {};
            try { clicks = JSON.parse(localStorage.getItem('listing_clicks') || '{}'); } catch (e) {}
            clicks[id] = (clicks[id] || 0) + 1;
            localStorage.setItem('listing_clicks', JSON.stringify(clicks));
          } catch (err) { /* silent */ }
        }
        const loc = card.dataset.locationDetail || card.querySelector('.listing-location')?.textContent || '';
        const price = card.querySelector('.listing-price')?.textContent || '';
        const msg = `Hi, I'm interested in the listing: ${price} at ${loc}. Please share more details.`;
        window.open(`https://wa.me/919363752553?text=${encodeURIComponent(msg)}`, '_blank');
      });
    });
  }

  renderListings();

  // Listen for changes from admin panel (same origin)
  window.addEventListener('storage', (e) => {
    if (e.key === 'listings') renderListings();
  });

  // Re-render listings when user switches back to this tab (critical for file:// and same-tab nav)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') renderListings();
  });
  window.addEventListener('focus', () => renderListings());
  window.addEventListener('pageshow', (e) => {
    // bfcache restore — force fresh read
    if (e.persisted) renderListings();
  });

  // ─── Console ──────────────────────────────────
  console.log(
    '%c🌾 TNLandBazaar — Professional Agriculture & Vacant Land Experts',
    'font-size: 14px; color: #b08d57; font-weight: bold;'
  );

});
