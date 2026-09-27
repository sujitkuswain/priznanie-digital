import React, { useRef } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Form, useField } from 'formik'
import { FormWrapper, Input, Checkbox } from '../components/FormComponents'
import { DvePercentaRodicomUserInput } from '../types/PageUserInputs'
import { formatCurrency } from '../lib/utils'
import {
  calculate,
  MIN_2_PERCENT_CALCULATED_DONATION,
  TAX_YEAR,
  RODNE_CISLO_DLZKA,
} from '../lib/calculation'
import { formatRodneCislo, validateRodneCislo } from '../lib/utils'
import { ErrorSummary } from '../components/ErrorSummary'

import { Page } from '../components/Page'
import { Details } from '../components/Details'
import RadioGroup from '../components/radio/RadioGroup'
import Radio from '../components/radio/Radio'
import RadioConditional from '../components/radio/RadioConditional'
import Fieldset from '../components/fieldset/Fieldset'
import { Translate, slovakTranslator } from '../lib/i18n'

interface AdoptionCheckboxProps {
  labelSingular?: boolean
}

const AdoptionCheckbox = ({ labelSingular = false }: AdoptionCheckboxProps) => {
  const t = useTranslations('ParentsTwoPercent')
  const [field] = useField('dve_percenta_rodicom_nahradna_starostlivost')
  const isChecked = field.value === true

  return (
    <div className="govuk-!-margin-top-6">
      <Checkbox
        name="dve_percenta_rodicom_nahradna_starostlivost"
        label={labelSingular ? t('adoptedByParent') : t('adoptedByParents')}
      />
      {isChecked && (
        <p className="govuk-hint govuk-!-margin-top-2">
          {t('adoptionAttachment')}
        </p>
      )}
    </div>
  )
}

