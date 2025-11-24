import httpx
import subprocess
import time

BASE_URL = "http://localhost:5000"

# Helper to start backend server in the background
def start_server():
    # Assumes `node server.ts` works in backend folder
    proc = subprocess.Popen(
        ["node", "server.ts"],
        cwd="backend",  # path to backend folder
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    # wait a moment for server to start
    time.sleep(1)
    return proc

def stop_server(proc):
    proc.terminate()
    proc.wait()


def test_get_videos_initially_empty():
    proc = start_server()
    try:
        r = httpx.get(f"{BASE_URL}/api/videos/test123")
        assert r.status_code == 200
        assert r.json() == []
    finally:
        stop_server(proc)


def test_post_video_adds_video():
    proc = start_server()
    try:
        video_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        post_res = httpx.post(
            f"{BASE_URL}/api/videos/test123",
            json={"url": video_url},
        )
        assert post_res.status_code == 200
        json_data = post_res.json()
        assert json_data["success"] is True
        assert json_data["video"]["url"] == video_url

        # Confirm GET returns it
        get_res = httpx.get(f"{BASE_URL}/api/videos/test123")
        assert get_res.status_code == 200
        assert len(get_res.json()) == 1
        assert get_res.json()[0]["url"] == video_url
    finally:
        stop_server(proc)


def test_post_video_missing_url_returns_400():
    proc = start_server()
    try:
        r = httpx.post(f"{BASE_URL}/api/videos/test123", json={})
        assert r.status_code == 400
        assert r.json()["error"] == "Missing URL"
    finally:
        stop_server(proc)
