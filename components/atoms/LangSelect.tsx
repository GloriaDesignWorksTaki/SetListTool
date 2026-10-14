'use client'

import { useLocale } from '@/contexts/LocaleContext'
import type { Locale } from '@/i18n/types'

type LangSelectProps = {
  /** auth 画面などヘッダーがないときに右上固定 */
  floating?: boolean
}

const OPTIONS: { value: Locale; label: string }[] = [
  { value: 'ja', label: 'JA' },
  { value: 'en', label: 'EN' },
]

export const LangSelect = ({ floating = false }: LangSelectProps) => {
  const { locale, setLocale, t } = useLocale()
  const activeIndex = OPTIONS.findIndex((option) => option.value === locale)

  return (
    <div
      className={`langToggle${floating ? ' langToggleFloating' : ''}`}
      role="group"
      aria-label={t('lang.label')}
    >
      <span
        className="langToggleThumb"
        aria-hidden="true"
        style={{
          transform: `translateX(${Math.max(activeIndex, 0) * 100}%)`,
        }}
      />
      {OPTIONS.map(({ value, label }) => {
        const active = locale === value
        return (
          <button
            key={value}
            type="button"
            className={`langToggleOption${active ? ' isActive' : ''}`}
            aria-pressed={active}
            aria-label={value === 'ja' ? t('lang.ja') : t('lang.en')}
            onClick={() => setLocale(value)}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
