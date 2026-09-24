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
import { DELAY_LOADER_MS, TEKS_TOMBOL } from './constants.js';

// ── State terpusat ──────────────────────────────────────────────
const state = {
  /** @type {string|null} ID layanan terpilih */
  selectedService: null,
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
    }, 3000);
  }, DELAY_LOADER_MS);
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
}

document.addEventListener('DOMContentLoaded', init);
