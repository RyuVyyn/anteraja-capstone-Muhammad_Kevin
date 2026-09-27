export function ServiceComparison() {
  return (
    <section className="comparison-section" aria-labelledby="matrixHeading">
      <header className="comparison-header">
        <div>
          <h2 id="matrixHeading" className="comparison-heading">Perbandingan Lengkap Layanan</h2>
          <p className="comparison-subtitle">Informasi detail pengiriman untuk rute Bandung ke Surabaya (berat dihitung 2.0 kg)</p>
        </div>
        <span className="comparison-badge">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">verified_user</span>
          ✓ Jaminan Standar Pengiriman Anteraja
        </span>
      </header>

      <div className="table-wrapper">
        <table className="comparison-table">
          <caption className="sr-only">Tabel perbandingan spesifikasi tarif, estimasi waktu pengiriman, batas permintaan penjemputan paket, dan batas nominal fitur COD pada setiap opsi layanan Anteraja</caption>
          <thead>
            <tr>
              <th scope="col">INFORMASI LAYANAN</th>
              <th scope="col" className="col-highlight">Ekonomi (Pilihan Hemat)</th>
              <th scope="col">Reguler</th>
              <th scope="col">Next Day</th>
              <th scope="col">Same Day</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Tarif Ongkir (2.0 kg)</th>
              <td className="cell-primary">Rp 18.000</td>
              <td className="cell-bold">Rp 24.000</td>
              <td className="cell-bold">Rp 36.000</td>
              <td className="cell-disabled">-</td>
            </tr>
            <tr>
              <th scope="row">Porsi Ongkir vs Harga Barang</th>
              <td><span className="porsi-badge porsi-badge--warning">36% (Paling Terjangkau)</span></td>
              <td><span className="porsi-badge porsi-badge--warning">48%</span></td>
              <td><span className="porsi-badge porsi-badge--danger">72%</span></td>
              <td className="cell-disabled">-</td>
            </tr>
            <tr>
              <th scope="row">Estimasi Waktu Sampai</th>
              <td>3 - 5 Hari Kerja</td>
              <td>2 - 3 Hari Kerja</td>
              <td className="cell-fastest">1 Hari (Besok Sampai)</td>
              <td className="cell-disabled">-</td>
            </tr>
            <tr>
              <th scope="row">Batas Permintaan Jemput Paket</th>
              <td>15:00 WIB</td>
              <td>16:00 WIB</td>
              <td className="cell-bold">17:00 WIB</td>
              <td className="cell-disabled">13:00 WIB</td>
            </tr>
            <tr>
              <th scope="row">Dukungan Bayar di Tempat (COD)</th>
              <td className="cell-tertiary">Tersedia (Maks Rp 3 Juta)</td>
              <td className="cell-tertiary">Tersedia (Maks Rp 5 Juta)</td>
              <td className="cell-tertiary">Tersedia (Maks Rp 5 Juta)</td>
              <td className="cell-disabled">-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
