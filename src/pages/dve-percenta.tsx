import React, { useRef } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Form, FormikProps } from 'formik'
import { Checkbox, FormWrapper, Input } from '../components/FormComponents'
import { FormErrors, TwoPercentUserInput } from '../types/PageUserInputs'
import styles from './osobne-udaje.module.css'
import { getNgoByName } from '../lib/api'
import { formatCurrency } from '../lib/utils'
import {
  calculate,
  donateOnly3Percent,
  MIN_2_PERCENT_CALCULATED_DONATION,
} from '../lib/calculation'
import { ErrorSummary } from '../components/ErrorSummary'
import {
  AutoCompleteData,
  AutoCompleteInput,
} from '../components/AutoCompleteInput'

import { Page } from '../components/Page'
import { Details } from '../components/Details'
import RadioGroup from '../components/radio/RadioGroup'
import Radio from '../components/radio/Radio'
import RadioConditional from '../components/radio/RadioConditional'
import Fieldset from '../components/fieldset/Fieldset'
import { ExternalLink } from '../components/ExternalLink'
import { Translate, slovakTranslator } from '../lib/i18n'

const makeHandleOrganisationAutoform = ({
  setValues,
  values,
}: FormikProps<TwoPercentUserInput>) => {
  return (org: AutoCompleteData) => {
    setValues({
      ...values,
      r142_obchMeno: org.name || '',
      r142_ico: org.cin || '',
    })
  }
}

const supportLink = (chunks) => (
  <ExternalLink href="https://slovensko-digital.darujme.sk/podporte-nas-financne-darujme/">
    {chunks}
  </ExternalLink>
)

