import urllib.parse

from pydantic import EmailStr


def waiver_form_url(email: EmailStr, user_name: str) -> str:
    """Provide URL to DocuSign PowerForm for waiver with pre-filled user info."""
    role_name = "Participant"
    query = urllib.parse.urlencode(
        {
            "env": "demo",  # temporary
            "PowerFormId": "d5120219-dec1-41c5-b579-5e6b45c886e8",  # temporary
            "acct": "cc0e3157-358d-4e10-acb0-ef39db7e3071",  # temporary
            f"{role_name}_Email": email,
            f"{role_name}_UserName": user_name,
            "v": "2",
        }
    )

    return (
        f"https://demo.docusign.net/Member/PowerFormSigning.aspx?{query}"  # temporary
    )
