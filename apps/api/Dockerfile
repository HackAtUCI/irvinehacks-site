FROM python:3.9

COPY requirements.txt requirements.txt

RUN apt-get update && apt-get install -y libxml2-dev libxmlsec1-dev libxmlsec1-openssl
RUN pip install --no-cache-dir -r requirements.txt "uvicorn[standard]"

EXPOSE 8000

COPY . .

CMD ["python3", "src/dev.py"]
