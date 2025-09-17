# AI 얼굴 인식 서버

## 📖 프로젝트 소개
FastAPI를 기반으로 구축된 실시간 CCTV 얼굴 인식 및 등록 API 서버입니다.

- **얼굴 등록**: S3에 업로드된 3장의 사진으로 사용자 얼굴 정보를 등록합니다.
- **실시간 인식**: CCTV 스트림에서 얼굴을 탐지하고 등록된 사용자와 대조하여 출입을 기록합니다.
- **기술 스택**: Python, FastAPI, TensorFlow, OpenCV, PostgreSQL, Redis

## 🚀 실행 방법

1.  **Git 저장소 클론**
    ```bash
    git clone [저장소 URL]
    cd ai-repo2
    ```

2.  **가상 환경 생성 및 활성화**
    ```bash
    python -m venv .venv
    source .venv/bin/activate  # macOS/Linux
    .\.venv\Scripts\Activate  # Windows
    ```

3.  **라이브러리 설치**
    ```bash
    pip install -r requirements.txt
    ```

4.  **`.env` 파일 설정**
    `.env.example` 파일을 복사하여 `.env` 파일을 생성한 후, DB 및 S3 정보를 입력합니다.

5.  **서버 실행**
    ```bash
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    ```