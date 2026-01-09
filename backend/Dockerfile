# Use Python 3.11 slim version for a small image size
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for MySQL and ML libraries
RUN apt-get update && apt-get install -y gcc default-libmysqlclient-dev pkg-config && rm -rf /var/lib/apt/lists/*

# Copy and install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

EXPOSE 8000

# Start FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]