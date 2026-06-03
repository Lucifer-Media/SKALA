FROM eclipse-temurin:17-jre-alpine AS runtime

RUN addgroup -S skala && adduser -S skala -G skala

WORKDIR /app

# Копируем собранный JAR
COPY target/skala-server-*.jar app.jar

# Директория для логов
RUN mkdir -p /var/log/skala && chown skala:skala /var/log/skala

USER skala

EXPOSE 8090

ENTRYPOINT ["java", \
  "-Xms256m", "-Xmx768m", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
