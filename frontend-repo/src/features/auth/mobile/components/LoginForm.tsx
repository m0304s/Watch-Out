import { css } from '@emotion/react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { LoginFormData } from '@/features/auth/types'
import { Button } from '@/components/common/Button'

interface MobileLoginFormProps {
  onSubmit: (data: LoginFormData) => void
  loading?: boolean
}

export const MobileLoginForm = ({
  onSubmit,
  loading = false,
}: MobileLoginFormProps) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<LoginFormData>({
    id: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange =
    (field: keyof LoginFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }))
    }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (formData.id && formData.password) {
      onSubmit(formData)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const handleSignUpClick = () => {
    navigate('/signup')
  }

  return (
    <div css={containerStyles}>
      <form onSubmit={handleSubmit}>
        <div css={fieldStyles}>
          <input
            type="text"
            inputMode="text"
            autoComplete="username"
            placeholder="ID"
            value={formData.id}
            onChange={handleInputChange('id')}
            disabled={loading}
            css={inputStyles}
          />
        </div>

        <div css={fieldStyles}>
          <div css={passwordWrapperStyles}>
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="비밀번호"
              value={formData.password}
              onChange={handleInputChange('password')}
              disabled={loading}
              css={inputStyles}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              disabled={loading}
              css={toggleButtonStyles}
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !formData.id || !formData.password}
          css={submitButtonStyles}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div css={signUpSectionStyles}>
        <button
          type="button"
          onClick={handleSignUpClick}
          disabled={loading}
          css={signUpButtonStyles}
        >
          회원가입
        </button>
      </div>
    </div>
  )
}

const containerStyles = css`
  width: 100%;
  max-width: 420px;
  background-color: var(--color-bg-white);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  @media (min-width: 768px) {
    padding: 32px;
  }
`

const fieldStyles = css`
  margin-bottom: 16px;

  @media (min-width: 768px) {
    margin-bottom: 20px;
  }
`

const inputStyles = css`
  width: 100%;
  height: 52px;
  padding: 16px 16px;
  border: 1px solid var(--color-gray-300);
  border-radius: 10px;
  font-size: 16px;
  color: var(--color-gray-800);
  background-color: var(--color-bg-white);
  font-family: 'PretendardRegular', sans-serif;

  &::placeholder {
    color: var(--color-gray-500);
  }
  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-light);
    outline: none;
  }

  @media (min-width: 768px) {
    height: 56px;
  }
`

const passwordWrapperStyles = css`
  position: relative;
`

const toggleButtonStyles = css`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 18px;
  color: var(--color-gray-500);
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`

const submitButtonStyles = css`
  width: 100%;
  height: 56px;
  background-color: var(--color-primary);
  color: var(--color-text-white);
  border: none;
  border-radius: 10px;
  font-family: 'PretendardSemiBold', sans-serif;
  font-size: 18px;
  transition:
    opacity 0.2s ease,
    transform 0.05s ease;

  &:hover {
    opacity: 0.9;
  }
  &:active {
    transform: translateY(1px);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const signUpSectionStyles = css`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--color-gray-200);
  text-align: center;
`

const signUpButtonStyles = css`
  width: 100%;
  height: 48px;
  background-color: transparent;
  color: var(--color-gray-600);
  border: 1px solid var(--color-gray-300);
  border-radius: 10px;
  font-family: 'PretendardMedium', sans-serif;
  font-size: 16px;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--color-gray-50);
    border-color: var(--color-gray-400);
  }
  &:active {
    transform: translateY(1px);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`
