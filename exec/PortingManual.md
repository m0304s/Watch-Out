# Deployment Guide (WatchOut)

## 개요

  - **서비스명**: WatchOut
  - **팀명**: 최가네 사각김박
  - **주요 구성**
      - **FE**: React, Vite, pnpm, Nginx (컨테이너 내장)
      - **BE**: Spring Boot, Java 17, Gradle
      - **AI**: FastAPI, Python, ONNX (GPU 가속)
      - **Media**: MediaMTX (Real-time Media Server)
      - **DB**: PostgreSQL, Redis
      - **Infra**: AWS EC2 (Ubuntu), Docker, Jenkins, Nginx (Edge Proxy)
      - **Dev Tools**: PR-Agent (CodiumAI)
      - **Monitoring**: Prometheus, Grafana, Alertmanager

-----

## IDE

  - **FE**: Visual Studio Code
  - **BE**: IntelliJ IDEA
  - **AI**: Visual Studio Code

-----

## 서버 환경

  - **OS**: Ubuntu 22.04 LTS
  - **플랫폼 / 플랜**: AWS EC2 (t2.xlarge)
  - **CPU**: 4 vCPUs
  - **메모리**: 16 GiB RAM
  - **GPU**: NVIDIA T4 (GPU 서버 추가 필요)

### GPU 서버 초기 설정 (필수)

Docker 컨테이너에서 GPU를 사용하려면 호스트 서버(EC2 인스턴스)에 NVIDIA 관련 드라이버 및 툴킷을 먼저 설치해야 합니다.

```bash
# 1. 시스템 패키지 업데이트 및 필수 도구 설치
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y gcc make

# 2. NVIDIA Container Toolkit 및 드라이버 설치
(가장 안정적인 방법은 CUDA Toolkit을 설치하여 드라이버를 함께 설치)
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update
sudo apt-get -y install cuda-toolkit-12-4

curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
  && curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit

# 3. Docker 서비스 재시작하여 툴킷 적용
sudo systemctl restart docker
```

### 방화벽 및 포트 설정

서버에 설정이 필요한 포트 목록입니다.

| 포트 | 프로토콜 | 연결 서비스 | 비고 |
| :--- | :--- | :--- | :--- |
| 22 | TCP | SSH | 원격 서버 접속 |
| 80 | TCP | HTTP (Prod) | Nginx Edge Proxy (Prod) |
| 443 | TCP | HTTPS (Prod) | Nginx Edge Proxy (Prod) |
| **1935** | TCP | **MediaMTX (RTMP)** | **RTMP 스트리밍** |
| 3000 | TCP | PR-Agent | CodiumAI PR-Agent 서비스 |
| 8000 | TCP | AI Service (FastAPI) | AI 모델 서빙 API |
| **8000-8100**| UDP | **MediaMTX (WebRTC)** | **WebRTC 미디어 전송** |
| 8080 | TCP | HTTP (Test) | Nginx Edge Proxy (Test) |
| **8189** | TCP | **MediaMTX (WebRTC)** | **WebRTC 시그널링(WHIP/WHEP)** |
| 8443 | TCP | HTTPS (Test) | Nginx Edge Proxy (Test) |
| **8554** | TCP | **MediaMTX (RTSP)** | **RTSP 스트리밍** |
| **8888** | TCP | **MediaMTX (HTTP)** | **HLS, WebRTC API 등** |
| 9090 | TCP | Prometheus | 모니터링 대시보드 |
| 9092 | TCP | Kafka | 메시지 큐 |
| 9093 | TCP | Alertmanager | 모니터링 알림 |
| 9100 | TCP | Node Exporter | 서버 메트릭 수집 |
| 9443 | TCP | Grafana | 모니터링 시각화 (3000번 포트로 전달) |
| 10443 | TCP | Jenkins | CI/CD 서버 (8443번 포트로 전달) |
| 15432 | TCP | PostgreSQL (Test) | 테스트 DB |
| 15433 | TCP | PostgreSQL (Prod) | 운영 DB |
| 16379 | TCP | Redis (Prod) | 운영 인메모리 DB |
| 16380 | TCP | Redis (Test) | 테스트 인메모리 DB |
| 50000 | TCP | Jenkins Agent | Jenkins 빌드 에이전트 통신 |

-----

### 도메인 및 SSL 설정

  - **도메인**: `j13e102.p.ssafy.io`
  - **SSL 인증서**: Let's Encrypt (Certbot 활용)
      - **인증서 경로**: `/etc/letsencrypt/live/j13e102.p.ssafy.io/`
      - **주요 파일**: `fullchain.pem`, `privkey.pem`
  - **적용 범위**: Nginx Edge Proxy를 통해 HTTPS(Prod: 443, Test: 8443)를 적용하며, 모든 HTTP 요청은 HTTPS로 자동 리다이렉트됩니다.
  - **만료 주기**: 90일

