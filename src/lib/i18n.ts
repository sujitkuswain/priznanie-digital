// Translator passed to validate() functions. Tests call validate() without one,
// so the default returns the message key.
export type Translate = (
  key: string,
  values?: Record<string, string | number>,
) => string

export const translateKey: Translate = (key) => key
