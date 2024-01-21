from collections import Counter
from typing import Union

from pydantic import BaseModel, TypeAdapter

from models.ApplicationData import Decision
from services import mongodb_handler
from services.mongodb_handler import Collection
from utils.user_record import Role, Status


class ApplicantSummaryRecord(BaseModel):
    status: Union[Status, Decision]


async def applicant_summary() -> Counter[Union[Status, Decision]]:
    """Get summary of applicants by status."""
    records = await mongodb_handler.retrieve(
        Collection.USERS,
        {"role": Role.APPLICANT},
        ["status"],
    )
    applicants = TypeAdapter(list[ApplicantSummaryRecord]).validate_python(records)

    by_status = Counter(applicant.status for applicant in applicants)
    return by_status
