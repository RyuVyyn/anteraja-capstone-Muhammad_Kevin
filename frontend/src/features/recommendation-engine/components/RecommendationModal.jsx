import { useEffect, useState } from 'react'

export function RecommendationModal({
  isOpen,
  onClose,
  onSelectService,
  recommendedService,
  comparisonService,
  shippingResult,
  isSelected,
}) {
  const [isExplanationOpen, setIsExplanationOpen] = useState(false)
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const handleSelect = () => {
    if (onSelectService && recommendedService) {
      onSelectService(recommendedService)
    }
    onClose()
  }

  const formatRp = (value) => `Rp ${new Intl.NumberFormat('id-ID').format(value)}`
  const priceDifference = comparisonService?.priceRaw != null && recommendedService?.priceRaw != null
    ? recommendedService.priceRaw - comparisonService.priceRaw
    : null
  const priceDifferencePercentage = priceDifference != null && comparisonService.priceRaw > 0
    ? Math.round((Math.abs(priceDifference) / comparisonService.priceRaw) * 100)
    : null
  const priceComparisonLabel = priceDifference == null
    ? 'Tidak ada layanan pembanding yang tersedia'
    : priceDifference > 0
      ? `${formatRp(priceDifference)} lebih mahal dari ${comparisonService.name} (${priceDifferencePercentage}%)`
      : priceDifference < 0
        ? `Hemat ${formatRp(Math.abs(priceDifference))} dibanding ${comparisonService.name} (${priceDifferencePercentage}%)`
        : `Tarif sama dengan ${comparisonService.name}`
  const etaDifference = comparisonService?.etaDays != null && recommendedService?.etaDays != null
    ? comparisonService.etaDays - recommendedService.etaDays
    : null
  const etaLabel = etaDifference == null
    ? 'Estimasi waktu pembanding tidak tersedia'
    : etaDifference > 0
      ? `${Math.abs(etaDifference).toLocaleString('id-ID', { maximumFractionDigits: 1 })} hari lebih cepat dari ${comparisonService.name}`
      : etaDifference < 0
        ? `${Math.abs(etaDifference).toLocaleString('id-ID', { maximumFractionDigits: 1 })} hari lebih lambat dari ${comparisonService.name}`
        : `Waktu tiba sama dengan ${comparisonService.name}`

  return (
    <div
      className="reco-modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="recommendationTitle"
    >
      <section className="recommendation-section" aria-labelledby="recommendationTitle">
        <header className="reco-header">
          <div className="reco-header-left">
            <div className="reco-icon" aria-hidden="true">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>hotel_class</span>
            </div>
            <div>
              <div className="reco-labels">
                <span className="reco-label-primary">REKOMENDASI ANTERAJA</span>
              </div>
              <h2 id="recommendationTitle" className="reco-title">Saran Pengiriman Terbaik</h2>
              {shippingResult && <p className="drawer-subtitle">Rute {shippingResult.kota_asal} ke {shippingResult.kota_tujuan}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Tutup rekomendasi"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="reco-card">
          <div className="reco-card-left">
            <span className="reco-card-category">Rekomendasi untuk pesanan ini</span>
            <h3 className="reco-card-name">{recommendedService?.name}</h3>
            <span className="reco-card-eta">Perkiraan sampai: {recommendedService?.eta}</span>
          </div>
          <div className="reco-card-right">
            <span className="reco-card-price">{recommendedService?.price}</span>
            <span className="reco-card-badge">Porsi ongkir {recommendedService?.persentaseOngkir}% dari harga barang</span>
          </div>
        </div>

        <section className="reco-explanation" aria-label="Penjelasan Nilai Rekomendasi">
          <button
            type="button"
            className="reco-explanation-toggle"
            onClick={() => setIsExplanationOpen((open) => !open)}
            aria-expanded={isExplanationOpen}
            aria-controls="reco-explanation-panel"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-tertiary)' }} aria-hidden="true">verified</span>
            <span>Kenapa layanan ini pas untuk toko Anda?</span>
            <span className="material-symbols-outlined reco-explanation-toggle__icon" aria-hidden="true">{isExplanationOpen ? 'expand_less' : 'expand_more'}</span>
          </button>

          <div id="reco-explanation-panel" className={`reco-explanation-panel ${isExplanationOpen ? 'reco-explanation-panel--open' : ''}`}>
            <p>
              <strong>{recommendedService?.name}</strong> memiliki tarif {recommendedService?.price} dengan estimasi {recommendedService?.eta}. {recommendedService?.recommendationReason || priceComparisonLabel}
            </p>
          </div>
        </section>

        <div className="reco-stats">
          <div className="reco-stat-card">
            <span className="reco-stat-label">Perbandingan Biaya</span>
            <span className="reco-stat-value reco-stat-value--tertiary">{priceComparisonLabel}</span>
          </div>
          <div className="reco-stat-card">
            <span className="reco-stat-label">Waktu Pengiriman</span>
            <span className="reco-stat-value reco-stat-value--on-surface">{etaLabel}</span>
          </div>
        </div>

        <footer className="reco-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn-reco-close"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleSelect}
            className="btn-reco-select"
          >
            <span>{isSelected ? 'Layanan Terpilih' : 'Pilih Layanan Ini'}</span>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">check</span>
          </button>
        </footer>
      </section>
    </div>
  )
}
