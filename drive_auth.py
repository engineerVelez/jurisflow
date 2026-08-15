from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
import os
import pickle
import base64
import io


SCOPES = ["https://www.googleapis.com/auth/drive"]


def get_service():

    # =====================================================
    # RENDER
    # =====================================================

    token_b64 = os.environ.get("GOOGLE_TOKEN_PICKLE_B64")

    if token_b64:
        print("🔐 Usando OAuth de Google desde Render")

        try:
            token_bytes = base64.b64decode(token_b64)
            creds = pickle.load(io.BytesIO(token_bytes))

            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    from google.auth.transport.requests import Request
                    creds.refresh(Request())
                else:
                    raise RuntimeError(
                        "❌ El token de Google no es válido o expiró."
                    )

            return build(
                "drive",
                "v3",
                credentials=creds
            )

        except Exception as e:
            print("❌ Error cargando token de Google:", e)
            raise

    # =====================================================
    # WINDOWS / DESARROLLO LOCAL
    # =====================================================

    creds = None

    if os.path.exists("token.pickle"):
        with open("token.pickle", "rb") as token:
            creds = pickle.load(token)

    if not creds or not creds.valid:

        flow = InstalledAppFlow.from_client_secrets_file(
            "credentials.json",
            SCOPES
        )

        creds = flow.run_local_server(port=0)

        with open("token.pickle", "wb") as token:
            pickle.dump(creds, token)

    return build(
        "drive",
        "v3",
        credentials=creds
    )