-----

## CI/CD 및 개발 도구 설치

### 1\. Docker 및 Docker Compose 설치 (호스트 서버)

```bash
# 1. 시스템 패키지 업데이트
sudo apt-get update && sudo apt-get upgrade -y

# 2. Docker 공식 GPG 키 추가 및 저장소 설정
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 3. Docker 및 Docker Compose 설치
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 4. 현재 사용자에 Docker 권한 부여
sudo usermod -aG docker $USER
# 터미널에 재접속해야 적용됩니다.
```

### 2\. Jenkins 설치

**A. 디렉토리 및 파일 생성**

```bash
# Jenkins 설정 파일들을 저장할 디렉토리 생성
mkdir ~/jenkins
cd ~/jenkins
```

**B. `Dockerfile` 작성**

`jenkins` 디렉토리 안에 `Dockerfile`을 생성하고 아래 내용을 붙여넣습니다. 이 파일은 Jenkins 이미지에 Docker CLI를 자동으로 설치합니다.

```dockerfile
# Dockerfile
FROM jenkins/jenkins:lts
USER root

RUN apt-get update && apt-get install -y lsb-release curl gpg

RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

RUN echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

RUN apt-get update && apt-get install -y docker-ce-cli

USER jenkins
```

**C. `docker-compose.yml` 작성**

`jenkins` 디렉토리 안에 `docker-compose.yml`을 생성하고 아래 내용을 붙여넣습니다.

```yaml
version: '3.8'

services:
  jenkins:
    build: .
    container_name: jenkins
    restart: unless-stopped
    ports:
      - "10443:8443"
      - "50000:50000"
    volumes:
      - /home/ubuntu/jenkins-data:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
    group_add:
      - "999" # 'docker' 그룹의 GID로 변경 필요
    environment:
      JENKINS_OPTS: "--httpPort=-1 --httpsPort=8443 --httpsKeyStore=/var/jenkins_home/jenkins.p12 --httpsKeyStorePassword=j13e102 --prefix=/jenkins"
      JENKINS_URL: "https://j13e102.p.ssafy.io/jenkins"
```

**D. Jenkins 실행**

```bash
# ~/jenkins 디렉토리에서 실행
docker-compose up -d --build
```

### 3\. PR-Agent 설치

**A. 디렉토리 및 `docker-compose.yml` 파일 생성**

```bash
mkdir ~/pr-agent
cd ~/pr-agent
nano docker-compose.yml
```

**B. `docker-compose.yml` 내용 작성**

```yaml
# docker-compose.yml
version: '3.8'

services:
  pr-agent:
    image: codiumai/pr-agent:latest
    container_name: pr_agent
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - GIT_PROVIDER=gitlab
      - GITLAB_URL=https://lab.ssafy.com
      - GITLAB_PERSONAL_ACCESS_TOKEN=[YOUR_GITLAB_TOKEN]
      - OPENAI_KEY=[YOUR_GEMINI_API_KEY] # Gemini 사용 시 OPENAI_KEY 변수 사용
      - AI_PROVIDER=google
      - MODEL=gemini-1.5-pro-latest
      - LOG_LEVEL=DEBUG
```

**C. PR-Agent 실행**

```bash
# ~/pr-agent 디렉토리에서 실행
docker-compose up -d
```

-----

## 데이터베이스 및 메시지 큐 설치

### 1\. PostgreSQL 설치

**A. 디렉토리 및 `docker-compose.yml` 파일 생성**

```bash
mkdir ~/postgres
cd ~/postgres
nano docker-compose.yml
```

**B. `docker-compose.yml` 내용 작성**

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    container_name: watchOut-db-prod
    restart: unless-stopped
    environment:
      POSTGRES_DB: watchOut
      POSTGRES_USER: j102
      POSTGRES_PASSWORD: [YOUR_PROD_DB_PASSWORD]
    volumes:
      - ./data:/var/lib/postgresql/data
    ports:
      - "15433:5432"
    networks:
      - prod-network

  test-db:
    image: postgres:16-alpine
    container_name: watchOut-db-test
    restart: unless-stopped
    environment:
      POSTGRES_DB: watchOut_test
      POSTGRES_USER: j102
      POSTGRES_PASSWORD: [YOUR_TEST_DB_PASSWORD]
    volumes:
      - ./data-test:/var/lib/postgresql/data
    ports:
      - "15432:5432"
    networks:
      - test-network

