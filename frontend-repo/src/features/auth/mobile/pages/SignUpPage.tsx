import { css } from '@emotion/react'
import { MobileHeader } from '@/components/mobile/MobileHeader'
import { MobileSignUpForm } from '@/features/auth/mobile/components/SignUpForm'
import type { SignUpFormData } from '@/features/auth'

export const MobileSignUpPage = () => {
  const handleSubmit = (data: SignUpFormData) => {
    console.log('SignUp form submitted (mock):', data)
  }

  return (
    <div css={pageStyles}>
      <MobileHeader title="회원가입" showBack backTo="/login" />
      <main css={mainStyles}>
        <MobileSignUpForm onSubmit={handleSubmit} />
      </main>
    </div>
  )
}

const pageStyles = css`
  min-height: 100dvh;
  background-color: var(--color-gray-50);
`

const mainStyles = css`
  max-width: 480px;
  margin: 0 auto;
`


