import ResetPasswordForm from '@/components/organisms/ResetPasswordForm'
import { LocaleHead } from '@/components/atoms/LocaleHead'

export default function ResetPasswordPage() {
  return (
    <main>
      <LocaleHead titleKey="meta.resetTitle" descriptionKey="meta.resetDescription" />
      <section>
        <div className="wrapper">
          <ResetPasswordForm />
        </div>
      </section>
    </main>
  )
}
