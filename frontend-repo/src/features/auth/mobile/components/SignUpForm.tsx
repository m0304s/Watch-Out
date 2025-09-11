import { MdFileUpload } from "react-icons/md"
import { useMemo, useState } from 'react'
import { css } from '@emotion/react'
import type { CompanyOption, FullBloodType, SignUpFormData } from '@/features/auth'

interface SignUpFormProps {
  onSubmit?: (data: SignUpFormData) => void
}

const BLOOD_TYPES: FullBloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const MOCK_COMPANIES: CompanyOption[] = [
  { companyUuid: 'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', companyName: '동규와 아이들' },
  { companyUuid: '11111111-2222-3333-4444-555555555555', companyName: '하하호호 즐거운 회사' },
  { companyUuid: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', companyName: '삼성전자' }
]

export const MobileSignUpForm = ({ onSubmit }: SignUpFormProps) => {
  const [form, setForm] = useState<SignUpFormData>({
    userId: '',
    password: '',
    userName: '',
    contact: '',
    emergencyContact: '',
    fullBloodType: 'A+',
    photoUrl: '',
    companyUuid: ''
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [companyQuery, setCompanyQuery] = useState('')

  const filteredCompanies = useMemo(() => {
    const q = companyQuery.trim().toLowerCase()
    if (!q) return MOCK_COMPANIES
    return MOCK_COMPANIES.filter(c => c.companyName.toLowerCase().includes(q))
  }, [companyQuery])

  const handleChange = (key: keyof SignUpFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }))
  }

  const handlePhoneChange = (key: 'contact' | 'emergencyContact') => (e: React.ChangeEvent<HTMLInputElement>) => {
    // 숫자만 허용, 최대 11자리. 한글 IME 합성 입력은 숫자필드라 영향 없음
    const raw = e.target.value
    const digits = raw.replace(/\D/g, '').slice(0, 11)
    setForm(prev => ({ ...prev, [key]: digits }))
  }

  const handleOpenCompanyModal = () => setShowCompanyModal(true)
  const handleCloseCompanyModal = () => setShowCompanyModal(false)
  const handleSelectCompany = (company: CompanyOption) => {
    setForm(prev => ({ ...prev, companyUuid: company.companyUuid }))
    setShowCompanyModal(false)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (form.password !== confirmPassword) {
      return
    }
    onSubmit?.(form)
  }

  const selectedCompanyName = useMemo(() => {
    const found = MOCK_COMPANIES.find(c => c.companyUuid === form.companyUuid)
    return found?.companyName ?? ''
  }, [form.companyUuid])

  return (
    <form onSubmit={handleSubmit} css={formStyles}>
      <div css={fieldStyles}>
        <label css={labelStyles} htmlFor="userId">ID</label>
        <input id="userId" placeholder="사용자 ID를 입력하세요" value={form.userId} onChange={handleChange('userId')} css={inputStyles} />
      </div>

      <div css={fieldStyles}>
        <div css={rowBetweenStyles}>
          <label css={labelStyles} htmlFor="password">비밀번호</label>
        </div>
        <input id="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange('password')} css={inputStyles} />
      </div>

      <div css={fieldStyles}>
        <label css={labelStyles} htmlFor="confirmPassword">비밀번호 확인</label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          css={inputStyles}
        />
        {confirmPassword && form.password !== confirmPassword && (
          <p css={helperErrorStyles}>비밀번호가 일치하지 않습니다.</p>
        )}
      </div>

      <div css={fieldStyles}>
        <label css={labelStyles} htmlFor="userName">이름</label>
        <input id="userName" placeholder="이름을 입력하세요" value={form.userName} onChange={handleChange('userName')} css={inputStyles} />
      </div>

      <div css={fieldStyles}>
        <label css={labelStyles} htmlFor="contact">연락처</label>
        <input
          id="contact"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="01012345678"
          value={form.contact}
          onChange={handlePhoneChange('contact')}
          css={inputStyles}
        />
        <p css={helperTextStyles}>숫자만 입력 (예: 01012345678)</p>
      </div>

      <div css={fieldStyles}>
        <label css={labelStyles} htmlFor="emergencyContact">비상연락처</label>
        <input
          id="emergencyContact"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="01087654321"
          value={form.emergencyContact}
          onChange={handlePhoneChange('emergencyContact')}
          css={inputStyles}
        />
      </div>

      <div css={fieldStyles}>
        <label css={labelStyles} htmlFor="bloodType">혈액형</label>
        <select id="bloodType" value={form.fullBloodType} onChange={handleChange('fullBloodType')} css={selectStyles}>
          {BLOOD_TYPES.map(bt => (
            <option key={bt} value={bt}>{bt}</option>
          ))}
        </select>
      </div>

      <div css={photoFieldStyles}>
        <div css={photoBoxStyles} aria-hidden><MdFileUpload /></div>
        <span css={photoTextStyles}>사진 업로드</span>
      </div>

      <div css={fieldStyles}>
        <label css={labelStyles}>회사명</label>
        <div css={companyRowStyles}>
          <input value={selectedCompanyName} placeholder="회사명을 입력하세요" readOnly css={companyInputStyles} />
          <button type="button" onClick={handleOpenCompanyModal} css={searchButtonStyles}>회사 검색</button>
        </div>
      </div>

      <button type="submit" css={submitButtonStyles} disabled={Boolean(confirmPassword && form.password !== confirmPassword)}>
        회원가입
      </button>

      {showCompanyModal && (
        <div role="dialog" aria-modal="true" css={modalOverlayStyles} onClick={handleCloseCompanyModal}>
          <div css={modalContentStyles} onClick={e => e.stopPropagation()}>
            <div css={modalHeaderStyles}>
              <span css={modalTitleStyles}>회사 검색</span>
              <button type="button" onClick={handleCloseCompanyModal} css={modalCloseStyles}>닫기</button>
            </div>
            <input autoFocus placeholder="회사명을 검색하세요" value={companyQuery} onChange={e => setCompanyQuery(e.target.value)} css={modalSearchInputStyles} />
            <div css={modalListStyles}>
              {filteredCompanies.map(c => (
                <button key={c.companyUuid} type="button" onClick={() => handleSelectCompany(c)} css={modalItemStyles}>
                  {c.companyName}
                </button>
              ))}
              {filteredCompanies.length === 0 && (
                <div css={emptyStyles}>검색 결과가 없습니다</div>
              )}
            </div>
          </div>
        </div>
      )}
    </form>
  )
}

