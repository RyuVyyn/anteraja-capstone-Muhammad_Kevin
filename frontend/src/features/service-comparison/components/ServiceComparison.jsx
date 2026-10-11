export function ServiceComparison({ services = [], shippingResult }) {
  const hasData = shippingResult?.options?.length > 0

  const routeLabel = !shippingResult
    ? 'Pilih rute dan hitung ongkir untuk melihat perbandingan tarif.'
    : hasData
    ? `${shippingResult.kota_asal} ke ${shippingResult.kota_tujuan} (berat dihitung ${shippingResult.berat_ditagih} kg)`
    : `${shippingResult.kota_asal} ke ${shippingResult.kota_tujuan} (layanan tidak tersedia)`

  const beratDitagih = shippingResult?.berat_ditagih

  const findService = (id) => services.find((s) => s.id === id)
  const ekonomi  = findService('ekonomi')
  const reguler  = findService('reguler')
  const nextday  = findService('nextday')
  const sameday  = findService('sameday')
  const isAvailable = (service) => Boolean(service && !service.disabled && !service.pending)
  const availablePriceServices = services.filter((service) => isAvailable(service) && service.priceRaw != null)
  const cheapestService = availablePriceServices.reduce(
    (cheapest, service) => !cheapest || service.priceRaw < cheapest.priceRaw ? service : cheapest,
    null,
  )
  const availableSlaServices = services.filter((service) => !service.disabled && service.etaDays != null)
  const fastestEtaDays = availableSlaServices.length
    ? Math.min(...availableSlaServices.map((service) => service.etaDays))
    : null
  const isFastest = (service) => service && !service.disabled && service.etaDays === fastestEtaDays
  const getEtaClass = (service) => {
    if (!service || service.disabled) return 'cell-disabled'
    return isFastest(service) ? 'cell-fastest' : ''
  }

  const getPrice = (svc) => isAvailable(svc) ? svc.price : '-'
  const getPorsi = (svc) => {
    if (!isAvailable(svc)) return '-'
    if (svc.persentaseOngkir != null) return `${svc.persentaseOngkir}%`
    return '-'
  }
  const getEta = (svc) => isAvailable(svc) ? svc.eta : '-'
  const getPriceClass = (svc) => {
    if (!isAvailable(svc)) return 'cell-disabled'
    return svc.id === cheapestService?.id ? 'cell-primary' : 'cell-bold'
  }

  const getPorsiBadgeType = (svc) => {
    if (!isAvailable(svc)) return ''
    if (svc.kategoriRisikoMargin === 'Merah') return 'porsi-badge--danger'
    if (svc.kategoriRisikoMargin === 'Kuning') return 'porsi-badge--warning'
    return 'porsi-badge--success'
  }

  const renderPorsi = (service) => {
    if (!isAvailable(service) || service.persentaseOngkir == null) {
      return <span className="cell-disabled">-</span>
    }

    return (
      <span className={`porsi-badge ${getPorsiBadgeType(service)}`}>
        {getPorsi(service)} {service.id === cheapestService?.id ? '(Paling Terjangkau)' : ''}
      </span>
    )
  }

  return (
    <section className="comparison-section" aria-labelledby="matrixHeading">
      <header className="comparison-header">
        <div>
          <h2 id="matrixHeading" className="comparison-heading">Perbandingan Lengkap Layanan</h2>
          <p className="comparison-subtitle">Informasi detail pengiriman untuk rute {routeLabel}</p>
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
              <th scope="col" className={cheapestService?.id === 'ekonomi' ? 'col-highlight' : ''}>Ekonomi {cheapestService?.id === 'ekonomi' ? '(Pilihan Hemat)' : ''}</th>
              <th scope="col">Reguler</th>
              <th scope="col">Next Day</th>
              <th scope="col">Same Day</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Tarif Ongkir{beratDitagih == null ? '' : ` (${beratDitagih} kg)`}</th>
              <td className={getPriceClass(ekonomi)}>{getPrice(ekonomi)}</td>
              <td className={getPriceClass(reguler)}>{getPrice(reguler)}</td>
              <td className={getPriceClass(nextday)}>{getPrice(nextday)}</td>
              <td className={getPriceClass(sameday)}>{getPrice(sameday)}</td>
            </tr>
            <tr>
              <th scope="row">Porsi Ongkir vs Harga Barang</th>
              <td>{renderPorsi(ekonomi)}</td>
              <td>{renderPorsi(reguler)}</td>
              <td>{renderPorsi(nextday)}</td>
              <td>{renderPorsi(sameday)}</td>
            </tr>
            <tr>
              <th scope="row">Estimasi Waktu Sampai</th>
              <td className={getEtaClass(ekonomi)}>{getEta(ekonomi)}</td>
              <td className={getEtaClass(reguler)}>{getEta(reguler)}</td>
              <td className={getEtaClass(nextday)}>{getEta(nextday)}</td>
              <td className={getEtaClass(sameday)}>{getEta(sameday)}</td>
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
