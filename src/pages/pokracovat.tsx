import React from 'react'
import getConfig from 'next/config'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import fileDownload from 'js-file-download'
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
