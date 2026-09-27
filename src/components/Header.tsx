import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'

const FlagEn = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="12"
    viewBox="0 0 60 30"
    aria-hidden="true"
    focusable="false"
  >
    <clipPath id="flag-en-diagonals">
      <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
    </clipPath>
    <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
    <path
      d="M0,0 L60,30 M60,0 L0,30"
      clipPath="url(#flag-en-diagonals)"
      stroke="#C8102E"
      strokeWidth="4"
    />
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
  </svg>
)

const FlagSk = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="16"
    viewBox="0 0 9 6"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M0 0h9v2H0z" fill="#fff" />
    <path d="M0 2h9v2H0z" fill="#0b4ea2" />
    <path d="M0 4h9v2H0z" fill="#ee1c25" />
    <path
      d="M1.5 1.2h2.2v2q0 1.3-1.1 1.9-1.1-.6-1.1-1.9z"
      fill="#ee1c25"
      stroke="#fff"
      strokeWidth=".15"
    />
    <path
      d="M2.5 1.5h.2v2.3h-.2zM2.2 1.9h.8v.18h-.8zM2.05 2.5h1.1v.2h-1.1z"
      fill="#fff"
    />
    <path
      d="M1.75 3.9q.4-.5.85-.1.45-.4.85.1-.3.8-.85 1.05-.55-.25-.85-1.05z"
      fill="#0b4ea2"
    />
  </svg>
)

const Header: React.FC = () => {
  const router = useRouter()
  const t = useTranslations('Header')
  const otherLocale = router.locale === 'en' ? 'sk' : 'en'
  const isLandingPage = router.pathname === '/' || router.pathname === '/domov'

  const logo = (
    <a className="sdn-header__link">
      <img
        className="sdn-header__logo"
        src="/assets/images/priznanie_logo.png"
        alt="priznanie.digital"
      />
    </a>
  )

  return (
    <header
      className="sdn-header sdn-header-1200 "
      role="banner"
      data-module="sdn-header"
    >
      <div className="sdn-header__container govuk-width-container ">
        {isLandingPage ? (
          logo
        ) : (
          <Link href="/" legacyBehavior>
            {logo}
          </Link>
        )}
        <Link
          href={router.asPath}
          locale={otherLocale}
          lang={otherLocale}
          aria-label={t('switchLanguageLabel')}
          className="language-switch"
        >
          {otherLocale === 'en' ? <FlagEn /> : <FlagSk />}
          {t('switchLanguage')}
        </Link>
      </div>
    </header>
  )
}

export default Header
