import { css } from '@emotion/react'
import React, { useState } from 'react'

import type { LoginFormData } from '@/features/auth/types'

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void
  loading?: boolean
}

export const LoginForm = ({ onSubmit, loading = false }: LoginFormProps) => {
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

  return (
    <div
      css={css`
        width: 400px;
        background-color: var(--color-bg-white);
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      `}
    >
      <form onSubmit={handleSubmit}>
        <div
          css={css`
            margin-bottom: 24px;
          `}
        >
          <input
            type="text"
            placeholder="ID"
            value={formData.id}
            onChange={handleInputChange('id')}
            disabled={loading}
            css={css`
              width: 100%;
              height: 60px;
              padding: 20px;
              border: 1px solid var(--color-gray-300);
              border-radius: 8px;
              font-size: 16px;
              color: var(--color-gray-800);
              background-color: var(--color-bg-white);
              &::placeholder {
                color: var(--color-gray-500);
              }
              &:focus {
                border-color: var(--color-primary);
                box-shadow: 0 0 0 3px var(--color-primary-light);
              }
            `}
          />
        </div>

        <div
          css={css`
            margin-bottom: 24px;
          `}
        >
          <div
            css={css`
              position: relative;
            `}
          >
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호"
              value={formData.password}
              onChange={handleInputChange('password')}
              disabled={loading}
              css={css`
                width: 100%;
                height: 60px;
                padding: 20px;
                border: 1px solid var(--color-gray-300);
                border-radius: 8px;
                font-size: 16px;
                color: var(--color-gray-800);
                background-color: var(--color-bg-white);
                &::placeholder {
                  color: var(--color-gray-500);
                }
                &:focus {
                  border-color: var(--color-primary);
                  box-shadow: 0 0 0 3px var(--color-primary-light);
                }
              `}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              disabled={loading}
              css={css`
                position: absolute;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                font-size: 20px;
                color: var(--color-gray-500);
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 20px;
                height: 20px;
              `}
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !formData.id || !formData.password}
          css={css`
            width: 100%;
            height: 60px;
            background-color: var(--color-primary);
            color: var(--color-text-white);
            border-radius: 8px;
            font-family: 'PretendardSemiBold', sans-serif;
            font-size: 18px;
            font-weight: 600;
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
          `}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  )
}
