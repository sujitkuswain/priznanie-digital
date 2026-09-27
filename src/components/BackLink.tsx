import Link from 'next/link'
import React from 'react'
import { useTranslations } from 'next-intl'

export interface BackLinkProps {
  href: string
}

export const BackLink = ({ href }: BackLinkProps) => {
  const t = useTranslations('Common')
  return (
    <Link href={href} className="govuk-back-link" data-test="back">
      {t('back')}
    </Link>
  )
}
