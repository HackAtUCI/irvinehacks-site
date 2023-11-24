import logging

from fastapi import FastAPI

from app import app as api

# Override AWS Lambda logging configuration
logging.basicConfig(level=logging.INFO, force=True)

# This ASGI app is used by Vercel as a Serverless Function
app = FastAPI()
app.mount("/api", api)
