import React, { useState } from 'react'
import getConfig from 'next/config'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import fileDownload from 'js-file-download'
import { ExternalLink } from '../components/ExternalLink'
import { Page } from '../components/Page'
import { TaxForm } from '../types/TaxForm'
import { convertToXML } from '../lib/xml/xmlConverter'
import { RedirectField, RedirectForm } from '../components/RedirectForm'
import { setDate, toBase64, formatCurrency } from '../lib/utils'
import { buildSummary } from '../lib/calculation'
import { Summary } from '../types/Summary'

const {
  publicRuntimeConfig: {
    priznanieEmailTemplateId,
    navodyBaseUrl,
    priznanieStepUrl,
  },
} = getConfig()

const action_url = `${navodyBaseUrl}${priznanieStepUrl}`

const buildXml = (taxForm: TaxForm) => convertToXML(setDate(taxForm))

const buildSummaryFields = (obj: Summary) => {
  return Object.keys(obj).map((key) => ({
    name: `submission[extra][params][summary][${key}]`,
    value: obj[key].eq(0) ? '0,00 EUR' : formatCurrency(obj[key].toNumber()),
  }))
}

const buildFields = (taxForm: TaxForm): RedirectField[] => {
  const xmlFile = toBase64(buildXml(taxForm))
  const fullName = `${taxForm.r005_meno}\u00A0${taxForm.r004_priezvisko}`
  const summaryFields = buildSummaryFields(buildSummary(taxForm))

  return [
    { name: 'submission[type]', value: 'EmailMeSubmissionInstructionsEmail' },
    {
      name: 'submission[callback_url]',
      value: priznanieStepUrl,
    },
    {
      name: 'submission[callback_step_path]',
      value: priznanieStepUrl,
    },
    {
      name: 'submission[callback_step_status]',
      value: 'not_started',
    },
    {
      name: 'submission[attachments[]filename]',
      value: 'danove-priznanie.xml',
    },
    { name: 'submission[attachments[]body_base64]', value: xmlFile },
    {
      name: 'submission[subscription_types][]',
      value: 'EmailMeSubmissionInstructionsEmail',
    },
    {
      name: 'submission[subscription_types][]',
      value: 'SelfEmployedSubscription',
    },
    {
      name: 'submission[subscription_types][]',
      value: 'NewsletterSubscription',
    },
    {
      name: 'submission[extra][template_id]',
      value: priznanieEmailTemplateId,
    },
    {
      name: 'submission[extra][params][recipient_name]',
      value: fullName,
    },
    {
      name: 'submission[extra][params][action_url]',
      value: action_url,
    },
    ...summaryFields,
  ]
}

const GUIDE_STEPS = [
  'login',
  'form',
  'load',
  'attachments',
  'sign',
  'pay',
  'verify',
] as const

const externalLink = (href: string) =>
  function GuideLink(chunks) {
    return <ExternalLink href={href}>{chunks}</ExternalLink>
  }

// tags used in the guide texts: <b> for portal button labels, links to external services
const richTags = {
  b: (chunks) => <b>{chunks}</b>,
  portal: externalLink(
    'https://www.financnasprava.sk/sk/osobna-internetova-zona/katalogy/katalog-formularov',
  ),
  autogram: externalLink(
    'https://sluzby.slovensko.digital/autogram-na-statnych-weboch/',
  ),
  autogramMobile: externalLink(
    'https://sluzby.slovensko.digital/autogram-v-mobile/index.html',
  ),
  certificates: externalLink(
    'https://navody.digital/zivotne-situacie/aktivacia-eid/krok/certifikaty',
  ),
  payment: externalLink(
    'https://www.financnasprava.sk/sk/infoservis/platenie-dani',
  ),
}

// one step at a time, like the original Návody.Digital guide
const SubmissionGuide = () => {
  const t = useTranslations('Continue')
  const tc = useTranslations('Common')
  const [current, setCurrent] = useState(0)
  const step = GUIDE_STEPS[current]

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-one-third">
        <ol className="govuk-list govuk-list--number">
          {GUIDE_STEPS.map((name, index) => (
            <li key={name}>
              {index === current ? (
                <strong>{t(`guide.${name}.title`)}</strong>
              ) : (
                <a
                  href={`#guide-${name}`}
                  className="govuk-link"
                  onClick={(event) => {
                    event.preventDefault()
                    setCurrent(index)
                  }}
                >
                  {t(`guide.${name}.title`)}
                </a>
              )}
            </li>
          ))}
        </ol>
      </div>
      <div className="govuk-grid-column-two-thirds" id={`guide-${step}`}>
        <span className="govuk-caption-m">
          {t('guideStepOf', { step: current + 1, total: GUIDE_STEPS.length })}
        </span>
        <h3 className="govuk-heading-m">{t(`guide.${step}.title`)}</h3>
        <p>{t.rich(`guide.${step}.text`, richTags)}</p>
        {current > 0 && (
          <button
            type="button"
            className="govuk-button btn-secondary govuk-!-margin-right-2"
            onClick={() => setCurrent(current - 1)}
          >
            {tc('back')}
          </button>
        )}
        {current < GUIDE_STEPS.length - 1 && (
          <button
            type="button"
            className="govuk-button"
            data-test="guide-next"
            onClick={() => setCurrent(current + 1)}
          >
            {t('guideNext')}
          </button>
        )}
      </div>
    </div>
  )
}

// English users get the XML directly instead of the Slovak-only Návody.Digital guide
const DownloadXml = ({ taxForm, canContinue }) => {
  const t = useTranslations('Continue')

  if (!canContinue) {
    return (
      <div className="govuk-!-margin-top-6">
        <p>{t('sessionExpired')}</p>
        <Link href="/" className="govuk-button">
          {t('startAgain')}
        </Link>
      </div>
    )
  }

  return (
    <>
      <h1 className="govuk-heading-l govuk-!-margin-top-3">{t('heading')}</h1>
      <p>{t('intro')}</p>
      <button
        type="button"
        className="govuk-button"
        data-test="download-xml"
        onClick={() => fileDownload(buildXml(taxForm), 'danove-priznanie.xml')}
      >
        {t('downloadXml')}
      </button>
      <div className="govuk-inset-text">{t('slovakVersionNote')}</div>

      <h2 className="govuk-heading-m">{t('guideHeading')}</h2>
      <p>{t('guideIntro')}</p>
      <SubmissionGuide />
      <p>
        {t.rich('guideSource', {
          link: (chunks) => (
            <ExternalLink href="https://navody.digital/zivotne-situacie/elektronicke-podanie-danoveho-priznania-2025">
              {chunks}
            </ExternalLink>
          ),
        })}
      </p>
    </>
  )
}

const ContinuePage: Page = ({ taxForm, taxFormUserInput, isDebug }) => {
  const locale = useLocale()

  if (locale === 'en') {
    return (
      <DownloadXml
        taxForm={taxForm}
        canContinue={!!taxFormUserInput.r004_priezvisko}
      />
    )
  }

  return (
    <RedirectForm
      isDebug={isDebug}
      fields={buildFields(taxForm)}
      canContinue={!!taxFormUserInput.r004_priezvisko}
      debugDownload={buildXml(taxForm)}
    />
  )
}

export default ContinuePage
