import ForgotPasswordForm from '@/components/organisms/ForgotPasswordForm'
import { LocaleHead } from '@/components/atoms/LocaleHead'

export default function ForgotPasswordPage() {
  return (
    <main>
      <LocaleHead titleKey="meta.forgotTitle" descriptionKey="meta.forgotDescription" />
      <section>
        <div className="wrapper">
          <ForgotPasswordForm />
        </div>
      </section>
    </main>
  )
}
