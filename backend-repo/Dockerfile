FROM gradle:8.14.0-jdk17 AS builder
WORKDIR /workspace

# (캐시 최적화) Gradle 관련 파일 먼저 복사
COPY build.gradle settings.gradle gradle.properties* ./
COPY gradle ./gradle
RUN gradle --version

# 소스 복사
COPY . .

# Spring Boot Jar 생성
RUN ./gradlew --no-daemon clean bootJar

FROM openjdk:17-jdk-slim

ENV TZ=Asia/Seoul \
    LANG=C.UTF-8 \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Dfile.encoding=UTF-8" \
    SPRING_PROFILES_ACTIVE=docker

# 빌드 결과 Jar 복사 (하나만 생성되도록 Gradle 구성 권장)
COPY --from=builder /workspace/build/libs/*.jar /app.jar

# (선택) 헬스체크 — 애플리케이션 포트/엔드포인트에 맞게 수정
# HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
#   CMD wget -q -O - http://localhost:8080/actuator/health | grep UP || exit 1

RUN useradd -m appuser
USER appuser

EXPOSE 8080
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app.jar"]
