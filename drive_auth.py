from googleapiclient.discovery import build
from google.oauth2 import service_account
from google_auth_oauthlib.flow import InstalledAppFlow
import os
import pickle


SCOPES = ["https://www.googleapis.com/auth/drive"]


def get_service():

    # =====================================================
    # RENDER / PRODUCCIÓN
    # =====================================================

    secret_file = "/etc/secrets/google-service-account.json"

    if os.path.exists(secret_file):

        print("🔐 Usando cuenta de servicio de Google Drive")

        credentials = service_account.Credentials.from_service_account_file(
            secret_file,
            scopes=SCOPES
        )

        return build(
            "drive",
            "v3",
            credentials=credentials
        )

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