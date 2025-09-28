import os
import sys
import numpy as np

# AI repo의 app 모듈을 임포트할 수 있도록 경로 추가
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

# 이제 app 내부의 서비스를 임포트할 수 있습니다.
from services.face_embedding import face_embedding_service

# 테스트할 이미지 경로 설정
# ai-repo2/test_images 폴더에 이미지를 넣어주세요.
TEST_IMAGE_PATHS = {
  "person_a_1": "C:/Users/SSAFY/Downloads/정훈1.jpg",
  "person_a_2": "C:/Users/SSAFY/Downloads/정훈2.jpg",
  "person_b_1": "C:/Users/SSAFY/Downloads/환수.jpg",
}

def get_image_bytes(path):
  if not os.path.exists(path):
    raise FileNotFoundError(f"이미지 파일을 찾을 수 없습니다: {path}")
  with open(path, "rb") as f:
    return f.read()

def calculate_cosine_similarity(emb1, emb2):
  # 이미 L2 정규화된 임베딩이므로 내적이 코사인 유사도와 같습니다.
  return np.dot(emb1, emb2)

if __name__ == "__main__":
  print("--- ArcFace 모델 테스트 시작 ---")

  try:
    # 모델 로드 (FaceEmbeddingService 인스턴스가 __init__ 시점에 이미 로드)
    # face_embedding_service = FaceEmbeddingService() # 싱글톤 패턴이므로 직접 인스턴스 생성 대신 임포트된 객체 사용

    # 테스트 이미지로부터 임베딩 생성
    embeddings = {}
    for name, path in TEST_IMAGE_PATHS.items():
      print(f"[{name}] 이미지에서 임베딩 생성 중... ({path})")
      image_bytes = get_image_bytes(path)
      embeddings[name] = face_embedding_service.generate_embedding(image_bytes)
      print(f"[{name}] 임베딩 생성 완료. Shape: {embeddings[name].shape}")

    print("\n--- 유사도 비교 결과 ---")

    # 같은 사람 (person_a) 비교
    if "person_a_1" in embeddings and "person_a_2" in embeddings:
      sim_same_person = calculate_cosine_similarity(embeddings["person_a_1"], embeddings["person_a_2"])
      print(f"✅ 같은 사람 (person_a_1 vs person_a_2) 유사도: {sim_same_person:.4f} (높을수록 좋음)")
    else:
      print("⚠️ 같은 사람 비교를 위한 이미지가 부족합니다 (person_a_1, person_a_2 필요).")

    # 다른 사람 (person_a vs person_b) 비교
    if "person_a_1" in embeddings and "person_b_1" in embeddings:
      sim_diff_person = calculate_cosine_similarity(embeddings["person_a_1"], embeddings["person_b_1"])
      print(f"❌ 다른 사람 (person_a_1 vs person_b_1) 유사도: {sim_diff_person:.4f} (낮을수록 좋음)")
    else:
      print("⚠️ 다른 사람 비교를 위한 이미지가 부족합니다 (person_a_1, person_b_1 필요).")

    # 임베딩 차원 확인
    if embeddings:
      first_embedding_dim = list(embeddings.values())[0].shape[0]
      print(f"\n생성된 임베딩 차원: {first_embedding_dim}")
      if first_embedding_dim == 512:
        print("✅ 임베딩 차원이 512로 올바릅니다.")
      else:
        print(f"❌ 임베딩 차원이 512가 아닌 {first_embedding_dim}입니다.")

  except FileNotFoundError as e:
    print(f"오류: {e}\n테스트 이미지를 'test_images' 폴더에 준비해주세요.")
  except ValueError as e:
    print(f"오류: {e}\n얼굴이 감지되지 않았거나 유효하지 않은 이미지일 수 있습니다.")
  except Exception as e:
    print(f"예상치 못한 오류 발생: {e}")

  print("\n--- ArcFace 모델 테스트 종료 ---")