networks:
  prod-network:
    name: prod-network
  test-network:
    name: test-network
```

**C. PostgreSQL 실행**

```bash
# ~/postgres 디렉토리에서 실행
docker-compose up -d
```

### 2\. Redis 설치

**A. 디렉토리 및 `docker-compose.yml` 파일 생성**

```bash
mkdir ~/redis
cd ~/redis
nano docker-compose.yml
```

**B. `docker-compose.yml` 내용 작성**

```yaml
# docker-compose.yml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: redis_db
    restart: unless-stopped
    ports:
      - "16379:6379"
    volumes:
      - ./redis-data:/data
    networks:
      - prod-network

  redis_test:
    image: redis:7-alpine
    container_name: redis_db_test
    restart: unless-stopped
    ports:
      - "16380:6379"
    volumes:
      - ./redis-test-data:/data
    networks:
      - test-network

networks:
  prod-network:
    name: prod-network
  test-network:
    name: test-network
```

**C. Redis 실행**

```bash
# ~/redis 디렉토리에서 실행
docker-compose up -d
```

### 3\. Kafka 설치 (Docker Compose)

**A. 디렉토리 및 `docker-compose.yml` 파일 생성**

```bash
mkdir ~/kafka
cd ~/kafka
nano docker-compose.yml
```

**B. `docker-compose.yml` 내용 작성**

Kafka는 Zookeeper가 필요하므로 함께 설치합니다.

```yaml
# docker-compose.yml
version: '3.8'

services:
  zookeeper:
    image: bitnami/zookeeper:latest
    container_name: zookeeper
    restart: unless-stopped
    ports:
      - "2181:2181"
    environment:
      - ALLOW_ANONYMOUS_LOGIN=yes
    networks:
      - default_net

  kafka:
    image: bitnami/kafka:latest
    container_name: kafka
    restart: unless-stopped
    ports:
      - "9092:9092"
    depends_on:
      - zookeeper
    environment:
      - KAFKA_CFG_ZOOKEEPER_CONNECT=zookeeper:2181
      - ALLOW_PLAINTEXT_LISTENER=yes
      - KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://[EC2_Public_IP]:9092
    networks:
      - default_net

networks:
  default_net:
    name: kafka-network
```

**C. Kafka 실행**

```bash
# ~/kafka 디렉토리에서 실행
docker-compose up -d
```

-----

## 미디어 서버 설치 (MediaMTX)

### 1\. MediaMTX 설치 (Docker Compose)

**A. 디렉토리 및 `docker-compose.yml` 파일 생성**

```bash
mkdir ~/mediamtx
cd ~/mediamtx
nano docker-compose.yml
```

**B. `docker-compose.yml` 내용 작성**

```yaml
version: '3.8'

services:
  mediamtx:
    image: bluenviron/mediamtx:latest
    container_name: mediamtx
    restart: unless-stopped
    ports:
      - "8554:8554"        # RTSP
      - "1935:1935"        # RTMP
      - "8888:8888"        # HTTP (HLS, WebRTC API)
      - "8189:8189/tcp"    # WebRTC (WHIP/WHEP)
      - "8000-8100:8000-8100/udp" # WebRTC (ICE)
```

**C. MediaMTX 실행**

```bash
# ~/mediamtx 디렉토리에서 실행
docker-compose up -d
```

-----

## 서비스별 설정

### Nginx Edge Proxy (리버스 프록시)

  - **설정 파일**: `Jenkinsfile`에 의해 Git Repository의 `docker/edge/nginx/` 디렉토리에서 `prod.conf` 또는 `test.conf` 파일이 컨테이너로 복사됩니다.
  - **주요 역할**: SSL 인증서 적용, HTTP-\>HTTPS 리다이렉션, 요청 경로에 따른 서비스 분배 (FE, BE, Jenkins)
  - **프록시 방식**: 각 서비스는 Docker 네트워크(`test-network`, `prod-network`) 내에서 컨테이너 이름으로 통신합니다.

#### 프록시 경로 설정 (Prod 환경 기준)

| 요청 경로 | 전달 대상 (컨테이너) | 설명 |
| :--- | :--- | :--- |
| `/` | `http://watchout-fe-prod:80` | 프론트엔드 React 앱 |
| `/api/` | `http://watchout-be-prod:8080` | 백엔드 Spring Boot API (Blue/Green) |
| `/jenkins/` | `http://jenkins:8080` | Jenkins 대시보드 |
| `/api-ai/` | `http://ai-service-prod:8000` | AI FastAPI 서비스 |
| `/media/` | `http://mediamtx:8888` | MediaMTX HTTP API/HLS |