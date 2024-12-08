from unittest.mock import ANY, AsyncMock, Mock, patch

from fastapi.testclient import TestClient
from onelogin.saml2.auth import OneLogin_Saml2_Auth
from onelogin.saml2.settings import OneLogin_Saml2_Settings

from auth.user_identity import NativeUser, issue_user_identity
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

patch_saml_settings = patch(
    "routers.saml._get_saml_settings", new=(lambda: SAMPLE_SETTINGS)
)

client = TestClient(saml.router, follow_redirects=False)


@patch_saml_settings
def test_saml_login_redirects() -> None:
    """Tests that the login route redirects to the UCI Shibboleth SSO page"""
    res = client.get("/login")

    assert res.status_code == 307
    location = res.headers["location"]
    assert location.startswith(SSO_URL)
    assert location.endswith("&RelayState=%2F")


@patch_saml_settings
def test_saml_login_sends_relay_state() -> None:
    """Query parameter is turned into relay state with SAML request."""
    res = client.get("/login?return_to=%2Fflux-capacitor")

    assert res.status_code == 307
    location = res.headers["location"]
    assert location.startswith(SSO_URL)
    assert location.endswith("&RelayState=%2Fflux-capacitor")


@patch("routers.saml.issue_user_identity", autospec=True)  # module since direct import
@patch("services.mongodb_handler.update_one", autospec=True)
@patch("routers.saml._get_saml_auth", autospec=True)
def test_saml_acs_succeeds(
    mock_get_saml_auth: Mock,
    mock_mongodb_handler_update_one: AsyncMock,
    mock_issue_user_identity: Mock,
) -> None:
    """Tests that the ACS route can process a valid auth request"""
    mock_auth = Mock(OneLogin_Saml2_Auth)
    mock_get_saml_auth.return_value = mock_auth

    mock_auth.get_errors.return_value = []
    mock_auth.is_authenticated.return_value = True
    sample_attributes = {
        "email": ["hack@uci.edu"],
        "displayName": ["Hack at UCI"],
        "ucinetid": ["hack"],
        "uciaffiliation": ["group"],
    }
    mock_auth.get_friendlyname_attribute = sample_attributes.get
    # do the same thing, but mock will capture calls
    mock_issue_user_identity.side_effect = issue_user_identity

    # specifying raw data rather than using `data` parameter
    res = client.post(
        "/acs",
        content="RelayState=%2Fportal&SAMLResponse=PD94bWwgdmVyc3BvbnNlPg%3D%3D",
        headers={"content-type": "application/x-www-form-urlencoded"},
    )
    assert res.status_code == 303

    mock_auth.process_response.assert_called()
    mock_mongodb_handler_update_one.assert_awaited_once()

    # user is redirected to relay state
    assert res.headers["location"] == "/portal"
    # user identity is parsed properly from friendly-name attributes
    mock_issue_user_identity.assert_called_once_with(
        NativeUser(
            ucinetid="hack",
            display_name="Hack at UCI",
            email="hack@uci.edu",
            affiliations=["group"],
        ),
        ANY,  # the redirect response
    )
    # response sets appropriate JWT cookie for user identity
    assert res.headers["Set-Cookie"].startswith("irvinehacks_auth=ey")
