import { useTranslations } from 'next-intl'
import { BooleanRadio, Input } from './FormComponents'
import { formatCurrency } from '../lib/utils'
import { Details } from './Details'
import Fieldset from './fieldset/Fieldset'
import RadioGroup from './radio/RadioGroup'
import Radio from './radio/Radio'
import RadioConditional from './radio/RadioConditional'
import Decimal from 'decimal.js'
import { Warning } from './Warning'
import { TAX_YEAR, UROKY_POCET_ROKOV } from '../lib/calculation'

interface Props {
  disabled?: boolean
}

export const ApplyForBonusQuestion = ({ disabled = false }: Props) => {
  const t = useTranslations('Mortgage')
  return (
    <>
      <BooleanRadio
        title={t('question', {
          year: TAX_YEAR,
          since: TAX_YEAR - UROKY_POCET_ROKOV,
        })}
        name="r035_uplatnuje_uroky"
        hint={t('questionHint')}
        disabled={disabled}
      />
      <Details title={t('whenTitle')}>
        <>
          <p>{t('whenIntro')}</p>
          <ul>
            <li>{t('whenMaturity')}</li>
            <li>{t('whenSecured')}</li>
            <li>{t('whenNotRefinanced', { year: TAX_YEAR })}</li>
            <li>{t('whenNotAccelerated', { year: TAX_YEAR })}</li>
          </ul>
        </>
      </Details>
    </>
  )
}

export const ZaplateneUrokyQuestion = ({ disabled }) => {
  const t = useTranslations('Mortgage')
  return (
    <>
      <Input
        name="r035_zaplatene_uroky"
        type="number"
        label={t('paidInterestLabel', { year: TAX_YEAR })}
        disabled={disabled}
      />
      <Warning>{t('paidInterestWarning')}</Warning>
    </>
  )
}

export const ZaciatokUveruQuestion = ({ disabled, values }) => {
  const t = useTranslations('Mortgage')
  return (
    <div className="govuk-form-group">
      <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
        <h1 className="govuk-fieldset__heading">{t('datesHeading')}</h1>
      </legend>
      <p className="govuk-hint">{t('datesHint')}</p>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label className="govuk-label govuk-!-font-weight-bold">
        {t('contractDateLabel')}
      </label>
      <div className="govuk-form-group">
        <fieldset
          className="govuk-fieldset"
          role="group"
          aria-describedby="zmluva-uzatvorenie-hint"
        >
          <div id="zmluva-uzatvorenie-hint" className="govuk-hint">
            {t('contractDateHint')}
            <br />
            14 5 {TAX_YEAR - 3}
          </div>
          <div className="govuk-date-input" id="zmluva-uzatvorenie-zaciatok">
            <div className="govuk-date-input__item">
              <div className="govuk-form-group">
                <Input
                  name="uroky_zmluva_den_uzatvorenia"
                  label={t('day')}
                  type="number"
                  width={2}
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="govuk-date-input__item">
              <div className="govuk-form-group">
                <Input
                  name="uroky_zmluva_mesiac_uzatvorenia"
                  label={t('month')}
                  type="number"
                  width={2}
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="govuk-date-input__item">
              <div className="govuk-form-group">
                <Input
                  name="uroky_zmluva_rok_uzatvorenia"
                  type="number"
                  label={t('year')}
                  width={4}
                  disabled={disabled}
                />
              </div>
            </div>
          </div>
        </fieldset>
      </div>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label className="govuk-label govuk-!-font-weight-bold">
        {t('interestStartLabel')}
      </label>
      <div className="govuk-form-group">
        <fieldset
          className="govuk-fieldset"
          role="group"
          aria-describedby="zaciatok-urocenia-hint"
        >
          <div id="zaciatok-urocenia-hint" className="govuk-hint">
            {t('interestStartHint')}
            <br />
            27 8 {TAX_YEAR - 3}
          </div>
          <div className="govuk-date-input" id="zaciatok-prijmov">
            <div className="govuk-date-input__item">
              <div className="govuk-form-group">
                <Input
                  name="uroky_zaciatok_urocenia_den"
                  label={t('day')}
                  type="number"
                  width={2}
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="govuk-date-input__item">
              <div className="govuk-form-group">
                <Input
                  name="uroky_zaciatok_urocenia_mesiac"
                  label={t('month')}
                  type="number"
                  width={2}
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="govuk-date-input__item">
              <div className="govuk-form-group">
                <Input
                  name="uroky_zaciatok_urocenia_rok"
                  type="number"
                  label={t('year')}
                  width={4}
                  disabled={disabled}
                />
              </div>
            </div>
          </div>
        </fieldset>
      </div>
      {parseInt(values.uroky_zmluva_rok_uzatvorenia, 10) >= 2024 && (
        <Warning>{t('ownHousingWarning')}</Warning>
      )}
    </div>
  )
}

