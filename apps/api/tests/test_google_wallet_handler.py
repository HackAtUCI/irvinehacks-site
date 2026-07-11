import hashlib
from typing import Any
from unittest.mock import Mock, patch

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from jose import jwt

from services import google_wallet_handler

_PRIVATE_KEY = rsa.generate_private_key(public_exponent=65537, key_size=2048)
_PRIVATE_KEY_PEM = _PRIVATE_KEY.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.TraditionalOpenSSL,
    encryption_algorithm=serialization.NoEncryption(),
).decode()
_PUBLIC_KEY_PEM = (
    _PRIVATE_KEY.public_key()
    .public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    .decode()
)

SAMPLE_SERVICE_ACCOUNT = {
    "client_email": "wallet-issuer@example-project.iam.gserviceaccount.com",
    "private_key": _PRIVATE_KEY_PEM,
}


def _decode_save_url(save_url: str) -> dict[str, Any]:
    assert save_url.startswith(google_wallet_handler.SAVE_URL_BASE)
    token = save_url[len(google_wallet_handler.SAVE_URL_BASE) :]
    return jwt.decode(token, _PUBLIC_KEY_PEM, algorithms=["RS256"], audience="google")


def _expected_object_id(uid: str) -> str:
    """Compute the expected Wallet object ID for the given uid, matching the
    sanitize-then-hash scheme in `google_wallet_handler._sanitized_object_suffix`."""
    sanitized = google_wallet_handler._OBJECT_ID_UNSAFE_CHARS.sub("_", uid)
    uid_hash = hashlib.sha256(uid.encode()).hexdigest()[
        : google_wallet_handler._UID_HASH_LENGTH
    ]
    return f"{google_wallet_handler.ISSUER_ID}.{sanitized}-{uid_hash}"


@patch("services.google_wallet_handler._get_service_account", autospec=True)
def test_build_checkin_pass_save_url_encodes_uid_as_barcode(
    mock_get_service_account: Mock,
) -> None:
    """Test the generated pass barcode encodes the given uid and references
    the fixed ZotHacks Generic Class."""
    mock_get_service_account.return_value = SAMPLE_SERVICE_ACCOUNT

    save_url = google_wallet_handler.build_checkin_pass_save_url("edu.uci.hack")
    claims = _decode_save_url(save_url)

    assert claims["iss"] == SAMPLE_SERVICE_ACCOUNT["client_email"]
    assert claims["typ"] == "savetowallet"

    generic_objects = claims["payload"]["genericObjects"]
    assert len(generic_objects) == 1

    generic_object = generic_objects[0]
    assert generic_object["classId"] == google_wallet_handler.GENERIC_CLASS_ID
    assert generic_object["genericType"] == "GENERIC_ENTRY_TICKET"
    assert generic_object["barcode"] == {
        "type": "QR_CODE",
        "value": "edu.uci.hack",
        "alternateText": "edu.uci.hack",
    }
    assert generic_object["id"] == _expected_object_id("edu.uci.hack")
    assert generic_object["cardTitle"]["defaultValue"]["value"] == "ZotHacks 2026"
    assert generic_object["header"]["defaultValue"]["value"] == "Check-In Pass"
    assert generic_object["subheader"]["defaultValue"]["value"] == "Check-In Pass"


@patch("services.google_wallet_handler._get_service_account", autospec=True)
def test_build_checkin_pass_save_url_includes_full_name_when_given(
    mock_get_service_account: Mock,
) -> None:
    """Test the pass header is set to the applicant's full name when given,
    while the subheader keeps identifying the pass type."""
    mock_get_service_account.return_value = SAMPLE_SERVICE_ACCOUNT

    save_url = google_wallet_handler.build_checkin_pass_save_url(
        "edu.uci.hack", "Riley Wong"
    )
    claims = _decode_save_url(save_url)

    generic_object = claims["payload"]["genericObjects"][0]
    assert generic_object["header"]["defaultValue"]["value"] == "Riley Wong"
    assert generic_object["subheader"]["defaultValue"]["value"] == "Check-In Pass"


@patch("services.google_wallet_handler._get_service_account", autospec=True)
def test_build_checkin_pass_save_url_sanitizes_object_id(
    mock_get_service_account: Mock,
) -> None:
    """Test uids with characters illegal in Wallet object IDs are sanitized."""
    mock_get_service_account.return_value = SAMPLE_SERVICE_ACCOUNT

    save_url = google_wallet_handler.build_checkin_pass_save_url(
        "guest+tag@example.com"
    )
    claims = _decode_save_url(save_url)

    generic_object = claims["payload"]["genericObjects"][0]
    expected_id = _expected_object_id("guest+tag@example.com")
    assert generic_object["id"] == expected_id
    assert generic_object["barcode"]["value"] == "guest+tag@example.com"


@patch("services.google_wallet_handler._get_service_account", autospec=True)
def test_build_checkin_pass_save_url_object_ids_do_not_collide(
    mock_get_service_account: Mock,
) -> None:
    """Test that distinct uids which sanitize to the same string still
    produce distinct Wallet object IDs."""
    mock_get_service_account.return_value = SAMPLE_SERVICE_ACCOUNT

    save_url_a = google_wallet_handler.build_checkin_pass_save_url(
        "guest+a@example.com"
    )
    save_url_b = google_wallet_handler.build_checkin_pass_save_url(
        "guest_a@example.com"
    )

    generic_object_a = _decode_save_url(save_url_a)["payload"]["genericObjects"][0]
    generic_object_b = _decode_save_url(save_url_b)["payload"]["genericObjects"][0]

    # Both uids sanitize to "guest_a@example.com" -> "guest_a_example.com", but
    # since they are different raw uids, the resulting object IDs must differ.
    assert generic_object_a["id"] != generic_object_b["id"]


@patch("services.google_wallet_handler._get_service_account", autospec=True)
def test_build_checkin_pass_save_url_object_id_is_stable(
    mock_get_service_account: Mock,
) -> None:
    """Test that the same uid always produces the same object ID, so that
    re-saving a pass updates the same Wallet object instead of creating a new
    one."""
    mock_get_service_account.return_value = SAMPLE_SERVICE_ACCOUNT

    save_url_1 = google_wallet_handler.build_checkin_pass_save_url("edu.uci.hack")
    save_url_2 = google_wallet_handler.build_checkin_pass_save_url("edu.uci.hack")

    generic_object_1 = _decode_save_url(save_url_1)["payload"]["genericObjects"][0]
    generic_object_2 = _decode_save_url(save_url_2)["payload"]["genericObjects"][0]

    assert generic_object_1["id"] == generic_object_2["id"]


def test_missing_credentials_raise_runtime_error(  # type: ignore[no-untyped-def]
    monkeypatch,
) -> None:
    """Test a clear error is raised when no service account is configured."""
    monkeypatch.delenv("WALLET_SERVICE_ACCOUNT_FILE", raising=False)
    monkeypatch.delenv("GOOGLE_WALLET_SERVICE_ACCOUNT_CREDENTIALS", raising=False)

    try:
        google_wallet_handler.build_checkin_pass_save_url("edu.uci.hack")
        assert False, "Expected RuntimeError"
    except RuntimeError:
        pass
