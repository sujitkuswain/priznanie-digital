import React from 'react'
import { Page } from '../components/Page'
import { TaxFormUserInput } from '../types/TaxFormUserInput'
import { debugTestData } from '../lib/debugTestData'

const DebugPage: Page<Partial<TaxFormUserInput>> = ({
  setTaxFormUserInput,
  router,
}) => {
  return (
    <>
      <h1 className="govuk-heading-l govuk-!-margin-top-3">Debug stránka</h1>
      <button
        className="govuk-button"
        onClick={() => {
          document.cookie = 'you-shall=not-pass'
          window.location.href = '/'
        }}
      >
        Zapnúť DEBUG mode
      </button>
      <br />
      <button
        className="govuk-button btn-secondary"
        onClick={() => {
          document.cookie = 'you-shall=; Max-Age=0'
          window.location.href = '/'
        }}
      >
        Vypnúť DEBUG mode
      </button>
      <br />
      <button
        className="govuk-button btn-secondary"
        data-test="fill-test-data"
        onClick={() => {
          setTaxFormUserInput(debugTestData)
          router.push('/suhrn')
        }}
      >
        Vyplniť testovacie údaje (test data)
      </button>
    </>
  )
}

export default DebugPage
