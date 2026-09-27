import React from 'react'
import { useTranslations } from 'next-intl'
import { formatCurrency } from '../lib/utils'
import { TaxFormUserInput } from '../types/TaxFormUserInput'
import { Page } from '../components/Page'
import { Warning } from '../components/Warning'
import Decimal from 'decimal.js'
import { BackLink } from '../components/BackLink'
import Link from 'next/link'
import { buildSummary, TAX_YEAR } from '../lib/calculation'
import { ExternalLink } from '../components/ExternalLink'

interface SummaryRow {
  key: string
  title: string
  description?: string
  value: Decimal
  fontSize?: number
  showEvenWhenZero?: boolean
}

interface SummaryProps {
  rows: SummaryRow[]
  title?: string
  compactView?: boolean // Do not show rows with zero value
}

const Summary = ({ rows, title, compactView = false }: SummaryProps) => (
  <div id="summary">
    <table className="govuk-table">
      {title && (
        <caption className="govuk-table__caption govuk-table__caption--l">
          {title}
        </caption>
      )}
      <tbody className="govuk-table__body">
        {rows.map(
          ({
            key,
            title,
            description,
            value,
            fontSize,
            showEvenWhenZero = false,
          }) => {
            if (compactView && value.equals(0) && !showEvenWhenZero) return null

            return (
              <tr
                className="govuk-table__row"
                style={fontSize ? { fontSize } : undefined}
                key={key}
              >
                <td className="govuk-table__cell">
                  {title}
                  {description && (
                    <div className="govuk-!-margin-top-1">
                      <small>{description}</small>
                    </div>
                  )}
                </td>
                <td
                  className="govuk-table__cell govuk-table__cell--numeric"
                  data-test={key}
                >
                  <strong>{formatCurrency(value.toNumber())}</strong>
                </td>
              </tr>
            )
          },
        )}
      </tbody>
    </table>
  </div>
)

const Vysledky: Page<Partial<TaxFormUserInput>> = ({
  taxForm,
  previousRoute,
  nextRoute,
}) => {
  const t = useTranslations('Results')
  const tc = useTranslations('Common')
  const summary = buildSummary(taxForm)

  const summaryRows = [
    {
      title: t('incomeTotal'),
      value: summary.prijmy,
      key: 'prijmy',
    },
    {
      title: t('flatRateExpenses'),
      value: summary.pausalneVydavky,
      key: 'pausalneVydavky',
    },
    {
      title: t('insurancePaidTotal'),
      value: summary.zaplatenePoistneSpolu,
      key: 'zaplatenePoistneSpolu',
    },
    {
      title: t('allowanceSelf'),
      value: summary.nezdanitelnaCastNaSeba,
      key: 'nezdanitelnaCastNaSeba',
    },
    {
      title: t('allowancePartner'),
      value: summary.nezdanitelnaCastNaPartnera,
      key: 'nezdanitelnaCastNaPartnera',
    },
    {
      title: t('pensionContributions'),
      value: summary.prispevkyNaDochodkovePoistenie,
      key: 'prispevkyNaDochodkovePoistenie',
    },
    {
      title: t('taxBase'),
      value: summary.zakladDane,
      key: 'zakladDane',
      fontSize: 20,
      showEvenWhenZero: true,
    },
  ]

  const rentRows = [
    {
      title: t('incomeTotal'),
      value: summary.prijemNehnutelnost,
      key: 'prijemNehnutelnost',
    },
    {
      title: t('provableExpensesTotal'),
      value: summary.vydavkyNehnutelnost,
      key: 'vydavkyNehnutelnost',
    },
    {
      title: t('taxBase'),
      value: summary.zakladDanZPrenajmu,
      key: 'zakladDanZPrenajmu',
      fontSize: 20,
      showEvenWhenZero: true,
    },
  ]

  const totalRows = [
    {
      title: t('taxTotal'),
      value: summary.danSpolu,
      key: 'danSpolu',
    },
    {
      title: t('taxAdvances'),
      value: summary.preddavkyNaDan,
      key: 'preddavkyNaDan',
    },
    {
      title: t('childBonus'),
      value: summary.danovyBonusNaDeti,
      key: 'danovyBonusNaDeti',
    },
    {
      title: t('mortgageBonus'),
      value: summary.danovyBonusNaUroky,
      key: 'danovyBonusNaUroky',
    },
    {
      title: t('bonusOverpaymentPayout'),
      value: summary.danovyBonusPreplatokNaVyplatenie,
      key: 'danovyBonusPreplatokNaVyplatenie',
    },
    {
      title: t('taxToPay'),
      value: summary.danNaUhradu,
      key: 'danNaUhradu',
      fontSize: 30,
    },
  ]

  return (
    <>
      <BackLink href={previousRoute} />
      <h1 className="govuk-heading-l govuk-!-margin-top-3">
        {t('heading', { year: TAX_YEAR })}
      </h1>
      <Summary
        title={t('employmentAndSelfEmployment')}
        rows={summaryRows}
        compactView
      />
      {taxForm.rent && <Summary title={t('rentalIncome')} rows={rentRows} />}
      <Summary title={t('taxToPayOrOverpayment')} rows={totalRows} />

      {taxForm.preddavkyNaDan.suma.greaterThan(0) && (
        <Warning>
          <strong>
            {t.rich('advancesWarning', {
              // periodicita is a Slovak data value from calculation.ts
              periodicity: t(
                `periodicity.${taxForm.preddavkyNaDan.periodicita}`,
              ),
              year: TAX_YEAR + 1,
              amount: formatCurrency(taxForm.preddavkyNaDan.suma.toNumber()),
              link: (chunks) => (
                <ExternalLink href="https://www.financnasprava.sk/sk/elektronicke-sluzby/verejne-sluzby/danove-kalkulacky/vypocet-preddavkov-fo-2025">
                  {chunks}
                </ExternalLink>
              ),
            })}
          </strong>
        </Warning>
      )}

      <Link href={nextRoute} legacyBehavior>
        <button
          data-test="next"
          className="govuk-button govuk-!-margin-top-3"
          type="submit"
        >
          {tc('continue')}
        </button>
      </Link>
    </>
  )
}

export default Vysledky
