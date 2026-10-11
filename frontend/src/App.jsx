import { useMemo, useRef } from 'react'
import './App.css'
import { ShipmentProvider, useShipmentContext } from './context/ShipmentContext'
import { filterTabs, services as fallbackServices } from './data/serviceCatalog'
import { ShippingForm } from './features/shipping-form/components/ShippingForm'
import { MarginCalculator } from './features/margin-calculator/components/MarginCalculator'
import { RecommendationEngine } from './features/recommendation-engine/components/RecommendationEngine'
import { ServiceComparison } from './features/service-comparison/components/ServiceComparison'
import { useLocationData } from './hooks/useLocationData'
import { useShippingCalculation } from './hooks/useShippingCalculation'
import { formatRibuan, parseNumber } from './shared/utils/numberFormat'

const parseWeight = (value) => {
  const raw = String(value ?? '').trim()
  if (!raw) return NaN

  const decimalSeparator = raw.lastIndexOf(',') > raw.lastIndexOf('.') ? ',' : '.'
  const normalized = raw
    .replace(decimalSeparator === ',' ? /\./g : /,/g, '')
    .replace(decimalSeparator, '.')
  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : NaN
}

const limitWeightPrecision = (value) => {
  const raw = String(value ?? '').replace(/[^\d.,]/g, '')
  const separatorIndex = Math.max(raw.lastIndexOf(','), raw.lastIndexOf('.'))
  if (separatorIndex < 0) return raw

  const integer = raw.slice(0, separatorIndex).replace(/[.,]/g, '')
  const fraction = raw.slice(separatorIndex + 1).replace(/[.,]/g, '').slice(0, 2)
  return `${integer}${raw[separatorIndex]}${fraction}`
}

