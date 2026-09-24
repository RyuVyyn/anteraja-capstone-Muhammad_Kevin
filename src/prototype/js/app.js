/**
 * @file app.js
 * @description Entry point — state, selector, dan handler DOM
 *              untuk kalkulator ongkir Anteraja.
 *              Menggunakan ES module, tanpa variabel global.
 */

import {
  parseAngka,
  formatRibuan,
  validasiAngka,
  hitungBeratVolumetrik,
  tentukanBeratDihitung,
} from './utils.js';
import {
  DELAY_LOADER_MS,
  DURASI_FEEDBACK_SUKSES_MS,
  DURASI_TOAST_MS,
  TEKS_TOMBOL,
  FILTER_MAP,
} from './constants.js';

// ── State terpusat ──────────────────────────────────────────────
const state = {
  /** @type {string|null} ID layanan terpilih */
  selectedService: null,
  /** @type {string} Kategori filter tab aktif */
  activeFilter: 'all',
  /** @type {boolean} Apakah form sedang loading */
  isSubmitting: false,
};

// ── Selector terkumpul ──────────────────────────────────────────
function getElements() {
  return {
    form: document.getElementById('shippingForm'),
    priceInput: document.getElementById('priceInput'),
    weightInput: document.getElementById('weightInput'),
    dimPanjang: document.getElementById('dimPanjang'),
    dimLebar: document.getElementById('dimLebar'),
    dimTinggi: document.getElementById('dimTinggi'),
    dimensionInputs: document.querySelectorAll('.dimension-input'),
    btnSubmit: document.querySelector('.btn-submit'),
    volumeSummary: document.querySelector('.volume-summary'),
    volBold: document.querySelector('.vol-bold'),
    volNormal: document.querySelector('.vol-normal'),
    volPrimary: document.querySelector('.vol-primary'),
    filterTabs: document.querySelectorAll('.filter-tab'),
    serviceCards: document.querySelectorAll('.service-card'),
    servicesGrid: document.querySelector('.services-grid'),
  };
}

// ── Interaksi 1: Format ribuan otomatis + validasi input ────────

/**
 * Menampilkan pesan error di bawah input field.
 * @param {HTMLInputElement} input - Elemen input
 * @param {string} pesan - Pesan error (kosong = hapus error)
 */
function tampilkanError(input, pesan) {
  let errorEl = input.parentElement.querySelector('[data-error-msg]');
  if (pesan) {
    input.classList.add('input-error');
    input.setAttribute('aria-invalid', 'true');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.setAttribute('data-error-msg', '');
      errorEl.className = 'input-error-msg';
      input.parentElement.appendChild(errorEl);
    }
    errorEl.textContent = pesan;
  } else {
    input.classList.remove('input-error');
    input.removeAttribute('aria-invalid');
    if (errorEl) {
      errorEl.remove();
    }
  }
}

/**
 * Handler event 'input': format ribuan saat mengetik.
 * @param {Event} event
 */
function handleFormatInput(event) {
  const input = event.target;
  const cursorPos = input.selectionStart;
  const rawBefore = input.value;
  const angka = parseAngka(rawBefore);

  if (!isNaN(angka) && rawBefore.trim() !== '') {
    const formatted = formatRibuan(angka);
    input.value = formatted;

    // Hitung posisi kursor yang benar setelah formatting
    const diff = formatted.length - rawBefore.length;
    const newPos = Math.max(0, cursorPos + diff);
    input.setSelectionRange(newPos, newPos);
  }

  // Hapus error saat mengetik jika sudah valid
  const hasil = validasiAngka(input.value);
  if (hasil.valid) {
    tampilkanError(input, '');
  }
}

/**
 * Handler event 'blur': validasi saat keluar dari field.
 * @param {Event} event
 */
function handleValidasiBlur(event) {
  const input = event.target;
  const hasil = validasiAngka(input.value);
  tampilkanError(input, hasil.pesan);
}

