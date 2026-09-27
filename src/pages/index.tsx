import React from 'react'
import Link from 'next/link'
import styles from './index.module.css'
import { Warning } from '../components/Warning'
import { TAX_YEAR } from '../lib/calculation'
import { ExternalLink } from '../components/ExternalLink'
import getConfig from 'next/config'
import { useTranslations } from 'next-intl'

const IconCheck = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    viewBox="0 0 24 24"
    width="24"
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
)

const IconLock = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    viewBox="0 0 24 24"
    width="24"
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
  </svg>
)

const Home = ({
  nextRoute,
  nextPostponeRoute,
  isDebug,
  isLive,
  isPostponeLive,
}) => {
  const t = useTranslations('Home')
  return (
    <>
      <div className="govuk-grid-column-two-thirds">
        <TaxFormSection
          nextRoute={nextRoute}
          isDebug={isDebug}
          isLive={isLive}
        />
      </div>

      <div className="govuk-grid-column-one-third">
        <div className={styles.postponeBox}>
          <PostponeSection
            nextPostponeRoute={nextPostponeRoute}
            now={new Date()}
            isPostponeLive={isPostponeLive}
            isDebug={isDebug}
          />
        </div>

        <ul className={styles.safeList}>
          <li>
            <IconLock />
            <p>{t('sslConnection')}</p>
          </li>
          <li>
            <IconCheck />
            <p>
              {t.rich('preparedWith', {
                link: (chunks) => (
                  <ExternalLink href="https://www.linkedin.com/company/avenias/">
                    {chunks}
                  </ExternalLink>
                ),
              })}
            </p>
          </li>
        </ul>
      </div>
    </>
  )
}

export default Home

const {
  publicRuntimeConfig: { informujteMaKedBudeLive, navodyBaseUrl },
} = getConfig()

const TaxFormSection = ({ nextRoute, isDebug, isLive }) => {
  const t = useTranslations('Home')
  return (
    <>
      <h2 className="govuk-heading-l govuk-!-margin-top-3">
        {t('taxFormHeading')}
        <br />
        {t('taxFormYear', { year: TAX_YEAR })}
      </h2>

      {!isLive && (
        <Warning className="govuk-!-font-weight-bold">
          {t('workingOnVersion')}
        </Warning>
      )}
      <p className="govuk-body-l">
        {isLive ? t('introLive') : t('introNotLive', { year: TAX_YEAR + 1 })}
      </p>

      <p>{t('introDownload')}</p>

      <p>{t('introPurpose')}</p>

      <p>{t('introVolunteers')}</p>

      <Warning>
        <>
          <p>
            <strong>{t('unsupportedHeading')}</strong>
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li>{t('unsupportedOtherIncome')}</li>
            <li>{t('unsupportedForeignIncome')}</li>
            <li>{t('unsupportedLosses')}</li>
            <li>{t('unsupportedPensioners')}</li>
            <li>{t('unsupportedLiabilities')}</li>
            <li>{t('unsupportedWithholding')}</li>
          </ul>
        </>
      </Warning>

      <p className="govuk-body-xs">{t('consentTaxForm')}</p>

      {(isLive || isDebug) && (
        <Link href={nextRoute} legacyBehavior>
          <button
            type="button"
            className="govuk-button govuk-button--large govuk-button--start govuk-!-margin-bottom-3"
          >
            {t('startTaxForm')}
            <svg
              className="govuk-button__start-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="17.5"
              height="19"
              viewBox="0 0 33 40"
              aria-hidden="true"
              focusable="false"
            >
              <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
            </svg>
          </button>
        </Link>
      )}

      {!isLive && (
        <Link href={`${navodyBaseUrl}${informujteMaKedBudeLive}`}>
          <button
            type="button"
            className="govuk-button govuk-button--large govuk-button--start"
          >
            {t('notifyMe')}
          </button>
        </Link>
      )}
    </>
  )
}

const PostponeSection = ({
  nextPostponeRoute,
  now,
  isPostponeLive,
  isDebug,
}) => {
  const t = useTranslations('Home')
  const isPostponeTime = now.getMonth() < 3 || now.getFullYear() == TAX_YEAR

  return (
    <>
      <h2 className="govuk-heading-m govuk-!-margin-top-3">
        {t('postponeHeading', { year: TAX_YEAR })}
      </h2>
      <PostponeText now={now} />
      <ul className="govuk-list govuk-list--bullet">
        <li>{t('postponeUntilSlovakOnly', { year: TAX_YEAR + 1 })}</li>
        <li>{t('postponeUntilForeign', { year: TAX_YEAR + 1 })}</li>
      </ul>

      {((isPostponeTime && isPostponeLive) || isDebug) && (
        <>
          <p className="govuk-body-xs">{t('consentPostpone')}</p>
          <PostponeButton
            isPostponeTime={isPostponeTime}
            nextPostponeRoute={nextPostponeRoute}
          />
        </>
      )}
    </>
  )
}

const PostponeText = ({ now }: { now: Date }) => {
  const t = useTranslations('Home')
  return (
    <>
      {now.getMonth() > 2 && now.getFullYear() == TAX_YEAR + 1 && (
        <>
          <p>{t('deadlineWas', { year: TAX_YEAR + 1 })}</p>
          <p>{t('couldExtend')}</p>
        </>
      )}
      {(now.getMonth() < 3 || now.getFullYear() == TAX_YEAR) && (
        <>
          <p>{t('deadlineIs', { year: TAX_YEAR + 1 })}</p>
          <p>{t('canExtend')}</p>
        </>
      )}
    </>
  )
}

const PostponeButton = ({ isPostponeTime, nextPostponeRoute }) => {
  const t = useTranslations('Home')
  if (!isPostponeTime) {
    return (
      <button
        type="button"
        className="btn-secondary govuk-button govuk-button--large govuk-button--disabled"
        disabled
      >
        {t('postponeExpired')}
      </button>
    )
  }

  if (isPostponeTime) {
    return (
      <Link href={nextPostponeRoute} legacyBehavior>
        <button
          type="button"
          className="btn-secondary govuk-button govuk-button--large"
        >
          {t('startPostpone')}
        </button>
      </Link>
    )
  }
}
