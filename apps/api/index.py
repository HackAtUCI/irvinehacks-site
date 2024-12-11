import logging
import os

import axiom_py  # type: ignore[import-untyped]
from axiom_py.logging import AxiomHandler  # type: ignore[import-untyped]
from fastapi import FastAPI

from app import app as api
from auth.guest_auth import AUTH_KEY_SALT
from auth.user_identity import JWT_SECRET
from services.docusign_handler import DOCUSIGN_HMAC_KEY

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET is not defined")
if not AUTH_KEY_SALT:
    raise RuntimeError("AUTH_KEY_SALT is not defined")
if not DOCUSIGN_HMAC_KEY:
    raise RuntimeError("DOCUSIGN_HMAC_KEY is not defined")

AXIOM_TOKEN = os.getenv("NEXT_PUBLIC_AXIOM_TOKEN")
AXIOM_DATASET = os.getenv("NEXT_PUBLIC_AXIOM_DATASET")


def setup_logging() -> None:
    """
    Configure root logger to send data to Axiom.
    Important: `handler` cannot be global since vc_init will incorrectly register that.
    """
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)

    if AXIOM_TOKEN and AXIOM_DATASET:
        client = axiom_py.Client(AXIOM_TOKEN)
        handler = AxiomHandler(client, AXIOM_DATASET)
        root_logger.addHandler(handler)


setup_logging()

# This ASGI app is used by Vercel as a Serverless Function
app = FastAPI()
app.mount("/api", api)
