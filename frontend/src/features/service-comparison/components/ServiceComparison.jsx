import { useTranslation } from '../../../i18n'

export function ServiceComparison({ services = [], shippingResult }) {
  const { t } = useTranslation()
  const hasData = shippingResult?.options?.length > 0

  const routeLabel = !shippingResult
    ? t('comparison.routeEmpty')
    : hasData
    ? t('comparison.routeWithData', { origin: shippingResult.kota_asal, destination: shippingResult.kota_tujuan, weight: shippingResult.berat_ditagih })
    : t('comparison.routeUnavailable', { origin: shippingResult.kota_asal, destination: shippingResult.kota_tujuan })

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
        {getPorsi(service)} {service.id === cheapestService?.id ? t('comparison.mostAffordable') : ''}
      </span>
    )
  }

  return (
    <section className="comparison-section" aria-labelledby="matrixHeading">
      <header className="comparison-header">
        <div>
          <h2 id="matrixHeading" className="comparison-heading">{t('comparison.heading')}</h2>
          <p className="comparison-subtitle">{t('comparison.subtitle', { route: routeLabel })}</p>
        </div>
        <span className="comparison-badge">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">verified_user</span>
          ✓ {t('comparison.badge')}
        </span>
      </header>

      <div className="table-wrapper">
        <table className="comparison-table">
          <caption className="sr-only">{t('comparison.caption')}</caption>
          <thead>
            <tr>
              <th scope="col">{t('comparison.thInfo')}</th>
              <th scope="col" className={cheapestService?.id === 'ekonomi' ? 'col-highlight' : ''}>{t('comparison.thEconomy')} {cheapestService?.id === 'ekonomi' ? t('comparison.thEconomyCheap') : ''}</th>
              <th scope="col">{t('comparison.thRegular')}</th>
              <th scope="col">{t('comparison.thNextDay')}</th>
              <th scope="col">{t('comparison.thSameDay')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">{beratDitagih == null ? t('comparison.rowFare') : t('comparison.rowFareWithWeight', { weight: beratDitagih })}</th>
              <td className={getPriceClass(ekonomi)}>{getPrice(ekonomi)}</td>
              <td className={getPriceClass(reguler)}>{getPrice(reguler)}</td>
              <td className={getPriceClass(nextday)}>{getPrice(nextday)}</td>
              <td className={getPriceClass(sameday)}>{getPrice(sameday)}</td>
            </tr>
            <tr>
              <th scope="row">{t('comparison.rowShare')}</th>
              <td>{renderPorsi(ekonomi)}</td>
              <td>{renderPorsi(reguler)}</td>
              <td>{renderPorsi(nextday)}</td>
              <td>{renderPorsi(sameday)}</td>
            </tr>
            <tr>
              <th scope="row">{t('comparison.rowEta')}</th>
              <td className={getEtaClass(ekonomi)}>{getEta(ekonomi)}</td>
              <td className={getEtaClass(reguler)}>{getEta(reguler)}</td>
              <td className={getEtaClass(nextday)}>{getEta(nextday)}</td>
              <td className={getEtaClass(sameday)}>{getEta(sameday)}</td>
            </tr>
            <tr>
              <th scope="row">{t('comparison.rowPickup')}</th>
              <td>{t('comparison.pickupEconomy')}</td>
              <td>{t('comparison.pickupRegular')}</td>
              <td className="cell-bold">{t('comparison.pickupNextDay')}</td>
              <td className="cell-disabled">{t('comparison.pickupSameDay')}</td>
            </tr>
            <tr>
              <th scope="row">{t('comparison.rowCod')}</th>
              <td className="cell-tertiary">{t('comparison.cod3m')}</td>
              <td className="cell-tertiary">{t('comparison.cod5m')}</td>
              <td className="cell-tertiary">{t('comparison.cod5m')}</td>
              <td className="cell-disabled">-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
