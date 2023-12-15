import hashlib
import os
from logging import getLogger
from typing import Protocol

from aiogoogle import HTTPError
from fastapi import UploadFile

from services import gdrive_handler

log = getLogger(__name__)

RESUMES_FOLDER_ID = os.getenv("RESUMES_FOLDER_ID")
SIZE_LIMIT = 500_000
ACCEPTED_TYPES = ("application/pdf",)


class Person(Protocol):
    first_name: str
    last_name: str


async def upload_resume(person: Person, resume_upload: UploadFile) -> str:
    """Upload resume file to Google Drive and provide url to uploaded file.
    Reject files larger than size limit"""
    if not RESUMES_FOLDER_ID:
        raise RuntimeError("RESUMES_FOLDER_ID is not defined")

    if resume_upload.content_type not in ACCEPTED_TYPES:
        raise TypeError("Invalid resume file type")

    # Check file size
    raw_resume_file: bytes = await resume_upload.read()
    if len(raw_resume_file) > SIZE_LIMIT:
        raise ValueError("Resume file is larger than allowed")

    # Rename with applicant's name and file digest
    digest = hashlib.md5(raw_resume_file).hexdigest()
    filename = f"{person.first_name}-{person.last_name}-{digest[:8]}.pdf"

    try:
        resume_url = await gdrive_handler.upload_file(
            RESUMES_FOLDER_ID,
            filename,
            raw_resume_file,
            resume_upload.content_type,
        )
    except HTTPError as err:
        log.error("During resume upload: %s", err)
        raise RuntimeError("Could not upload resume to Google Drive")

    return resume_url
