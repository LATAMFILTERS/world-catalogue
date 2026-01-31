FROM python:3.11-slim

# IMPORTANTE: Esta línea invalida el cache en cada build
ARG CACHEBUST=1
RUN echo "Cache bust: $CACHEBUST"

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8080"]
