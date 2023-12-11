FROM python:3.9

COPY . .

RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y pkg-config libxml2-dev libxmlsec1-dev libxmlsec1-openssl
RUN pip install -r requirements.txt -r requirements-dev.txt

CMD ["python3", "src/dev.py"]
