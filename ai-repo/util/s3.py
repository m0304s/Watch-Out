import os, uuid, boto3
from functools import lru_cache
from botocore.config import Config

@lru_cache
def _s3():
    region = os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION") or "ap-northeast-2"
    cfg = Config(signature_version="s3v4", retries={"max_attempts": 5, "mode": "standard"})
    return boto3.client("s3", region_name=region, config=cfg)

def _bucket():
    return os.environ["S3_BUCKET"]

def upload_jpeg_bytes(img_bytes: bytes, prefix: str = "captures/", filename: str | None = None,
                      content_type: str = "image/jpeg", expires_sec: int = 7*24*3600):
    """
    JPEG 바이트를 S3에 업로드하고 (비공개), presigned GET URL을 리턴.
    DB에는 'key'를 저장해두고, 필요할 때마다 presigned를 생성하는 게 안전.
    """
    if not filename:
        filename = uuid.uuid4().hex + ".jpg"
    key = f"{prefix}{filename}"

    _s3().put_object(
        Bucket=_bucket(),
        Key=key,
        Body=img_bytes,
        ContentType=content_type,
        ACL="private",  # 공개 버킷이 아니면 private 유지
        ServerSideEncryption="AES256"  # 선택
    )

    # 7일짜리 presigned URL (원하면 짧게 조정)
    url = _s3().generate_presigned_url(
        "get_object",
        Params={"Bucket": _bucket(), "Key": key},
        ExpiresIn=expires_sec
    )
    return key, url
