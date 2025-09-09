FROM node:22-alpine AS builder
WORKDIR /app

# pnpm 준비
RUN corepack enable && corepack prepare pnpm@latest --activate

# 의존성 설치
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# 소스 복사 및 빌드
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN pnpm run build

FROM nginx:1.27-alpine
RUN rm -f /etc/nginx/conf.d/*.conf

# 빌드 인자: prod/test
ARG ENV

# 변경된 경로 반영 (docker/frontend/nginx/{prod.conf,test.conf})
COPY docker/frontend/nginx/${ENV}.conf /etc/nginx/conf.d/default.conf

# 정적 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 헬스체크: 정적 서빙 확인
HEALTHCHECK --interval=10s --timeout=3s --retries=12 CMD \
  wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

EXPOSE 80

CMD ["nginx","-g","daemon off;"]
