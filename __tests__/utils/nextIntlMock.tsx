import React from 'react'

type Translator = ((key: string) => string) & {
  rich: (key: string) => string
}

export const useTranslations = (): Translator => {
  const t = ((key: string) => key) as Translator
  t.rich = (key: string) => key
  return t
}

export const NextIntlClientProvider = ({
  children,
}: {
  children: React.ReactNode
}) => <>{children}</>

export const useLocale = () => 'sk'
