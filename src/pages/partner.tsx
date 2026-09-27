import React from 'react'
import { Form } from 'formik'
import { useTranslations } from 'next-intl'
import { FormWrapper } from '../components/FormComponents'
import { FormErrors, PartnerUserInput } from '../types/PageUserInputs'
import { numberInputRegexp, validateRodneCislo } from '../lib/utils'
import { PartnerBonusForm } from '../components/PartnerBonusForm'
import { validatePartnerBonusForm } from '../lib/validatePartnerBonusForm'
import { Page } from '../components/Page'
import { partnerUserInitialValues } from '../lib/initialValues'
import { BackLink } from '../components/BackLink'
import { ErrorSummary } from '../components/ErrorSummary'
import { Translate, translateKey } from '../lib/i18n'

const Partner: Page<PartnerUserInput> = ({
  setTaxFormUserInput,
  taxFormUserInput,
  router,
  previousRoute,
  nextRoute,
}) => {
  const t = useTranslations('Partner')
  return (
    <>
      <BackLink href={previousRoute} />
      <FormWrapper<PartnerUserInput>
        initialValues={taxFormUserInput}
        validate={(values) => validate(values, t)}
        onSubmit={(values, { setFieldValue }) => {
          if (
            values.r032_uplatnujem_na_partnera === false ||
            validatePartnerBonusForm(values, values.partner_step) === false ||
            values.partner_step === 4
          ) {
            const userInput = values.r032_uplatnujem_na_partnera
              ? values
              : {
                  ...partnerUserInitialValues,
                  r032_uplatnujem_na_partnera: false,
                }

            if (!validatePartnerBonusForm(values, values.partner_step)) {
              userInput.r032_partner_vlastne_prijmy = ''
              userInput.r031_priezvisko_a_meno = ''
              userInput.r031_rodne_cislo = ''
              userInput.r032_partner_pocet_mesiacov = ''
              userInput.r032_partner_pocet_mesiacov = ''
            }

            setTaxFormUserInput(userInput)
            router.push(nextRoute)
          } else {
            setFieldValue('partner_step', values.partner_step + 1)
          }
        }}
      >
        {(props) => (
          <Form className="form" noValidate>
            <ErrorSummary errors={props.errors} />
            <PartnerBonusForm
              {...props}
              step={props.values.partner_step}
              setStep={(value) => props.setFieldValue('partner_step', value)}
            />
          </Form>
        )}
      </FormWrapper>
    </>
  )
}

export const validate = (
  values: PartnerUserInput,
  t: Translate = translateKey,
) => {
  const errors: Partial<FormErrors<PartnerUserInput>> = {}

  if (typeof values.r032_uplatnujem_na_partnera === 'undefined') {
    errors.r032_uplatnujem_na_partnera = t('errorSelectAnswer')
  }

  if (
    values.partner_step === 1 &&
    typeof values.partner_spolocna_domacnost === 'undefined'
  ) {
    errors.partner_spolocna_domacnost = t('errorSelectAnswer')
  }

  if (values.partner_step === 3 && validatePartnerBonusForm(values, 3)) {
    if (!values.r032_partner_vlastne_prijmy) {
      errors.r032_partner_vlastne_prijmy = t('errorIncome')
    } else if (!values.r032_partner_vlastne_prijmy.match(numberInputRegexp)) {
      errors.r032_partner_vlastne_prijmy = t('errorIncomeFormat')
    }
  } else if (values.partner_step === 4 && validatePartnerBonusForm(values, 4)) {
    if (!values.r031_priezvisko_a_meno) {
      errors.r031_priezvisko_a_meno = t('errorName')
    }
    if (!values.r031_rodne_cislo) {
      errors.r031_rodne_cislo = t('errorBirthNumber')
    } else if (!validateRodneCislo(values.r031_rodne_cislo)) {
      errors.r031_rodne_cislo = t('errorBirthNumberInvalid')
    }

    if (!values.r032_partner_pocet_mesiacov) {
      errors.r032_partner_pocet_mesiacov = t('errorMonths')
    } else if (
      !values.r032_partner_pocet_mesiacov.match(/^\d+$/) ||
      Number.parseInt(values.r032_partner_pocet_mesiacov, 10) < 0 ||
      Number.parseInt(values.r032_partner_pocet_mesiacov, 10) > 12
    ) {
      errors.r032_partner_pocet_mesiacov = t('errorMonthsRange')
    }
  }

  return errors
}

export default Partner
