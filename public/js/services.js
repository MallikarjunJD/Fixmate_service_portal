const cards = document.querySelectorAll('.card');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalPricing = document.getElementById('modalPricing');
const gallery = document.querySelector('#gallery img');
const thumbs = document.getElementById('thumbs');
const bookBtn = document.getElementById('bookBtn');
const closeModalBtn = document.getElementById('closeModal');

const fallbackImage = '/assets/fallback.jpg';
const assetsPath = '/assets/services/';


img.onerror = function () {
    if (this.dataset.failed) return;   // 🔥 prevents infinite loop
    this.dataset.failed = true;
    this.src = fallbackImage;
};

// -------- CARD CLICK = OPEN MODAL ----------
cards.forEach(card => {
    card.addEventListener('click', (e) => {
        // prevent modal when user clicks the View button
        if (e.target.tagName === 'A') return;

        const s = JSON.parse(card.dataset.service);
        openModal(s);
    });
});

function openModal(s) {
    modalTitle.textContent = s.name;
    modalDescription.textContent = s.description;

    modalPricing.innerHTML = '';
    Object.keys(s.pricing).forEach(key => {
        const d = document.createElement('div');
        d.className = 'pill';
        d.textContent = `${key} — ₹${s.pricing[key]}`;
        modalPricing.appendChild(d);
    });

    // gallery image
    const firstImg = s.images?.length ? assetsPath + s.images[0] : fallbackImage;
    gallery.src = firstImg;
    gallery.onerror = () => { gallery.src = fallbackImage; }

    // thumbnails
    thumbs.innerHTML = '';
    s.images.forEach(img => {
        const b = document.createElement('button');
        b.style.border = 'none';
        b.style.background = 'transparent';

        const im = document.createElement('img');
        im.src = assetsPath + img;
        im.style.width = '70px';
        im.style.height = '48px';
        im.style.objectFit = 'cover';
        im.style.borderRadius = '6px';
        im.onerror = () => { im.src = fallbackImage; };

        b.appendChild(im);
        b.addEventListener('click', () => gallery.src = im.src);
        thumbs.appendChild(b);
    });

    // dynamic booking link
    bookBtn.href = `/services/${s.id}`;

    modalBackdrop.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modalBackdrop.style.display = 'none';
    document.body.style.overflow = 'auto';
}

closeModalBtn.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', e => {
    if (e.target === modalBackdrop) closeModal();
});

// search + sort system
const searchInput = document.getElementById('q');
const sortSelect = document.getElementById('sort');
const resetBtn = document.getElementById('reset');
const listEl = document.getElementById('list');

const originalServices = window.originalServices;


function render(services) {
    listEl.innerHTML = '';

    services.forEach(s => {
        const div = document.createElement('div');
        div.className = "card";
        div.dataset.service = JSON.stringify(s);

        div.innerHTML = `
        <div class="thumb">
          <img src="${assetsPath + s.images[0]}" onerror="this.src='${fallbackImage}'">
        </div>
        <div class="title">${s.name}</div>
        <div class="desc">${s.description.substring(0, 70)}...</div>
        <a href="/services/${s.id}" class="btn" style="text-align:center;margin-top:6px;">View & Book</a>
      `;

        div.addEventListener('click', (e) => {
            if (e.target.tagName !== 'A') openModal(s);
        });

        listEl.appendChild(div);
    });
}



function applyFilters() {
    const q = searchInput.value.toLowerCase();
    let filtered = originalServices.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
    );

    if (sortSelect.value === 'priceAsc')
        filtered.sort((a, b) => Math.min(...Object.values(a.pricing)) - Math.min(...Object.values(b.pricing)));

    if (sortSelect.value === 'priceDesc')
        filtered.sort((a, b) => Math.max(...Object.values(b.pricing)) - Math.max(...Object.values(a.pricing)));

    if (sortSelect.value === 'name')
        filtered.sort((a, b) => a.name.localeCompare(b.name));

    render(filtered);
}

searchInput.addEventListener('input', applyFilters);
sortSelect.addEventListener('change', applyFilters);

resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    sortSelect.value = 'name';
    render(originalServices);
});