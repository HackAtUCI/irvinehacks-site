import logging

from fastapi import FastAPI

from app import app as api
from auth.user_identity import JWT_SECRET

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET is not defined")

# Override AWS Lambda logging configuration
logging.basicConfig(level=logging.INFO, force=True)

# This ASGI app is used by Vercel as a Serverless Function
app = FastAPI()
app.mount("/api", api)
