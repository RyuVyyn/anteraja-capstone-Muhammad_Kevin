import { useEffect, useState } from 'react'

export function RecommendationModal({
  isOpen,
  onClose,
  onSelectService,
  recommendedService,
  isSelected,
}) {
  const [isExplanationOpen, setIsExplanationOpen] = useState(true)
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
                <span className="reco-label-sep" aria-hidden="true">•</span>
                <span className="reco-label-secondary">PILIHAN PALING HEMAT</span>
              </div>
              <h2 id="recommendationTitle" className="reco-title">Saran Pengiriman Terbaik untuk Toko Anda</h2>
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
            <span className="reco-card-category">{recommendedService?.ribbonLabel || 'Pilihan Paling Hemat'}</span>
            <h3 className="reco-card-name">{recommendedService?.name || 'Anteraja Ekonomi'}</h3>
            <span className="reco-card-eta">
              {recommendedService?.eta ? `Perkiraan sampai: ${recommendedService.eta}` : 'Perkiraan sampai: 3 - 5 Hari'}
            </span>
          </div>
          <div className="reco-card-right">
            <span className="reco-card-price">{recommendedService?.price || 'Rp 18.000'}</span>
            <span className="reco-card-badge">Porsi ongkir paling ramah kantong</span>
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
              Layanan <strong>{recommendedService?.name || 'Anteraja Ekonomi'}</strong> direkomendasikan agar biaya kirim tidak terlalu membebani harga barang Anda. Anda menghemat <strong>Rp 6.000 (25%)</strong> dibanding layanan standar reguler, dengan waktu sampai yang tetap wajar untuk belanja online.
            </p>
          </div>
        </section>

        <div className="reco-stats">
          <div className="reco-stat-card">
            <span className="reco-stat-label">Penghematan Ongkir</span>
            <span className="reco-stat-value reco-stat-value--tertiary">Hemat Rp 6.000 (25%)</span>
          </div>
          <div className="reco-stat-card">
            <span className="reco-stat-label">Waktu Pengiriman</span>
            <span className="reco-stat-value reco-stat-value--on-surface">Selisih 1 - 2 Hari dibanding Reguler</span>
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
