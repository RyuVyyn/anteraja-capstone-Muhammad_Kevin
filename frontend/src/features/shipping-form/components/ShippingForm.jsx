import { useTranslation } from '../../../i18n'

export function ShippingForm({
  origin,
  destination,
  weight,
  dimensions,
  price,
  errors,
  volumeSummary,
  submitMessage,
  isSubmitting,
  cities = [],
  onOriginChange,
  onDestinationChange,
  onWeightChange,
  onDimensionChange,
  onPriceChange,
  onBlurField,
  onSubmit,
}) {
  const { t } = useTranslation()
  const citySuggestions = Array.from(new Map(cities.map((city) => [city.name, city])).values())

  return (
    <section className="calculator-section" aria-labelledby="calculatorHeading">
      <header className="calculator-header">
        <div className="calculator-header-left">
          <div className="calculator-header-divider" aria-hidden="true"></div>
          <div>
            <h1 id="calculatorHeading" className="calculator-heading">{t('form.heading')}</h1>
          </div>
        </div>
      </header>

      <form id="shippingForm" className="form-content" onSubmit={onSubmit}>
        <fieldset className="form-grid">
          <legend className="sr-only">{t('form.legend')}</legend>

          <div className="form-group fg-col-3">
            <label htmlFor="originInput" className="form-label">{t('form.origin')}</label>
            <div className="input-wrapper">
              <span className="material-symbols-outlined input-icon input-icon--secondary" aria-hidden="true">trip_origin</span>
              <input id="originInput" name="origin" list="originCityOptions" className="form-input form-input--with-icon" type="text" value={origin} onChange={onOriginChange} />
            </div>
            <datalist id="originCityOptions">
              {citySuggestions.map((city) => (
                <option key={city.id ?? city.name} value={`${city.name} (${city.province ?? t('form.regionFallback')})`} />
              ))}
            </datalist>
          </div>

          <div className="form-group fg-col-3">
            <label htmlFor="destinationInput" className="form-label">{t('form.destination')}</label>
            <div className="input-wrapper">
              <span className="material-symbols-outlined input-icon input-icon--primary" aria-hidden="true">location_on</span>
              <input id="destinationInput" name="destination" list="destinationCityOptions" className="form-input form-input--with-icon" type="text" value={destination} onChange={onDestinationChange} />
            </div>
            <datalist id="destinationCityOptions">
              {citySuggestions.map((city) => (
                <option key={city.id ?? `${city.name}-destination`} value={`${city.name} (${city.province ?? t('form.regionFallback')})`} />
              ))}
            </datalist>
          </div>

          <div className="form-group fg-col-2">
            <label htmlFor="weightInput" className="form-label">{t('form.weight')}</label>
            <div className="input-wrapper">
              <input id="weightInput" name="weight" className={`form-input ${errors.weight ? 'input-error' : ''}`} type="text" inputMode="decimal" aria-invalid={Boolean(errors.weight)} value={weight} onChange={onWeightChange} onBlur={onBlurField('weight')} />
            </div>
            {errors.weight && <span className="input-error-msg">{errors.weight}</span>}
          </div>

          <div className="form-group fg-col-2">
            <label className="form-label">{t('form.dimensions')}</label>
            <div className="dimension-grid">
              <input id="dimPanjang" aria-label={t('form.lengthAria')} className={`dimension-input ${errors.panjang ? 'input-error' : ''}`} data-dimension="panjang" title={t('form.length')} type="text" aria-invalid={Boolean(errors.panjang)} value={dimensions.panjang} onChange={onDimensionChange('panjang')} onBlur={onBlurField('panjang')} />
              <input id="dimLebar" aria-label={t('form.widthAria')} className={`dimension-input ${errors.lebar ? 'input-error' : ''}`} data-dimension="lebar" title={t('form.width')} type="text" aria-invalid={Boolean(errors.lebar)} value={dimensions.lebar} onChange={onDimensionChange('lebar')} onBlur={onBlurField('lebar')} />
              <input id="dimTinggi" aria-label={t('form.heightAria')} className={`dimension-input ${errors.tinggi ? 'input-error' : ''}`} data-dimension="tinggi" title={t('form.height')} type="text" aria-invalid={Boolean(errors.tinggi)} value={dimensions.tinggi} onChange={onDimensionChange('tinggi')} onBlur={onBlurField('tinggi')} />
            </div>
            {Object.values(errors).some((value) => value && ['panjang', 'lebar', 'tinggi'].includes(Object.keys(errors).find((key) => errors[key] === value))) && (
              <span className="input-error-msg">{t('errors.invalidNumber')}</span>
            )}
          </div>

          <div className="form-group fg-col-2">
            <label htmlFor="priceInput" className="form-label">{t('form.price')}</label>
            <div className="input-wrapper">
              <span className="input-prefix" aria-hidden="true">Rp</span>
              <input id="priceInput" name="price" className={`form-input form-input--with-prefix form-input--price ${errors.price ? 'input-error' : ''}`} type="text" aria-invalid={Boolean(errors.price)} value={price} onChange={onPriceChange} onBlur={onBlurField('price')} />
            </div>
            {errors.price && <span className="input-error-msg">{errors.price}</span>}
          </div>
        </fieldset>

        <footer className="form-footer">
          <div className="volume-summary" role="status" aria-live="polite">
            <div className="volume-summary-inner">
              <div className="volume-icon" aria-hidden="true">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>view_in_ar</span>
              </div>
              <div className="volume-details">
                <span className="vol-bold">{t('volume.size', { value: volumeSummary.volumetricWeight.toFixed(1).replace('.0', '') })}</span>
                <span className="vol-dot" aria-hidden="true">•</span>
                <span className="vol-normal">{t('volume.actual', { value: Number(volumeSummary.actualWeight).toFixed(1).replace('.0', '') })}</span>
                <span className="vol-dot" aria-hidden="true">•</span>
                <span className="vol-primary">{t('volume.calculated', { value: Number(volumeSummary.calculatedWeight).toFixed(1).replace('.0', ''), mode: volumeSummary.usingVolume ? t('volume.byVolume') : t('volume.byActual') })}</span>
              </div>
            </div>
          </div>

          <button type="submit" className={`btn-submit ${isSubmitting ? 'btn-submit--loading' : ''}`} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="btn-submit__spinner" aria-hidden="true"></span>
                {t('form.submitting')}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }} aria-hidden="true">sync_saved_locally</span>{t('form.submit')}
              </>
            )}
          </button>
        </footer>

        {submitMessage && (
          <div className="btn-submit__success" role="status">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">check_circle</span>{submitMessage}
          </div>
        )}
      </form>
    </section>
  )
}
