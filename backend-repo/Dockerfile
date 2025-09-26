FROM gradle:8.8-jdk17 AS builder
WORKDIR /workspace

COPY build.gradle settings.gradle ./
COPY gradle ./gradle

RUN gradle --no-daemon dependencies || true

COPY . .

RUN sed -i 's/\r$//' gradlew || true \
 && chmod +x gradlew

RUN ./gradlew --no-daemon clean bootJar

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

RUN useradd -m -u 1001 appuser

COPY --from=builder /workspace/build/libs/*.jar /app/app.jar

RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 8080

ENV JAVA_OPTS=""

ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
