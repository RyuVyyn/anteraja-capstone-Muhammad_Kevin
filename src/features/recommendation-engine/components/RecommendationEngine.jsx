import { useState } from 'react'
import { RecommendationModal } from './RecommendationModal'

export function RecommendationEngine({
  filterTabs,
  activeFilter,
  setActiveFilter,
  allServices,
  shippingResult,
  visibleServices,
  selectedService,
  onSelectService,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getMarginBadgeClass = (service) => {
    const percentage = service.persentaseOngkir
    if (percentage != null) {
      if (percentage > 30) return 'ongkir-badge--danger'
      if (percentage > 15) return 'ongkir-badge--warning'
      return 'ongkir-badge--success'
    }

    if (service.kategoriRisikoMargin === 'Merah') return 'ongkir-badge--danger'
    if (service.kategoriRisikoMargin === 'Kuning') return 'ongkir-badge--warning'
    return 'ongkir-badge--success'
  }

  const recommendedService = allServices.find((service) => service.isRecommended && !service.disabled) || null
  const regularService = allServices.find((service) => service.id === 'reguler')
  const availableAlternatives = allServices.filter((service) =>
    service.id !== recommendedService?.id && !service.disabled && !service.pending && service.priceRaw != null,
  )
  const cheapestAlternative = availableAlternatives.reduce(
    (cheapest, service) => !cheapest || service.priceRaw < cheapest.priceRaw ? service : cheapest,
    null,
  )
  const comparisonService = recommendedService?.id === 'reguler'
    ? cheapestAlternative
    : regularService && !regularService.disabled && !regularService.pending && regularService.id !== recommendedService?.id
      ? regularService
      : cheapestAlternative
  const availableServices = allServices.filter((service) => !service.disabled && !service.pending && service.etaDays != null)
  const fastestEtaDays = availableServices.length
    ? Math.min(...availableServices.map((service) => service.etaDays))
    : null

  return (
    <>
      <section aria-label="Pilihan Layanan Pengiriman" className="services-grid">
        {visibleServices.map((service) => {
          const isSelected = selectedService === service.id
          const isDisabled = service.disabled
          const isRecommended = service.isRecommended
          const isFastest = !isDisabled && service.etaDays != null && service.etaDays === fastestEtaDays
          const cardToneClass = isSelected ? 'service-card--selected' : isDisabled ? 'service-card--disabled' : 'service-card--default'
          const buttonToneClass = isSelected ? 'btn-pilih--selected' : isDisabled ? 'btn-pilih--disabled' : 'btn-pilih--secondary'

          return (
            <article
              key={service.id}
              className={`service-card ${cardToneClass}`}
              data-service-id={service.id}
              data-tags={service.tags.join(',')}
              data-service-name={service.name}
              data-service-price={service.price}
              data-service-eta={service.eta}
              data-disabled={isDisabled ? 'true' : 'false'}
              onClick={() => onSelectService(service)}
            >
              {isRecommended && (
                <header className="card-ribbon card-ribbon--primary">
                  <span className="ribbon-label">
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }} aria-hidden="true">star</span>REKOMENDASI UTAMA
                  </span>
                </header>
              )}

              {isFastest && (
                <header className="card-ribbon card-ribbon--fastest">
                  <span className="ribbon-label">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">bolt</span>PALING CEPAT
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 600 }}>{service.eta}</span>
                </header>
              )}

              {service.tones === 'disabled' && (
                <header className="card-ribbon card-ribbon--disabled">
                  <span className="ribbon-label" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{service.ribbonLabel}</span>
                  <span className="ribbon-badge--error">{service.ribbonBadge}</span>
                </header>
              )}

              <div className="card-body">
                <div className="card-info">
                  <div className="card-title-row">
                    <div>
                      <span className="card-category">{service.category}</span>
                      <h3 className={`card-title ${service.tones === 'disabled' ? 'card-title--disabled' : ''}`}>{service.name}</h3>
                    </div>

                    {service.tones === 'disabled' ? (
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-service-disabled)', fontSize: '20px', flexShrink: 0 }} aria-hidden="true">block</span>
                    ) : (
                      <div className={`card-check ${isSelected ? 'card-check--selected' : 'card-check--empty'}`} aria-hidden="true">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', display: isSelected ? 'block' : 'none' }}>check</span>
                      </div>
                    )}
                  </div>

                  <div className="estimate-row">
                    <span className={`estimate-label ${service.tones === 'disabled' ? 'estimate-label--disabled' : ''}`}>{service.tones === 'disabled' ? 'Status Layanan' : 'Estimasi Tiba'}</span>
                    <span className={`estimate-value ${service.tones === 'disabled' ? 'estimate-value--disabled' : ''}`}>{service.eta}</span>
                  </div>

                  <div className="price-area">
                    {service.pending ? (
                      <div className="price-pending">Isi detail pengiriman untuk melihat tarif.</div>
                    ) : service.tones === 'disabled' ? (
                      <>
                        <div className="price-main">
                          <span className="price-value price-value--disabled">-</span>
                        </div>
                        <div>
                          <p className="unavailable-text">{service.unavailableMessage}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="price-row">
                          <div className="price-main">
                            <span className={`price-value ${isSelected ? 'price-value--default' : ''}`}>{service.price}</span>
                          </div>
                          {service.tarifPerKg != null && <span className="price-rate">Tarif Rp {new Intl.NumberFormat('id-ID').format(service.tarifPerKg)}/kg</span>}
                        </div>
                        <div>
                          <span className={`ongkir-badge ${getMarginBadgeClass(service)}`}>
                            {service.persentaseOngkir != null
                              ? `Porsi Ongkir: ${service.persentaseOngkir}% dari harga barang`
                              : service.id === 'ekonomi'
                                ? 'Porsi Ongkir: 36% dari harga barang'
                                : service.id === 'reguler'
                                  ? 'Porsi Ongkir: 48% dari harga barang'
                                  : 'Porsi Ongkir: 72% dari harga barang'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {isRecommended && (
                    <button
                      type="button"
                      className="btn-reco"
                      style={{ textDecoration: 'none' }}
                      onClick={(event) => {
                        event.stopPropagation()
                        setIsModalOpen(true)
                      }}
                      aria-haspopup="dialog"
                    >
                      <span>Lihat Saran Rekomendasi</span>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">open_in_new</span>
                    </button>
                  )}
                </div>

                <footer className="card-footer">
                  <button
                    type="button"
                    className={`btn-pilih ${buttonToneClass}`}
                    disabled={isDisabled}
                    onClick={(event) => {
                      event.stopPropagation()
                      onSelectService(service)
                    }}
                  >
                    <span>{isDisabled ? 'Rute Tidak Didukung' : isSelected ? 'Layanan Terpilih' : 'Pilih Layanan'}</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">{isSelected ? 'check' : 'arrow_forward'}</span>
                  </button>
                </footer>
              </div>
            </article>
          )
        })}
      </section>

      <RecommendationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectService={onSelectService}
        recommendedService={recommendedService}
        comparisonService={comparisonService}
        shippingResult={shippingResult}
        isSelected={selectedService === recommendedService?.id}
      />
    </>
  )
}
