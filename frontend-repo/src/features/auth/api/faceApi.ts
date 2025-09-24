import { api } from '@/api/client'
import type {
  FacePresignedUrlRequest,
  FacePresignedUrlResponse,
  FacePhotos,
  FaceRegistrationError,
} from '@/features/auth/types'

// 얼굴 사진 presigned URL 요청 API
export const getFacePresignedUrls = async (
  fileNames: string[],
): Promise<FacePresignedUrlResponse[]> => {
  const request: FacePresignedUrlRequest = { fileNames }
  const response = await api.post<FacePresignedUrlResponse[]>(
    '/s3/faces/presigned-url',
    request,
  )
  return response.data
}

// S3에 얼굴 이미지 업로드 함수
export const uploadFaceImageToS3 = async (
  uploadUrl: string,
  file: File,
): Promise<void> => {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  })

  if (!response.ok) {
    throw new Error(`S3 업로드 실패: ${response.status} ${response.statusText}`)
  }
}

// 얼굴 이미지 업로드 전체 프로세스
export const uploadFaceImages = async (
  files: FacePhotos,
): Promise<string[]> => {
  try {
    // 파일 유효성 검사
    if (!files.front || !files.left || !files.right) {
      const error: FaceRegistrationError = {
        code: 'INVALID_FILE',
        message: '모든 사진을 촬영해주세요.',
      }
      throw error
    }

    const fileNames = ['front.jpg', 'left.jpg', 'right.jpg']

    // 1. presigned URL 요청
    const presignedUrls = await getFacePresignedUrls(fileNames)

    // 2. S3에 이미지들 업로드
    const uploadPromises = [
      uploadFaceImageToS3(presignedUrls[0].uploadUrl, files.front),
      uploadFaceImageToS3(presignedUrls[1].uploadUrl, files.left),
      uploadFaceImageToS3(presignedUrls[2].uploadUrl, files.right),
    ]

    await Promise.all(uploadPromises)

    // 3. 업로드된 파일들의 URL 반환
    return presignedUrls.map((url) => url.fileUrl)
  } catch (error) {
    console.error('얼굴 이미지 업로드 실패:', error)

    // 이미 FaceRegistrationError인 경우 그대로 throw
    if (error && typeof error === 'object' && 'code' in error) {
      throw error
    }

    // 네트워크 에러 처리
    const faceError: FaceRegistrationError = {
      code: 'NETWORK_ERROR',
      message: '네트워크 오류가 발생했습니다. 다시 시도해주세요.',
      details: { originalError: error },
    }
    throw faceError
  }
}

export const faceApi = {
  getFacePresignedUrls,
  uploadFaceImageToS3,
  uploadFaceImages,
}

export default faceApi
