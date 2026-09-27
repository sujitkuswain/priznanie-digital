import { Form } from 'formik'
import { useTranslations } from 'next-intl'
import { BooleanRadio, FormWrapper, Input } from '../components/FormComponents'
import { EmployedUserInput, FormErrors } from '../types/PageUserInputs'
import { numberInputRegexp } from '../lib/utils'
import { ErrorSummary } from '../components/ErrorSummary'
import { Page } from '../components/Page'
import { employmentUserInputInitialValues } from '../lib/initialValues'
import { BackLink } from '../components/BackLink'
import { TAX_YEAR } from '../lib/calculation'
import TooltipHint from '../components/TooltipHint'
import styles from './zamestnanie.module.css'
import { Translate, translateKey } from '../lib/i18n'

const Zamestnanie: Page<EmployedUserInput> = ({
  setTaxFormUserInput,
  taxFormUserInput,
  router,
  previousRoute,
  nextRoute,
}) => {
  const t = useTranslations('Employment')
  const tc = useTranslations('Common')
  return (
    <>
      <BackLink href={previousRoute} />
      <FormWrapper<EmployedUserInput>
        initialValues={taxFormUserInput}
        validate={(values) => validate(values, t)}
        onSubmit={(values) => {
          const userInput = values.employed
            ? values
            : {
                ...employmentUserInputInitialValues,
                employed: false,
              }
          setTaxFormUserInput(userInput)
          router.push(nextRoute)
        }}
      >
        {({ values, errors }) => (
          <Form className="form" noValidate>
            <ErrorSummary<EmployedUserInput> errors={errors} />
            <BooleanRadio
              title={t('question', { year: TAX_YEAR })}
              name="employed"
            />
            {values.employed && (
              <>
                <h3 className="govuk-heading-m">{t('documentIntro')}</h3>
                <Input
                  name="uhrnPrijmovOdVsetkychZamestnavatelov"
                  type="number"
                  label={t('incomeLabel')}
                  hint={
                    <div>
                      <span className={styles.hintText}>
                        {t('rowHint', { row: '01' })}
                      </span>
                      <TooltipHint>
                        <img
                          className={styles.hintImage}
                          src="/assets/images/zamestnanie-hint-01.png"
                          alt="zamestnanie-hint-01"
                        />
                      </TooltipHint>
                    </div>
                  }
                />
                <Input
                  name="uhrnPovinnehoPoistnehoNaSocialnePoistenie"
                  type="number"
                  label={t('socialLabel')}
                  hint={
                    <div>
                      <span className={styles.hintText}>
                        {t('rowHint', { row: '02a' })}
                      </span>
                      <TooltipHint>
                        <img
                          className={styles.hintImage}
                          src="/assets/images/zamestnanie-hint-02a.png"
                          alt="zamestnanie-hint-02a"
                        />
                      </TooltipHint>
                    </div>
                  }
                />
                <Input
                  name="uhrnPovinnehoPoistnehoNaZdravotnePoistenie"
                  type="number"
                  label={t('healthLabel')}
                  hint={
                    <div>
                      <span className={styles.hintText}>
                        {t('rowHint', { row: '02b' })}
                      </span>
                      <TooltipHint>
                        <img
                          className={styles.hintImage}
                          src="/assets/images/zamestnanie-hint-02b.png"
                          alt="zamestnanie-hint-02b"
                        />
                      </TooltipHint>
                    </div>
                  }
                />
                <Input
                  name="uhrnPreddavkovNaDan"
                  type="number"
                  label={t('advancesLabel')}
                  hint={
                    <div>
                      <span className={styles.hintText}>
                        {t('rowHint', { row: '04' })}
                      </span>
                      <TooltipHint>
                        <img
                          className={styles.hintImage}
                          src="/assets/images/zamestnanie-hint-04.png"
                          alt="zamestnanie-hint-04"
                        />
                      </TooltipHint>
                    </div>
                  }
                />
                <Input
                  name="udajeODanovomBonuseNaDieta"
                  type="number"
                  label={t('childBonusLabel')}
                  hint={
                    <div>
                      <span className={styles.hintText}>
                        {t('childBonusHint')}
                      </span>
                      <TooltipHint>
                        <img
                          className={styles.hintImage}
                          src="/assets/images/zamestnanie-hint-13.png"
                          alt="zamestnanie-hint-13"
                        />
                      </TooltipHint>
                    </div>
                  }
                />
              </>
            )}
            <button data-test="next" className="govuk-button" type="submit">
              {tc('continue')}
            </button>
          </Form>
        )}
      </FormWrapper>
    </>
  )
}

export const validate = (
  values: EmployedUserInput,
  t: Translate = translateKey,
) => {
  const errors: Partial<FormErrors<EmployedUserInput>> = {}

  if (typeof values.employed === 'undefined') {
    errors.employed = t('errorSelectAnswer')
  }

  if (values.employed) {
    if (!values.uhrnPrijmovOdVsetkychZamestnavatelov) {
      errors.uhrnPrijmovOdVsetkychZamestnavatelov = t('errorIncome')
    } else if (
      !values.uhrnPrijmovOdVsetkychZamestnavatelov.match(numberInputRegexp)
    ) {
      errors.uhrnPrijmovOdVsetkychZamestnavatelov = t('errorIncomeFormat')
    }

    if (!values.uhrnPovinnehoPoistnehoNaSocialnePoistenie) {
      errors.uhrnPovinnehoPoistnehoNaSocialnePoistenie = t('errorSocial')
    } else if (
      !values.uhrnPovinnehoPoistnehoNaSocialnePoistenie.match(numberInputRegexp)
    ) {
      errors.uhrnPovinnehoPoistnehoNaSocialnePoistenie = t('errorSocialFormat')
    }

    if (!values.uhrnPovinnehoPoistnehoNaZdravotnePoistenie) {
      errors.uhrnPovinnehoPoistnehoNaZdravotnePoistenie = t('errorHealth')
    } else if (
      !values.uhrnPovinnehoPoistnehoNaZdravotnePoistenie.match(
        numberInputRegexp,
      )
    ) {
      errors.uhrnPovinnehoPoistnehoNaZdravotnePoistenie = t('errorHealthFormat')
    }

    if (!values.uhrnPreddavkovNaDan) {
      errors.uhrnPreddavkovNaDan = t('errorAdvances')
    } else if (!values.uhrnPreddavkovNaDan.match(numberInputRegexp)) {
      errors.uhrnPreddavkovNaDan = t('errorAdvancesFormat')
    }

    if (!values.udajeODanovomBonuseNaDieta) {
      errors.udajeODanovomBonuseNaDieta = t('errorChildBonus')
    } else if (!values.udajeODanovomBonuseNaDieta.match(numberInputRegexp)) {
      errors.udajeODanovomBonuseNaDieta = t('errorChildBonusFormat')
    }
  }

  return errors
}

export default Zamestnanie