/**
 * Validasi seluruh field numerik. Mengembalikan true jika semua valid.
 * @param {object} elements - Objek elemen dari getElements()
 * @returns {boolean}
 */
function validasiSemuaInput(elements) {
  const inputs = [
    elements.priceInput,
    elements.weightInput,
    ...elements.dimensionInputs,
  ];
  let semuaValid = true;
  for (const input of inputs) {
    const hasil = validasiAngka(input.value);
    tampilkanError(input, hasil.pesan);
    if (!hasil.valid) {
      semuaValid = false;
    }
  }
  return semuaValid;
}

// ── Interaksi 2: Berat volumetrik real-time ─────────────────────

/**
 * Membaca nilai dimensi & berat dari input, menghitung volumetrik,
 * lalu memperbarui teks di .volume-summary.
 * @param {object} elements - Objek elemen dari getElements()
 */
function updateVolumeSummary(elements) {
  const panjang = parseAngka(elements.dimPanjang.value) || 0;
  const lebar = parseAngka(elements.dimLebar.value) || 0;
  const tinggi = parseAngka(elements.dimTinggi.value) || 0;

  // Berat: hapus satuan "kg" jika ada
  const rawWeight = elements.weightInput.value.replace(/\s*kg\s*/gi, '');
  const beratAktual = parseAngka(rawWeight) || 0;

  const beratVolumetrik = hitungBeratVolumetrik({ panjang, lebar, tinggi });
  const { beratDihitung, ikutVolume } = tentukanBeratDihitung({
    beratAktual,
    beratVolumetrik,
  });

  if (elements.volBold) {
    elements.volBold.textContent = `Ukuran Volume: ${beratVolumetrik} kg`;
  }
  if (elements.volNormal) {
    elements.volNormal.textContent = `Berat Aktual: ${beratAktual} kg`;
  }
  if (elements.volPrimary) {
    const keterangan = ikutVolume
      ? '(mengikuti volume paket)'
      : '(mengikuti berat aktual)';
    elements.volPrimary.textContent = `Berat Dihitung: ${beratDihitung} kg ${keterangan}`;
  }
}

// ── Interaksi 3: Submit kalkulator & loading state ──────────────

/**
 * Menggulir tampilan ke elemen target dengan menghormati preferensi motion pengguna.
 * @param {HTMLElement|null} element - Elemen target untuk scroll
 */
function scrollKeHasilLayanan(element) {
  if (!element) return;
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  element.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'start',
  });
}

/**
 * Handler submit formulir cek ongkir dengan simulasi loading dan feedback.
 * @param {Event} event
 * @param {object} elements - Objek elemen dari getElements()
 */
function handleSubmitForm(event, elements) {
  event.preventDefault();

  if (state.isSubmitting) return;

  const valid = validasiSemuaInput(elements);
  if (!valid) {
    const firstError = elements.form.querySelector('.input-error');
    if (firstError) {
      firstError.focus();
    }
    return;
  }

  // Set loading state
  state.isSubmitting = true;
  elements.btnSubmit.classList.add('btn-submit--loading');
  elements.btnSubmit.disabled = true;
  const originalHTML = elements.btnSubmit.innerHTML;
  elements.btnSubmit.innerHTML = `<span class="btn-submit__spinner" aria-hidden="true"></span> ${TEKS_TOMBOL.LOADING}`;

  // Hapus feedback sebelumnya jika ada
  const existingFeedback = elements.form.querySelector('.btn-submit__success');
  if (existingFeedback) {
    existingFeedback.remove();
  }

  setTimeout(() => {
    state.isSubmitting = false;
    elements.btnSubmit.classList.remove('btn-submit--loading');
    elements.btnSubmit.disabled = false;
    elements.btnSubmit.innerHTML = originalHTML;

    // Scroll ke bagian hasil layanan (hanya pada jalur sukses)
    scrollKeHasilLayanan(elements.servicesGrid);

    // Perbarui volumetrik kembali untuk sinkronisasi data
    updateVolumeSummary(elements);

    // Tampilkan pesan sukses
    const feedbackEl = document.createElement('div');
    feedbackEl.className = 'btn-submit__success';
    feedbackEl.setAttribute('role', 'status');
    feedbackEl.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px" aria-hidden="true">check_circle</span> Tarif pengiriman berhasil diperbarui!';
    elements.btnSubmit.parentElement.appendChild(feedbackEl);

    setTimeout(() => {
      feedbackEl.remove();
    }, DURASI_FEEDBACK_SUKSES_MS);
  }, DELAY_LOADER_MS);
}

