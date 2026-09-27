import React from 'react'
import { Form, FormikProps } from 'formik'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { FormWrapper, Input } from '../components/FormComponents'
import styles from './osobne-udaje.module.css'
import {
  PersonalInformationUserInput,
  FormErrors,
} from '../types/PageUserInputs'
import { getAutoformByPersonName } from '../lib/api'
import { ErrorSummary } from '../components/ErrorSummary'
import { AutoCompleteInput } from '../components/AutoCompleteInput'
import { formatPsc, getStreetNumber } from '../lib/utils'
import { Nace } from '../components/Nace'
import { Page } from '../components/Page'
import { AutoFormSubject } from '../types/api'
import { Translate, slovakTranslator } from '../lib/i18n'

const formatNace = (economicActivity) => {
  const { code, name } = economicActivity || {}
  if (code && name) {
    return `${code} - ${name}`
  }
  return ''
}

const makeHandlePersonAutoform = ({
  setValues,
}: FormikProps<PersonalInformationUserInput>) => {
  return (subject: AutoFormSubject) => {
    let first_name,
      last_name,
      prefixes,
      postfixes,
      street,
      reg_number,
      building_number,
      municipality,
      postal_code,
      country

    if (subject.statutory.length > 0) {
      ;({
        first_name,
        last_name,
        prefixes,
        postfixes,
        street,
        reg_number,
        building_number,
        municipality,
        postal_code,
        country,
      } = subject.statutory[0])
    }

    setValues({
      meno_priezvisko: subject.name,
      r004_priezvisko: last_name || '',
      r005_meno: first_name || '',
      r006_titul: prefixes || '',
      r006_titul_za: postfixes || '',
      r001_dic: `${subject.tin}` || '',
      r003_nace: formatNace(subject.main_economic_activity),
      r007_ulica: street || municipality || '',
      r008_cislo: getStreetNumber({ reg_number, building_number }) || '',
      r009_psc: postal_code ? formatPsc(postal_code) : '',
      r010_obec: municipality || '',
      r011_stat: country || '',
    })
  }
}

const OsobneUdaje: Page<PersonalInformationUserInput> = ({
  setTaxFormUserInput,
  taxFormUserInput,
  router,
  previousRoute,
  nextRoute,
}) => {
  const t = useTranslations('PersonalDetails')
  const tc = useTranslations('Common')
  return (
    <>
      <Link href={previousRoute} data-test="back" className="govuk-back-link">
        {tc('back')}
      </Link>
      <FormWrapper<PersonalInformationUserInput>
        initialValues={taxFormUserInput}
        validate={(values) => validate(values, t)}
        onSubmit={(values) => {
          setTaxFormUserInput(values)
          router.push(nextRoute)
        }}
      >
        {(props) => (
          <>
            <ErrorSummary<PersonalInformationUserInput> errors={props.errors} />
            <Form className="form">
              <h2 className="govuk-heading-l">{t('heading')}</h2>
              <p>{t('searchHint')}</p>

              <AutoCompleteInput
                name="meno_priezvisko"
                label={t('searchLabel')}
                onSelect={makeHandlePersonAutoform(props)}
                fetchData={async (name) => {
                  const data = await getAutoformByPersonName(name)
                  return data.map((item) => ({
                    ...item,
                    id: item.id,
                    value: `${item.name} ${item.formatted_address}`,
                  }))
                }}
              />

              <div className={styles.inlineFieldContainer}>
                <Input
                  className={styles.inlineField}
                  name="r006_titul"
                  type="text"
                  label={t('titleBefore')}
                />
                <Input
                  className={styles.inlineField}
                  name="r006_titul_za"
                  type="text"
                  label={t('titleAfter')}
                />
              </div>

              <Input
                className={styles.wideField}
                name="r005_meno"
                type="text"
                label={t('firstName')}
                width="auto"
              />

              <Input
                className={styles.wideField}
                name="r004_priezvisko"
                type="text"
                label={t('lastName')}
                width="auto"
              />

              <Nace />

              <div className={styles.inlineFieldContainer}>
                <Input
                  className={styles.inlineField}
                  name="r001_dic"
                  type="text"
                  label={t('dic')}
                  hint={t('dicHint')}
                />
              </div>

              <h2 className="govuk-heading-l">{t('addressHeading')}</h2>
              <div className={styles.inlineFieldContainer}>
                <Input
                  className={styles.inlineField}
                  name="r007_ulica"
                  type="text"
                  label={t('street')}
                />
                <Input
                  className={styles.inlineField}
                  name="r008_cislo"
                  type="text"
                  label={t('houseNumber')}
                />
              </div>
              <div className={styles.inlineFieldContainer}>
                <Input
                  className={styles.inlineField}
                  name="r009_psc"
                  type="text"
                  label={t('postalCode')}
                  maxLength={6}
                  onChange={async (event) => {
                    const pscValue = formatPsc(
                      event.currentTarget.value,
                      props.values.r009_psc,
                    )
                    props.setFieldValue('r009_psc', pscValue)
                  }}
                />

                <Input
                  className={styles.inlineField}
                  name="r010_obec"
                  type="text"
                  label={t('municipality')}
                />
              </div>

              <Input name="r011_stat" type="text" label={t('country')} />

              <button className="govuk-button" type="submit">
                {tc('continue')}
              </button>
            </Form>
          </>
        )}
      </FormWrapper>
    </>
  )
}

export const validate = (
  values: PersonalInformationUserInput,
  t: Translate = slovakTranslator('PersonalDetails'),
) => {
  const errors: Partial<FormErrors<PersonalInformationUserInput>> = {}

  if (!values.r001_dic) {
    errors.r001_dic = t('errorDic')
  } else if (values.r001_dic.length < 9 || values.r001_dic.length > 10) {
    /**
     * @see https://ec.europa.eu/taxation_customs/tin/pdf/sk/TIN_-_subject_sheet_-_2_structure_and_specificities_sk.pdf
     */
    errors.r001_dic = t('errorDicLength')
  }

  if (!values.r005_meno) {
    errors.r005_meno = t('errorFirstName')
  }

  if (!values.r004_priezvisko) {
    errors.r004_priezvisko = t('errorLastName')
  }

  if (!values.r008_cislo) {
    errors.r008_cislo = t('errorHouseNumber')
  }

  const pscNumberFormat = /^\d{3} \d{2}$/
  if (!values.r009_psc) {
    errors.r009_psc = t('errorPostalCode')
  } else if (!pscNumberFormat.test(values.r009_psc)) {
    errors.r009_psc = t('errorPostalCodeFormat')
  }

  if (!values.r010_obec) {
    errors.r010_obec = t('errorMunicipality')
  }

  if (!values.r011_stat) {
    errors.r011_stat = t('errorCountry')
  }

  return errors
}

export default OsobneUdaje
