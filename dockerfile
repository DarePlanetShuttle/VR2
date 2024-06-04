# Usa la imagen oficial de Nginx
FROM nginx:latest

# Establecer el directorio de trabajo
WORKDIR /usr/share/nginx/html

# Copiar el contenido de la carpeta html al contenedor
COPY . .

# Exponer el puerto 80 para el tráfico HTTP
EXPOSE 80
