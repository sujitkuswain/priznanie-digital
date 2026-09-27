import React from 'react'
import { useTranslations } from 'next-intl'
import { ExternalLink } from './ExternalLink'

export const PrivacyPolicyLink = () => {
  const t = useTranslations('Footer')
  return (
    <ExternalLink href="https://navody.digital/ochrana-osobnych-udajov">
      {t('privacyPolicy')}
    </ExternalLink>
  )
}
