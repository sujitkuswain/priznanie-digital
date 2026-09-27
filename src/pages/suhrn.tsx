import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { TaxFormUserInput } from '../types/TaxFormUserInput'
import { formatCurrency, formatDate, parseInputNumber } from '../lib/utils'
import styles from './suhrn.module.css'
import classnames from 'classnames'
import { Warning } from '../components/Warning'
import { Page } from '../components/Page'
import { BackLink } from '../components/BackLink'
import { TAX_YEAR, zaciatok_urocenia_datum } from '../lib/calculation'

interface SummaryRow {
  title: string
  value?: string
  currency?: boolean
  testId?: string
  allignRight?: boolean
}
interface SummaryProps {
  title: string
  rows: SummaryRow[]
  href?: string
}
const Summary = (props: SummaryProps) => {
  const t = useTranslations('Summary')
  return (
    <>
      <h2
        className={classnames(
          'govuk-heading-m',
          'govuk-!-margin-top-3',
          styles.summaryTitle,
        )}
      >
        <span>{props.title}</span>
        {props.href && (
          <Link href={`${props.href}?edit`} className={styles.editLink}>
            {t('edit')}
          </Link>
        )}
      </h2>
      <table className="govuk-table">
        <tbody className="govuk-table__body">
          {props.rows.map(
            ({ title, value, currency, testId, allignRight }, index) => (
              <tr className="govuk-table__row" key={`${title}-${index}`}>
                {value ? (
                  <>
                    <td
                      className={
                        allignRight
                          ? 'govuk-table__cell'
                          : 'govuk-table__cell govuk-!-width-one-half'
                      }
                    >
                      {title}
                    </td>
                    <td
                      className="govuk-table__cell"
                      style={{
                        textAlign: allignRight ? 'end' : 'start',
                        whiteSpace: 'nowrap',
                      }}
                      data-test={testId}
                    >
                      {currency
                        ? formatCurrency(parseInputNumber(value))
                        : value}
                    </td>
                  </>
                ) : (
                  <td className="govuk-table__cell">{title}</td>
                )}
              </tr>
            ),
          )}
        </tbody>
      </table>
    </>
  )
}

