import React, { useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { FieldArray, Form } from 'formik'
import styles from './deti.module.css'
import {
  BooleanRadio,
  Input,
  FormWrapper,
  Select,
  optionWithValue,
} from '../components/FormComponents'
import { ChildrenUserInput } from '../types/PageUserInputs'
import { ChildInput, monthNames } from '../types/TaxFormUserInput'
import {
  childrenUserInputInitialValues,
  makeEmptyChild,
} from '../lib/initialValues'
import classnames from 'classnames'
import {
  formatCurrency,
  formatRodneCislo,
  validateRodneCislo,
  maxChildAgeBonusMonth,
  minChildAgeBonusMonth,
  numberInputRegexp,
  parseInputNumber,
} from '../lib/utils'
import { Page } from '../components/Page'
import { ErrorSummary } from '../components/ErrorSummary'
import {
  calculate,
  CHILD_RATE_FIFTEEN_AND_OLDER,
  CHILD_RATE_FIFTEEN_AND_YOUNGER,
  HIGH_INCOME_THRESHOLD,
  RODNE_CISLO_DLZKA,
  MAX_CHILD_AGE_BONUS,
  monthKeyValues,
  monthToKeyValue,
  TAX_YEAR,
} from '../lib/calculation'
import { Details } from '../components/Details'
import RadioGroup from '../components/radio/RadioGroup'
import Radio from '../components/radio/Radio'
import RadioConditional from '../components/radio/RadioConditional'
import Fieldset from '../components/fieldset/Fieldset'
import Decimal from 'decimal.js'
import { Warning } from '../components/Warning'
import { ExternalLink } from '../components/ExternalLink'
import { UserInput } from '../types/UserInput'
import { Translate, translateKey } from '../lib/i18n'

// month names stay Slovak in form data; only the displayed label is translated
const useMonthName = () => {
  const t = useTranslations('Common')
  const names = t.raw('months') as string[]
  return (month: string) => names[monthNames.indexOf(month)] ?? month
}

const translateMonthOptions = (
  options: optionWithValue[],
  monthName: (month: string) => string,
) => options.map((option) => ({ ...option, name: monthName(option.name) }))

const Deti: Page<ChildrenUserInput> = ({
  setTaxFormUserInput,
  taxForm,
  taxFormUserInput,
  router,
  previousRoute,
  nextRoute,
}) => {
  const t = useTranslations('Children')
  const tc = useTranslations('Common')
  const monthName = useMonthName()
  const previousPageLink = (
    <Link href={previousRoute} data-test="back" className="govuk-back-link">
      {tc('back')}
    </Link>
  )

  return (
    <>
      {previousPageLink}
      <FormWrapper<ChildrenUserInput>
        initialValues={taxFormUserInput}
        validate={(values) => validate(values, t, monthName)}
        onSubmit={(values) => {
          const userInput =
            values.hasChildren === 'yes'
              ? values
              : {
                  ...childrenUserInputInitialValues,
                  hasChildren: values.hasChildren,
                }
          const { danovyBonusNaDieta } = calculate({
            ...taxFormUserInput,
            ...userInput,
          })
          setTaxFormUserInput(userInput)
          if (values.hasChildren === 'yes') {
            if (
              danovyBonusNaDieta.nevyuzityDanovyBonus.equals(new Decimal(0))
            ) {
              router.push(nextRoute)
            } else {
              if (
                values.partner_bonus_na_deti === false ||
                values.partner_bonus_na_deti_chce_uplatnit === false
              ) {
                router.push(nextRoute)
              } else if (values.partner_bonus_na_deti === true) {
                const errors = validate(values, t, monthName)
                if (Object.keys(errors).length === 0) {
                  router.push(nextRoute)
                }
              }
            }
          } else {
            router.push(nextRoute)
          }
        }}
      >
        {({ values, errors, setErrors, validateForm, setFieldValue }) => (
          <Form className="form">
            <ErrorSummary<ChildrenUserInput> errors={errors} />
            <Fieldset
              title={t('question', { year: TAX_YEAR })}
              error={errors.hasChildren}
            >
              <RadioGroup
                value={values.hasChildren ?? ''}
                onChange={(value) => {
                  setFieldValue('hasChildren', value)
                }}
              >
                <Radio
                  name="hasChildren-input-yes"
                  label={tc('yes')}
                  value="yes"
                />
                <Radio
                  name="hasChildren-input-income-used"
                  label={t('answerIncomeUsed')}
                  value="income-used-by-someone-else"
                />
                <Radio
                  name="hasChildren-input-no"
                  label={tc('no')}
                  value="no"
                />
              </RadioGroup>
            </Fieldset>
            {values.hasChildren === 'yes' && (
              <>
                <h1 className="govuk-heading-l">{t('heading')}</h1>
                <p className="govuk-hint">
                  {t.rich('intro', {
                    year: TAX_YEAR,
                    link: (chunks) => (
                      <ExternalLink href="https://podpora.financnasprava.sk/392084-Vy%C5%BEivovan%C3%A9-die%C5%A5a-">
                        {chunks}
                      </ExternalLink>
                    ),
                  })}
                </p>
                <Details title={t('amountTitle')}>
                  <p className="govuk-hint">
                    <b>{t('amountHeading')}</b>
                    <ul>
                      <li>
                        {t('amountUnder15', {
                          amount: formatCurrency(
                            CHILD_RATE_FIFTEEN_AND_YOUNGER,
                          ),
                        })}
                      </li>
                      <li>
                        {t('amountOver15', {
                          amount: formatCurrency(CHILD_RATE_FIFTEEN_AND_OLDER),
                        })}
                      </li>
                    </ul>
                    {t.rich('amountReduction', {
                      threshold: formatCurrency(
                        HIGH_INCOME_THRESHOLD.toNumber(),
                      ),
                      link: (chunks) => (
                        <ExternalLink href="https://podpora.financnasprava.sk/790897-Da%C5%88ov%C3%BD-bonus-na-vy%C5%BEivovan%C3%A9-die%C5%A5a-za-rok-2025">
                          {chunks}
                        </ExternalLink>
                      ),
                    })}
                  </p>
                </Details>

                <FieldArray name="children">
                  {(arrayHelpers) => (
                    <div className={styles.childrenInputGroup}>
                      {values.children.map((child, index) => (
                        <div key={child.id}>
                          {values.children.length > 1 && (
                            <h2
                              className={classnames(
                                'govuk-heading-m',
                                'govuk-!-margin-top-3',
                                styles.childHeadline,
                              )}
                            >
                              {t('childNumber', { number: index + 1 })}
                              <button
                                className="govuk-button btn-secondary btn-warning"
                                type="button"
                                onClick={() => arrayHelpers.remove(index)}
                                data-test={`remove-child-${index}`}
                              >
                                {t('removeChild', { number: index + 1 })}
                              </button>
                            </h2>
                          )}
                          <ChildForm
                            savedValues={child}
                            index={index}
                            setFieldValue={setFieldValue}
                          />
                        </div>
                      ))}
                      <button
                        className="btn-secondary govuk-button"
                        type="button"
                        onClick={async () => {
                          const errors = await validateForm()
                          setErrors(errors)
                          const hasErrors = Object.keys(errors).length > 0
                          if (!hasErrors) {
                            arrayHelpers.push(makeEmptyChild())
                          }
                        }}
                        data-test="add-child"
                      >
                        {t('addChild')}
                      </button>
                    </div>
                  )}
                </FieldArray>

                {(taxForm.danovyBonusNaDieta.nevyuzityDanovyBonus.greaterThan(
                  new Decimal(0),
                ) ||
                  values.partner_bonus_na_deti === true) && (
                  <>
                    <BooleanRadio
                      title={t('increaseQuestion', {
                        amount: formatCurrency(
                          taxForm.danovyBonusNaDieta.nevyuzityDanovyBonus.toNumber(),
                        ),
                      })}
                      hint={t('increaseHint', {
                        bonus: formatCurrency(
                          taxForm.danovyBonusNaDieta.danovyBonus.toNumber(),
                        ),
                        amount: formatCurrency(
                          taxForm.danovyBonusNaDieta.nevyuzityDanovyBonus.toNumber(),
                        ),
                      })}
                      name="partner_bonus_na_deti_chce_uplatnit"
                    />
                    {values.partner_bonus_na_deti_chce_uplatnit && (
                      <>
                        <BooleanRadio
                          title={t('otherPersonQuestion')}
                          hint={t('otherPersonHint')}
                          name="partner_bonus_na_deti"
                        />

                        {values.partner_bonus_na_deti && (
                          <>
                            <h1 className="govuk-heading-l govuk-!-margin-top-3">
                              {t('otherPersonHeading')}
                            </h1>
                            <Input
                              name="r034_priezvisko_a_meno"
                              type="text"
                              label={t('otherPersonName')}
                            />
                            <Input
                              name="r034_rodne_cislo"
                              type="text"
                              label={t('birthNumber')}
                              maxLength={RODNE_CISLO_DLZKA}
                              onChange={async (event) => {
                                const rodneCislo = formatRodneCislo(
                                  event.currentTarget.value,
                                  values.r034_rodne_cislo,
                                )
                                const shouldValidate =
                                  rodneCislo.length >= RODNE_CISLO_DLZKA
                                setFieldValue(
                                  'r034_rodne_cislo',
                                  rodneCislo,
                                  shouldValidate,
                                )
                              }}
                            />

                            <h2 className="govuk-heading-m">
                              {t('otherPersonMonthsHeading')}
                            </h2>
                            <p className="govuk-hint">
                              {t('otherPersonMonthsHint')}
                            </p>
                            <div
                              className={classnames(
                                'govuk-form-group',
                                styles.inlineFieldContainer,
                              )}
                            >
                              <Select
                                name={`partner_bonus_na_deti_od`}
                                label={t('from')}
                                optionsWithValue={[
                                  ...translateMonthOptions(
                                    monthKeyValues(monthNames),
                                    monthName,
                                  ),
                                  { name: '', value: '' },
                                ]}
                              />
                              <Select
                                name={`partner_bonus_na_deti_do`}
                                label={t('to')}
                                optionsWithValue={[
                                  ...translateMonthOptions(
                                    monthKeyValues(monthNames),
                                    monthName,
                                  ),
                                  { name: '', value: '' },
                                ]}
                              />
                            </div>
                            <h2 className="govuk-heading-m">
                              {t('otherPersonIncomeHeading', {
                                year: TAX_YEAR,
                              })}
                            </h2>
                            <Select
                              name="partner_bonus_na_deti_typ_prijmu"
                              label={t('incomeMethodLabel')}
                              optionsWithValue={[
                                { name: '', value: '0' },
                                {
                                  name: t('incomeMethod1'),
                                  value: '1',
                                },
                                {
                                  name: t('incomeMethod2'),
                                  value: '2',
                                },
                                {
                                  name: t('incomeMethod3'),
                                  value: '3',
                                },
                                {
                                  name: t('incomeMethod4'),
                                  value: '4',
                                },
                              ]}
                            />

                            <Input
                              name="r034a"
                              type="number"
                              label={t('incomeLabel')}
                              hint={getIncomeHint(
                                values.partner_bonus_na_deti_typ_prijmu,
                                t,
                              )}
                            />

                            <AttachmentWarning
                              prijem={values.partner_bonus_na_deti_typ_prijmu}
                            />
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}
            <button className="govuk-button" type="submit">
              {tc('continue')}
            </button>
          </Form>
        )}
      </FormWrapper>
    </>
  )
}

const AttachmentWarning = ({ prijem }) => {
  const t = useTranslations('Children')
  if (prijem === '3') {
    return <Warning>{t('attachmentAnnualSettlement')}</Warning>
  }
  if (prijem === '4') {
    return <Warning>{t('attachmentTaxBase')}</Warning>
  }
  return null
}

const getIncomeHint = (value: string, t: Translate): string => {
  switch (value) {
    case '0':
      return ''
    case '1':
      return t('incomeHintTypeA')
    case '2':
      return t('incomeHintTypeB')
    case '3':
      return t('incomeHintAnnualSettlement')
    default:
      break
  }
}

interface ChildFormProps {
  index: number
  savedValues: ChildInput
  setFieldValue: (
    name: string,
    value: string | boolean,
    shouldValidate?: boolean,
  ) => void
}
const ChildForm = ({
  savedValues: { rodneCislo, wholeYear },
  index,
  setFieldValue,
}: ChildFormProps) => {
  const t = useTranslations('Children')
  const monthName = useMonthName()
  const monthNamesFrom = monthNames.filter((month) =>
    minChildAgeBonusMonth(rodneCislo, month),
  )
  const monthNamesUntil = monthNames.filter((month) =>
    maxChildAgeBonusMonth(rodneCislo, month),
  )
  const monthOptions = monthNamesUntil.filter((value) =>
    monthNamesFrom.includes(value),
  )
  const bonusInPartOfYear = monthOptions.length < 12

  useEffect(() => {
    if (
      validateRodneCislo(rodneCislo) &&
      maxChildAgeBonusMonth(rodneCislo, 'Január')
    ) {
      if (bonusInPartOfYear) {
        setFieldValue(`children[${index}].wholeYear`, false)
      } else {
        setFieldValue(`children[${index}].wholeYear`, true)
      }
      if (monthOptions.length) {
        const fromMonthValue = monthToKeyValue(monthOptions[0]).value.toString()
        const toMonthValue = monthToKeyValue(
          monthOptions[monthOptions.length - 1],
        ).value.toString()
        setFieldValue(`children[${index}].monthFrom`, fromMonthValue)
        setFieldValue(`children[${index}].monthTo`, toMonthValue)
      }
    } else {
      setFieldValue(`children[${index}].wholeYear`, true)
    }
  }, [bonusInPartOfYear, rodneCislo])

  return (
    <>
      <Input
        name={`children[${index}].priezviskoMeno` as keyof UserInput}
        type="text"
        label={t('childName')}
      />
      <Input
        name={`children[${index}].rodneCislo` as keyof UserInput}
        type="text"
        label={t('birthNumber')}
        maxLength={RODNE_CISLO_DLZKA}
        width={10}
        onChange={async (event) => {
          const rodneCisloValue = formatRodneCislo(
            event.currentTarget.value,
            rodneCislo,
          )
          const shouldValidate = rodneCisloValue.length >= RODNE_CISLO_DLZKA
          setFieldValue(
            `children[${index}].rodneCislo`,
            rodneCisloValue,
            shouldValidate,
          )
        }}
      />
      <h3 className="govuk-heading-s">{t('claimPeriodHeading')}</h3>
      <RadioGroup
        value={wholeYear ? 'wholeYear' : 'partYear'}
        onChange={(value) => {
          setFieldValue(`children[${index}].wholeYear`, value === 'wholeYear')
        }}
      >
        <Radio
          name={`children[${index}]-bonus-interval-input-wholeyear`}
          label={t('wholeYear')}
          value="wholeYear"
          disabled={!validateRodneCislo(rodneCislo) || bonusInPartOfYear}
        />
        <Radio
          name={`children[${index}]-bonus-interval-input-partyear`}
          label={t('partYear')}
          value="partYear"
          disabled={
            !validateRodneCislo(rodneCislo) || monthOptions.length === 0
          }
        />
        <RadioConditional forValue="partYear">
          <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
            <p className="govuk-hint">
              {t('partYearHint', {
                from: monthName(monthOptions[0]),
                to: monthName(monthOptions[monthOptions.length - 1]),
              })}
            </p>
          </legend>
          <div
            className={classnames(
              'govuk-form-group',
              styles.inlineFieldContainer,
            )}
          >
            <Select
              name={`children[${index}].monthFrom`}
              label={t('from')}
              optionsWithValue={translateMonthOptions(
                monthKeyValues(monthOptions),
                monthName,
              )}
              disabled={wholeYear ? 0 : false}
            />
            <Select
              name={`children[${index}].monthTo`}
              label={t('to')}
              optionsWithValue={translateMonthOptions(
                monthKeyValues(monthOptions),
                monthName,
              )}
              disabled={wholeYear ? 11 : false}
            />
          </div>
        </RadioConditional>
      </RadioGroup>
    </>
  )
}

interface ChildFormErrors {
  priezviskoMeno?: string
  rodneCislo?: string
  monthTo?: string
}
interface ChildrenFormErrors {
  hasChildren?: string
  children?: ChildFormErrors[]
  partner_bonus_na_deti_od?: string
  partner_bonus_na_deti_do?: string
  partner_bonus_na_deti_typ_prijmu?: string
  r034_priezvisko_a_meno?: string
  r034_rodne_cislo?: string
  r034a?: string
}

export const validate = (
  values: ChildrenUserInput,
  t: Translate = translateKey,
  monthName: (month: string) => string = (month) => month,
) => {
  const errors: ChildrenFormErrors = {}

  if (!values.hasChildren) {
    errors.hasChildren = t('errorSelectAnswer')
  }
  if (values.hasChildren === 'yes') {
    const childrenErrors = values.children.map((childValues, index) => {
      const childErrors: ChildFormErrors = {}

      if (childValues.priezviskoMeno.length === 0) {
        childErrors.priezviskoMeno = t('errorChildName')
      }
      if (!childValues.rodneCislo) {
        childErrors.rodneCislo = t('errorChildBirthNumber')
      } else if (!validateRodneCislo(childValues.rodneCislo)) {
        childErrors.rodneCislo = t('errorBirthNumberInvalid')
      } else if (!maxChildAgeBonusMonth(childValues.rodneCislo, 'Január')) {
        childErrors.rodneCislo = t('errorChildTooOld', {
          year: TAX_YEAR,
          age: MAX_CHILD_AGE_BONUS,
        })
      } else if (
        values.children
          .slice(0, index)
          .find((v) => v.rodneCislo === childValues.rodneCislo)
      ) {
        childErrors.rodneCislo = t('errorChildDuplicate')
      }

      if (
        !childValues.wholeYear &&
        Number.parseInt(childValues.monthFrom, 10) >
          Number.parseInt(childValues.monthTo, 10)
      ) {
        childErrors.monthTo = t('errorMonthTo', {
          month: monthName(monthNames[childValues.monthFrom]),
        })
      }

      return childErrors
    })

    if (childrenErrors.some((err) => Object.keys(err).length > 0)) {
      errors.children = childrenErrors
    }

    if (values.partner_bonus_na_deti) {
      if (
        !['1', '2', '3', '4'].includes(values.partner_bonus_na_deti_typ_prijmu)
      ) {
        errors.partner_bonus_na_deti_typ_prijmu = t('errorIncomeMethod')
      }

      if (values.partner_bonus_na_deti_od === '') {
        errors.partner_bonus_na_deti_od = t('errorFrom')
      }

      if (values.partner_bonus_na_deti_do === '') {
        errors.partner_bonus_na_deti_do = t('errorTo')
      }

      if (!values.r034_priezvisko_a_meno) {
        errors.r034_priezvisko_a_meno = t('errorOtherPersonName')
      }

      if (!values.r034_rodne_cislo) {
        errors.r034_rodne_cislo = t('errorOtherPersonBirthNumber')
      } else if (!validateRodneCislo(values.r034_rodne_cislo)) {
        errors.r034_rodne_cislo = t('errorBirthNumberInvalid')
      }

      if (!values.r034a) {
        errors.r034a = t('errorIncome')
      } else if (!values.r034a.match(numberInputRegexp)) {
        errors.r034a = t('errorIncomeFormat')
      } else if (
        new Decimal(parseInputNumber(values.r034a)).lessThanOrEqualTo(0)
      ) {
        errors.r034a = t('errorIncomePositive')
      }
    }
  }

  return errors
}

export default Deti
