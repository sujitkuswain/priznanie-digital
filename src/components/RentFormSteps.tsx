import React from 'react'
import { useTranslations } from 'next-intl'
import { BooleanRadio, Input } from './FormComponents'
import { Details } from './Details'
import {
  OSLOBODENIE_PRENAJOM_A_PRILZ_CINNOSTI,
  TAX_YEAR,
} from '../lib/calculation'
import { Warning } from './Warning'
import { useFormikContext } from 'formik'
import { RentUserInput } from '../types/PageUserInputs'
import { formatCurrency, parseInputNumber } from '../lib/utils'
import Decimal from 'decimal.js'
import { ExternalLink } from './ExternalLink'

interface Props {
  disabled?: boolean
}

export const ApplyForBonusQuestion = ({ disabled = false }: Props) => {
  const t = useTranslations('Rent')
  return (
    <>
      <BooleanRadio
        title={t('question', { year: TAX_YEAR })}
        name="rent"
        hint={t('questionHint')}
        disabled={disabled}
      />
    </>
  )
}

export const IncomeQuestion = ({ disabled }) => {
  const t = useTranslations('Rent')
  return (
    <>
      <Input
        name="vyskaPrijmovZPrenajmu"
        type="number"
        label={t('incomeLabel', { year: TAX_YEAR })}
        disabled={disabled}
      />
    </>
  )
}

export const OslobodenieQuestion = ({ disabled }) => {
  const t = useTranslations('Rent')
  const exemption = formatCurrency(OSLOBODENIE_PRENAJOM_A_PRILZ_CINNOSTI)
  return (
    <>
      <BooleanRadio
        name="prenajomPrijemZPrilezitostnejCinnosti"
        title={t('occasionalQuestion', { year: TAX_YEAR })}
        disabled={disabled}
      />
      <p className="govuk-hint">
        {t('exemptIntro')}
        <ul>
          <li>{t('exemptRent')}</li>
          <li>{t('exemptOccasional')}</li>
        </ul>
        {t.rich('exemptRule', {
          amount: exemption,
          link: (chunks) => (
            <ExternalLink href="https://podpora.financnasprava.sk/186937-Oslobodenie-pr%C3%ADjmov-z-pr%C3%ADle%C5%BEitostn%C3%BDch-%C4%8Dinnost%C3%AD">
              {chunks}
            </ExternalLink>
          ),
        })}
      </p>
      <Details title={t('occasionalTitle')}>
        <>
          <p>
            {t.rich('occasionalText', {
              link: (chunks) => (
                <ExternalLink href="https://podpora.financnasprava.sk/531581-Pr%C3%ADjmy-z-pr%C3%ADle%C5%BEitostn%C3%BDch-%C4%8Dinnost%C3%AD">
                  {chunks}
                </ExternalLink>
              ),
            })}
          </p>
          <ul>
            {(t.raw('occasionalExamples') as string[]).map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
        </>
      </Details>
      <Warning>{t('occasionalUnsupported', { amount: exemption })}</Warning>
    </>
  )
}

export const OslobodenieVyskaQuestion = ({ disabled }) => {
  const t = useTranslations('Rent')
  const { values } = useFormikContext<RentUserInput>()
  const {
    prenajomPrijemZPrilezitostnejCinnosti,
    vyskaPrijmovZPrenajmu,
    vyskaOslobodenia,
  } = values
  let priznanyPrijem = null
  const oslobodenie = parseInputNumber(vyskaOslobodenia)
  if (oslobodenie > 0) {
    priznanyPrijem = Decimal.max(
      new Decimal(parseInputNumber(vyskaPrijmovZPrenajmu)).minus(
        new Decimal(oslobodenie),
      ),
      0,
    )
  }
  const exemption = formatCurrency(OSLOBODENIE_PRENAJOM_A_PRILZ_CINNOSTI)
  const hint =
    prenajomPrijemZPrilezitostnejCinnosti === true
      ? t('exemptionHintWithOccasional', { amount: exemption })
      : t('exemptionHintWithoutOccasional', { amount: exemption })
  return (
    <>
      <Input
        name="vyskaOslobodenia"
        type="number"
        label={t('exemptionLabel')}
        hint={hint}
        disabled={disabled}
        min={1}
        max={500}
      />
      {priznanyPrijem && (
        <p>
          {t('declaredIncome', {
            amount: formatCurrency(priznanyPrijem.toNumber()),
          })}
        </p>
      )}
    </>
  )
}

export const VydavkyQuestion = ({ disabled }) => {
  const t = useTranslations('Rent')
  return (
    <>
      <Input
        name="vydavkyZPrenajmu"
        type="number"
        label={t('expensesLabel', { year: TAX_YEAR })}
        disabled={disabled}
        min={1}
        max={500}
      />
      <Details title={t('expensesTitle')}>
        <>
          <p>{t('expensesIntro')}</p>
          <ol>
            <li>{t('expensesEnergy')}</li>
            <li>{t('expensesFund')}</li>
            <li>{t('expensesServices')}</li>
            <ul>
              {(t.raw('expensesServiceExamples') as string[]).map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
          </ol>
        </>
      </Details>
    </>
  )
}

export const PreviousButton = ({ onClick }) => {
  const t = useTranslations('Common')
  return (
    <button
      className="govuk-button btn-secondary"
      type="button"
      onClick={onClick}
    >
      {t('back')}
    </button>
  )
}

export const SubmitButton = () => {
  const t = useTranslations('Common')
  return (
    <button className="govuk-button" type="submit">
      {t('continue')}
    </button>
  )
}
