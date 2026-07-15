import { useLanguage } from '../i18n/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="border-t border-border-warm">
      <p className="mx-auto max-w-[1100px] px-6 py-8 text-center text-sm text-muted">
        {t('footer.rights')} <span aria-hidden="true">·</span> {t('footer.signoff')}
      </p>
    </footer>
  )
}
