# Dockerfile
FROM denoland/deno:latest

WORKDIR /app

COPY . /app/

EXPOSE 8000

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "app.js"]