const TriPercenta = ({ calculatedTax }) => {
  const t = useTranslations('NgoTwoPercent')
  return (
    <>
      <Checkbox
        name="splnam3per"
        label={t('threePercentLabel', {
          amount: formatCurrency(calculatedTax.suma_3_percenta.toNumber()),
        })}
      />
      <Details title={t('threePercentTitle')}>
        <p className="govuk-hint">
          {t.rich('threePercentVolunteering', {
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>
        <p className="govuk-hint">{t('threePercentAnyOrganisation')}</p>
        <p className="govuk-hint">{t('threePercentAttachment')}</p>
      </Details>
    </>
  )
}

const Suhlas = () => {
  const t = useTranslations('NgoTwoPercent')
  return (
    <div>
      <h2 className="govuk-heading-m">{t('consentHeading')}</h2>
      <Checkbox name="XIIoddiel_suhlasZaslUdaje" label={t('consentLabel')} />
    </div>
  )
}

const DvePercenta: Page<TwoPercentUserInput> = ({
  setTaxFormUserInput,
  taxFormUserInput,
  router,
  previousRoute,
  nextRoute,
}) => {
  const t = useTranslations('NgoTwoPercent')
  const tc = useTranslations('Common')
  const submitButtonRef = useRef(null)
  const calculatedTax = calculate(taxFormUserInput)

  const uplatnenie2PercentHint = donateOnly3Percent(calculatedTax)
    ? t('onlyThreePercentHint', {
        amount: formatCurrency(calculatedTax.suma_3_percenta.toNumber()),
      })
    : t('eligibleHint', {
        amount: formatCurrency(calculatedTax.suma_2_percenta.toNumber()),
      })

  const previousPageLink = (
    <Link href={previousRoute} data-test="back" className="govuk-back-link">
      {tc('back')}
    </Link>
  )

  if (!calculatedTax.canDonateTwoPercentOfTax) {
    return (
      <>
        {previousPageLink}
        <h1 className="govuk-heading-l">{t('heading')}</h1>
        <p data-test="ineligible-message">
          {t('ineligible', {
            amount: formatCurrency(MIN_2_PERCENT_CALCULATED_DONATION),
          })}
        </p>
        <div className="box govuk-!-margin-bottom-5">
          <p>{t.rich('supportUs', { link: supportLink })}</p>
        </div>
        <Link href={nextRoute} legacyBehavior>
          <button className="govuk-button govuk-!-margin-top-4" type="button">
            {tc('continue')}
          </button>
        </Link>
      </>
    )
  }

  return (
    <>
      {previousPageLink}
      <FormWrapper<TwoPercentUserInput>
        initialValues={taxFormUserInput}
        validate={(values) => validate(values, t)}
        onSubmit={(values) => {
          setTaxFormUserInput(values)
          router.push(nextRoute)
        }}
      >
        {(props) => (
          <>
            <ErrorSummary<TwoPercentUserInput> errors={props.errors} />
            <Form className="form" noValidate>
              <Fieldset
                title={t('question')}
                error={props.errors.dve_percenta_podporujem}
                hint={uplatnenie2PercentHint}
              >
                <RadioGroup
                  value={String(props.values.dve_percenta_podporujem)}
                  onChange={(value) => {
                    if (value === 'ano-sk-digital') {
                      props.setValues({
                        ...props.values,
                        r142_ico: '50 158 635',
                        r142_obchMeno: 'Slovensko.Digital',
                        XIIoddiel_uplatnujem2percenta: true,
                        dve_percenta_podporujem: 'ano-sk-digital',
                      })
                    } else if (value === 'ano-inu') {
                      props.setValues({
                        ...props.values,
                        r142_ico: '',
                        r142_obchMeno: '',
                        XIIoddiel_uplatnujem2percenta: true,
                        dve_percenta_podporujem: 'ano-inu',
                      })
                    } else {
                      props.setValues({
                        ...props.values,
                        r142_ico: '',
                        r142_obchMeno: '',
                        XIIoddiel_uplatnujem2percenta: false,
                        dve_percenta_podporujem: 'nie',
                      })
                    }
                  }}
                >
                  <Radio
                    name="dve_percenta_podporujem-ano-sk-digital-input"
                    label={t('answerSlovenskoDigital')}
                    value="ano-sk-digital"
                  />
                  <RadioConditional forValue="ano-sk-digital">
                    <TriPercenta calculatedTax={calculatedTax} />
                    <Suhlas />
                  </RadioConditional>

                  <Radio
                    name="dve_percenta_podporujem-ano-inu-input"
                    label={t('answerOther')}
                    value="ano-inu"
                  />
                  <RadioConditional forValue="ano-inu">
                    <TriPercenta calculatedTax={calculatedTax} />
                    <Suhlas />
                    <h2 className="govuk-heading-m">{t('recipientHeading')}</h2>
                    <p>{t('recipientHint')}</p>

                    <AutoCompleteInput
                      name="r142_obchMeno"
                      label={t('recipientName')}
                      onSelect={makeHandleOrganisationAutoform(props)}
                      fetchData={async (name) => {
                        const data = await getNgoByName(name)
                        return data.map((item) => ({
                          ...item,
                          id: item.id,
                          value: `${item.name}, ${item.municipality}`,
                        }))
                      }}
                    />

                    <div className={styles.inlineFieldContainer}>
                      <Input
                        className={styles.inlineField}
                        name="r142_ico"
                        type="text"
                        label={t('recipientIco')}
                        maxLength={12}
                        onChange={async (event) => {
                          props.setFieldValue(
                            'r142_ico',
                            event.currentTarget.value,
                          )
                        }}
                      />
                    </div>

                    <div className="box govuk-!-margin-top-5">
                      <p>{t.rich('supportUsOther', { link: supportLink })}</p>
                    </div>
                  </RadioConditional>

                  <Radio
                    name="dve_percenta_podporujem-nie-input"
                    label={tc('no')}
                    value="nie"
                  />
                </RadioGroup>
              </Fieldset>
              <button
                data-test="next"
                className="govuk-button"
                type="submit"
                ref={submitButtonRef}
              >
                {tc('continue')}
              </button>
            </Form>
          </>
        )}
      </FormWrapper>
    </>
  )
}

type Errors = Partial<FormErrors<TwoPercentUserInput>>
export const validate = (
  values: TwoPercentUserInput,
  t: Translate = slovakTranslator('NgoTwoPercent'),
): Errors => {
  const errors: Errors = {}

  if (typeof values.dve_percenta_podporujem === 'undefined') {
    errors.dve_percenta_podporujem = t('errorSelectAnswer')
  }
  if (['ano-sk-digital', 'ano-inu'].includes(values.dve_percenta_podporujem)) {
    if (!values.r142_ico) {
      errors.r142_ico = t('errorIco')
    }

    if (!values.r142_obchMeno) {
      errors.r142_obchMeno = t('errorName')
    }
  }
  return errors
}

export default DvePercenta
