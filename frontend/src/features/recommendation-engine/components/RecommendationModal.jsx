import { useEffect, useState } from 'react'
import { useTranslation } from '../../../i18n'

export function RecommendationModal({
  isOpen,
  onClose,
  onSelectService,
  recommendedService,
  comparisonService,
  shippingResult,
  isSelected,
}) {
  const { t, locale } = useTranslation()
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

  const formatRp = (value) => `Rp ${new Intl.NumberFormat(locale).format(value)}`
  const priceDifference = comparisonService?.priceRaw != null && recommendedService?.priceRaw != null
    ? recommendedService.priceRaw - comparisonService.priceRaw
    : null
  const priceDifferencePercentage = priceDifference != null && comparisonService.priceRaw > 0
    ? Math.round((Math.abs(priceDifference) / comparisonService.priceRaw) * 100)
    : null
  const priceComparisonLabel = priceDifference == null
    ? t('modal.noComparison')
    : priceDifference > 0
      ? t('modal.moreExpensive', { diff: formatRp(priceDifference), name: comparisonService.name, pct: priceDifferencePercentage })
      : priceDifference < 0
        ? t('modal.cheaper', { diff: formatRp(Math.abs(priceDifference)), name: comparisonService.name, pct: priceDifferencePercentage })
        : t('modal.samePrice', { name: comparisonService.name })
  const etaDifference = comparisonService?.etaDays != null && recommendedService?.etaDays != null
    ? comparisonService.etaDays - recommendedService.etaDays
    : null
  const etaLabel = etaDifference == null
    ? t('modal.etaUnavailable')
    : etaDifference > 0
      ? t('modal.faster', { days: Math.abs(etaDifference).toLocaleString(locale, { maximumFractionDigits: 1 }), name: comparisonService.name })
      : etaDifference < 0
        ? t('modal.slower', { days: Math.abs(etaDifference).toLocaleString(locale, { maximumFractionDigits: 1 }), name: comparisonService.name })
        : t('modal.sameEta', { name: comparisonService.name })

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
                <span className="reco-label-primary">{t('modal.label')}</span>
              </div>
              <h2 id="recommendationTitle" className="reco-title">{t('modal.title')}</h2>
              {shippingResult && <p className="drawer-subtitle">{t('modal.route', { origin: shippingResult.kota_asal, destination: shippingResult.kota_tujuan })}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label={t('modal.closeAria')}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="reco-card">
          <div className="reco-card-left">
            <span className="reco-card-category">{t('modal.cardCategory')}</span>
            <h3 className="reco-card-name">{recommendedService?.name}</h3>
            <span className="reco-card-eta">{t('modal.cardEta', { eta: recommendedService?.eta })}</span>
          </div>
          <div className="reco-card-right">
            <span className="reco-card-price">{recommendedService?.price}</span>
            <span className="reco-card-badge">{t('modal.cardBadge', { pct: recommendedService?.persentaseOngkir })}</span>
          </div>
        </div>

        <section className="reco-explanation" aria-label={t('modal.explanationLabel')}>
          <button
            type="button"
            className="reco-explanation-toggle"
            onClick={() => setIsExplanationOpen((open) => !open)}
            aria-expanded={isExplanationOpen}
            aria-controls="reco-explanation-panel"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-tertiary)' }} aria-hidden="true">verified</span>
            <span>{t('modal.explanationToggle')}</span>
            <span className="material-symbols-outlined reco-explanation-toggle__icon" aria-hidden="true">{isExplanationOpen ? 'expand_less' : 'expand_more'}</span>
          </button>

          <div id="reco-explanation-panel" className={`reco-explanation-panel ${isExplanationOpen ? 'reco-explanation-panel--open' : ''}`}>
            <p>
              <strong>{recommendedService?.name}</strong> {t('modal.explanationLead', { price: recommendedService?.price, eta: recommendedService?.eta })} {recommendedService?.recommendationReason || priceComparisonLabel}
            </p>
          </div>
        </section>

        <div className="reco-stats">
          <div className="reco-stat-card">
            <span className="reco-stat-label">{t('modal.costComparison')}</span>
            <span className="reco-stat-value reco-stat-value--tertiary">{priceComparisonLabel}</span>
          </div>
          <div className="reco-stat-card">
            <span className="reco-stat-label">{t('modal.deliveryTime')}</span>
            <span className="reco-stat-value reco-stat-value--on-surface">{etaLabel}</span>
          </div>
        </div>

        <footer className="reco-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn-reco-close"
          >
            {t('modal.close')}
          </button>
          <button
            type="button"
            onClick={handleSelect}
            className="btn-reco-select"
          >
            <span>{isSelected ? t('engine.serviceSelected') : t('modal.selectThis')}</span>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">check</span>
          </button>
        </footer>
      </section>
    </div>
  )
}