const Suhrn: Page<TaxFormUserInput> = ({
  taxFormUserInput,
  previousRoute,
  nextRoute,
}) => {
  const t = useTranslations('Summary')
  const tc = useTranslations('Common')
  const months = tc.raw('months') as string[]
  return (
    <>
      <BackLink href={previousRoute} />
      <h1 className="govuk-heading-l govuk-!-margin-top-3">{t('heading')}</h1>

      <Warning>
        <strong>{t('warning')}</strong>
      </Warning>

      <Summary
        title={t('selfEmployedTitle')}
        href={'/prijmy-a-vydavky'}
        rows={[
          {
            title: t('income'),
            value: taxFormUserInput.t1r10_prijmy,
            currency: true,
            allignRight: true,
          },
          {
            title: t('socialInsurance'),
            value: taxFormUserInput.priloha3_r11_socialne,
            currency: true,
            allignRight: true,
          },
          {
            title: t('healthInsurance'),
            value: taxFormUserInput.priloha3_r13_zdravotne,
            currency: true,
            allignRight: true,
          },
          {
            title: t('advancesPaid'),
            value: taxFormUserInput.zaplatenePreddavky,
            currency: true,
            allignRight: true,
          },
        ]}
      />
      <Summary
        title={t('employmentTitle', { year: TAX_YEAR })}
        href={'/zamestnanie'}
        rows={
          taxFormUserInput.employed
            ? [
                {
                  title: t('employmentIncome'),
                  value: taxFormUserInput.uhrnPrijmovOdVsetkychZamestnavatelov,
                  currency: true,
                  allignRight: true,
                },
                {
                  title: t('employmentSocial'),
                  value:
                    taxFormUserInput.uhrnPovinnehoPoistnehoNaSocialnePoistenie,
                  currency: true,
                  allignRight: true,
                  testId: 'r039_socialne',
                },
                {
                  title: t('employmentHealth'),
                  value:
                    taxFormUserInput.uhrnPovinnehoPoistnehoNaZdravotnePoistenie,
                  currency: true,
                  allignRight: true,
                  testId: 'r039_zdravotne',
                },
                {
                  title: t('employmentAdvances'),
                  value: taxFormUserInput.uhrnPreddavkovNaDan,
                  currency: true,
                  allignRight: true,
                },
                {
                  title: t('childBonus'),
                  value: taxFormUserInput.udajeODanovomBonuseNaDieta,
                  currency: true,
                  allignRight: true,
                },
              ]
            : [
                {
                  title: t('employmentNone', { year: TAX_YEAR }),
                },
              ]
        }
      />
      <Summary
        title={t('agreementsTitle', { year: TAX_YEAR })}
        href={'/dohoda'}
        rows={
          taxFormUserInput.dohoda
            ? [
                {
                  title: t('agreementsIncome'),
                  value: taxFormUserInput.uhrnPrijmovZoVsetkychDohod,
                  currency: true,
                  allignRight: true,
                },
                {
                  title: t('agreementsSocial'),
                  value:
                    taxFormUserInput.uhrnPovinnehoPoistnehoNaSocialnePoistenieDohody,
                  currency: true,
                  allignRight: true,
                },
                {
                  title: t('agreementsHealth'),
                  value:
                    taxFormUserInput.uhrnPovinnehoPoistnehoNaZdravotnePoistenieDohody,
                  currency: true,
                  allignRight: true,
                },
                {
                  title: t('agreementsAdvances'),
                  value: taxFormUserInput.uhrnPreddavkovNaDanDohody,
                  currency: true,
                  allignRight: true,
                },
                {
                  title: t('childBonus'),
                  value: taxFormUserInput.udajeODanovomBonuseNaDietaDohody,
                  currency: true,
                  allignRight: true,
                },
              ]
            : [
                {
                  title: t('agreementsNone', { year: TAX_YEAR }),
                },
              ]
        }
      />
      <Summary
        title={t('partnerTitle')}
        href={'/partner'}
        rows={
          taxFormUserInput.r032_uplatnujem_na_partnera
            ? [
                {
                  title: t('partnerName'),
                  value: taxFormUserInput.r031_priezvisko_a_meno,
                },
                {
                  title: t('birthNumber'),
                  value: taxFormUserInput.r031_rodne_cislo,
                },
                {
                  title: t('partnerIncome'),
                  value: taxFormUserInput.r032_partner_vlastne_prijmy,
                  currency: true,
                },
                {
                  title: t('partnerMonths'),
                  value: taxFormUserInput.r032_partner_pocet_mesiacov,
                },
              ]
            : [
                {
                  title: t('partnerNone'),
                },
              ]
        }
      />
      <Summary
        title={t('childrenTitle')}
        href={'/deti'}
        rows={
          taxFormUserInput.hasChildren === 'yes'
            ? taxFormUserInput.children
                .map((child) => [
                  { title: t('fullName'), value: child.priezviskoMeno },
                  {
                    title: t('birthNumber'),
                    value: child.rodneCislo,
                  },
                ])
                .reduce((result, value) => [...result, ...value], [])
            : [
                {
                  title: t('childrenNone'),
                },
              ]
        }
      />
      <Summary
        title={t('otherPersonTitle')}
        href={'/deti'}
        rows={
          taxFormUserInput.partner_bonus_na_deti
            ? [
                {
                  title: t('fullName'),
                  value: taxFormUserInput.r034_priezvisko_a_meno,
                },
                {
                  title: t('birthNumber'),
                  value: taxFormUserInput.r034_rodne_cislo,
                },
                {
                  title: t('otherPersonMonths'),
                  value: `${
                    months[parseInt(taxFormUserInput.partner_bonus_na_deti_od)]
                  } - ${
                    months[parseInt(taxFormUserInput.partner_bonus_na_deti_do)]
                  }`,
                },
                {
                  title: t('otherPersonIncomeType'),
                  value: t(
                    `incomeType${taxFormUserInput.partner_bonus_na_deti_typ_prijmu}`,
                  ),
                },
                {
                  title: t('income'),
                  value: taxFormUserInput.r034a,
                  currency: true,
                },
              ]
            : taxFormUserInput.hasChildren === 'income-used-by-someone-else'
              ? [
                  {
                    title: t('otherPersonIncomeUsed'),
                  },
                ]
              : [
                  {
                    title: t('otherPersonNone'),
                  },
                ]
        }
      />
      <Summary
        title={t('pensionTitle')}
        href={'/dochodok'}
        rows={
          taxFormUserInput.platil_prispevky_na_dochodok
            ? [
                {
                  title: t('pensionAmount'),
                  value: taxFormUserInput.zaplatene_prispevky_na_dochodok,
                  currency: true,
                },
              ]
            : [{ title: t('pensionNone') }]
        }
      />
      <Summary
        title={t('mortgageTitle')}
        href={'/uroky'}
        rows={
          taxFormUserInput.r035_uplatnuje_uroky
            ? [
                {
                  title: t('mortgagePaid', { year: TAX_YEAR }),
                  value: taxFormUserInput.r035_zaplatene_uroky,
                  currency: true,
                },
                {
                  title: t('mortgageInterestStart'),
                  value: formatDate(zaciatok_urocenia_datum(taxFormUserInput)),
                },
              ]
            : [{ title: t('mortgageNone') }]
        }
      />
      <Summary
        title={t('rentTitle')}
        href={'/prenajom'}
        rows={
          taxFormUserInput.rent
            ? [
                {
                  title: t('rentIncome'),
                  value: taxFormUserInput.vyskaPrijmovZPrenajmu,
                  currency: true,
                  allignRight: true,
                },
                {
                  title: t('rentExpenses'),
                  value: taxFormUserInput.vydavkyZPrenajmu,
                  currency: true,
                  allignRight: true,
                },
                {
                  title: t('rentExemption'),
                  value: taxFormUserInput.vyskaOslobodenia,
                  currency: true,
                  allignRight: true,
                },
              ]
            : [
                {
                  title: t('rentNone'),
                },
              ]
        }
      />
      <Summary
        title={t('parentsTitle')}
        href={'/dve-percenta-rodicom'}
        rows={
          taxFormUserInput.dve_percenta_rodicom === 'obidvom'
            ? [
                {
                  title: t('parent1'),
                  value: `${taxFormUserInput.dve_percenta_rodicA?.meno} ${taxFormUserInput.dve_percenta_rodicA?.priezvisko}`,
                },
                {
                  title: t('birthNumber'),
                  value: taxFormUserInput.dve_percenta_rodicA?.rodneCislo,
                },
                {
                  title: t('parent2'),
                  value: `${taxFormUserInput.dve_percenta_rodicB?.meno} ${taxFormUserInput.dve_percenta_rodicB?.priezvisko}`,
                },
                {
                  title: t('birthNumber'),
                  value: taxFormUserInput.dve_percenta_rodicB?.rodneCislo,
                },
              ]
            : taxFormUserInput.dve_percenta_rodicom === 'jednemu'
              ? [
                  {
                    title: t('parent'),
                    value: `${taxFormUserInput.dve_percenta_rodicA?.meno} ${taxFormUserInput.dve_percenta_rodicA?.priezvisko}`,
                  },
                  {
                    title: t('birthNumber'),
                    value: taxFormUserInput.dve_percenta_rodicA?.rodneCislo,
                  },
                ]
              : [
                  {
                    title: t('parentsNone'),
                  },
                ]
        }
      />
      <Summary
        title={t('taxpayerTitle')}
        href={'/osobne-udaje'}
        rows={[
          { title: t('dic'), value: taxFormUserInput.r001_dic },
          {
            title: t('firstName'),
            value: taxFormUserInput.r005_meno,
            testId: 'r005_meno',
          },
          {
            title: t('lastName'),
            value: taxFormUserInput.r004_priezvisko,
            testId: 'r004_priezvisko',
          },
        ]}
      />
      <Summary
        title={t('addressTitle')}
        href={'/osobne-udaje'}
        rows={[
          {
            title: t('streetAndNumber'),
            value: `${taxFormUserInput.r007_ulica} ${taxFormUserInput.r008_cislo}`,
          },
          { title: t('postalCode'), value: taxFormUserInput.r009_psc },
          { title: t('municipality'), value: taxFormUserInput.r010_obec },
          { title: t('country'), value: taxFormUserInput.r011_stat },
        ]}
      />
      <Link href={nextRoute} legacyBehavior>
        <button
          data-test="next"
          className="govuk-button govuk-!-margin-top-4"
          type="button"
        >
          {tc('continue')}
        </button>
      </Link>
    </>
  )
}

export default Suhrn
