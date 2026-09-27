import React, { PropsWithChildren } from 'react'
import { ErrorPrefix } from '../FormComponents'

interface Props {
  readonly title: string
  readonly hint?: string
  readonly error?: string
}

const Fieldset = ({
  title,
  hint,
  error,
  children,
}: PropsWithChildren<Props>) => {
  return (
    <fieldset className="govuk-fieldset">
      <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
        <h2 className="govuk-fieldset__heading">{title}</h2>
      </legend>
      {hint && <span className="govuk-hint">{hint}</span>}
      {error && (
        <span data-test="error" className="govuk-error-message">
          <ErrorPrefix /> {error}
        </span>
      )}
      {children}
    </fieldset>
  )
}

export default Fieldset