const formStyles = css`
  padding: 16px;
  background-color: var(--color-text-white);
`

const fieldStyles = css`
  margin-bottom: 12px;
`

const labelStyles = css`
  display: block;
  margin-bottom: 8px;
  color: var(--color-gray-600);
  font-family: 'PretendardMedium', sans-serif;
  font-size: 14px;
`

const inputStyles = css`
  width: 100%;
  height: 56px;
  padding: 0 12px;
  border: 1px solid var(--color-gray-300);
  border-radius: 8px;
  background-color: var(--color-gray-50);
  font-family: 'PretendardRegular', sans-serif;
  font-size: 16px;
  color: var(--color-gray-800);

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-light);
  }
`

const helperTextStyles = css`
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-gray-600);
  font-family: 'PretendardRegular', sans-serif;
`

const helperErrorStyles = css`
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-red);
  font-family: 'PretendardRegular', sans-serif;
`

const selectStyles = css`
  width: 100%;
  height: 56px;
  padding: 0 12px;
  border: 1px solid var(--color-gray-300);
  border-radius: 8px;
  background-color: var(--color-gray-50);
  font-family: 'PretendardRegular', sans-serif;
  font-size: 16px;
  color: var(--color-gray-800);
`

const rowBetweenStyles = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const photoFieldStyles = css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid var(--color-gray-200);
  border-bottom: 1px solid var(--color-gray-200);
  margin: 12px 0;
`

const photoBoxStyles = css`
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  background-color: var(--color-gray-300);
  border-radius: 8px;
  color: var(--color-gray-700);
  font-size: 24px;
`

const photoTextStyles = css`
  font-family: 'PretendardMedium', sans-serif;
  color: var(--color-gray-700);
  font-size: 16px;
`

const companyRowStyles = css`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
`

const companyInputStyles = css`
  ${inputStyles}
  background-color: var(--color-gray-100);
`

const searchButtonStyles = css`
  padding: 0 12px;
  height: 56px;
  border: none;
  border-radius: 8px;
  background-color: var(--color-primary);
  color: var(--color-text-white);
  font-family: 'PretendardSemiBold', sans-serif;
  cursor: pointer;
`

const submitButtonStyles = css`
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 8px;
  background-color: var(--color-primary);
  color: var(--color-text-white);
  font-family: 'PretendardSemiBold', sans-serif;
  font-size: 16px;
  margin-top: 8px;
  cursor: pointer;
`

const modalOverlayStyles = css`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 50;
`

const modalContentStyles = css`
  width: 100%;
  max-width: 480px;
  background: var(--color-text-white);
  border-radius: 12px;
  padding: 16px;
`

const modalHeaderStyles = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`

const modalTitleStyles = css`
  font-family: 'PretendardSemiBold', sans-serif;
  color: var(--color-gray-900);
  font-size: 18px;
`

const modalCloseStyles = css`
  border: none;
  background: transparent;
  color: var(--color-gray-700);
  font-family: 'PretendardRegular', sans-serif;
  cursor: pointer;
`

const modalSearchInputStyles = css`
  ${inputStyles}
  height: 48px;
  margin-bottom: 12px;
`

const modalListStyles = css`
  max-height: 360px;
  overflow: auto;
  border: 1px solid var(--color-gray-200);
  border-radius: 8px;
`

const modalItemStyles = css`
  display: block;
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  background: var(--color-text-white);
  border: none;
  border-bottom: 1px solid var(--color-gray-200);
  font-family: 'PretendardRegular', sans-serif;
  cursor: pointer;

  &:hover {
    background: var(--color-gray-100);
  }
`

const emptyStyles = css`
  padding: 24px;
  text-align: center;
  color: var(--color-gray-600);
  font-family: 'PretendardRegular', sans-serif;
`


