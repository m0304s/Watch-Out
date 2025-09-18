import { css } from '@emotion/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileHeader } from '@/components/mobile/MobileHeader'
import { MobileSignUpForm } from '@/features/auth/mobile/components/SignUpForm'
import { signup } from '@/features/auth/api/auth'
import type {
  SignUpFormData,
  ABOType,
  RhFactor,
  SignUpRequest,
} from '@/features/auth'

export const MobileSignUpPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // FullBloodType을 ABOType과 RhFactor로 분리하는 함수
  const parseBloodType = (
    fullBloodType: string,
  ): { bloodType: ABOType; rhFactor: RhFactor } => {
    const bloodType = fullBloodType.slice(0, -1) as ABOType
    const sign = fullBloodType.slice(-1)
    const rhFactor: RhFactor = sign === '+' ? 'PLUS' : 'MINUS'
    return { bloodType, rhFactor }
  }

  const handleSubmit = async (data: SignUpFormData) => {
    setLoading(true)

    try {
      const { bloodType, rhFactor } = parseBloodType(data.fullBloodType)

      const signupRequest: SignUpRequest = {
        userId: data.userId,
        password: data.password,
        userName: data.userName,
        contact: data.contact,
        emergencyContact: data.emergencyContact,
        bloodType,
        rhFactor,
        photoUrl: data.photoUrl, // 실제 업로드된 이미지 URL 사용
        companyUuid: data.companyUuid,
        gender: data.gender,
      }

      const response = await signup(signupRequest)

      if (response.success) {
        alert('회원가입이 완료되었습니다!')
        // 얼굴 사진 등록 페이지로 이동
        navigate('/face-registration')
      } else {
        alert(response.message || '회원가입에 실패했습니다.')
      }
    } catch (error) {
      console.error('회원가입 실패:', error)
      alert('회원가입 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div css={pageStyles}>
      <MobileHeader title="회원가입" showBack backTo="/login" />
      <main css={mainStyles}>
        <MobileSignUpForm onSubmit={handleSubmit} loading={loading} />
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