function ShipmentAppContent() {
  const {
    origin,
    setOrigin,
    destination,
    setDestination,
    weight,
    setWeight,
    dimensions,
    setDimensions,
    price,
    setPrice,
    activeFilter,
    setActiveFilter,
    selectedService,
    setSelectedService,
    toast,
    setToast,
    submitMessage,
    setSubmitMessage,
    errors,
    setErrors,
    isSubmitting,
    setIsSubmitting,
  } = useShipmentContext()

  const { cities, isLoading: isLocationLoading, isError: isLocationError, errorMessage: locationError } = useLocationData()
  const { shippingResult, isCalculating, calcError, calculateShipping } = useShippingCalculation()
  const servicesGridRef = useRef(null)

  const volumeSummary = useMemo(() => {
    const panjang = parseNumber(dimensions.panjang) || 0
    const lebar = parseNumber(dimensions.lebar) || 0
    const tinggi = parseNumber(dimensions.tinggi) || 0
    const actualWeight = parseWeight(weight) || 0
    const volumetricWeight = Math.round((panjang * lebar * tinggi / 6000) * 100) / 100
    const calculatedWeight = Math.max(actualWeight, volumetricWeight)
    const usingVolume = volumetricWeight > actualWeight

    return {
      volumetricWeight,
      actualWeight,
      calculatedWeight,
      usingVolume,
    }
  }, [dimensions, weight])

  // Transform API response into service card objects for the UI
  const services = useMemo(() => {
    const serviceIdMap = {
      'SRV_EKO': { id: 'ekonomi', category: 'Layanan Hemat', ribbonLabel: 'PILIHAN PALING HEMAT', ribbonBadge: 'Hemat Ongkir', tones: 'primary', tags: ['cheapest', 'recommended'] },
      'SRV_REG': { id: 'reguler', category: 'PILIHAN POPULER', ribbonLabel: '', ribbonBadge: '', tones: 'default', tags: ['regular'] },
      'SRV_NXT': { id: 'nextday', category: 'Kilat Esok Tiba', ribbonLabel: 'PALING CEPAT', ribbonBadge: 'Besok Sampai', tones: 'default', tags: ['fastest'] },
      'SRV_SMD': { id: 'sameday', category: 'Antar Instan 8 Jam', ribbonLabel: 'Same Day', ribbonBadge: 'Same Day', tones: 'default', tags: ['sameday'] },
    }

    if (!shippingResult) {
      return fallbackServices.map((service) => ({
        ...service,
        price: '',
        priceRaw: null,
        tarifPerKg: null,
        persentaseOngkir: null,
        kategoriRisikoMargin: null,
        pending: true,
        disabled: false,
        tones: service.id === 'ekonomi' ? 'primary' : 'default',
        eta: 'Belum dihitung',
      }))
    }

    const optionsByServiceId = new Map((shippingResult.options || []).map((option) => [option.service_id, option]))

    return fallbackServices.map((service) => {
      const serviceId = Object.keys(serviceIdMap).find((id) => serviceIdMap[id].id === service.id)
      const option = optionsByServiceId.get(serviceId)

      if (!option) {
        return {
          ...service,
          price: '-',
          priceRaw: null,
          tarifPerKg: null,
          persentaseOngkir: null,
          kategoriRisikoMargin: null,
          pending: false,
          disabled: true,
          tones: 'disabled',
          eta: 'Tidak tersedia',
          unavailableMessage: 'Layanan ini tidak tersedia untuk rute yang dipilih.',
        }
      }

      const mapping = serviceIdMap[option.service_id]
      return {
        ...service,
        ...mapping,
        name: `Anteraja ${option.nama_layanan}`,
        price: `Rp ${new Intl.NumberFormat('id-ID').format(option.tarif_ongkir)}`,
        priceRaw: option.tarif_ongkir,
        eta: option.estimasi_sla,
        etaDays: option.estimasi_sla_hari,
        tarifPerKg: option.tarif_per_kg,
        persentaseOngkir: option.persentase_ongkir,
        kategoriRisikoMargin: option.kategori_risiko_margin,
        selisihHargaLayanan: option.selisih_harga_layanan,
        isRecommended: option.is_recommended,
        recommendationReason: option.alasan_rekomendasi,
        recommendationRuleCode: option.rule_code_applied,
        pending: false,
        disabled: false,
      }
    })
  }, [shippingResult])

  const visibleServices =
    activeFilter === 'all'
      ? services
      : services.filter((item) => item.tags.includes(activeFilter))

  const handleDimensionChange = (field) => (event) => {
    const raw = event.target.value.replace(/[^\d.,]/g, '')
    setDimensions((current) => ({ ...current, [field]: raw }))
  }

  const handleWeightChange = (event) => {
    setWeight(limitWeightPrecision(event.target.value))
  }

  const handlePriceChange = (event) => {
    const sanitized = event.target.value.replace(/[^\d.,]/g, '')
    const parsed = parseNumber(sanitized)
    setPrice(Number.isNaN(parsed) ? '' : formatRibuan(parsed))
  }

  const getNumericError = (field, value) => {
    const numericValue = field === 'weight' ? parseWeight(value) : parseNumber(value)
    if (Number.isNaN(numericValue) || numericValue <= 0) {
      return 'Masukkan angka yang valid'
    }
    return ''
  }

  const handleFieldBlur = (field) => (event) => {
    const nextMessage = getNumericError(field, event.target.value)
    setErrors((current) => {
      const next = { ...current }
      if (nextMessage) {
        next[field] = nextMessage
      } else {
        delete next[field]
      }
      return next
    })
  }

  const collectValidationErrors = () => {
    const nextErrors = {}
    const fields = [
      ['price', price],
      ['weight', weight],
      ['panjang', dimensions.panjang],
      ['lebar', dimensions.lebar],
      ['tinggi', dimensions.tinggi],
    ]

    fields.forEach(([field, value]) => {
      const message = getNumericError(field, value)
      if (message) {
        nextErrors[field] = message
      }
    })

    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = collectValidationErrors()
    const isValid = Object.keys(nextErrors).length === 0

    if (!isValid) {
      setErrors(nextErrors)
      const fieldMap = {
        price: '#priceInput',
        weight: '#weightInput',
        panjang: '#dimPanjang',
        lebar: '#dimLebar',
        tinggi: '#dimTinggi',
      }
      const firstError = Object.keys(nextErrors)[0]
      const field = document.querySelector(fieldMap[firstError])
      field?.focus()
      return
    }

    setIsSubmitting(true)

    // Kirim data ke PHP backend
    const payload = {
      kota_asal: origin,
      kota_tujuan: destination,
      berat_kg: parseWeight(weight),
      panjang_cm: parseNumber(dimensions.panjang) || 0,
      lebar_cm: parseNumber(dimensions.lebar) || 0,
      tinggi_cm: parseNumber(dimensions.tinggi) || 0,
      harga_jual: parseNumber(price),
    }

    const result = await calculateShipping(payload)

    setIsSubmitting(false)

    if (result?.success) {
      setSubmitMessage('Tarif pengiriman berhasil dihitung dari server!')
      setSelectedService('')  // Reset selection

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      servicesGridRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      })

      window.setTimeout(() => setSubmitMessage(''), 3000)
    } else {
      setSubmitMessage('')
    }
  }

  const handleSelectService = (service) => {
    if (service.disabled) return

    setSelectedService(service.id)
    setToast({ name: service.name, price: service.price, eta: service.eta })
    window.setTimeout(() => setToast(null), 4000)
  }

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <div className="header-brand">
            <a href="#" aria-label="Beranda Anteraja">
              <img
                src="src/assets/anteraja-logo.png"
                alt="Anteraja Logo"
              />
            </a>
          </div>
          <nav className="header-nav" aria-label="Navigasi Utama" />
          <div className="header-actions">
            <div className="lang-switcher" role="group" aria-label="Pilihan Bahasa">
              <span className="lang-active">ID</span>
              <span className="lang-sep" aria-hidden="true">|</span>
              <span className="lang-inactive">EN</span>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="main-inner">
          <nav aria-label="Breadcrumb" className="breadcrumb-nav">
            <ol className="breadcrumb-list">
              <li className="bc-active">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">calculate</span>
                <span>Kalkulator Ongkir &amp; Estimasi Pengiriman</span>
              </li>
            </ol>
          </nav>

          <ShippingForm
            origin={origin}
            destination={destination}
            weight={weight}
            dimensions={dimensions}
            price={price}
            errors={errors}
            volumeSummary={volumeSummary}
            submitMessage={submitMessage}
            isSubmitting={isSubmitting}
            cities={cities}
            locationStatus={{ isLoading: isLocationLoading, isError: isLocationError, message: locationError }}
            onOriginChange={(event) => setOrigin(event.target.value)}
            onDestinationChange={(event) => setDestination(event.target.value)}
            onWeightChange={handleWeightChange}
            onDimensionChange={handleDimensionChange}
            onPriceChange={handlePriceChange}
            onBlurField={handleFieldBlur}
            onSubmit={handleSubmit}
          />

          <MarginCalculator shippingResult={shippingResult} />

          {calcError && (
            <div className="btn-submit__error" role="alert" style={{ background: 'var(--color-error-container, #fde8e8)', color: 'var(--color-error, #c62828)', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">error</span>
              {calcError}
            </div>
          )}

          <div ref={servicesGridRef}>
            <RecommendationEngine
              filterTabs={filterTabs}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              allServices={services}
              shippingResult={shippingResult}
              visibleServices={visibleServices}
              selectedService={selectedService}
              onSelectService={handleSelectService}
            />
          </div>

          <ServiceComparison services={services} shippingResult={shippingResult} />
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-brand-logo">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDscWsPhuqrCHcFo671op_y_ygwOSQFkrraQ8oC1uslmAAMk2MJVAATKWpS7qs9KDWsA_DuZPIAhlZ4HF2hzap7TqPUdxMmAauXyh3tLG7nQzov6PE5T0ZdDSsaMQYb1H1r5AyCn3lOseSR_fEPfydtY7p4p5r1HBJGqJVOnHmW5RTvjc-sN1o4WzDhz8Uii0tk4THq7iEPJ8U-PcADZKBzMl1B-97WaAC-T14iIcyjB5nnrfiWo-7s7Be9z8KIsmLU3w"
                  alt="Anteraja Logo"
                />
              </div>
              <address className="footer-contact">
                <p className="footer-contact-title">Butuh bantuan? Hubungi Anteraja Care</p>
                <div className="footer-contact-items">
                  <p><span className="contact-label">X:</span><span>@AnterajaCare</span></p>
                  <p><span className="contact-label">Call Center:</span><span>021 - 5066 - 3333</span></p>
                  <p><span className="contact-label">Customer Service:</span><a href="mailto:cs@anteraja.id">cs@anteraja.id</a></p>
                </div>
              </address>
            </div>

            <nav aria-label="Tentang dan Produk Anteraja" className="footer-nav-group">
              <div className="footer-nav-section">
                <h3 className="footer-nav-heading">Tentang Anteraja</h3>
                <ul className="footer-nav-list">
                  <li><a href="#">Profil Perusahaan</a></li>
                  <li><a href="#">Aplikasi Anteraja</a></li>
                  <li><a href="#">FAQ</a></li>
                  <li><a href="#">Karir</a></li>
                  <li><a href="#">Blog</a></li>
                </ul>
              </div>
              <div className="footer-nav-section">
                <h3 className="footer-nav-heading">Produk Anteraja</h3>
                <ul className="footer-nav-list">
                  <li><a href="#">Pengiriman Corporate</a></li>
                  <li><a href="#">Pengiriman UMKM</a></li>
                </ul>
              </div>
            </nav>

            <nav aria-label="Layanan dan Informasi" className="footer-nav-group">
              <div className="footer-nav-section">
                <h3 className="footer-nav-heading">Layanan</h3>
                <ul className="footer-nav-list">
                  <li><a href="#">Jenis Pengiriman</a></li>

                  <li><a href="#">Lokasi Anteraja</a></li>
                  <li><a href="#">Lacak Pengiriman</a></li>
                  <li><a href="#">Cek Ongkir</a></li>
                </ul>
              </div>
              <div className="footer-nav-section">
                <h3 className="footer-nav-heading">Informasi</h3>
                <ul className="footer-nav-list">
                  <li><a href="#">Syarat &amp; Ketentuan</a></li>
                  <li><a href="#">Kebijakan Privasi</a></li>
                  <li><a href="#">Quality Policy</a></li>
                  <li><a href="#">Anteraja Whistleblowing System</a></li>
                </ul>
              </div>
            </nav>

            <nav aria-label="Kerjasama Bisnis" className="footer-nav-section">
              <h3 className="footer-nav-heading">Kerjasama</h3>
              <ul className="footer-nav-list">
                <li><a href="#">Keagenan Pengusaha Anteraja</a></li>
                <li><a href="#">Jadi Partner Bisnis</a></li>
                <li><a href="#">Marketing</a></li>
              </ul>
            </nav>

            <aside aria-label="Media Sosial dan Unduh Aplikasi" className="footer-nav-group">
              <div className="footer-nav-section">
                <h3 className="footer-nav-heading">Social Media</h3>
                <div className="social-links">
                  <a href="#" aria-label="Facebook Anteraja" className="social-link">
                    <svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
                  </a>
                  <a href="#" aria-label="Instagram Anteraja" className="social-link">
                    <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
                  </a>
                  <a href="#" aria-label="TikTok Anteraja" className="social-link">
                    <svg viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.02 3.82.02 7.64-.02 11.46-.11 2.37-1.12 4.67-2.88 6.27-2.02 1.83-4.88 2.64-7.59 2.14-3.13-.57-5.83-2.85-6.72-5.91-.98-3.32-.08-7.1 2.33-9.52 1.85-1.85 4.54-2.73 7.15-2.33v4.06c-1.37-.3-2.87-.1-4.04.66-1.04.68-1.72 1.86-1.82 3.1-.14 1.69.75 3.39 2.27 4.16 1.44.73 3.23.63 4.59-.26 1.05-.69 1.66-1.92 1.67-3.18V0h.22z"></path></svg>
                  </a>
                  <a href="#" aria-label="X Anteraja" className="social-link">
                    <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                  </a>
                  <a href="#" aria-label="YouTube Anteraja" className="social-link">
                    <svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path></svg>
                  </a>
                </div>
              </div>
              <div className="footer-nav-section">
                <h4 className="app-download-heading">Download Aplikasi</h4>
                <div className="app-downloads">
                  <a href="#" className="app-link">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }} aria-hidden="true">app_badging</span>
                    <div className="app-link-text">
                      <span className="small">Download on the</span>
                      <span className="name">App Store</span>
                    </div>
                  </a>
                  <a href="#" className="app-link">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }} aria-hidden="true">play_arrow</span>
                    <div className="app-link-text">
                      <span className="small">GET IT ON</span>
                      <span className="name">Google Play</span>
                    </div>
                  </a>
                </div>
              </div>
            </aside>
          </div>
          <div className="footer-copyright">
            <p>Copyright © 2020 PT. Tri Adi Bersama. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {toast && (
        <div className="toast-summary" role="status" aria-live="polite">
          <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '20px' }} aria-hidden="true">check_circle</span>
          <span>Layanan: <strong>{toast.name}</strong></span>
          <span className="toast-summary__dot">•</span>
          <span>Tarif: <strong>{toast.price}</strong></span>
          <span className="toast-summary__dot">•</span>
          <span>Estimasi: {toast.eta}</span>
          <button
            type="button"
            className="toast-close-btn"
            aria-label="Tutup ringkasan"
            onClick={() => setToast(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, marginLeft: '8px', display: 'inline-flex', alignItems: 'center' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>
      )}
    </>
  )
}

export default function App() {
  return (
    <ShipmentProvider>
      <ShipmentAppContent />
    </ShipmentProvider>
  )
}
