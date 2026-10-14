'use client'

import { useLocale } from '@/contexts/LocaleContext'

type PrivacyPolicyContentProps = {
  /** モーダル用は短く、ページ用は全セクション */
  variant?: 'short' | 'full'
  headingLevel?: 'h2' | 'h3'
  className?: string
  updateDateClassName?: string
  sectionClassName?: string
}

export const PrivacyPolicyContent = ({
  variant = 'full',
  headingLevel = 'h3',
  className,
  updateDateClassName,
  sectionClassName,
}: PrivacyPolicyContentProps) => {
  const { locale, t } = useLocale()
  const Heading = headingLevel
  const date = new Date().toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US')

  return (
    <div className={className}>
      <p className={updateDateClassName}>
        {t('privacy.lastUpdated', { date })}
      </p>

      <div className={sectionClassName}>
        <Heading>{t('privacy.s1.title')}</Heading>
        <p>{t('privacy.s1.body')}</p>
      </div>

      <div className={sectionClassName}>
        <Heading>{t('privacy.s2.title')}</Heading>
        <p>{t('privacy.s2.intro')}</p>
        <ul>
          <li>{t('privacy.s2.item1')}</li>
          <li>{t('privacy.s2.item2')}</li>
          <li>{t('privacy.s2.item3')}</li>
          <li>{t('privacy.s2.item4')}</li>
          <li>{t('privacy.s2.item5')}</li>
        </ul>
      </div>

      <div className={sectionClassName}>
        <Heading>{t('privacy.s3.title')}</Heading>
        <p>{t('privacy.s3.intro')}</p>
        <ul>
          <li>{t('privacy.s3.item1')}</li>
          <li>{t('privacy.s3.item2')}</li>
          <li>{t('privacy.s3.item3')}</li>
          <li>{t('privacy.s3.item4')}</li>
        </ul>
      </div>

      <div className={sectionClassName}>
        <Heading>{t('privacy.s4.title')}</Heading>
        <p>{t('privacy.s4.body')}</p>
      </div>

      <div className={sectionClassName}>
        <Heading>{t('privacy.s5.title')}</Heading>
        <p>{t('privacy.s5.body')}</p>
      </div>

      {variant === 'full' && (
        <>
          <div className={sectionClassName}>
            <Heading>{t('privacy.s6.title')}</Heading>
            <p>{t('privacy.s6.intro')}</p>
            <ul>
              <li>{t('privacy.s6.item1')}</li>
              <li>{t('privacy.s6.item2')}</li>
            </ul>
            <p>{t('privacy.s6.outro')}</p>
          </div>

          <div className={sectionClassName}>
            <Heading>{t('privacy.s7.title')}</Heading>
            <p>{t('privacy.s7.body')}</p>
          </div>

          <div className={sectionClassName}>
            <Heading>{t('privacy.s8.title')}</Heading>
            <p>{t('privacy.s8.body')}</p>
          </div>

          <div className={sectionClassName}>
            <Heading>{t('privacy.s9.title')}</Heading>
            <p>{t('privacy.s9.body')}</p>
          </div>
        </>
      )}
    </div>
  )
}
