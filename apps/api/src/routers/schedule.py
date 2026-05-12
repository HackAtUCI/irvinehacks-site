from datetime import date, datetime
from logging import getLogger
from typing import Annotated, Any, Literal, Mapping, Optional, Union

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel, TypeAdapter, ValidationError
from typing_extensions import assert_never
from pymongo import DESCENDING

from admin import applicant_review_processor, participant_manager, summary_handler
from admin.participant_manager import AlreadyCheckedInError, Participant
from admin.score_normalizing_handler import (
    IH_WEIGHTING_CONFIG,
    add_normalized_scores_to_all_hacker_applicants,
    add_uids_to_exclude_from_hacker_normalization,
)
from auth.authorization import require_role
from auth.user_identity import User, utc_now
from models.ApplicationData import Decision, Review
from models.user_record import Applicant, ApplicantStatus, Role, Status as UserStatus
from services import mongodb_handler
from services.mongodb_handler import BaseRecord, Collection
from utils import email_handler

log = getLogger(__name__)

router = APIRouter()

require_manager = require_role(
    {
        Role.DIRECTOR,
        Role.HACKER_REVIEWER,
        Role.MENTOR_REVIEWER,
        Role.VOLUNTEER_REVIEWER,
        Role.CHECKIN_LEAD,
    }
)
require_reviewer = require_role(
    {
        Role.DIRECTOR,
        Role.LEAD,
        Role.HACKER_REVIEWER,
        Role.MENTOR_REVIEWER,
        Role.VOLUNTEER_REVIEWER,
    }
)
require_lead = require_role({Role.LEAD})
require_hacker_reviewer = require_role({Role.DIRECTOR, Role.HACKER_REVIEWER})
require_mentor_reviewer = require_role({Role.DIRECTOR, Role.MENTOR_REVIEWER})
require_volunteer_reviewer = require_role({Role.DIRECTOR, Role.VOLUNTEER_REVIEWER})
require_checkin_lead = require_role({Role.DIRECTOR, Role.CHECKIN_LEAD})
require_organizer = require_role({Role.ORGANIZER})
require_director = require_role({Role.DIRECTOR})

# @router.get("/applicants/mentors")
# async def mentor_applicants(
#     user: Annotated[User, Depends(require_mentor_reviewer)],
# ) -> list[SimplifiedApplicantSummary]:
#     """Get records of all mentor applicants."""
#     log.info("%s requested mentor applicants", user)

#     return await mentor_volunteer_applicants("Mentor")