export const DalsiDlzniciQuestion = ({
  values,
  errors,
  setFieldValue,
  disabled,
}) => {
  const t = useTranslations('Mortgage')
  const tc = useTranslations('Common')
  return (
    <Fieldset
      title={t('coDebtorsQuestion')}
      hint={t('coDebtorsHint')}
      error={errors.uroky_dalsi_dlznik}
    >
      <RadioGroup
        value={String(values.uroky_dalsi_dlznik)}
        onChange={(value) => {
          setFieldValue('uroky_dalsi_dlznik', value === 'true')
        }}
      >
        <Radio
          name="uroky_dalsi_dlznik-input-yes"
          label={tc('yes')}
          value="true"
          disabled={disabled}
        />
        <RadioConditional forValue="true">
          <Input
            name="uroky_pocet_dlznikov"
            type="number"
            label={t('debtorsCountLabel')}
            hint={t('debtorsCountHint')}
            width={4}
            disabled={disabled}
          />
        </RadioConditional>

        <Radio
          name="uroky_dalsi_dlznik-input-no"
          label={tc('no')}
          value="false"
          disabled={disabled}
        />
      </RadioGroup>
    </Fieldset>
  )
}

export const DalsiUverQuestion = ({ disabled }) => {
  const t = useTranslations('Mortgage')
  return (
    <BooleanRadio
      name="uroky_dalsi_uver_uplatnuje"
      title={t('otherLoanQuestion')}
      disabled={disabled}
    />
  )
}

export const VekQuestion = ({ disabled, values: { uroky_dalsi_dlznik } }) => {
  const t = useTranslations('Mortgage')
  return (
    <BooleanRadio
      name="uroky_splnam_vek_kriteria"
      title={
        uroky_dalsi_dlznik ? t('ageQuestionWithCoDebtors') : t('ageQuestion')
      }
      disabled={disabled}
    />
  )
}

const maxPrijem = ({
  uroky_zmluva_rok_uzatvorenia: rok,
  uroky_pocet_dlznikov,
  uroky_dalsi_dlznik,
}): Decimal => {
  const pocet_dlznikov = uroky_dalsi_dlznik
    ? new Decimal(parseInt(uroky_pocet_dlznikov))
    : new Decimal(1)
  switch (rok) {
    case '2019':
      return new Decimal(1316.9).mul(pocet_dlznikov)
    case '2020':
      return new Decimal(1419.6).mul(pocet_dlznikov)
    case '2021':
      return new Decimal(1472.9).mul(pocet_dlznikov)
    case '2022':
      return new Decimal(1574.3).mul(pocet_dlznikov)
    case '2023':
      return new Decimal(1695.2).mul(pocet_dlznikov)
    case '2024':
      return new Decimal(2288).mul(pocet_dlznikov)
    case '2025':
      return new Decimal(2438.4).mul(pocet_dlznikov)
    default:
      return new Decimal(0)
  }
}

export const PrijemQuestion = ({
  disabled,
  values: {
    uroky_dalsi_dlznik,
    uroky_zmluva_rok_uzatvorenia,
    uroky_pocet_dlznikov,
  },
}) => {
  const t = useTranslations('Mortgage')
  const prijem = formatCurrency(
    maxPrijem({
      uroky_zmluva_rok_uzatvorenia,
      uroky_pocet_dlznikov,
      uroky_dalsi_dlznik,
    }).toNumber(),
  )
  const params = {
    year: parseInt(uroky_zmluva_rok_uzatvorenia) - 1,
    amount: prijem,
  }

  return (
    <BooleanRadio
      name="uroky_splnam_prijem"
      title={
        uroky_dalsi_dlznik
          ? t('incomeQuestionWithCoDebtors', params)
          : t('incomeQuestion', params)
      }
      disabled={disabled}
    />
  )
}

export const NotEligible = () => {
  const t = useTranslations('Mortgage')
  return (
    <div data-test="ineligible-message">
      <h1 className="govuk-heading-l govuk-!-margin-top-3">
        {t('notEligibleHeading')}
      </h1>
      <p>{t('notEligibleText')}</p>
    </div>
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
