import { useState } from 'react'
import { useTranslation } from '../../../i18n'

export function MarginCalculator({ shippingResult }) {
  const { t, locale } = useTranslation()
  const [isTipsOpen, setIsTipsOpen] = useState(false)

  const cheapestOption = shippingResult?.options?.[0]
  const hargaJual = cheapestOption ? shippingResult.harga_jual : null
  const ongkirTermurah = cheapestOption?.tarif_ongkir ?? null
  const persentaseOngkir = cheapestOption?.persentase_ongkir ?? null
  const kategori = cheapestOption?.kategori_risiko_margin
  const sisaPendapatan = hargaJual != null && ongkirTermurah != null
    ? hargaJual - ongkirTermurah
    : null

  const regulerOption = shippingResult?.options?.find((opt) => opt.service_id === 'SRV_REG')
  const hemat = regulerOption && cheapestOption
    ? regulerOption.tarif_ongkir - cheapestOption.tarif_ongkir
    : null

  const formatRp = (n) => `Rp ${new Intl.NumberFormat(locale).format(n)}`
  const formatValue = (value) => value == null ? '-' : formatRp(value)

  const porsiBadgeClass = kategori === 'Merah' ? 'stat-sub--error' : kategori === 'Kuning' ? 'stat-sub--warning' : 'stat-sub--success'
  const advice = !cheapestOption
    ? shippingResult
      ? t('margin.adviceNoService')
      : t('margin.adviceEmpty')
    : t('margin.adviceWithPct', { pct: persentaseOngkir })

  return (
    <aside className="profit-drawer" aria-label={t('margin.regionLabel')}>
      <div className="profit-drawer-inner">
        <header className="profit-drawer-header">
          <div className="profit-drawer-title-wrap">
            <div className="profit-drawer-icon" aria-hidden="true">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>lightbulb</span>
            </div>
            <div>
              <h2>{t('margin.heading')}</h2>
              <p className="drawer-subtitle">
                {hargaJual == null
                  ? t('margin.subtitleEmpty')
                  : t('margin.subtitleWithPrice', { price: formatRp(hargaJual) })}
              </p>
            </div>
          </div>

          <button
            type="button"
            className={`btn-tips ${isTipsOpen ? 'btn-tips--open' : ''}`}
            onClick={() => setIsTipsOpen((open) => !open)}
            aria-expanded={isTipsOpen}
            aria-controls="profit-tips-panel"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">lightbulb</span>
            <span>{t('margin.tipsButton')}</span>
            <span className="material-symbols-outlined btn-tips__chevron" aria-hidden="true">{isTipsOpen ? 'expand_less' : 'expand_more'}</span>
          </button>
        </header>

        <div id="profit-tips-panel" className={`tips-accordion ${isTipsOpen ? 'tips-accordion--open' : ''}`}>
          <aside className="saran-box" aria-label={t('margin.adviceLabel')}>
            <span className="material-symbols-outlined saran-icon" aria-hidden="true">tips_and_updates</span>
            <div>
              <h3>{t('margin.adviceHeading')}</h3>
              <p>{advice}</p>
            </div>
          </aside>
        </div>

        <div className={`drawer-content ${isTipsOpen ? 'drawer-content--open' : ''}`}>
          <dl className="stats-grid">
            <div className="stat-card stat-card--default">
              <dt>{t('margin.priceLabel')}</dt>
              <dd className="stat-value">{formatValue(hargaJual)}</dd>
              <dd className="stat-sub stat-sub--tertiary">{t('margin.priceSub')}</dd>
            </div>

            <div className="stat-card stat-card--warning">
              <dt>{t('margin.cheapestLabel')}</dt>
              <dd className="stat-value">{formatValue(ongkirTermurah)}</dd>
              <dd className={`stat-sub ${kategori ? porsiBadgeClass : ''}`}>
                {persentaseOngkir == null ? t('margin.shareNone') : t('margin.share', { pct: persentaseOngkir })}
              </dd>
            </div>

            <div className="stat-card stat-card--default">
              <dt>{t('margin.remainingLabel')}</dt>
              <dd className="stat-value">{formatValue(sisaPendapatan)}</dd>
              <dd className="stat-sub">{t('margin.remainingSub')}</dd>
            </div>

            <div className="stat-card stat-card--blue">
              <dt>{t('margin.savingsLabel')}</dt>
              <dd className="stat-value">{formatValue(hemat)}</dd>
              <dd className="stat-sub stat-sub--tertiary-bold">{t('margin.savingsSub')}</dd>
            </div>
          </dl>
        </div>
      </div>
    </aside>
  )
}
