import os, json, boto3
from dotenv import load_dotenv
from botocore.config import Config

load_dotenv(override=True)

print("ENV:", {k: os.getenv(k)[:6] if os.getenv(k) else None for k in
      ["AWS_ACCESS_KEY_ID","AWS_SECRET_ACCESS_KEY","AWS_SESSION_TOKEN","AWS_REGION","S3_BUCKET"]})

cfg = Config(signature_version="s3v4")
try:
    print("\nSTS...")
    print(json.dumps(boto3.client("sts", config=cfg).get_caller_identity(), indent=2))
except Exception as e:
    print("STS FAIL:", e)

region = os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION") or "ap-northeast-2"
bucket = os.environ["S3_BUCKET"]
try:
    print("\nS3 A (no region)...",
          boto3.client("s3", config=cfg).get_bucket_location(Bucket=bucket))
except Exception as e:
    print("S3 A FAIL:", e)
try:
    print("\nS3 B (with region)...",
          boto3.client("s3", region_name=region, config=cfg).get_bucket_location(Bucket=bucket))
except Exception as e:
    print("S3 B FAIL:", e)
