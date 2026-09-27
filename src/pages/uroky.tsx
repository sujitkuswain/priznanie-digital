import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Form } from 'formik'
import { FormWrapper } from '../components/FormComponents'
import { FormErrors, UrokyUserInput } from '../types/PageUserInputs'
import { ErrorSummary } from '../components/ErrorSummary'
import { Page } from '../components/Page'
import { UrokyBonusForm } from '../components/UrokyBonusForm'
import { urokyInitialValues } from '../lib/initialValues'
import { validateUrokyBonusForm } from '../lib/validateUrokyBonusForm'
import { TAX_YEAR, UROKY_POCET_ROKOV } from '../lib/calculation'
import { numberInputRegexp, parseInputNumber } from '../lib/utils'
import Decimal from 'decimal.js'
import { Translate, slovakTranslator } from '../lib/i18n'

const Uroky: Page<UrokyUserInput> = ({
  taxFormUserInput,
  setTaxFormUserInput,
  router,
  previousRoute,
  nextRoute,
}) => {
  const t = useTranslations('Mortgage')
  const tc = useTranslations('Common')
  return (
    <>
      <Link href={previousRoute} data-test="back" className="govuk-back-link">
        {tc('back')}
      </Link>
      <FormWrapper<UrokyUserInput>
        initialValues={taxFormUserInput}
        validate={(values) => validate(values, t)}
        onSubmit={(values, { setFieldValue }) => {
          if (
            values.r035_uplatnuje_uroky === false ||
            validateUrokyBonusForm(values, values.hypoteka_step) === false ||
            values.hypoteka_step === 6
          ) {
            const userInput = values.r035_uplatnuje_uroky
              ? values
              : {
                  ...urokyInitialValues,
                  r035_uplatnuje_uroky: false,
                }

            if (!validateUrokyBonusForm(values, values.hypoteka_step)) {
              userInput.r035_zaplatene_uroky = ''
            }

            setTaxFormUserInput(userInput)
            router.push(nextRoute)
          } else {
            setFieldValue('hypoteka_step', values.hypoteka_step + 1)
          }
        }}
      >
        {(props) => (
          <Form className="form" noValidate>
            <ErrorSummary errors={props.errors} />
            <UrokyBonusForm
              {...props}
              step={props.values.hypoteka_step}
              setStep={(value) => props.setFieldValue('hypoteka_step', value)}
            />
          </Form>
        )}
      </FormWrapper>
    </>
  )
}

const isInteger = (value: string) => {
  return new Decimal(value).isInteger()
}