const DvePercentaRodicom: Page<DvePercentaRodicomUserInput> = ({
  setTaxFormUserInput,
  taxFormUserInput,
  router,
  previousRoute,
  nextRoute,
}) => {
  const t = useTranslations('ParentsTwoPercent')
  const tc = useTranslations('Common')
  const submitButtonRef = useRef(null)
  const calculatedTax = calculate(taxFormUserInput)

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
      <FormWrapper<DvePercentaRodicomUserInput>
        initialValues={taxFormUserInput}
        validate={(values) => validate(values, t)}
        onSubmit={(values) => {
          setTaxFormUserInput(values)
          router.push(nextRoute)
        }}
      >
        {(props) => (
          <>
            <ErrorSummary<DvePercentaRodicomUserInput> errors={props.errors} />
            <Form className="form" noValidate>
              <Fieldset
                title={t('question')}
                error={props.errors.dve_percenta_rodicom}
                hint={t('questionHint', {
                  amount: formatCurrency(
                    calculatedTax.suma_2_percenta.toNumber(),
                  ),
                })}
              >
                <RadioGroup
                  value={props.values.dve_percenta_rodicom ?? ''}
                  onChange={(value) => {
                    if (value === 'obidvom') {
                      props.setValues({
                        ...props.values,
                        dve_percenta_rodicom: 'obidvom',
                        dve_percenta_rodicA: {
                          meno: '',
                          priezvisko: '',
                          rodneCislo: '',
                        },
                        dve_percenta_rodicB: {
                          meno: '',
                          priezvisko: '',
                          rodneCislo: '',
                        },
                        dve_percenta_rodicom_nahradna_starostlivost: false,
                      })
                    } else if (value === 'jednemu') {
                      props.setValues({
                        ...props.values,
                        dve_percenta_rodicom: 'jednemu',
                        dve_percenta_rodicA: {
                          meno: '',
                          priezvisko: '',
                          rodneCislo: '',
                        },
                        dve_percenta_rodicB: undefined,
                        dve_percenta_rodicom_nahradna_starostlivost: false,
                      })
                    } else {
                      props.setValues({
                        ...props.values,
                        dve_percenta_rodicom: 'nie',
                        dve_percenta_rodicA: undefined,
                        dve_percenta_rodicB: undefined,
                        dve_percenta_rodicom_nahradna_starostlivost: false,
                      })
                    }
                  }}
                >
                  <Radio
                    name="dve_percenta_rodicom-input-obidvom"
                    label={t('answerBoth')}
                    value="obidvom"
                  />
                  <RadioConditional forValue="obidvom">
                    <p className="govuk-hint">
                      {t('eachParentGets', {
                        amount: formatCurrency(
                          calculatedTax.suma_2_percenta.toNumber(),
                        ),
                      })}
                    </p>
                    <div className="govuk-grid-row">
                      <div className="govuk-grid-column-one-half">
                        <h2 className="govuk-heading-m">
                          {t('parentHeading', { number: 1 })}
                        </h2>
                        <Input
                          name="dve_percenta_rodicA.meno"
                          type="text"
                          label={t('firstName')}
                        />
                        <Input
                          name="dve_percenta_rodicA.priezvisko"
                          type="text"
                          label={t('lastName')}
                        />
                        <Input
                          name="dve_percenta_rodicA.rodneCislo"
                          type="text"
                          label={t('birthNumber')}
                          maxLength={RODNE_CISLO_DLZKA}
                          onChange={(event) => {
                            const rodneCislo = formatRodneCislo(
                              event.currentTarget.value,
                              props.values.dve_percenta_rodicA?.rodneCislo ||
                                '',
                            )
                            props.setFieldValue(
                              'dve_percenta_rodicA.rodneCislo',
                              rodneCislo,
                              false,
                            )
                          }}
                        />
                      </div>
                      <div className="govuk-grid-column-one-half">
                        <h2 className="govuk-heading-m">
                          {t('parentHeading', { number: 2 })}
                        </h2>
                        <Input
                          name="dve_percenta_rodicB.meno"
                          type="text"
                          label={t('firstName')}
                        />
                        <Input
                          name="dve_percenta_rodicB.priezvisko"
                          type="text"
                          label={t('lastName')}
                        />
                        <Input
                          name="dve_percenta_rodicB.rodneCislo"
                          type="text"
                          label={t('birthNumber')}
                          maxLength={RODNE_CISLO_DLZKA}
                          onChange={(event) => {
                            const rodneCislo = formatRodneCislo(
                              event.currentTarget.value,
                              props.values.dve_percenta_rodicB?.rodneCislo ||
                                '',
                            )
                            props.setFieldValue(
                              'dve_percenta_rodicB.rodneCislo',
                              rodneCislo,
                              false,
                            )
                          }}
                        />
                      </div>
                    </div>
                    <AdoptionCheckbox />
                  </RadioConditional>

                  <Radio
                    name="dve_percenta_rodicom-input-jednemu"
                    label={t('answerOne')}
                    value="jednemu"
                  />
                  <RadioConditional forValue="jednemu">
                    <p className="govuk-hint">
                      {t('parentGets', {
                        amount: formatCurrency(
                          calculatedTax.suma_2_percenta.toNumber(),
                        ),
                      })}
                    </p>
                    <div>
                      <h2 className="govuk-heading-m">
                        {t('parentHeadingSingle')}
                      </h2>
                      <Input
                        name="dve_percenta_rodicA.meno"
                        type="text"
                        label={t('firstName')}
                      />
                      <Input
                        name="dve_percenta_rodicA.priezvisko"
                        type="text"
                        label={t('lastName')}
                      />
                      <Input
                        name="dve_percenta_rodicA.rodneCislo"
                        type="text"
                        label={t('birthNumber')}
                        maxLength={RODNE_CISLO_DLZKA}
                        onChange={(event) => {
                          const rodneCislo = formatRodneCislo(
                            event.currentTarget.value,
                            props.values.dve_percenta_rodicA?.rodneCislo || '',
                          )
                          props.setFieldValue(
                            'dve_percenta_rodicA.rodneCislo',
                            rodneCislo,
                            false,
                          )
                        }}
                      />
                    </div>
                    <AdoptionCheckbox labelSingular />
                  </RadioConditional>

                  <Radio
                    name="dve_percenta_rodicom-input-nie"
                    label={tc('no')}
                    value="nie"
                  />
                </RadioGroup>
              </Fieldset>
              <Details title={t('whoTitle')}>
                <p className="govuk-hint">
                  {t('whoIntro', { year: TAX_YEAR })}
                  <ul>
                    {(t.raw('whoPensions') as string[]).map((pension) => (
                      <li key={pension}>{pension}</li>
                    ))}
                  </ul>
                  {t('whoOutro')}
                </p>
              </Details>
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

type ParentErrors = {
  [K in keyof NonNullable<
    DvePercentaRodicomUserInput['dve_percenta_rodicA']
  >]?: string
}

type Errors = {
  [K in keyof DvePercentaRodicomUserInput]?: K extends
    | 'dve_percenta_rodicA'
    | 'dve_percenta_rodicB'
    ? ParentErrors
    : string
}

export const validate = (
  values: DvePercentaRodicomUserInput,
  t: Translate = slovakTranslator('ParentsTwoPercent'),
): Errors => {
  const errors: Errors = {}

  if (!values.dve_percenta_rodicom) {
    errors.dve_percenta_rodicom = t('errorSelectAnswer')
  }

  if (
    values.dve_percenta_rodicom === 'obidvom' ||
    values.dve_percenta_rodicom === 'jednemu'
  ) {
    const rodicAErrors: ParentErrors = {}

    if (!values.dve_percenta_rodicA?.meno) {
      rodicAErrors.meno = t('errorFirstName')
    }
    if (!values.dve_percenta_rodicA?.priezvisko) {
      rodicAErrors.priezvisko = t('errorLastName')
    }
    if (!values.dve_percenta_rodicA?.rodneCislo) {
      rodicAErrors.rodneCislo = t('errorBirthNumber')
    } else if (!validateRodneCislo(values.dve_percenta_rodicA.rodneCislo)) {
      rodicAErrors.rodneCislo = t('errorBirthNumberInvalid')
    }

    if (Object.keys(rodicAErrors).length > 0) {
      errors.dve_percenta_rodicA = rodicAErrors
    }
  }

  if (values.dve_percenta_rodicom === 'obidvom') {
    const rodicBErrors: ParentErrors = {}

    if (!values.dve_percenta_rodicB?.meno) {
      rodicBErrors.meno = t('errorFirstName')
    }
    if (!values.dve_percenta_rodicB?.priezvisko) {
      rodicBErrors.priezvisko = t('errorLastName')
    }
    if (!values.dve_percenta_rodicB?.rodneCislo) {
      rodicBErrors.rodneCislo = t('errorBirthNumber')
    } else if (!validateRodneCislo(values.dve_percenta_rodicB.rodneCislo)) {
      rodicBErrors.rodneCislo = t('errorBirthNumberInvalid')
    }

    if (Object.keys(rodicBErrors).length > 0) {
      errors.dve_percenta_rodicB = rodicBErrors
    }

    // Check that both parents don't have the same rodné číslo (only if both are valid)
    if (
      values.dve_percenta_rodicA?.rodneCislo &&
      values.dve_percenta_rodicB?.rodneCislo &&
      validateRodneCislo(values.dve_percenta_rodicA.rodneCislo) &&
      validateRodneCislo(values.dve_percenta_rodicB.rodneCislo) &&
      values.dve_percenta_rodicA.rodneCislo ===
        values.dve_percenta_rodicB.rodneCislo
    ) {
      if (!errors.dve_percenta_rodicB) {
        errors.dve_percenta_rodicB = {}
      }
      errors.dve_percenta_rodicB.rodneCislo = t('errorSameBirthNumber')
    }
  }

  return errors
}

export default DvePercentaRodicom
