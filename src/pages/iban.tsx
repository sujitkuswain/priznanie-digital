import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { FormErrors, TaxBonusUserInput } from '../types/PageUserInputs'
import { Form, FormikProps } from 'formik'
import { ErrorSummary } from '../components/ErrorSummary'
import { BooleanRadio, FormWrapper, Input } from '../components/FormComponents'
import {
  formatCurrency,
  formatIban,
  validateIbanCountry,
  validateIbanFormat,
} from '../lib/utils'
import { Page } from '../components/Page'
import { taxBonusInitialInput } from '../lib/initialValues'
import { TaxForm } from '../types/TaxForm'
import { BackLink } from '../components/BackLink'
import { Translate, slovakTranslator } from '../lib/i18n'

const Iban: Page<TaxBonusUserInput> = ({
  taxForm,
  taxFormUserInput,
  setTaxFormUserInput,
  router,
  previousRoute,
  nextRoute,
}) => {
  const t = useTranslations('Iban')
  const tc = useTranslations('Common')
  const danovyBonus = taxForm.r121
  const danovyBonusUroky = taxForm.r127
  const danovyPreplatok = taxForm.r136_danovy_preplatok
  const spolu = danovyBonus.plus(danovyBonusUroky).plus(danovyPreplatok)

  const Preplatky = (
    <ul className="govuk-list govuk-list--bullet">
      {taxForm.mozeZiadatVyplatitDanovyBonus && (
        <li>
          <strong>{t('taxBonus')}: </strong>
          {formatCurrency(danovyBonus.toNumber())}
        </li>
      )}
      {taxForm.mozeZiadatVratitDanovyBonusUroky && (
        <li>
          <strong>{t('mortgageBonus')}: </strong>
          {formatCurrency(danovyBonusUroky.toNumber())}
        </li>
      )}
      {taxForm.mozeZiadatVratitDanovyPreplatok && (
        <li>
          <strong>{t('overpayment')}: </strong>
          {formatCurrency(danovyPreplatok.toNumber())}
        </li>
      )}
    </ul>
  )

  if (!taxForm.mozeZiadatVratitPreplatkyBonusyUroky) {
    return (
      <>
        <p data-test="ineligible-message">{t('notEligible')}</p>
        <Link href={nextRoute} legacyBehavior>
          <button
            data-test="next"
            className="govuk-button govuk-!-margin-top-3"
            type="button"
          >
            {tc('continue')}
          </button>
        </Link>
      </>
    )
  }

  return (
    <FormWrapper<TaxBonusUserInput>
      initialValues={taxFormUserInput}
      validate={makeValidate(taxForm, t)}
      onSubmit={(values) => {
        const userInput = values.ziadamVyplatitDanovyBonusUrokPreplatok
          ? values
          : {
              ...taxBonusInitialInput,
              ziadamVyplatitDanovyBonusziadamVyplatitDanovyBonus: false,
            }
        setTaxFormUserInput(userInput)
        router.push(nextRoute)
      }}
    >
      {({ values, errors, setFieldValue }: FormikProps<TaxBonusUserInput>) => (
        <>
          <BackLink href={previousRoute} />
          <Form className="form" noValidate>
            <ErrorSummary<TaxBonusUserInput> errors={errors} />

            {taxForm.mozeZiadatVratitPreplatkyBonusyUroky && (
              <BooleanRadio
                name="ziadamVyplatitDanovyBonusUrokPreplatok"
                title={t('question', {
                  amount: formatCurrency(spolu.toNumber()),
                })}
                hint={Preplatky}
              />
            )}

            {values.ziadamVyplatitDanovyBonusUrokPreplatok && (
              <Input
                name="iban"
                type="text"
                label="IBAN"
                hint={t('ibanHint')}
                maxLength={29}
                onChange={(event) => {
                  const iban = formatIban(
                    event.currentTarget.value,
                    values.iban,
                  )
                  setFieldValue('iban', iban)
                }}
              />
            )}

            <button data-test="next" className="govuk-button" type="submit">
              {tc('continue')}
            </button>
          </Form>
        </>
      )}
    </FormWrapper>
  )
}

export default Iban

export const makeValidate =
  (taxForm: TaxForm, t: Translate = slovakTranslator('Iban')) =>
  (values: TaxBonusUserInput) => {
    const errors: Partial<FormErrors<TaxBonusUserInput>> = {}

    if (
      taxForm.mozeZiadatVratitPreplatkyBonusyUroky &&
      typeof values.ziadamVyplatitDanovyBonusUrokPreplatok === 'undefined'
    ) {
      errors.ziadamVyplatitDanovyBonusUrokPreplatok = t('errorSelectAnswer')
    }

    if (values.ziadamVyplatitDanovyBonusUrokPreplatok) {
      if (!values.iban || values.iban === '') {
        // Medzinárodné bankové číslo účtu (angl. International Bank Account Number, skr. IBAN)
        errors.iban = t('errorIban')
      } else if (!validateIbanFormat(values.iban)) {
        errors.iban = t('errorIbanFormat')
      } else if (!validateIbanCountry(values.iban)) {
        errors.iban = t('errorIbanCountry')
      }
    }

    return errors
  }
