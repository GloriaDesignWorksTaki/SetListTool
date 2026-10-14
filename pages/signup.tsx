import SignupForm from '@/components/organisms/SignupForm'
import { LocaleHead } from '@/components/atoms/LocaleHead'

export default function SignupPage() {
  return (
    <main>
      <LocaleHead titleKey="meta.signupTitle" descriptionKey="meta.signupDescription" />
      <section>
        <div className="wrapper">
          <SignupForm />
        </div>
      </section>
    </main>
  )
}
