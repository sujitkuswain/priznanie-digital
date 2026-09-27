import React from 'react'
import { Form } from 'formik'
import { useTranslations } from 'next-intl'
import { FormWrapper } from '../components/FormComponents'
import { FormErrors, RentUserInput } from '../types/PageUserInputs'
import { RentForm } from '../components/RentForm'
import { Page } from '../components/Page'
import { rentUserInputInitialValues } from '../lib/initialValues'
import { BackLink } from '../components/BackLink'
import { ErrorSummary } from '../components/ErrorSummary'
import { OSLOBODENIE_PRENAJOM_A_PRILZ_CINNOSTI } from '../lib/calculation'
import { numberInputRegexp } from '../lib/utils'
import { Translate, translateKey } from '../lib/i18n'

const Rent: Page<RentUserInput> = ({
  setTaxFormUserInput,
  taxFormUserInput,
  router,
  previousRoute,
  nextRoute,
}) => {
  const t = useTranslations('Rent')
  return (
    <>
      <BackLink href={previousRoute} />
      <FormWrapper<RentUserInput>
        initialValues={taxFormUserInput}
        validate={(values) => validate(values, t)}
        onSubmit={(values, { setFieldValue }) => {
          if (values.rent === false || values.rent_step === 4) {
            const userInput = values.rent
              ? values
              : {
                  ...rentUserInputInitialValues,
                  rent: false,
                }
            setTaxFormUserInput(userInput)
            router.push(nextRoute)
          } else if (values.rent_step === 3) {
            if (values.prenajomPrijemZPrilezitostnejCinnosti === false) {
              setFieldValue(
                'vyskaOslobodenia',
                OSLOBODENIE_PRENAJOM_A_PRILZ_CINNOSTI.toString(),
              )
            } else if (values.prenajomPrijemZPrilezitostnejCinnosti === true) {
              setFieldValue('vyskaOslobodenia', '')
            }
            setFieldValue('rent_step', values.rent_step + 1)
          } else {
            setFieldValue('rent_step', values.rent_step + 1)
          }
        }}
      >
        {(props) => (
          <Form className="form" noValidate>
            <ErrorSummary errors={props.errors} />
            <RentForm
              {...props}
              step={props.values.rent_step}
              setStep={(value) => props.setFieldValue('rent_step', value)}
            />
          </Form>
        )}
      </FormWrapper>
    </>
  )
}

export const validate = (
  values: RentUserInput,
  t: Translate = translateKey,
) => {
  const errors: Partial<FormErrors<RentUserInput>> = {}

  if (typeof values.rent === 'undefined') {
    errors.rent = t('errorSelectAnswer')
  }

  if (
    values.rent_step === 1 &&
    typeof values.vyskaPrijmovZPrenajmu === 'undefined'
  ) {
    errors.vyskaPrijmovZPrenajmu = t('errorSelectAnswer')
  } else if (
    (values.rent_step === 1 &&
      !values.vyskaPrijmovZPrenajmu.match(numberInputRegexp)) ||
    Number.parseInt(values.vyskaPrijmovZPrenajmu, 10) < 0
  ) {
    errors.vyskaPrijmovZPrenajmu = t('errorNumber')
  }

  if (
    values.rent_step === 2 &&
    typeof values.vydavkyZPrenajmu === 'undefined'
  ) {
    errors.vydavkyZPrenajmu = t('errorSelectAnswer')
  } else if (
    (values.rent_step === 2 &&
      !values.vydavkyZPrenajmu.match(numberInputRegexp)) ||
    Number.parseInt(values.vydavkyZPrenajmu, 10) < 0
  ) {
    errors.vydavkyZPrenajmu = t('errorNumber')
  }

  if (
    values.rent_step === 3 &&
    typeof values.prenajomPrijemZPrilezitostnejCinnosti === 'undefined'
  ) {
    errors.prenajomPrijemZPrilezitostnejCinnosti = t('errorSelectAnswer')
  }

  if (
    values.rent_step === 4 &&
    typeof values.vyskaOslobodenia === 'undefined'
  ) {
    errors.vyskaOslobodenia = t('errorSelectAnswer')
  } else if (
    (values.rent_step === 4 &&
      !values.vyskaOslobodenia.match(numberInputRegexp)) ||
    Number.parseInt(values.vyskaOslobodenia, 10) < 0 ||
    Number.parseInt(values.vyskaOslobodenia, 10) > 500
  ) {
    errors.vyskaOslobodenia = t('errorExemptionRange')
  }

  return errors
}

export default Rent
