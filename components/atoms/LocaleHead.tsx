'use client'

import Head from 'next/head'
import { useLocale } from '@/contexts/LocaleContext'
import type { MessageKey } from '@/i18n/messages'

type LocaleHeadProps = {
  titleKey: MessageKey
  descriptionKey: MessageKey
}

export const LocaleHead = ({ titleKey, descriptionKey }: LocaleHeadProps) => {
  const { t } = useLocale()

  return (
    <Head>
      <title>{`${t(titleKey)} | Setlist Maker`}</title>
      <meta name="description" content={t(descriptionKey)} />
      <link rel="icon" href="favicon.ico" />
    </Head>
  )
}
