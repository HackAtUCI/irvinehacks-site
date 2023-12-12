from unittest.mock import AsyncMock, MagicMock, patch

from services import gdrive_handler

SAMPLE_NAME = "my-file-name"
SAMPLE_FOLDER_ID = "my-folder-id"
SAMPLE_BYTES = b"my-bytes"
SAMPLE_FILE_TYPE = "my-file-type"
SAMPLE_OUTPUT_ID = "12345"
UPLOAD_PATH = (
    "https://www.googleapis.com/upload/drive/v3/files?fields=id&supportsAllDrives=True"
)


@patch("services.gdrive_handler._get_credentials")
@patch("aiogoogle.Aiogoogle.as_service_account")
async def test_upload_single_file(
    mock_asServiceAccount: AsyncMock, mock_getCredentials: MagicMock
) -> None:
    """Test whether the Request object sent to the Google Drive API
    is generated properly."""
    mock_getCredentials.return_value = None

    mock_asServiceAccount.return_value = {"id": SAMPLE_OUTPUT_ID}

    output = await gdrive_handler.upload_file(
        SAMPLE_FOLDER_ID, SAMPLE_NAME, SAMPLE_BYTES, SAMPLE_FILE_TYPE
    )

    mock_asServiceAccount.assert_called_once()

    request = mock_asServiceAccount.call_args.args[0]
    assert request.method == "POST"
    assert request.media_upload.upload_path == UPLOAD_PATH
    assert request.json == {
        "name": SAMPLE_NAME,
        "parents": [SAMPLE_FOLDER_ID],
    }
    assert request.upload_file_content_type == SAMPLE_FILE_TYPE
    assert request.media_upload.multipart

    assert output == gdrive_handler.GOOGLE_DRIVE_URL + SAMPLE_OUTPUT_ID
