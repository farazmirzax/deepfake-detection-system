import yt_dlp
import os
import uuid

# Create a temporary folder to store downloaded videos
DOWNLOAD_DIR = "temp_downloads"
if not os.path.exists(DOWNLOAD_DIR):
    os.makedirs(DOWNLOAD_DIR)

def download_video(url: str):
    """
    Downloads a video from a URL (YouTube, etc.) and returns the file path.
    """
    print(f"📥 Agent is fetching video from: {url}")
    
    # Generate a random filename so users don't overwrite each other
    filename = f"{uuid.uuid4()}"
    
    ydl_opts = {
        'format': 'best[ext=mp4]', # We only need visual, so mp4 is safest
        'outtmpl': os.path.join(DOWNLOAD_DIR, f'{filename}.%(ext)s'),
        'quiet': True,
        'no_warnings': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
            
        # Find the file we just downloaded (it might be .mp4, .mkv, etc.)
        for file in os.listdir(DOWNLOAD_DIR):
            if file.startswith(filename):
                return os.path.join(DOWNLOAD_DIR, file)
                
    except Exception as e:
        print(f"❌ Download Error: {e}")
        return None