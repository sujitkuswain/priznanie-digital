import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Form } from 'formik'
import classNames from 'classnames'
import { ChildInput, TaxFormUserInput } from '../types/TaxFormUserInput'
import { FormWrapper, Input } from './FormComponents'
import { ErrorSummary } from './ErrorSummary'
import { FeedbackFormInput } from '../types/UserInput'
import { rodnecislo } from 'rodnecislo'

export const anonymizeTaxForm = (taxFormUserInput: TaxFormUserInput) => {
  return {
    ...taxFormUserInput,
    r001_dic: 'anon',
    r003_nace: 'anon',
    r004_priezvisko: 'anon',
    r005_meno: 'anon',
    meno_priezvisko: 'anon',
    r007_ulica: 'anon',
    r008_cislo: 'anon',
    r009_psc: 'anon',
    r010_obec: 'anon',
    r011_stat: 'anon',
    r031_priezvisko_a_meno: 'anon',
    r031_rodne_cislo: 'anon',
    r034_priezvisko_a_meno: 'anon',
    r034_rodne_cislo: 'anon',
    r006_titul: 'anon',
    r006_titul_za: 'anon',
    iban: 'anon',
    email: 'anon',
    children: taxFormUserInput.children.map(anoymizeChild),
    dve_percenta_rodicA: taxFormUserInput.dve_percenta_rodicA
      ? { meno: 'anon', priezvisko: 'anon', rodneCislo: 'anon' }
      : taxFormUserInput.dve_percenta_rodicA,
    dve_percenta_rodicB: taxFormUserInput.dve_percenta_rodicB
      ? { meno: 'anon', priezvisko: 'anon', rodneCislo: 'anon' }
      : taxFormUserInput.dve_percenta_rodicB,
  }
}

export const anoymizeChild = (child: ChildInput) => {
  const rCislo = rodnecislo(child.rodneCislo.replace(' / ', ''))
  return {
    ...child,
    rodneCislo: 'anon',
    rokNarodenia: rCislo.year(),
    mesiacNarodenia: rCislo.month() + 1,
    priezviskoMeno: 'anon',
  }
}

const sendFeedback = async ({
  whatWereYouDoing,
  whatWentWrong,
  email,
  taxFormUserInput,
}) => {
  const response = await fetch('/api/feedback', {
    method: 'POST',
    body: JSON.stringify({
      whatWereYouDoing,
      whatWentWrong,
      email,
      taxFormUserInput: anonymizeTaxForm(taxFormUserInput),
      url: window.location.href,
    }),
  })
  return response.status === 200
}

const validateFeedbackForm = (values, t) => {
  const errors: Record<string, string> = {}

  if (!values.whatWereYouDoing) {
    errors.whatWereYouDoing = t('errorWhatWereYouDoing')
  }

  if (!values.whatWentWrong) {
    errors.whatWentWrong = t('errorWhatWentWrong')
  }

  if (values.email && !values.email.match(/^.+@.+\.[a-z]+$/i)) {
    errors.email = t('errorEmail')
  }

  return errors
}

interface FeedbackFormProps {
  taxFormUserInput: TaxFormUserInput
  close: () => void
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  taxFormUserInput,
  close,
}) => {
  const t = useTranslations('Feedback')
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] =
    useState(undefined)

  return (
    <div
      id="sdn-feedbackbar-form-foundbug"
      className="sdn-feedbackbar__form govuk-!-padding-4"
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-4">
          <h3 className="govuk-heading-m">{t('formHeading')}</h3>
          <p className="govuk-body">{t('formIntro')}</p>
        </div>
        <div
          className="govuk-grid-column-one-third"
          style={{ textAlign: 'right' }}
        >
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              close()
            }}
          >
            {t('close')}
          </a>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          {isSubmittedSuccessfully === true ? (
            <p className="govuk-body">{t('thanks')}</p>
          ) : (
            <FormWrapper<FeedbackFormInput>
              initialValues={{
                whatWereYouDoing: '',
                whatWentWrong: '',
                email: '',
              }}
              validate={(values) => validateFeedbackForm(values, t)}
              onSubmit={async (values, { setErrors }) => {
                const success = await sendFeedback({
                  ...values,
                  taxFormUserInput,
                })
                setIsSubmittedSuccessfully(success)

                if (!success) {
                  setErrors({
                    saving: t('errorSaving'),
                  })
                }
              }}
            >
              {(formik) => (
                <Form noValidate>
                  <ErrorSummary errors={formik.errors} />
                  <Input
                    name="whatWereYouDoing"
                    label={t('whatWereYouDoing')}
                    type="text"
                    width="auto"
                  />
                  <Input
                    name="whatWentWrong"
                    label={t('whatWentWrong')}
                    type="textarea"
                  />
                  <Input
                    name="email"
                    label={t('email')}
                    type="email"
                    hint={t('emailHint')}
                  />
                  <button
                    type="submit"
                    data-test="submit"
                    className={classNames(
                      'govuk-button',
                      'govuk-button--large',
                      'govuk-!-margin-top-4',
                      { 'govuk-button--disabled': formik.isSubmitting },
                    )}
                    disabled={formik.isSubmitting}
                  >
                    {formik.isSubmitting ? t('sending') : t('send')}
                  </button>
                </Form>
              )}
            </FormWrapper>
          )}
        </div>
      </div>
    </div>
  )
}

interface FeedbackProps {
  taxFormUserInput: TaxFormUserInput
}

export const Feedback: React.FC<FeedbackProps> = ({ taxFormUserInput }) => {
  const t = useTranslations('Feedback')
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)

  if (isFeedbackOpen) {
    return (
      <FeedbackForm
        taxFormUserInput={taxFormUserInput}
        close={() => setIsFeedbackOpen(false)}
      />
    )
  }
  return (
    <div className="sdn-feedbackbar__container" id="sdn-feedbackbar-container">
      <div className="sdn-feedbackbar__useful" />

      <div className="sdn-feedbackbar__foundbug">
        <span>{t('foundBug')}&nbsp;</span>
        <span>
          <a
            href="#"
            className="sdn-feedbackbar__link"
            data-test="feedback"
            onClick={(e) => {
              e.preventDefault()
              setIsFeedbackOpen(true)
            }}
          >
            {t('writeUs')}
          </a>
        </span>
      </div>
    </div>
  )
}
