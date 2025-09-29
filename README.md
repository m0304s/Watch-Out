<div align="center">
  <h1>🚧 Watchout : AI 기반 건설현장 안전관리 플랫폼</h1>
  <p>건설현장의 안전을 지키는 스마트 안전관리 시스템</p>
  <p>공통 프로젝트 부울경 2반 TEAM 06 - S13P21E102</p>
</div>

---

## 📑 목차
1. [🚀 프로젝트 소개](#intro)
2. [🛠️ 기술 스택](#tech)
3. [💡 주요 기능](#func)
4. [📂 시스템 아키텍처](#arch)
5. [⚙️ 실행 방법](#meth)
6. [🖥️ 서비스 화면](#view)
7. [👨‍👩‍👧‍👦 개발 팀 소개](#team)
8. [🗓️ 개발 일정](#date)
9. [📝 산출물](#output)

## 🚀 프로젝트 소개 <a id="intro"></a>
**"[AI 기반 건설현장 안전관리] 플랫폼"**

Watchout은 **AI 기반 실시간 안전장비 감지**와 **스마트워치를 통한 낙상 감지**를 통해 건설현장의 안전사고를 예방하고 관리하는 통합 안전관리 플랫폼입니다.

- **실시간 CCTV 모니터링** 및 AI 기반 안전장비 착용 여부 감지  
- **스마트워치 기반 낙상 감지** 및 긴급상황 알림  
- **구역별 안전관리** 및 작업자 관리 시스템  
- **실시간 알림** 및 위반 내역 추적  
- **대시보드를 통한 안전 현황 모니터링**  

### 🔗 [서비스 바로가기](https://j13e102.p.ssafy.io/)

## 🛠️ 기술 스택 <a id="tech"></a>

### Frontend
- React, TypeScript, Vite
- Capacitor (모바일/워치 앱)
- Zustand (상태 관리)
- Axios, React Router

### Backend
- Java 17, Spring Boot 3.5.5
- Spring Security, JWT
- Spring Data JPA, QueryDSL

### AI & Computer Vision
- YOLACT (객체 감지 및 분할)
- OpenCV (이미지 처리)
- ArcFace (얼굴 인식)

### Mobile & Watch
- Android (Kotlin)
- Wear OS (스마트워치)
- Health Services API (낙상 감지)
- Wearable Data API (워치-폰 통신)

### Infra & DevOps
- Nginx (리버스 프록시)
- Jenkins (CI/CD)
- Docker, Docker Compose
- AWS EC2, S3, RDS
- Kafka

### Database
- PostgreSQL
- Redis

### Tools
- Git, GitLab
- Jira, Notion
- MatterMost

---

## 💡 주요 기능 <a id="func"></a>

| 기능 | 설명 |
|------|------|
| **AI 기반 안전장비 감지** | YOLACT 모델을 활용한 안전모, 안전조끼 등 착용 여부 실시간 감지 |
| **CCTV 실시간 모니터링** | 다중 카메라 동시 모니터링 및 구역별 관리 |
| **스마트워치 낙상 감지** | Health Services API를 통한 낙상 사고 자동 감지 및 알림 |
| **구역별 안전관리** | 작업 구역별 CCTV 배치 및 안전담당자 관리 |
| **실시간 알림 시스템** | FCM을 통한 안전장비 위반 및 긴급상황 즉시 알림 |
| **대시보드 모니터링** | 안전 현황 통계 및 위반 내역 시각화 |
| **작업자 관리** | 작업자 등록 및 구역별 배치 관리 |
| **위반 내역 추적** | 안전장비 위반 사항 기록 및 이미지 저장 |

---

## 📂 시스템 아키텍처 <a id="arch"></a>

- **사용자** → Nginx(443) → Frontend/Backend  
- **Backend** → DB(PostgreSQL), Cache(Redis), Messaging(Kafka)  
- **AI 서버** → CCTV 영상 분석 → 안전장비 위반 감지 → Backend 전달  
- **스마트워치** → 낙상 감지 → 모바일 앱 → Backend 알림  
- **Jenkins** → CI/CD 파이프라인 관리

---

## ⚙️ 실행 방법 <a id="meth"></a>

### 1. 환경 변수 설정
```bash
# API 설정
VITE_API_BASE_URL=https://j13e102.p.ssafy.io/api

# Firebase 설정
VITE_FIREBASE_API_KEY=AIzaSyBWaaDFnie2q0uxVsoKDJsxxer6h1DUh98
VITE_FIREBASE_AUTH_DOMAIN=watchout-238c7.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=watchout-238c7
VITE_FIREBASE_STORAGE_BUCKET=watchout-238c7.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=276857840662
VITE_FIREBASE_APP_ID=1:276857840662:web:562f09d8f2913211314137

# Firebase VAPID Key
VITE_FIREBASE_VAPID_KEY=BEHWGdHjQhnW_MM32MDtb46uvYxA6HnN-FH5Z4R0NbN07UEn_rIABoTr7Hnz8cO1Bap4eeqnMuiwSMXWj8Ckm2E

# Firebase CDN URL
VITE_FIREBASE_CDN_URL=https://www.gstatic.com/firebasejs/9.0.0/

# API Timeout 설정
VITE_API_TIMEOUT=30000
VITE_API_TIMEOUT_SHORT=10000

# 운영 환경 설정
VITE_IS_DEVELOPMENT=true

```

### 2. Docker 실행
```bash
# 전체 서비스 실행
docker-compose up -d

# 개별 서비스 실행
# Backend
cd backend-repo
./gradlew build
docker build -t watchout/backend-app .

# Frontend
cd frontend-repo
pnpm install
pnpm run build
docker build -t watchout/frontend-app .

# AI Service
cd ai-repo
docker build -t watchout/ai-service .
```

### 3. 개발 환경 실행
```bash
# Backend
cd backend-repo
./gradlew bootRun

# Frontend
cd frontend-repo
pnpm install
pnpm run dev

# AI Service
cd ai-repo
pip install -r requirements.txt
python main.py
```

---

## 🖥️ 서비스 화면 <a id="view"></a>

### 대시보드
- 전체 안전 현황 모니터링
- 실시간 위반 알림
- 구역별 안전 통계

### CCTV 모니터링
- 다중 카메라 실시간 뷰
- AI 감지 결과 오버레이
- 구역별 카메라 관리

### 스마트워치 앱
- 낙상 감지 및 SOS 기능
- 구역 정보 표시
- 간단한 안전 체크

### 모바일 앱
- 푸시 알림 수신
- 위반 내역 확인
- 작업자 관리

---

## 👨‍👩‍👧‍👦 개발 팀 소개 <a id="team"></a>

| 역할 | 이름 | 담당 영역 | GitHub |
|------|------|-----------|--------|
| `FE Leader` | 김예나 | Frontend, Web App | [@yeneua](https://github.com/yeneua) |
| `FE` | 김동규 | Frontend, Mobile App | [@donggyu-kim12](https://github.com/donggyu-kim12) |
| `BE Leader` | 최민석 | Backend, DevOps | [@m0304s](https://github.com/m0304s) |
| `BE` | 김환수 | Backend | [@KimHS17](https://github.com/KimHS17) |
| `BE, AI` | 김현서 | Backend | [@khyunse0](https://github.com/khyunse0) |
| `BE, AI` | 박정훈 | Backend, DevOps | [@Leehwa531](https://github.com/Leehwa531) |

---

## 🗓️ 개발 일정 <a id="date"></a>

- **1주차 (8/25 ~ 8/31)**: 프로젝트 기획 및 요구사항 분석
- **2주차 (9/1 ~ 9/7)**: 시스템 설계 및 기술 스택 선정
- **3주차 (9/8 ~ 9/14)**: 인프라 구축 및 기본 기능 구현
- **4주차 (9/15 ~ 9/21)**: AI 모델 연동 및 고도화
- **5주차 (9/22 ~ 9/28)**: 테스트 및 최적화
- **9/29**: 최종 프로젝트 평가

---

## 📝 산출물 <a id="output"></a>

### 1. 🔗 [기획서](https://phase-football-921.notion.site/261ab603db8b813c9841c3c24fa45eea?pvs=74)
### 2. 🔗 [기능 명세서](https://phase-football-921.notion.site/261ab603db8b81f78b06c520da6e7e1f?pvs=74)
### 3. 🔗 [ERD](https://www.erdcloud.com/d/YyZAC7CE8xsfReyes)
### 4. 🔗 [API 문서](https://phase-football-921.notion.site/API-25bab603db8b8090ac11f65f7fb4884e?pvs=74)

---

## 🏗️ 프로젝트 구조

```
S13P21E102/
├── frontend-repo/          # React 웹 애플리케이션
├── backend-repo/           # Spring Boot 백엔드
├── watch-repo/            # Wear OS 스마트워치 앱
├── ai-repo/               # AI 서비스
├── ai-repo2/              # 얼굴 인식 서비스
└── Jenkinsfile            # CI/CD 파이프라인
```

---

## 🔧 주요 기술 특징

- **실시간 AI 감지**: YOLACT 모델을 활용한 안전장비 착용 여부 실시간 감지
- **스마트워치 통합**: Wear OS 기반 낙상 감지 및 긴급상황 알림
- **마이크로서비스 아키텍처**: AI 서비스와 백엔드 분리로 확장성 확보
- **실시간 알림**: FCM을 통한 즉시 알림 시스템
- **Docker 기반 배포**: 컨테이너화를 통한 일관된 배포 환경

---

<div align="center">
  <p>🚧 <strong>Watchout</strong> - 건설현장의 안전을 지키는 스마트 솔루션 🚧</p>
</div>
