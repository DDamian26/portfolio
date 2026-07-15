import { useLanguage } from '../i18n/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="border-t border-border-warm">
      <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted sm:flex-row">
        <div className="flex flex-col gap-1 text-center sm:text-left">
          <span>{t('footer.rights')}</span>
          <span>{t('footer.tagline')}</span>
        </div>
        <a href="#top" className="font-semibold text-body transition-colors hover:text-accent">
          {t('footer.backToTop')} ↑
        </a>
      </div>
    </footer>
  )
}
