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
  onOriginChange,
  onDestinationChange,
  onWeightChange,
  onDimensionChange,
  onPriceChange,
  onBlurField,
  onSubmit,
}) {
  return (
    <section className="calculator-section" aria-labelledby="calculatorHeading">
      <header className="calculator-header">
        <div className="calculator-header-left">
          <div className="calculator-header-divider" aria-hidden="true"></div>
          <div>
            <h1 id="calculatorHeading" className="calculator-heading">Cek Tarif &amp; Estimasi Pengiriman</h1>
          </div>
        </div>
      </header>

      <form id="shippingForm" className="form-content" onSubmit={onSubmit}>
        <fieldset className="form-grid">
          <legend className="sr-only">Formulir Cek Tarif Pengiriman</legend>

          <div className="form-group fg-col-3">
            <label htmlFor="originInput" className="form-label">Kota Asal</label>
            <div className="input-wrapper">
              <span className="material-symbols-outlined input-icon input-icon--secondary" aria-hidden="true">trip_origin</span>
              <input id="originInput" name="origin" className="form-input form-input--with-icon" type="text" value={origin} onChange={onOriginChange} />
            </div>
          </div>

          <div className="form-group fg-col-3">
            <label htmlFor="destinationInput" className="form-label">Kota Tujuan</label>
            <div className="input-wrapper">
              <span className="material-symbols-outlined input-icon input-icon--primary" aria-hidden="true">location_on</span>
              <input id="destinationInput" name="destination" className="form-input form-input--with-icon" type="text" value={destination} onChange={onDestinationChange} />
            </div>
          </div>

          <div className="form-group fg-col-2">
            <label htmlFor="weightInput" className="form-label">Berat Fisik</label>
            <div className="input-wrapper">
              <input id="weightInput" name="weight" className={`form-input ${errors.weight ? 'input-error' : ''}`} type="text" aria-invalid={Boolean(errors.weight)} value={weight} onChange={onWeightChange} onBlur={onBlurField('weight')} />
            </div>
            {errors.weight && <span className="input-error-msg">{errors.weight}</span>}
          </div>

          <div className="form-group fg-col-2">
            <label className="form-label">Dimensi P x L x T (cm)</label>
            <div className="dimension-grid">
              <input id="dimPanjang" aria-label="Panjang paket dalam sentimeter" className={`dimension-input ${errors.panjang ? 'input-error' : ''}`} data-dimension="panjang" title="Panjang" type="text" aria-invalid={Boolean(errors.panjang)} value={dimensions.panjang} onChange={onDimensionChange('panjang')} onBlur={onBlurField('panjang')} />
              <input id="dimLebar" aria-label="Lebar paket dalam sentimeter" className={`dimension-input ${errors.lebar ? 'input-error' : ''}`} data-dimension="lebar" title="Lebar" type="text" aria-invalid={Boolean(errors.lebar)} value={dimensions.lebar} onChange={onDimensionChange('lebar')} onBlur={onBlurField('lebar')} />
              <input id="dimTinggi" aria-label="Tinggi paket dalam sentimeter" className={`dimension-input ${errors.tinggi ? 'input-error' : ''}`} data-dimension="tinggi" title="Tinggi" type="text" aria-invalid={Boolean(errors.tinggi)} value={dimensions.tinggi} onChange={onDimensionChange('tinggi')} onBlur={onBlurField('tinggi')} />
            </div>
            {Object.values(errors).some((value) => value && ['panjang', 'lebar', 'tinggi'].includes(Object.keys(errors).find((key) => errors[key] === value))) && (
              <span className="input-error-msg">Masukkan angka yang valid</span>
            )}
          </div>

          <div className="form-group fg-col-2">
            <label htmlFor="priceInput" className="form-label">Harga Produk (Rp)</label>
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
                <span className="vol-bold">Ukuran Volume: {volumeSummary.volumetricWeight.toFixed(1).replace('.0', '')} kg</span>
                <span className="vol-dot" aria-hidden="true">•</span>
                <span className="vol-normal">Berat Aktual: {Number(volumeSummary.actualWeight).toFixed(1).replace('.0', '')} kg</span>
                <span className="vol-dot" aria-hidden="true">•</span>
                <span className="vol-primary">Berat Dihitung: {Number(volumeSummary.calculatedWeight).toFixed(1).replace('.0', '')} kg ({volumeSummary.usingVolume ? 'mengikuti volume paket' : 'mengikuti berat aktual'})</span>
              </div>
            </div>
          </div>

          <button type="submit" className={`btn-submit ${isSubmitting ? 'btn-submit--loading' : ''}`} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="btn-submit__spinner" aria-hidden="true"></span>
                Menghitung...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }} aria-hidden="true">sync_saved_locally</span>Hitung Ongkir
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
