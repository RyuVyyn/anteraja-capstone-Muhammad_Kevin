export function MarginCalculator() {
  return (
    <aside className="profit-drawer" aria-label="Simulasi Pengaruh Ongkir terhadap Usaha Anda">
      <div className="profit-drawer-inner">
        <header className="profit-drawer-header">
          <div className="profit-drawer-icon" aria-hidden="true">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>lightbulb</span>
          </div>
          <div>
            <h2>Simulasi Pengaruh Ongkir terhadap Usaha Anda</h2>
            <p className="drawer-subtitle">Perkiraan beban ongkir jika produk Anda dijual seharga Rp 50.000</p>
          </div>
        </header>

        <dl className="stats-grid">
          <div className="stat-card stat-card--default">
            <dt>Harga Jual Produk</dt>
            <dd className="stat-value">Rp 50.000</dd>
            <dd className="stat-sub stat-sub--tertiary">Harga ke pembeli</dd>
          </div>

          <div className="stat-card stat-card--warning">
            <dt>Biaya Ongkir Termurah</dt>
            <dd className="stat-value">Rp 18.000</dd>
            <dd className="stat-sub stat-sub--error">Porsi ongkir: 36%</dd>
          </div>

          <div className="stat-card stat-card--default">
            <dt>Sisa Pendapatan</dt>
            <dd className="stat-value">Rp 32.000</dd>
            <dd className="stat-sub">Sebelum dipotong modal barang</dd>
          </div>

          <div className="stat-card stat-card--blue">
            <dt>Hemat vs Layanan Standar</dt>
            <dd className="stat-value">Rp 6.000</dd>
            <dd className="stat-sub stat-sub--tertiary-bold">Lebih hemat untuk pembeli/toko</dd>
          </div>
        </dl>

        <aside className="saran-box" aria-label="Saran Pengiriman">
          <span className="material-symbols-outlined saran-icon" aria-hidden="true">tips_and_updates</span>
          <div>
            <h3>Saran untuk Toko Anda:</h3>
            <p>
              Biaya ongkir mengambil sekitar <strong>36%</strong> dari harga barang. Agar pembeli tidak merasa ongkir terlalu mahal, Anda bisa menawarkan paket hemat (misal: beli 2 pcs seharga Rp 100.000 dengan ongkir tetap sama), atau berikan subsidi ongkir sebagian (Rp 5.000 - Rp 8.000).
            </p>
          </div>
        </aside>
      </div>
    </aside>
  )
}
