import { useState } from 'react'

export function MarginCalculator({ shippingResult }) {
  const [isTipsOpen, setIsTipsOpen] = useState(false)

  const cheapestOption = shippingResult?.options?.[0]
  const hargaJual = cheapestOption ? shippingResult.harga_jual : null
  const ongkirTermurah = cheapestOption?.tarif_ongkir ?? null
  const persentaseOngkir = cheapestOption?.persentase_ongkir ?? null
  const kategori = cheapestOption?.kategori_risiko_margin
  const sisaPendapatan = hargaJual != null && ongkirTermurah != null
    ? hargaJual - ongkirTermurah
    : null

  const regulerOption = shippingResult?.options?.find((opt) => opt.service_id === 'SRV_REG')
  const hemat = regulerOption && cheapestOption
    ? regulerOption.tarif_ongkir - cheapestOption.tarif_ongkir
    : null

  const formatRp = (n) => `Rp ${new Intl.NumberFormat('id-ID').format(n)}`
  const formatValue = (value) => value == null ? '-' : formatRp(value)

  const porsiBadgeClass = kategori === 'Merah' ? 'stat-sub--error' : kategori === 'Kuning' ? 'stat-sub--warning' : 'stat-sub--success'
  const advice = !cheapestOption
    ? shippingResult
      ? 'Tarif layanan tidak ditemukan untuk rute ini. Coba pilih rute lain untuk mendapatkan saran ongkir.'
      : 'Isi detail pengiriman dan hitung ongkir untuk mendapatkan saran berdasarkan rute dan tarif.'
    : `Ongkir termurah mengambil ${persentaseOngkir}% dari harga barang. Pertimbangkan menampilkan layanan hemat atau memberi subsidi sesuai margin toko Anda.`

  return (
    <aside className="profit-drawer" aria-label="Simulasi Pengaruh Ongkir terhadap Usaha Anda">
      <div className="profit-drawer-inner">
        <header className="profit-drawer-header">
          <div className="profit-drawer-title-wrap">
            <div className="profit-drawer-icon" aria-hidden="true">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>lightbulb</span>
            </div>
            <div>
              <h2>Simulasi Pengaruh Ongkir terhadap Usaha Anda</h2>
              <p className="drawer-subtitle">
                {hargaJual == null
                  ? 'Ringkasan pengaruh ongkir akan muncul setelah tarif berhasil dihitung.'
                  : `Perkiraan beban ongkir jika produk Anda dijual seharga ${formatRp(hargaJual)}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            className={`btn-tips ${isTipsOpen ? 'btn-tips--open' : ''}`}
            onClick={() => setIsTipsOpen((open) => !open)}
            aria-expanded={isTipsOpen}
            aria-controls="profit-tips-panel"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">lightbulb</span>
            <span>Tips Hemat Ongkir</span>
            <span className="material-symbols-outlined btn-tips__chevron" aria-hidden="true">{isTipsOpen ? 'expand_less' : 'expand_more'}</span>
          </button>
        </header>

        <div id="profit-tips-panel" className={`tips-accordion ${isTipsOpen ? 'tips-accordion--open' : ''}`}>
          <aside className="saran-box" aria-label="Saran Pengiriman">
            <span className="material-symbols-outlined saran-icon" aria-hidden="true">tips_and_updates</span>
            <div>
              <h3>Saran untuk Toko Anda:</h3>
              <p>{advice}</p>
            </div>
          </aside>
        </div>

        <div className={`drawer-content ${isTipsOpen ? 'drawer-content--open' : ''}`}>
          <dl className="stats-grid">
            <div className="stat-card stat-card--default">
              <dt>Harga Jual Produk</dt>
              <dd className="stat-value">{formatValue(hargaJual)}</dd>
              <dd className="stat-sub stat-sub--tertiary">Harga ke pembeli</dd>
            </div>

            <div className="stat-card stat-card--warning">
              <dt>Biaya Ongkir Termurah</dt>
              <dd className="stat-value">{formatValue(ongkirTermurah)}</dd>
              <dd className={`stat-sub ${kategori ? porsiBadgeClass : ''}`}>
                {persentaseOngkir == null ? 'Porsi ongkir: -' : `Porsi ongkir: ${persentaseOngkir}%`}
              </dd>
            </div>

            <div className="stat-card stat-card--default">
              <dt>Sisa Pendapatan</dt>
              <dd className="stat-value">{formatValue(sisaPendapatan)}</dd>
              <dd className="stat-sub">Sebelum dipotong modal barang</dd>
            </div>

            <div className="stat-card stat-card--blue">
              <dt>Hemat vs Layanan Standar</dt>
              <dd className="stat-value">{formatValue(hemat)}</dd>
              <dd className="stat-sub stat-sub--tertiary-bold">Lebih hemat untuk pembeli/toko</dd>
            </div>
          </dl>
        </div>
      </div>
    </aside>
  )
}