export const validate = (
  values: UrokyUserInput,
  t: Translate = slovakTranslator('Mortgage'),
) => {
  const errors: Partial<FormErrors<UrokyUserInput>> = {}
  if (typeof values.r035_uplatnuje_uroky === 'undefined') {
    errors.r035_uplatnuje_uroky = t('errorSelectAnswer')
  }

  if (
    values.hypoteka_step === 1 &&
    typeof values.uroky_dalsi_uver_uplatnuje === 'undefined'
  ) {
    errors.uroky_dalsi_uver_uplatnuje = t('errorSelectAnswer')
  } else if (values.hypoteka_step === 2 && validateUrokyBonusForm(values, 2)) {
    const zmluva_den = Number.parseInt(values.uroky_zmluva_den_uzatvorenia, 10)
    const zmluva_mesiac = Number.parseInt(
      values.uroky_zmluva_mesiac_uzatvorenia,
      10,
    )
    const zmluva_rok = Number.parseInt(values.uroky_zmluva_rok_uzatvorenia, 10)
    const datum_uzavretia_zmluvy = new Date(
      zmluva_rok,
      zmluva_mesiac - 1,
      zmluva_den,
    )

    if (
      datum_uzavretia_zmluvy.getDate() !== zmluva_den ||
      !isInteger(values.uroky_zmluva_den_uzatvorenia)
    ) {
      errors.uroky_zmluva_den_uzatvorenia = t('errorDay')
    }
    if (
      datum_uzavretia_zmluvy.getMonth() + 1 !== zmluva_mesiac ||
      !isInteger(values.uroky_zmluva_mesiac_uzatvorenia)
    ) {
      errors.uroky_zmluva_mesiac_uzatvorenia = t('errorMonth')
    }
    if (
      typeof values.uroky_zmluva_rok_uzatvorenia === 'undefined' ||
      !isInteger(values.uroky_zmluva_rok_uzatvorenia)
    ) {
      errors.uroky_zmluva_rok_uzatvorenia = t('errorYear')
    } else {
      const rok = Number.parseInt(values.uroky_zmluva_rok_uzatvorenia, 10)
      if (rok > TAX_YEAR) {
        errors.uroky_zmluva_rok_uzatvorenia = t('errorContractYearFuture')
      }
    }

    const ziaciatok_urocenia_den = Number.parseInt(
      values.uroky_zaciatok_urocenia_den,
      10,
    )
    const zaciatok_urocenia_mesiac = Number.parseInt(
      values.uroky_zaciatok_urocenia_mesiac,
      10,
    )
    const zaciatok_urocenia_rok = Number.parseInt(
      values.uroky_zaciatok_urocenia_rok,
      10,
    )
    const zaciatok_urocenia = new Date(
      zaciatok_urocenia_rok,
      zaciatok_urocenia_mesiac - 1,
      ziaciatok_urocenia_den,
    )

    if (
      zaciatok_urocenia.getDate() !== ziaciatok_urocenia_den ||
      !isInteger(values.uroky_zaciatok_urocenia_den)
    ) {
      errors.uroky_zaciatok_urocenia_den = t('errorDay')
    }
    if (
      zaciatok_urocenia.getMonth() + 1 !== zaciatok_urocenia_mesiac ||
      !isInteger(values.uroky_zaciatok_urocenia_mesiac)
    ) {
      errors.uroky_zaciatok_urocenia_mesiac = t('errorMonth')
    }
    if (
      zaciatok_urocenia.getFullYear() !== zaciatok_urocenia_rok ||
      !isInteger(values.uroky_zaciatok_urocenia_rok)
    ) {
      errors.uroky_zaciatok_urocenia_rok = t('errorYearFormat')
    }

    if (zaciatok_urocenia.getFullYear() < TAX_YEAR - UROKY_POCET_ROKOV) {
      errors.uroky_zaciatok_urocenia_rok = t('errorInterestStartTooEarly', {
        year: TAX_YEAR - UROKY_POCET_ROKOV,
      })
    }

    if (zaciatok_urocenia.getFullYear() > TAX_YEAR) {
      errors.uroky_zaciatok_urocenia_rok = t('errorInterestStartTooLate', {
        year: TAX_YEAR,
      })
    }
  } else if (values.hypoteka_step === 3 && validateUrokyBonusForm(values, 3)) {
    if (typeof values.uroky_dalsi_dlznik === 'undefined') {
      errors.uroky_dalsi_dlznik = t('errorSelectAnswer')
    } else {
      if (values.uroky_dalsi_dlznik) {
        if (typeof values.uroky_pocet_dlznikov === 'undefined') {
          errors.uroky_pocet_dlznikov = t('errorDebtorsCount')
        } else if (!values.uroky_pocet_dlznikov.match(/^\d+$/)) {
          errors.uroky_pocet_dlznikov = t('errorDebtorsCountFormat')
        } else if (Number.parseInt(values.uroky_pocet_dlznikov, 10) < 2) {
          errors.uroky_pocet_dlznikov = t('errorDebtorsCountMin')
        }
      }
    }
  } else if (values.hypoteka_step === 4 && validateUrokyBonusForm(values, 4)) {
    if (typeof values.uroky_splnam_vek_kriteria === 'undefined') {
      errors.uroky_splnam_vek_kriteria = t('errorSelectAnswer')
    }
  } else if (values.hypoteka_step === 5 && validateUrokyBonusForm(values, 5)) {
    if (typeof values.uroky_splnam_prijem === 'undefined') {
      errors.uroky_splnam_prijem = t('errorSelectAnswer')
    }
  } else if (values.hypoteka_step === 6 && validateUrokyBonusForm(values, 6)) {
    if (typeof values.r035_zaplatene_uroky === 'undefined') {
      errors.r035_zaplatene_uroky = t('errorPaidInterest')
    } else if (!values.r035_zaplatene_uroky.match(numberInputRegexp)) {
      errors.r035_zaplatene_uroky = t('errorPaidInterestFormat')
    } else if (
      !new Decimal(
        parseInputNumber(values.r035_zaplatene_uroky),
      ).lessThanOrEqualTo(new Decimal(9999.99))
    ) {
      errors.r035_zaplatene_uroky = t('errorPaidInterestMax')
    }
  }

  return errors
}

export default Uroky