// ── Interaksi 4: Filter tab kategori layanan ────────────────────

/**
 * Menyaring kartu layanan pengiriman berdasarkan kategori yang dipilih.
 * @param {string} filterKey - Kunci filter ('all', 'cheapest', 'fastest', 'recommended')
 * @param {object} elements - Objek elemen dari getElements()
 */
function handleFilterTab(filterKey, elements) {
  state.activeFilter = filterKey;

  // Update tampilan tab filter (active/inactive state & aria-selected)
  for (const tab of elements.filterTabs) {
    const tabFilter = tab.getAttribute('data-filter');
    const isActive = tabFilter === filterKey;
    tab.classList.toggle('filter-tab--active', isActive);
    tab.classList.toggle('filter-tab--inactive', !isActive);
    tab.setAttribute('aria-selected', String(isActive));
  }

  const targetTag = FILTER_MAP[filterKey];

  // Tampilkan / sembunyikan kartu layanan sesuai kriteria filter
  for (const card of elements.serviceCards) {
    if (!targetTag) {
      card.classList.remove('card-hidden');
    } else {
      const tags = (card.getAttribute('data-tags') || '').split(',');
      if (tags.includes(targetTag)) {
        card.classList.remove('card-hidden');
      } else {
        card.classList.add('card-hidden');
      }
    }
  }
}

// ── Interaksi 5: Pemilihan kartu layanan & toast summary ────────

let toastTimeoutId = null;

/**
 * Menampilkan floating toast summary berisi info layanan yang dipilih.
 * @param {{ name: string, price: string, eta: string }} info
 */
function tampilkanToastSummary({ name, price, eta }) {
  let toast = document.querySelector('.toast-summary');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-summary';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }

  // Bersihkan timer dismiss sebelumnya
  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
  }

  toast.innerHTML = `
    <span class="material-symbols-outlined" style="color:var(--color-primary);font-size:20px" aria-hidden="true">check_circle</span>
    <span>Layanan: <strong>${name}</strong></span>
    <span class="toast-summary__dot">•</span>
    <span>Tarif: <strong>${price}</strong></span>
    <span class="toast-summary__dot">•</span>
    <span>Estimasi: ${eta}</span>
    <button type="button" class="toast-close-btn" aria-label="Tutup ringkasan" style="background:none;border:none;color:inherit;cursor:pointer;padding:0;margin-left:8px;display:inline-flex;align-items:center;">
      <span class="material-symbols-outlined" style="font-size:18px">close</span>
    </button>
  `;

  // Tombol close toast
  const closeBtn = toast.querySelector('.toast-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      toast.remove();
    });
  }

  // Auto dismiss setelah durasi toast
  toastTimeoutId = setTimeout(() => {
    toast.remove();
  }, DURASI_TOAST_MS);
}

/**
 * Menandai layanan yang dipilih pengguna, mengupdate visual kartu dan tombol.
 * @param {string} serviceId - ID layanan ('ekonomi', 'reguler', 'nextday', dll)
 * @param {object} elements - Objek elemen dari getElements()
 * @param {{ silent?: boolean }} [options] - Jika true, tidak memunculkan toast
 */
