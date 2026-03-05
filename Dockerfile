# --- ETAPA 1: Construcción (Build) ---
# Usamos una imagen de Gradle con JDK 17
FROM gradle:8.5-jdk17 AS build

# Definimos el directorio de trabajo dentro del contenedor
WORKDIR /home/gradle/project

# Copiamos solo los archivos de configuración primero para aprovechar la caché de Docker
COPY build.gradle settings.gradle ./

# Copiamos el código fuente y los archivos estáticos (src/main/resources/static)
COPY src ./src

# Construimos el proyecto omitiendo los tests para ganar velocidad
RUN gradle build --no-daemon -x test

# --- ETAPA 2: Ejecución (Runtime) ---
# Usamos un JRE ligero para que la imagen final sea pequeña
# ETAPA 2: Ejecución
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Usamos un comodín más preciso para copiar el JAR de Spring Boot
COPY --from=build /home/gradle/project/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]