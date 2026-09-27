import sk from '../messages/sk.json'

export type Translate = (
  key: string,
  values?: Record<string, string | number>,
) => string

// Default translator for validate() functions: returns the Slovak message,
// so validation behaves as before when no translator is passed (e.g. in tests).
export const slovakTranslator =
  (namespace?: string): Translate =>
  (key, values) => {
    const path = (namespace ? `${namespace}.${key}` : key).split('.')
    const message = path.reduce((node, part) => node?.[part], sk as object)
    if (typeof message !== 'string') {
      return key
    }
    return message.replace(/\{(\w+)\}/g, (match, name) =>
      values?.[name] === undefined ? match : String(values[name]),
    )
  }
