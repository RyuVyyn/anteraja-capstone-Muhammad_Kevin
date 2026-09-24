/**
 * @file constants.js
 * @description Konstanta aplikasi kalkulator ongkir Anteraja.
 *              Dipisahkan agar mudah diimpor ulang saat migrasi ke React.
 */

/** Pembagi volumetrik standar kurir (cm³ → kg) */
export const DIVISOR_VOLUMETRIK = 6000;

/** Durasi loading spinner pada tombol Hitung Ongkir (ms) */
export const DELAY_LOADER_MS = 800;

/** Durasi notifikasi feedback sukses kalkulasi ditampilkan (ms) */
export const DURASI_FEEDBACK_SUKSES_MS = 3000;

/** Durasi floating toast summary layanan ditampilkan (ms) */
export const DURASI_TOAST_MS = 4000;

/** Locale untuk formatting angka Indonesia */
export const LOCALE_ID = 'id-ID';

/** Pesan validasi */
export const PESAN_VALIDASI = {
  WAJIB_DIISI: 'Field ini wajib diisi',
  HARUS_ANGKA: 'Masukkan angka yang valid',
  HARUS_POSITIF: 'Angka harus lebih dari 0',
};

/** Teks tombol submit */
export const TEKS_TOMBOL = {
  DEFAULT: 'Hitung Ongkir',
  LOADING: 'Menghitung...',
};

/** Pemetaan filter tab ke data-tag pada kartu */
export const FILTER_MAP = {
  all: null,
  cheapest: 'cheapest',
  fastest: 'fastest',
  recommended: 'recommended',
};
