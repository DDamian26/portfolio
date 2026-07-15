import AccentText from './AccentText'
import Badge from './Badge'
import Reveal from './Reveal'
import { useLanguage } from '../i18n/LanguageContext'

// Badge + headline (with **marked** words highlighted) + optional subtitle,
// all pulled from the translations file for the given section key.
export default function SectionHeading({ section, align = 'center' }) {
  const { t } = useLanguage()
  const alignClass = align === 'center' ? 'items-center text-center' : 'items-start text-left'

  return (
    <Reveal className={`flex flex-col gap-5 ${alignClass}`}>
      <Badge>{t(`${section}.badge`)}</Badge>
      <h2 className="max-w-3xl text-4xl font-extrabold tracking-tight text-heading sm:text-5xl">
        <AccentText text={t(`${section}.title`)} />
      </h2>
      {t(`${section}.subtitle`) && (
        <p className="max-w-xl text-lg leading-relaxed">{t(`${section}.subtitle`)}</p>
      )}
    </Reveal>
  )
}
