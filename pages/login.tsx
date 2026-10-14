import { LoginWithWelcome } from '@/components/organisms/LoginWithWelcome'
import { LocaleHead } from '@/components/atoms/LocaleHead'

export default function LoginPage() {
  return (
    <main>
      <LocaleHead titleKey="meta.loginTitle" descriptionKey="meta.loginDescription" />
      <section>
        <div className="wrapper">
          <LoginWithWelcome />
        </div>
      </section>
    </main>
  )
}
