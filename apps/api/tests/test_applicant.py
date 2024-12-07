from test_user_apply import EXPECTED_APPLICATION_DATA

from models.user_record import Applicant, Status


def test_key_uid_not_in_applicant_model_dump() -> None:
    test_applicant = Applicant(
        uid="edu.uci.sder",
        first_name="Sam",
        last_name="Der",
        status=Status.ATTENDING,
        application_data=EXPECTED_APPLICATION_DATA,
    )

    assert "uid" not in test_applicant.model_dump()
