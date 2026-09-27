import React from 'react'
import { Form } from 'formik'
import { useTranslations } from 'next-intl'
import { BooleanRadio, FormWrapper, Input } from '../components/FormComponents'
import { DohodaUserInput, FormErrors } from '../types/PageUserInputs'
import { numberInputRegexp } from '../lib/utils'
import { ErrorSummary } from '../components/ErrorSummary'
import { Page } from '../components/Page'
import { dohodaUserInputInitialValues } from '../lib/initialValues'
import { BackLink } from '../components/BackLink'
import { TAX_YEAR } from '../lib/calculation'
import { Translate, slovakTranslator } from '../lib/i18n'

const Dohoda: Page<DohodaUserInput> = ({
  setTaxFormUserInput,
  taxFormUserInput,
  router,
  previousRoute,
  nextRoute,
}) => {
  // root translator: this page reuses the Employment labels and errors
  const t = useTranslations()
  return (
    <>
      <BackLink href={previousRoute} />
      <FormWrapper<DohodaUserInput>
        initialValues={taxFormUserInput}
        validate={(values) => validate(values, t)}
        onSubmit={(values) => {
          const userInput = values.dohoda
            ? values
            : {
                ...dohodaUserInputInitialValues,
                dohoda: false,
              }
          setTaxFormUserInput(userInput)
          router.push(nextRoute)
        }}
      >
        {({ values, errors }) => (
          <Form className="form" noValidate>
            <ErrorSummary<DohodaUserInput> errors={errors} />
            <BooleanRadio
              title={t('Agreements.question', { year: TAX_YEAR })}
              name="dohoda"
            />
            {values.dohoda && (
              <>
                <h3 className="govuk-heading-m">
                  {t('Agreements.documentIntro')}
                </h3>
                <Input
                  name="uhrnPrijmovZoVsetkychDohod"
                  type="number"
                  label={t('Agreements.incomeLabel')}
                  hint={t('Agreements.incomeHint')}
                />
                <Input
                  name="uhrnPovinnehoPoistnehoNaSocialnePoistenieDohody"
                  type="number"
                  label={t('Employment.socialLabel')}
                  hint={t('Employment.rowHint', { row: '02a' })}
                />
                <Input
                  name="uhrnPovinnehoPoistnehoNaZdravotnePoistenieDohody"
                  type="number"
                  label={t('Employment.healthLabel')}
                  hint={t('Employment.rowHint', { row: '02b' })}
                />
                <Input
                  name="uhrnPreddavkovNaDanDohody"
                  type="number"
                  label={t('Employment.advancesLabel')}
                  hint={t('Employment.rowHint', { row: '04' })}
                />
                <Input
                  name="udajeODanovomBonuseNaDietaDohody"
                  type="number"
                  label={t('Employment.childBonusLabel')}
                  hint={t('Employment.childBonusHint')}
                />
              </>
            )}
            <button data-test="next" className="govuk-button" type="submit">
              {t('Common.continue')}
            </button>
          </Form>
        )}
      </FormWrapper>
    </>
  )
}

export const validate = (
  values: DohodaUserInput,
  t: Translate = slovakTranslator(),
) => {
  const errors: Partial<FormErrors<DohodaUserInput>> = {}

  if (typeof values.dohoda === 'undefined') {
    errors.dohoda = t('Employment.errorSelectAnswer')
  }

  if (values.dohoda) {
    if (!values.uhrnPrijmovZoVsetkychDohod) {
      errors.uhrnPrijmovZoVsetkychDohod = t('Agreements.errorIncome')
    } else if (!values.uhrnPrijmovZoVsetkychDohod.match(numberInputRegexp)) {
      errors.uhrnPrijmovZoVsetkychDohod = t('Employment.errorIncomeFormat')
    }

    if (!values.uhrnPovinnehoPoistnehoNaSocialnePoistenieDohody) {
      errors.uhrnPovinnehoPoistnehoNaSocialnePoistenieDohody = t(
        'Employment.errorSocial',
      )
    } else if (
      !values.uhrnPovinnehoPoistnehoNaSocialnePoistenieDohody.match(
        numberInputRegexp,
      )
    ) {
      errors.uhrnPovinnehoPoistnehoNaSocialnePoistenieDohody = t(
        'Employment.errorSocialFormat',
      )
    }

    if (!values.uhrnPovinnehoPoistnehoNaZdravotnePoistenieDohody) {
      errors.uhrnPovinnehoPoistnehoNaZdravotnePoistenieDohody = t(
        'Employment.errorHealth',
      )
    } else if (
      !values.uhrnPovinnehoPoistnehoNaZdravotnePoistenieDohody.match(
        numberInputRegexp,
      )
    ) {
      errors.uhrnPovinnehoPoistnehoNaZdravotnePoistenieDohody = t(
        'Employment.errorHealthFormat',
      )
    }

    if (!values.uhrnPreddavkovNaDanDohody) {
      errors.uhrnPreddavkovNaDanDohody = t('Employment.errorAdvances')
    } else if (!values.uhrnPreddavkovNaDanDohody.match(numberInputRegexp)) {
      errors.uhrnPreddavkovNaDanDohody = t('Employment.errorAdvancesFormat')
    }

    if (!values.udajeODanovomBonuseNaDietaDohody) {
      errors.udajeODanovomBonuseNaDietaDohody = t('Employment.errorChildBonus')
    } else if (
      !values.udajeODanovomBonuseNaDietaDohody.match(numberInputRegexp)
    ) {
      errors.udajeODanovomBonuseNaDietaDohody = t(
        'Employment.errorChildBonusFormat',
      )
    }
  }

  return errors
}

export default Dohoda
