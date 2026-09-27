import React from 'react'
import { useTranslations } from 'next-intl'
import { Form, FormikProps } from 'formik'
import { BooleanRadio, FormWrapper, Input } from '../components/FormComponents'
import { FormErrors, IncomeAndExpenseUserInput } from '../types/PageUserInputs'
import { numberInputRegexp } from '../lib/utils'
import { ErrorSummary } from '../components/ErrorSummary'
import { Page } from '../components/Page'
import { BackLink } from '../components/BackLink'
import { TAX_YEAR } from '../lib/calculation'
import { incomeAndExpenseInitialValues } from '../lib/initialValues'
import { Details } from '../components/Details'
import { Translate, slovakTranslator } from '../lib/i18n'

const PrijmyAVydavky: Page<IncomeAndExpenseUserInput> = ({
  taxFormUserInput,
  setTaxFormUserInput,
  router,
  nextRoute,
  previousRoute,
}) => {
  const t = useTranslations('IncomeAndExpenses')
  const tc = useTranslations('Common')
  return (
    <>
      <BackLink href={previousRoute} />
      <FormWrapper<IncomeAndExpenseUserInput>
        initialValues={taxFormUserInput}
        validate={(values) => validate(values, t)}
        onSubmit={(values) => {
          const userInput = values.prijem_zo_zivnosti
            ? values
            : {
                ...incomeAndExpenseInitialValues,
                prijem_zo_zivnosti: false,
              }
          setTaxFormUserInput(userInput)
          router.push(nextRoute)
        }}
      >
        {({ values, errors }: FormikProps<IncomeAndExpenseUserInput>) => {
          return (
            <>
              <Form className="form" noValidate>
                <ErrorSummary<IncomeAndExpenseUserInput> errors={errors} />
                <BooleanRadio
                  title={t('question', { year: TAX_YEAR })}
                  name="prijem_zo_zivnosti"
                />
                <Details title={t('supportedTitle')}>
                  <p className="govuk-hint">
                    {t.rich('supported', { b: (chunks) => <b>{chunks}</b> })}
                  </p>
                  <p className="govuk-hint">
                    {t.rich('notSupported', { b: (chunks) => <b>{chunks}</b> })}
                  </p>
                </Details>
                {values.prijem_zo_zivnosti && (
                  <>
                    <h2 className="govuk-heading-l">{t('sectionHeading')}</h2>

                    <Input
                      name="t1r10_prijmy"
                      type="number"
                      label={t('incomeLabel')}
                      hint={t('incomeHint', { year: TAX_YEAR })}
                    />
                    <Input
                      name="priloha3_r11_socialne"
                      type="number"
                      label={t('socialLabel')}
                      hint={t('socialHint', { year: TAX_YEAR })}
                    />
                    <Input
                      name="priloha3_r13_zdravotne"
                      hint={t('healthHint', { year: TAX_YEAR })}
                      type="number"
                      label={t('healthLabel')}
                    />
                    <Input
                      name="zaplatenePreddavky"
                      hint={t('advancesHint', { year: TAX_YEAR })}
                      type="number"
                      label={t('advancesLabel')}
                    />
                  </>
                )}

                <button data-test="next" className="govuk-button" type="submit">
                  {tc('continue')}
                </button>
              </Form>
            </>
          )
        }}
      </FormWrapper>
    </>
  )
}

export const validate = (
  values: IncomeAndExpenseUserInput,
  t: Translate = slovakTranslator('IncomeAndExpenses'),
) => {
  const errors: Partial<FormErrors<IncomeAndExpenseUserInput>> = {}

  if (typeof values.prijem_zo_zivnosti === 'undefined') {
    errors.prijem_zo_zivnosti = t('errorSelectAnswer')
  }

  if (values.prijem_zo_zivnosti) {
    if (!values.t1r10_prijmy) {
      errors.t1r10_prijmy = t('errorIncome')
    }
    if (values.t1r10_prijmy && !values.t1r10_prijmy.match(numberInputRegexp)) {
      errors.t1r10_prijmy = t('errorIncomeFormat')
    }

    if (!values.priloha3_r11_socialne) {
      errors.priloha3_r11_socialne = t('errorSocial')
    }
    if (
      values.priloha3_r11_socialne &&
      !values.priloha3_r11_socialne.match(numberInputRegexp)
    ) {
      errors.priloha3_r11_socialne = t('errorSocialFormat')
    }

    if (!values.priloha3_r13_zdravotne) {
      errors.priloha3_r13_zdravotne = t('errorHealth')
    }
    if (
      values.priloha3_r13_zdravotne &&
      !values.priloha3_r13_zdravotne.match(numberInputRegexp)
    ) {
      errors.priloha3_r13_zdravotne = t('errorHealthFormat')
    }

    if (!values.zaplatenePreddavky) {
      errors.zaplatenePreddavky = t('errorAdvances')
    }
    if (
      values.zaplatenePreddavky &&
      !values.zaplatenePreddavky.match(numberInputRegexp)
    ) {
      errors.zaplatenePreddavky = t('errorAdvancesFormat')
    }
  }

  return errors
}

export default PrijmyAVydavky
