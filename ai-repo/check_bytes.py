import os
from dotenv import load_dotenv
load_dotenv(override=True)
for k in ["AWS_ACCESS_KEY_ID","AWS_SECRET_ACCESS_KEY","AWS_REGION","S3_BUCKET"]:
    v = os.getenv(k,"")
    print(k, "len=", len(v), "repr=", repr(v), "hex=", v.encode().hex())
