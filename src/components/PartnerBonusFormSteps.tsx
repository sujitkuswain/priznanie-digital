import React from 'react'
import { useTranslations } from 'next-intl'
import { BooleanRadio, Checkbox, Input } from './FormComponents'
import { formatRodneCislo } from '../lib/utils'
import { PartnerBonusFormProps } from './PartnerBonusForm'
import { Details } from './Details'
import { RODNE_CISLO_DLZKA, TAX_YEAR } from '../lib/calculation'

interface Props {
  disabled?: boolean
}

export const ApplyForBonusQuestion = ({ disabled = false }: Props) => {
  const t = useTranslations('Partner')
  return (
    <>
      <BooleanRadio
        title={t('applyQuestion')}
        name="r032_uplatnujem_na_partnera"
        disabled={disabled}
      />
      <Details title={t('whenTitle')}>
        <>
          <p>{t('whenIntro')}</p>
          <ol>
            {(t.raw('whenConditions') as string[]).map((condition) => (
              <li key={condition}>{condition}</li>
            ))}
          </ol>
        </>
      </Details>
    </>
  )
}

export const IncomeQuestion = ({ disabled }) => {
  const t = useTranslations('Partner')
  return (
    <>
      <Input
        name="r032_partner_vlastne_prijmy"
        type="number"
        label={t('incomeLabel', { year: TAX_YEAR })}
        disabled={disabled}
      />
      <Details title={t('incomeHowTitle')}>
        <>
          <p>{t('incomeIncludesIntro')}</p>
          <ul>
            {(t.raw('incomeIncludes') as string[]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>{t('incomeReduction')}</p>
          <p>{t('incomeExcludesIntro')}</p>
          <ul>
            {(t.raw('incomeExcludes') as string[]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      </Details>
    </>
  )
}

export const HouseholdQuestion = ({ disabled }) => {
  const t = useTranslations('Partner')
  return (
    <BooleanRadio
      name="partner_spolocna_domacnost"
      title={t('householdQuestion')}
      disabled={disabled}
    />
  )
}

export const ConditionsQuestion = ({ disabled }) => {
  const t = useTranslations('Partner')
  return (
    <div className="govuk-form-group">
      <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
        <h1 className="govuk-fieldset__heading">{t('conditionsQuestion')}</h1>
      </legend>
      <Checkbox
        name="partner_podmienky.1"
        label={t('condition1')}
        disabled={disabled}
      />
      <Checkbox
        name="partner_podmienky.2"
        label={t('condition2')}
        disabled={disabled}
      />
      <Checkbox
        name="partner_podmienky.3"
        label={t('condition3')}
        disabled={disabled}
      />
      <Checkbox
        name="partner_podmienky.4"
        label={t('condition4')}
        disabled={disabled}
      />
      <Checkbox
        name="partner_podmienky.5"
        label={t('condition5')}
        disabled={disabled}
      />
    </div>
  )
}

export const NotEligible = () => {
  const t = useTranslations('Partner')
  return (
    <div data-test="ineligible-message">
      <h1 className="govuk-heading-l govuk-!-margin-top-3">
        {t('notEligibleHeading')}
      </h1>
      <p>{t('notEligibleText')}</p>
    </div>
  )
}

export const EligiblePartnerForm = ({
  values,
  setFieldValue,
}: PartnerBonusFormProps) => {
  const t = useTranslations('Partner')
  return (
    <>
      <h1 className="govuk-heading-l govuk-!-margin-top-3">
        {t('detailsHeading')}
      </h1>
      <Input name="r031_priezvisko_a_meno" type="text" label={t('nameLabel')} />
      <Input
        name="r031_rodne_cislo"
        type="text"
        label={t('birthNumberLabel')}
        maxLength={13}
        onChange={async (event) => {
          const rodneCislo = formatRodneCislo(
            event.currentTarget.value,
            values.r031_rodne_cislo,
          )
          const shouldValidate = RODNE_CISLO_DLZKA <= rodneCislo.length
          setFieldValue('r031_rodne_cislo', rodneCislo, shouldValidate)
        }}
      />

      <Input
        name="r032_partner_pocet_mesiacov"
        type="number"
        min={1}
        max={12}
        label={t('monthsLabel')}
        hint={t('monthsHint')}
      />
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
