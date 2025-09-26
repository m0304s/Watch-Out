import { useEffect, useState } from 'react'
import { css } from '@emotion/react'
import { getWorkerDetail } from '@/features/worker/api/workerApi'
import { DetailModal } from '@/components/common/Modal'
import type {
  WorkerDetail,
  TrainingStatus,
  Gender,
  UserRole,
} from '@/features/worker/types'

interface WorkerDetailModalProps {
  userUuid: string | null
  isOpen: boolean
  onClose: () => void
}

// 유틸리티 함수들
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatBloodType = (bloodType: string, rhFactor: string): string => {
  const rhSymbol = rhFactor === 'PLUS' ? '+' : '-'
  return `${bloodType}${rhSymbol}`
}

const getGenderLabel = (gender: Gender): string => {
  return gender === 'MALE' ? '남성' : '여성'
}

const getTrainingStatusLabel = (status: TrainingStatus): string => {
  const labels = {
    COMPLETED: '교육완료',
    EXPIRED: '만료',
    NOT_COMPLETED: '미이수',
  }
  return labels[status]
}

const getRoleLabel = (role: UserRole): string => {
  return role === 'AREA_ADMIN' ? '현장 관리자' : '작업자'
}

const getTrainingStatusColor = (status: TrainingStatus): string => {
  switch (status) {
    case 'COMPLETED':
      return 'var(--color-green)'
    case 'EXPIRED':
      return 'var(--color-red)'
    case 'NOT_COMPLETED':
      return 'var(--color-yellow)'
    default:
      return 'var(--color-gray-500)'
  }
}

