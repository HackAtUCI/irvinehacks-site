FROM python:3.9

COPY requirements.txt requirements.txt

RUN apt-get update && apt-get install -y libxml2-dev libxmlsec1-dev libxmlsec1-openssl
RUN pip install --no-cache-dir -r requirements.txt "uvicorn[standard]"

EXPOSE 8000

COPY src/ src/

ENV PYTHONPATH=src/

CMD ["uvicorn", "app:app", "--host", "0.0.0.0"]
