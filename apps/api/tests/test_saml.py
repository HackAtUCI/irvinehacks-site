from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient
from onelogin.saml2.settings import OneLogin_Saml2_Settings

from routers import saml

SSO_URL = "https://shib.service.uci.edu/idp/profile/SAML2/Redirect/SSO"
SAMPLE_SETTINGS = OneLogin_Saml2_Settings(
    {
        "sp": {
            "entityId": "https://irvinehacks.com/shibboleth",
            "assertionConsumerService": {
                "url": "https://irvinehacks.com/api/saml/acs",
            },
        },
        "idp": {
            "entityId": "urn:mace:incommon:uci.edu",
            "singleSignOnService": {
                "url": SSO_URL,
            },
        },
    }
)

client = TestClient(saml.router)


@patch("routers.saml._get_saml_settings")
def test_saml_login_redirects(mock_get_saml_settings: MagicMock) -> None:
    """Tests that the login route redirects to the UCI Shibboleth SSO page"""
    mock_get_saml_settings.return_value = SAMPLE_SETTINGS
    res = client.get("/login", follow_redirects=False)
    assert res.status_code == 307
    assert res.headers["location"].startswith(SSO_URL)


@patch("routers.saml._get_saml_auth")
def test_saml_acs_succeeds(mock_get_saml_auth: MagicMock) -> None:
    """Tests that the ACS route can process a valid auth request"""
    mock_auth = MagicMock()
    mock_get_saml_auth.return_value = mock_auth

    mock_auth.get_errors.return_value = []
    mock_auth.is_authenticated.return_value = True
    mock_auth.get_friendlyname_attribute.side_effect = [
        ["hack@uci.edu"],
        ["Hack at UCI"],
        ["hack"],
        ["group"],
    ]

    res = client.post("/acs", follow_redirects=False)
    mock_auth.process_response.assert_called()

    # check that user is redirected to main page
    assert res.status_code == 303
    assert res.headers["location"] == "/"
    # check that response sets appropriate cookie
    assert res.headers["Set-Cookie"].startswith("irvinehacks_auth=")
