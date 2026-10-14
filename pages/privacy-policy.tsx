'use client'

import Link from 'next/link'
import { LocaleHead } from '@/components/atoms/LocaleHead'
import { PrivacyPolicyContent } from '@/components/molecules/PrivacyPolicyContent'
import { useLocale } from '@/contexts/LocaleContext'

export default function PrivacyPolicyPage() {
  const { t } = useLocale()

  return (
    <main>
      <LocaleHead titleKey="meta.privacyTitle" descriptionKey="meta.privacyDescription" />
      <section>
        <div className="wrapper">
          <div className="privacy-policy-container">
            <h1>{t('privacy.title')}</h1>
            <PrivacyPolicyContent
              variant="full"
              headingLevel="h2"
              updateDateClassName="privacy-policy-update-date"
              sectionClassName="privacy-policy-section"
            />
            <div className="privacy-policy-back-link">
              <Link href="/signup">
                {t('privacy.backToSignup')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
