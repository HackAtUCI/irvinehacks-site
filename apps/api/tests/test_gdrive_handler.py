from unittest.mock import AsyncMock, MagicMock, patch

from services import gdrive_handler

SAMPLE_NAME = "my-file-name"
SAMPLE_FOLDER_ID = "my-folder-id"
SAMPLE_BYTES = b"my-bytes"
SAMPLE_FILE_TYPE = "my-file-type"
SAMPLE_OUTPUT_ID = "12345"


@patch("services.gdrive_handler._get_credentials")
@patch("aiogoogle.Aiogoogle.discover")
@patch("aiogoogle.Aiogoogle.as_service_account")
async def test_upload_single_file(
    mock_asServiceAccount: AsyncMock,
    mock_discover: AsyncMock,
    mock_getCredentials: MagicMock,
) -> None:
    """Test whether the Request object sent to the Google Drive API
    is generated properly."""
    mock_getCredentials.return_value = None

    mock_asServiceAccount.return_value = {"id": SAMPLE_OUTPUT_ID}
    request = MagicMock()
    drive_v3 = MagicMock()
    drive_v3.files.create.return_value = request
    mock_discover.return_value = drive_v3

    output = await gdrive_handler.upload_file(
        SAMPLE_FOLDER_ID, SAMPLE_NAME, SAMPLE_BYTES, SAMPLE_FILE_TYPE
    )

    mock_asServiceAccount.assert_called_once()
    drive_v3.files.create.assert_called_once_with(
        upload_file=SAMPLE_BYTES,
        fields="id",
        json={
            "name": SAMPLE_NAME,
            "parents": [SAMPLE_FOLDER_ID],
        },
        supportsAllDrives=True,
    )

    request = mock_asServiceAccount.call_args.args[0]
    assert request.upload_file_content_type == SAMPLE_FILE_TYPE

    assert output == gdrive_handler.GOOGLE_DRIVE_URL + SAMPLE_OUTPUT_ID