function pilihLayanan(serviceId, elements, options = {}) {
  const targetCard = Array.from(elements.serviceCards).find(
    (card) => card.getAttribute('data-service-id') === serviceId
  );

  if (!targetCard || targetCard.getAttribute('data-disabled') === 'true') {
    return;
  }

  state.selectedService = serviceId;

  // Perbarui styling semua kartu
  for (const card of elements.serviceCards) {
    const isTarget = card === targetCard;
    const btnPilih = card.querySelector('.btn-pilih');
    const cardCheck = card.querySelector('.card-check');

    if (isTarget) {
      card.classList.add('service-card--selected');
      if (cardCheck) {
        cardCheck.className = 'card-check card-check--selected';
        cardCheck.innerHTML = '<span class="material-symbols-outlined" style="font-size:14px">check</span>';
      }
      if (btnPilih) {
        btnPilih.classList.add('btn-pilih--selected');
        btnPilih.innerHTML = '<span>Layanan Terpilih</span><span class="material-symbols-outlined" style="font-size:16px" aria-hidden="true">check</span>';
      }
    } else if (card.getAttribute('data-disabled') !== 'true') {
      card.classList.remove('service-card--selected');
      if (cardCheck) {
        cardCheck.className = 'card-check card-check--empty';
        cardCheck.innerHTML = '<span></span>';
      }
      if (btnPilih) {
        btnPilih.classList.remove('btn-pilih--selected');
        btnPilih.innerHTML = '<span>Pilih Layanan</span><span class="material-symbols-outlined" style="font-size:16px" aria-hidden="true">arrow_forward</span>';
      }
    }
  }

  if (!options.silent) {
    const name = targetCard.getAttribute('data-service-name') || 'Layanan Anteraja';
    const price = targetCard.getAttribute('data-service-price') || '-';
    const eta = targetCard.getAttribute('data-service-eta') || '-';
    tampilkanToastSummary({ name, price, eta });
  }
}

// ── Inisialisasi ────────────────────────────────────────────────
function init() {
  const elements = getElements();
  const numericInputs = [
    elements.priceInput,
    elements.weightInput,
    ...elements.dimensionInputs,
  ];

  // Interaksi 1: Format ribuan + validasi
  for (const input of numericInputs) {
    input.addEventListener('input', handleFormatInput);
    input.addEventListener('blur', handleValidasiBlur);
  }

  // Interaksi 2: Berat volumetrik real-time
  const volumeInputs = [
    elements.weightInput,
    ...elements.dimensionInputs,
  ];
  for (const input of volumeInputs) {
    input.addEventListener('input', () => updateVolumeSummary(elements));
  }
  updateVolumeSummary(elements);

  // Interaksi 3: Submit kalkulator & loading state
  if (elements.form) {
    elements.form.addEventListener('submit', (e) => handleSubmitForm(e, elements));
  }

  // Interaksi 4: Filter tab kategori layanan
  for (const tab of elements.filterTabs) {
    tab.addEventListener('click', () => {
      const filterKey = tab.getAttribute('data-filter') || 'all';
      handleFilterTab(filterKey, elements);
    });
  }

  // Interaksi 5: Pemilihan kartu layanan & toast summary
  for (const card of elements.serviceCards) {
    const serviceId = card.getAttribute('data-service-id');
    const isDisabled = card.getAttribute('data-disabled') === 'true';
    if (!serviceId || isDisabled) continue;

    // Klik tombol Pilih Layanan
    const btnPilih = card.querySelector('.btn-pilih');
    if (btnPilih) {
      btnPilih.addEventListener('click', (e) => {
        e.stopPropagation();
        pilihLayanan(serviceId, elements);
      });
    }

    // Klik area kartu layanan (abaikan klik link rekomendasi)
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      pilihLayanan(serviceId, elements);
    });
  }

  // Set pilihan awal ke layanan default ('ekonomi') secara hening
  pilihLayanan('ekonomi', elements, { silent: true });
}

document.addEventListener('DOMContentLoaded', init);
