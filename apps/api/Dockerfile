FROM python:3.9

RUN apt-get update && apt-get install -y libxml2-dev libxmlsec1-dev libxmlsec1-openssl

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt "uvicorn[standard]"

COPY src/ .

ENV PYTHONPATH=src/

CMD ["uvicorn", "app:app", "--host", "0.0.0.0"]
