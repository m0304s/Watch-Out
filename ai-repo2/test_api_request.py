import requests
import json

# ===================================================================
# ⭐️ 여기에 준비한 값으로 꼭 수정해주세요! ⭐️
# ===================================================================

# 1. 테스트할 서버의 주소
BASE_URL = "http://59.28.73.147:8000"

# 2. 1단계에서 DB에서 복사해둔, 실제 존재하는 사용자의 UUID
USER_UUID = "b1293189-64fa-4845-9ea3-40a51cfb2f88"

# 3. 1단계에서 준비한, 공개적으로 접근 가능한 이미지 URL 3개
IMAGE_URLS = [
  "https://s3-watchout.s3.ap-northeast-2.amazonaws.com/faces/91da42ff-d33f-448e-8663-1f5702100b97/95782537-cee9-4914-b4fd-666d97285c37/front-face.jpg",
  "https://s3-watchout.s3.ap-northeast-2.amazonaws.com/faces/91da42ff-d33f-448e-8663-1f5702100b97/95782537-cee9-4914-b4fd-666d97285c37/left-face.jpg",
  "https://s3-watchout.s3.ap-northeast-2.amazonaws.com/faces/91da42ff-d33f-448e-8663-1f5702100b97/95782537-cee9-4914-b4fd-666d97285c37/right-face.jpg"
]

# ===================================================================

def test_face_registration():
  """
  현재 서버의 얼굴 등록 API에 POST 요청을 보내는 테스트 함수
  """
  endpoint_url = f"{BASE_URL}/api/v1/users/{USER_UUID}/faces"

  payload = { "s3_urls": IMAGE_URLS }
  headers = { "Content-Type": "application/json" }

  print("========================================")
  print(f"🚀 API 요청을 시작합니다...")
  print(f"  - 요청 URL: {endpoint_url}")
  print(f"  - 전송 데이터: {json.dumps(payload, indent=2)}")
  print("----------------------------------------")

  try:
    # POST 요청 전송 (타임아웃 30초 설정)
    response = requests.post(endpoint_url, data=json.dumps(payload), headers=headers, timeout=30)

    print("✅ 서버 응답 도착!")
    print(f"  - 상태 코드: {response.status_code}")

    try:
      print(f"  - 응답 내용: {response.json()}")
    except json.JSONDecodeError:
      print(f"  - 응답 내용 (텍스트): {response.text}")

  except requests.exceptions.RequestException as e:
    print("❌ 요청 실패: 서버에 연결할 수 없거나 응답이 없습니다.")
    print(f"   오류 상세 내용: {e}")
  finally:
    print("========================================")


if __name__ == "__main__":
  if "여기에" in USER_UUID or "example-bucket" in IMAGE_URLS[0]:
    print("🛑 오류: 스크립트 상단의 USER_UUID와 IMAGE_URLS를 실제 값으로 변경해주세요.")
  else:
    test_face_registration()