import { useState } from 'react'
import { RecommendationModal } from './RecommendationModal'

export function RecommendationEngine({
  filterTabs,
  activeFilter,
  setActiveFilter,
  visibleServices,
  selectedService,
  onSelectService,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const recommendedService =
    visibleServices.find((service) => service.tones === 'primary') ||
    visibleServices.find((service) => service.id === 'ekonomi') ||
    visibleServices[0]

  return (
    <>
      <nav aria-label="Filter Layanan Pengiriman" className="filter-nav">
        <div role="tablist" aria-label="Kategori Filter" className="filter-tabs">
          {filterTabs.map((tab) => (
            <button
              key={tab.filter}
              type="button"
              role="tab"
              aria-selected={activeFilter === tab.filter}
              className={`filter-tab ${activeFilter === tab.filter ? 'filter-tab--active' : 'filter-tab--inactive'}`}
              data-filter={tab.filter}
              onClick={() => setActiveFilter(tab.filter)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="filter-actions">
          <button
            type="button"
            className="btn-reco-link"
            style={{ textDecoration: 'none' }}
            onClick={() => setIsModalOpen(true)}
            aria-haspopup="dialog"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">psychology</span>Rekomendasi Hemat
          </button>
        </div>
      </nav>

      <section aria-label="Pilihan Layanan Pengiriman" className="services-grid">
        {visibleServices.map((service) => {
          const isSelected = selectedService === service.id
          const isDisabled = service.disabled

          return (
            <article
              key={service.id}
              className={`service-card ${service.tones === 'primary' ? 'service-card--primary' : isDisabled ? 'service-card--disabled' : 'service-card--default'} ${isSelected ? 'service-card--selected' : ''}`}
              data-service-id={service.id}
              data-tags={service.tags.join(',')}
              data-service-name={service.name}
              data-service-price={service.price}
              data-service-eta={service.eta}
              data-disabled={isDisabled ? 'true' : 'false'}
              onClick={() => onSelectService(service)}
            >
              {service.tones === 'primary' && (
                <header className="card-ribbon card-ribbon--primary">
                  <span className="ribbon-label">
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }} aria-hidden="true">star</span>{service.ribbonLabel}
                  </span>
                  <span className="ribbon-badge">{service.ribbonBadge}</span>
                </header>
              )}

              {service.tones === 'default' && service.id === 'nextday' && (
                <header className="card-ribbon card-ribbon--fastest">
                  <span className="ribbon-label">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">bolt</span>{service.ribbonLabel}
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 600 }}>{service.ribbonBadge}</span>
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

                    {service.tones === 'primary' ? (
                      <div className={`card-check ${isSelected ? 'card-check--selected' : 'card-check--primary'}`} aria-hidden="true">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>
                      </div>
                    ) : service.tones === 'disabled' ? (
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-service-disabled)', fontSize: '20px', flexShrink: 0 }} aria-hidden="true">block</span>
                    ) : (
                      <div className={`card-check ${isSelected ? 'card-check--selected' : 'card-check--empty'}`} aria-hidden="true">
                        <span></span>
                      </div>
                    )}
                  </div>

                  <div className="estimate-row">
                    <span className={`estimate-label ${service.tones === 'disabled' ? 'estimate-label--disabled' : ''}`}>{service.tones === 'disabled' ? 'Status Layanan' : 'Estimasi Tiba'}</span>
                    <span className={`estimate-value ${service.tones === 'disabled' ? 'estimate-value--disabled' : ''}`}>{service.eta}</span>
                  </div>

                  <div className="price-area">
                    {service.tones === 'disabled' ? (
                      <>
                        <div className="price-main">
                          <span className="price-value price-value--disabled">-</span>
                          <span className="price-unit price-unit--disabled">/ 2.0 kg</span>
                        </div>
                        <div>
                          <p className="unavailable-text">Layanan Same Day saat ini khusus untuk pengiriman dalam kota yang sama (radius maks. 40 km). Rute Bandung ke Surabaya belum mendukung layanan ini.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="price-row">
                          <div className="price-main">
                            <span className={`price-value ${isSelected ? 'price-value--default' : ''}`}>{service.price}</span>
                            <span className="price-unit">/ 2.0 kg</span>
                          </div>
                          <span className="price-rate">{service.id === 'ekonomi' ? 'Tarif Rp 9.000/kg' : service.id === 'reguler' ? 'Rp 12.000/kg' : 'Rp 18.000/kg'}</span>
                        </div>
                        <div>
                          <span className={`ongkir-badge ${service.id === 'nextday' ? 'ongkir-badge--danger' : 'ongkir-badge--warning'}`}>
                            {service.id === 'ekonomi'
                              ? 'Porsi Ongkir: 36% dari harga barang'
                              : service.id === 'reguler'
                                ? 'Porsi Ongkir: 48% dari harga barang'
                                : 'Porsi Ongkir: 72% dari harga barang'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {service.tones === 'primary' && (
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
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">lightbulb</span>
                      Lihat Saran Rekomendasi
                    </button>
                  )}
                </div>

                <footer className="card-footer">
                  <button
                    type="button"
                    className={`btn-pilih ${service.tones === 'primary' ? 'btn-pilih--primary' : service.tones === 'disabled' ? 'btn-pilih--disabled' : 'btn-pilih--secondary'} ${isSelected ? 'btn-pilih--selected' : ''}`}
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
        isSelected={selectedService === recommendedService?.id}
      />
    </>
  )
}
