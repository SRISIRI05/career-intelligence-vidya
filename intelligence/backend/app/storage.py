import os
import requests
import uuid
import logging
from .config import settings

logger = logging.getLogger(__name__)

# Ensure local uploads directory exists
LOCAL_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(LOCAL_UPLOAD_DIR, exist_ok=True)

def upload_file_to_supabase(filename: str, file_bytes: bytes, content_type: str = "application/octet-stream") -> str:
    """
    Uploads file bytes to Supabase Storage bucket 'resumes'.
    If Supabase is not configured, saves the file locally in backend/uploads/.
    Returns the file URL or path.
    """
    has_supabase = bool(settings.SUPABASE_URL and settings.SUPABASE_KEY)
    
    # Generate unique filename to prevent overwrites
    unique_filename = f"{uuid.uuid4()}_{filename}"
    
    if has_supabase:
        try:
            # Endpoint structure: {SUPABASE_URL}/storage/v1/object/{bucket}/{filename}
            url = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/object/resumes/{unique_filename}"
            headers = {
                "Authorization": f"Bearer {settings.SUPABASE_KEY}",
                "apikey": settings.SUPABASE_KEY,
                "Content-Type": content_type
            }
            
            res = requests.post(url, headers=headers, data=file_bytes, timeout=10)
            if res.status_code == 200:
                # File uploaded successfully, return public URL
                public_url = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/object/public/resumes/{unique_filename}"
                logger.info(f"File {filename} successfully uploaded to Supabase Storage: {public_url}")
                return public_url
            else:
                logger.warning(f"Supabase Storage upload failed with status {res.status_code}: {res.text}. Falling back to local copy.")
        except Exception as e:
            logger.error(f"Error connecting to Supabase Storage: {e}. Falling back to local storage.")

    # Local Fallback
    local_path = os.path.join(LOCAL_UPLOAD_DIR, unique_filename)
    try:
        with open(local_path, "wb") as f:
            f.write(file_bytes)
        logger.info(f"File {filename} successfully saved locally at {local_path}")
        return f"/uploads/{unique_filename}"
    except Exception as e:
        logger.error(f"Failed to write file locally: {e}")
        return ""
