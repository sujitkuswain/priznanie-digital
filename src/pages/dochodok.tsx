import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Form } from 'formik'
import { FormWrapper, Input } from '../components/FormComponents'
import { FormErrors, PensionUserInput } from '../types/PageUserInputs'
import { numberInputRegexp, parseInputNumber } from '../lib/utils'
import { Page } from '../components/Page'
import { pensionInitialValues } from '../lib/initialValues'
import { ErrorSummary } from '../components/ErrorSummary'
import { TAX_YEAR } from '../lib/calculation'
import { Details } from '../components/Details'
import Fieldset from '../components/fieldset/Fieldset'
import RadioGroup from '../components/radio/RadioGroup'
import Radio from '../components/radio/Radio'
import RadioConditional from '../components/radio/RadioConditional'
import { Translate, translateKey } from '../lib/i18n'

const Dochodok: Page<PensionUserInput> = ({
  setTaxFormUserInput,
  taxFormUserInput,
  router,
  previousRoute,
  nextRoute,
}) => {
  const t = useTranslations('Pension')
  const tc = useTranslations('Common')
  return (
    <>
      <Link href={previousRoute} data-test="back" className="govuk-back-link">
        {tc('back')}
      </Link>
      <FormWrapper<PensionUserInput>
        initialValues={taxFormUserInput}
        validate={(values) => validate(values, t)}
        onSubmit={(values) => {
          const userInput = values.platil_prispevky_na_dochodok
            ? values
            : {
                ...pensionInitialValues,
                platil_prispevky_na_dochodok: false,
              }
          setTaxFormUserInput(userInput)
          router.push(nextRoute)
        }}
      >
        {({ values, errors, setFieldValue }) => (
          <Form className="form" noValidate>
            <ErrorSummary<PensionUserInput> errors={errors} />
            <Fieldset
              title={t('question', { year: TAX_YEAR })}
              error={errors.platil_prispevky_na_dochodok}
            >
              <RadioGroup
                value={String(values.platil_prispevky_na_dochodok)}
                onChange={(value) => {
                  setFieldValue(
                    'platil_prispevky_na_dochodok',
                    value === 'true',
                  )
                }}
              >
                <Radio
                  name="platil_prispevky_na_dochodok-input-yes"
                  label={tc('yes')}
                  value="true"
                />
                <RadioConditional forValue="true">
                  <Input
                    name="zaplatene_prispevky_na_dochodok"
                    type="number"
                    label={t('amountLabel', { year: TAX_YEAR })}
                    hint={t('amountHint')}
                  />
                </RadioConditional>

                <Radio
                  name="platil_prispevky_na_dochodok-input-no"
                  label={tc('no')}
                  value="false"
                />
              </RadioGroup>
            </Fieldset>
            <Details title={t('conditionsTitle')}>
              <ul>
                <li>
                  {t.rich('condition1', {
                    strong: (chunks) => <strong>{chunks}</strong>,
                  })}
                </li>
                <li>{t('condition2')}</li>
              </ul>
            </Details>
            <button data-test="next" className="govuk-button" type="submit">
              {tc('continue')}
            </button>
          </Form>
        )}
      </FormWrapper>
    </>
  )
}

export const validate = (
  values: PensionUserInput,
  t: Translate = translateKey,
) => {
  const errors: Partial<FormErrors<PensionUserInput>> = {}

  if (typeof values.platil_prispevky_na_dochodok === 'undefined') {
    errors.platil_prispevky_na_dochodok = t('errorSelectAnswer')
  }

  if (values.platil_prispevky_na_dochodok) {
    if (!values.zaplatene_prispevky_na_dochodok) {
      errors.zaplatene_prispevky_na_dochodok = t('errorAmount')
    } else if (
      !values.zaplatene_prispevky_na_dochodok.match(numberInputRegexp)
    ) {
      errors.zaplatene_prispevky_na_dochodok = t('errorAmountFormat')
    } else if (parseInputNumber(values.zaplatene_prispevky_na_dochodok) > 180) {
      errors.zaplatene_prispevky_na_dochodok = t('errorAmountMax')
    }
  }

  return errors
}

export default Dochodok