export const WorkerDetailModal = ({
  userUuid,
  isOpen,
  onClose,
}: WorkerDetailModalProps) => {
  const [workerDetail, setWorkerDetail] = useState<WorkerDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && userUuid) {
      fetchWorkerDetail()
    } else {
      setWorkerDetail(null)
      setError(null)
    }
  }, [isOpen, userUuid])

  const fetchWorkerDetail = async () => {
    if (!userUuid) return

    setLoading(true)
    setError(null)

    try {
      const detail = await getWorkerDetail(userUuid)
      setWorkerDetail(detail)
    } catch (err) {
      console.error('작업자 상세 정보 조회 실패:', err)
      setError('작업자 정보를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title="작업자 상세 정보"
      loading={loading}
      error={error}
      onRetry={fetchWorkerDetail}
    >
      {workerDetail && (
        <div css={modalStyles.detailContainer}>
          {/* 프로필 섹션 */}
          <div css={modalStyles.profileSection}>
            <img
              src={workerDetail.photoUrl}
              alt={`${workerDetail.userName} 사진`}
              css={modalStyles.profileImage}
            />
            <div css={modalStyles.profileInfo}>
              <h3 css={modalStyles.userName}>{workerDetail.userName}</h3>
              <p css={modalStyles.userId}>사번: {workerDetail.userId}</p>
              <div css={modalStyles.badges}>
                <span css={modalStyles.roleBadge(workerDetail.userRole)}>
                  {getRoleLabel(workerDetail.userRole)}
                </span>
                <span
                  css={modalStyles.statusBadge}
                  style={{
                    color: getTrainingStatusColor(workerDetail.trainingStatus),
                  }}
                >
                  {getTrainingStatusLabel(workerDetail.trainingStatus)}
                </span>
              </div>
            </div>
          </div>

          {/* 기본 정보 섹션 */}
          <div css={modalStyles.section}>
            <h4 css={modalStyles.sectionTitle}>기본 정보</h4>
            <div css={modalStyles.infoGrid}>
              <div css={modalStyles.infoItem}>
                <span css={modalStyles.infoLabel}>회사명</span>
                <span css={modalStyles.infoValue}>
                  {workerDetail.companyName}
                </span>
              </div>
              <div css={modalStyles.infoItem}>
                <span css={modalStyles.infoLabel}>작업 구역</span>
                <span css={modalStyles.infoValue}>{workerDetail.areaName}</span>
              </div>
              <div css={modalStyles.infoItem}>
                <span css={modalStyles.infoLabel}>성별</span>
                <span css={modalStyles.infoValue}>
                  {getGenderLabel(workerDetail.gender)}
                </span>
              </div>
              <div css={modalStyles.infoItem}>
                <span css={modalStyles.infoLabel}>혈액형</span>
                <span css={modalStyles.infoValue}>
                  {formatBloodType(
                    workerDetail.bloodType,
                    workerDetail.rhFactor,
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* 연락처 정보 섹션 */}
          <div css={modalStyles.section}>
            <h4 css={modalStyles.sectionTitle}>연락처 정보</h4>
            <div css={modalStyles.infoGrid}>
              <div css={modalStyles.infoItem}>
                <span css={modalStyles.infoLabel}>연락처</span>
                <span css={modalStyles.infoValue}>{workerDetail.contact}</span>
              </div>
              <div css={modalStyles.infoItem}>
                <span css={modalStyles.infoLabel}>비상 연락처</span>
                <span css={modalStyles.infoValue}>
                  {workerDetail.emergencyContact}
                </span>
              </div>
            </div>
          </div>

          {/* 교육 및 배정 정보 섹션 */}
          <div css={modalStyles.section}>
            <h4 css={modalStyles.sectionTitle}>교육 및 배정 정보</h4>
            <div css={modalStyles.infoGrid}>
              <div css={modalStyles.infoItem}>
                <span css={modalStyles.infoLabel}>교육 이수 여부</span>
                <span
                  css={modalStyles.infoValue}
                  style={{
                    color: getTrainingStatusColor(workerDetail.trainingStatus),
                  }}
                >
                  {getTrainingStatusLabel(workerDetail.trainingStatus)}
                </span>
              </div>
              {workerDetail.trainingCompletedAt && (
                <div css={modalStyles.infoItem}>
                  <span css={modalStyles.infoLabel}>교육 완료일</span>
                  <span css={modalStyles.infoValue}>
                    {formatDate(workerDetail.trainingCompletedAt)}
                  </span>
                </div>
              )}
              <div css={modalStyles.infoItem}>
                <span css={modalStyles.infoLabel}>워치 번호</span>
                <span css={modalStyles.infoValue}>{workerDetail.watchId}</span>
              </div>
              <div css={modalStyles.infoItem}>
                <span css={modalStyles.infoLabel}>배정일</span>
                <span css={modalStyles.infoValue}>
                  {formatDate(workerDetail.assignedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </DetailModal>
  )
}

const modalStyles = {
  detailContainer: css`
    padding: 24px;
  `,
  profileSection: css`
    display: flex;
    gap: 20px;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--color-gray-200);
  `,
  profileImage: css`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    background-color: var(--color-gray-200);
    flex-shrink: 0;
  `,
  profileInfo: css`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  userName: css`
    margin: 0;
    font-family: 'PretendardSemiBold', sans-serif;
    font-size: 20px;
    color: var(--color-gray-900);
  `,
  userId: css`
    margin: 0;
    font-family: 'PretendardRegular', sans-serif;
    font-size: 14px;
    color: var(--color-gray-600);
  `,
  badges: css`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  `,
  roleBadge: (role: UserRole) => css`
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-family: 'PretendardMedium', sans-serif;
    background-color: ${role === 'AREA_ADMIN'
      ? 'var(--color-primary-light)'
      : 'var(--color-gray-100)'};
    color: ${role === 'AREA_ADMIN'
      ? 'var(--color-primary)'
      : 'var(--color-gray-700)'};
  `,
  statusBadge: css`
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-family: 'PretendardMedium', sans-serif;
    background-color: var(--color-gray-100);
  `,
  section: css`
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }
  `,
  sectionTitle: css`
    margin: 0 0 16px 0;
    font-family: 'PretendardSemiBold', sans-serif;
    font-size: 16px;
    color: var(--color-gray-900);
  `,
  infoGrid: css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  `,
  infoItem: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
  `,
  infoLabel: css`
    font-family: 'PretendardMedium', sans-serif;
    font-size: 12px;
    color: var(--color-gray-600);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `,
  infoValue: css`
    font-family: 'PretendardRegular', sans-serif;
    font-size: 14px;
    color: var(--color-gray-900);
  `,
}
