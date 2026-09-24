/**
 * @file utils.js
 * @description Fungsi murni (pure functions) untuk kalkulator ongkir Anteraja.
 *              Tidak menyentuh DOM — bisa langsung dipindah ke util/helper React.
 */

import { LOCALE_ID, PESAN_VALIDASI, DIVISOR_VOLUMETRIK } from './constants.js';

/**
 * Menghapus titik pemisah ribuan dan mengembalikan angka numerik.
 * @param {string} text - Teks dari input (misal "50.000")
 * @returns {number} Angka hasil parsing, NaN jika tidak valid
 */
export function parseAngka(text) {
  if (typeof text !== 'string') return NaN;
  const cleaned = text.replace(/\./g, '').replace(/,/g, '.').trim();
  if (cleaned === '') return NaN;
  return Number(cleaned);
}

/**
 * Memformat angka ke format ribuan Indonesia (misal 50000 → "50.000").
 * @param {number} angka - Angka bulat atau desimal
 * @returns {string} Angka terformat, atau string kosong jika NaN
 */
export function formatRibuan(angka) {
  if (typeof angka !== 'number' || isNaN(angka)) return '';
  return angka.toLocaleString(LOCALE_ID);
}

/**
 * Memvalidasi nilai input angka.
 * @param {string} value - Nilai mentah dari input
 * @returns {{ valid: boolean, pesan: string }} Hasil validasi
 */
export function validasiAngka(value) {
  const trimmed = (value || '').trim();
  if (trimmed === '') {
    return { valid: false, pesan: PESAN_VALIDASI.WAJIB_DIISI };
  }
  const angka = parseAngka(trimmed);
  if (isNaN(angka)) {
    return { valid: false, pesan: PESAN_VALIDASI.HARUS_ANGKA };
  }
  if (angka <= 0) {
    return { valid: false, pesan: PESAN_VALIDASI.HARUS_POSITIF };
  }
  return { valid: true, pesan: '' };
}

/**
 * Menghitung berat volumetrik dari dimensi paket.
 * @param {{ panjang: number, lebar: number, tinggi: number }} dimensi
 * @returns {number} Berat volumetrik dalam kg (2 desimal)
 */
export function hitungBeratVolumetrik({ panjang, lebar, tinggi }) {
  const volume = panjang * lebar * tinggi;
  return Math.round((volume / DIVISOR_VOLUMETRIK) * 100) / 100;
}

/**
 * Menentukan berat dihitung (berat tagihan) = maks(aktual, volumetrik).
 * @param {{ beratAktual: number, beratVolumetrik: number }} param
 * @returns {{ beratDihitung: number, ikutVolume: boolean }}
 */
export function tentukanBeratDihitung({ beratAktual, beratVolumetrik }) {
  const ikutVolume = beratVolumetrik > beratAktual;
  return {
    beratDihitung: Math.max(beratAktual, beratVolumetrik),
    ikutVolume,
  };
}
