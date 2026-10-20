# ---- etape 1 : compilation / build stage ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# les dependances d'abord : couche mise en cache tant que le pom ne change pas
# dependencies first: cached layer while the pom is unchanged
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
# le script SQL est embarque dans le jar (voir pom.xml)
COPY sql ./sql
RUN mvn -B -q -DskipTests package && cp target/*.jar app.jar

# ---- etape 2 : execution / runtime stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app

RUN useradd --system --no-create-home appuser
COPY --from=build /app/app.jar app.jar
USER appuser

# Render injecte PORT ; 8080 par defaut en local / Render injects PORT; 8080 by default locally
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod
# memoire limitee : le plan gratuit de Render n'a que 512 Mo / limited memory: Render's free plan has only 512 MB
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=70", "-XX:+UseSerialGC", "-Xss512k", "-jar", "app.jar"]
