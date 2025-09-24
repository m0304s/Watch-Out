import { css } from '@emotion/react'
import { useEffect, useMemo, useState, useRef } from 'react'
import { MdFileUpload } from 'react-icons/md'
import type {
  CompanyOption,
  FullBloodType,
  SignUpFormData,
} from '@/features/auth'
import { getCompanies, uploadProfileImage } from '@/features/auth/api/auth'
import { useToast } from '@/hooks/useToast'

interface SignUpFormProps {
  onSubmit?: (data: SignUpFormData) => void
  loading?: boolean
}

const BLOOD_TYPES: FullBloodType[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
]

export const MobileSignUpForm = ({
  onSubmit,
  loading = false,
}: SignUpFormProps) => {
  const [form, setForm] = useState<SignUpFormData>({
    userId: '',
    password: '',
    userName: '',
    contact: '',
    emergencyContact: '',
    fullBloodType: 'A+',
    photoUrl: '',
    companyUuid: '',
    gender: 'MALE',
  })
  const toast = useToast()
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [companyQuery, setCompanyQuery] = useState('')
  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [companiesLoading, setCompaniesLoading] = useState(false)
  const [companiesError, setCompaniesError] = useState<string | null>(null)

  // 이미지 업로드 관련 상태
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 회사 목록 조회 (모달 오픈 시에만)
  const fetchCompanies = async () => {
    setCompaniesLoading(true)
    setCompaniesError(null)
    try {
      const list = await getCompanies()
      setCompanies(list)
    } catch (error) {
      console.error('회사 목록 조회 실패:', error)
      setCompaniesError('회사 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setCompaniesLoading(false)
    }
  }

  useEffect(() => {
    if (showCompanyModal && companies.length === 0 && !companiesLoading) {
      void fetchCompanies()
    }
  }, [showCompanyModal])

  const filteredCompanies = useMemo(() => {
    const q = companyQuery.trim().toLowerCase()
    if (!q) return companies
    return companies.filter((c) => c.companyName.toLowerCase().includes(q))
  }, [companyQuery, companies])

  const handleChange =
    (key: keyof SignUpFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
    }

  const handlePhoneChange =
    (key: 'contact' | 'emergencyContact') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // 숫자만 허용, 최대 11자리. 한글 IME 합성 입력은 숫자필드라 영향 없음
      const raw = e.target.value
      const digits = raw.replace(/\D/g, '').slice(0, 11)
      setForm((prev) => ({ ...prev, [key]: digits }))
    }

  const handleOpenCompanyModal = () => setShowCompanyModal(true)
  const handleCloseCompanyModal = () => setShowCompanyModal(false)
  const handleSelectCompany = (company: CompanyOption) => {
    setForm((prev) => ({ ...prev, companyUuid: company.companyUuid }))
    setShowCompanyModal(false)
  }

  // 이미지 선택 핸들러
  const handleImageSelect = () => {
    fileInputRef.current?.click()
  }

  // 파일 변경 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 이미지 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      toast.info('이미지 파일만 업로드 가능합니다.')
      return
    }

    // 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      toast.info('파일 크기는 10MB 이하여야 합니다.')
      return
    }

    setSelectedImage(file)

    // 이미지 미리보기 생성
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // 이미지 제거 핸들러
  const handleImageRemove = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setForm((prev) => ({ ...prev, photoUrl: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (form.password !== confirmPassword) {
      return
    }

    // 이미지가 선택되었지만 아직 업로드되지 않은 경우
    if (selectedImage && !form.photoUrl) {
      setImageUploading(true)
      try {
        const uploadedImageUrl = await uploadProfileImage(selectedImage)
        const updatedForm = { ...form, photoUrl: uploadedImageUrl }
        onSubmit?.(updatedForm)
      } catch (error) {
        console.error('이미지 업로드 실패:', error)
        toast.error('이미지 업로드에 실패했습니다. 다시 시도해주세요.')
      } finally {
        setImageUploading(false)
      }
    } else {
      // 이미지가 없거나 이미 업로드된 경우
      onSubmit?.(form)
    }
  }

  const selectedCompanyName = useMemo(() => {
    const found = companies.find(
      (c: CompanyOption) => c.companyUuid === form.companyUuid,
    )
    return found?.companyName ?? ''
  }, [form.companyUuid, companies])

  return (
    <form onSubmit={handleSubmit} css={formStyles}>
      <div css={fieldStyles}>
        <label css={labelStyles} htmlFor="userId">
          ID
        </label>
        <input
          id="userId"
          placeholder="사용자 ID를 입력하세요"
          value={form.userId}
          onChange={handleChange('userId')}
          css={inputStyles}
        />
      </div>

      <div css={fieldStyles}>
        <div css={rowBetweenStyles}>
          <label css={labelStyles} htmlFor="password">
            비밀번호
          </label>
        </div>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange('password')}
          css={inputStyles}
        />
      </div>

      <div css={fieldStyles}>
        <label css={labelStyles} htmlFor="confirmPassword">
          비밀번호 확인
        </label>
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
        <label css={labelStyles} htmlFor="userName">
          이름
        </label>
        <input
          id="userName"
          placeholder="이름을 입력하세요"
          value={form.userName}
          onChange={handleChange('userName')}
          css={inputStyles}
        />
      </div>

      <div css={fieldStyles}>
        <label css={labelStyles} htmlFor="contact">
          연락처
        </label>
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
        <label css={labelStyles} htmlFor="emergencyContact">
          비상연락처
        </label>
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
        <label css={labelStyles} htmlFor="bloodType">
          혈액형
        </label>
        <select
          id="bloodType"
          value={form.fullBloodType}
          onChange={handleChange('fullBloodType')}
          css={selectStyles}
        >
          {BLOOD_TYPES.map((bt) => (
            <option key={bt} value={bt}>
              {bt}
            </option>
          ))}
        </select>
      </div>

      <div css={fieldStyles}>
        <label css={labelStyles} htmlFor="gender">
          성별
        </label>
        <select
          id="gender"
          value={form.gender}
          onChange={handleChange('gender')}
          css={selectStyles}
        >
          <option value="MALE">남자</option>
          <option value="FEMALE">여자</option>
        </select>
      </div>

      <div css={photoFieldStyles}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {imagePreview ? (
          <div css={photoPreviewContainerStyles}>
            <img
              src={imagePreview}
              alt="프로필 미리보기"
              css={photoPreviewStyles}
            />
            <div css={photoActionsStyles}>
              <button
                type="button"
                onClick={handleImageSelect}
                css={photoChangeButtonStyles}
              >
                변경
              </button>
              <button
                type="button"
                onClick={handleImageRemove}
                css={photoRemoveButtonStyles}
              >
                제거
              </button>
            </div>
          </div>
        ) : (
          <div css={photoUploadAreaStyles} onClick={handleImageSelect}>
            <div css={photoBoxStyles}>
              <MdFileUpload />
            </div>
            <span css={photoTextStyles}>사진 업로드</span>
          </div>
        )}
      </div>

      <div css={fieldStyles}>
        <label css={labelStyles}>회사명</label>
        <div css={companyRowStyles}>
          <input
            value={selectedCompanyName}
            placeholder="회사명을 입력하세요"
            readOnly
            css={companyInputStyles}
          />
          <button
            type="button"
            onClick={handleOpenCompanyModal}
            css={searchButtonStyles}
          >
            회사 검색
          </button>
        </div>
      </div>

      <button
        type="submit"
        css={submitButtonStyles}
        disabled={
          loading ||
          imageUploading ||
          Boolean(confirmPassword && form.password !== confirmPassword)
        }
      >
        {imageUploading
          ? '이미지 업로드 중...'
          : loading
            ? '회원가입 중...'
            : '회원가입'}
      </button>

      {showCompanyModal && (
        <div
          role="dialog"
          aria-modal="true"
          css={modalOverlayStyles}
          onClick={handleCloseCompanyModal}
        >
          <div css={modalContentStyles} onClick={(e) => e.stopPropagation()}>
            <div css={modalHeaderStyles}>
              <span css={modalTitleStyles}>회사 검색</span>
              <button
                type="button"
                onClick={handleCloseCompanyModal}
                css={modalCloseStyles}
              >
                닫기
              </button>
            </div>
            <input
              autoFocus
              placeholder="회사명을 검색하세요"
              value={companyQuery}
              onChange={(e) => setCompanyQuery(e.target.value)}
              css={modalSearchInputStyles}
            />
            <div css={modalListStyles}>
              {companiesLoading ? (
                <div css={emptyStyles}>회사 목록을 불러오는 중...</div>
              ) : companiesError ? (
                <div css={errorStyles}>{companiesError}</div>
              ) : (
                <>
                  {filteredCompanies.map((c) => (
                    <button
                      key={c.companyUuid}
                      type="button"
                      onClick={() => handleSelectCompany(c)}
                      css={modalItemStyles}
                    >
                      {c.companyName}
                    </button>
                  ))}
                  {filteredCompanies.length === 0 && (
                    <div css={emptyStyles}>검색 결과가 없습니다</div>
                  )}
                </>
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
  padding: 12px 0;
  border-top: 1px solid var(--color-gray-200);
  border-bottom: 1px solid var(--color-gray-200);
  margin: 12px 0;
`

const photoUploadAreaStyles = css`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
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

const photoPreviewContainerStyles = css`
  display: flex;
  align-items: center;
  gap: 12px;
`

const photoPreviewStyles = css`
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--color-gray-300);
`

const photoActionsStyles = css`
  display: flex;
  gap: 8px;
`

const photoChangeButtonStyles = css`
  padding: 8px 12px;
  border: 1px solid var(--color-primary);
  border-radius: 6px;
  background-color: transparent;
  color: var(--color-primary);
  font-family: 'PretendardMedium', sans-serif;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background-color: var(--color-primary-light);
  }
`

const photoRemoveButtonStyles = css`
  padding: 8px 12px;
  border: 1px solid var(--color-gray-400);
  border-radius: 6px;
  background-color: transparent;
  color: var(--color-gray-600);
  font-family: 'PretendardMedium', sans-serif;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background-color: var(--color-gray-100);
  }
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

const errorStyles = css`
  padding: 24px;
  text-align: center;
  color: var(--color-red);
  font-family: 'PretendardRegular', sans-serif;
`
