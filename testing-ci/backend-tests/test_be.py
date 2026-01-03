import os
import httpx
import subprocess
import time
import pytest

BASE_URL = "http://localhost:5000"

# ----------------- Helper functions -----------------

def start_server():
    """Start backend server in the background."""
    env = os.environ.copy()
    env["NODE_ENV"] = "test"
    env["PORT"] = "5000"
    proc = subprocess.Popen(
        ["node", "dist/server.js"],
        cwd="backend",
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    time.sleep(3)  # wait a moment for the server to be ready
    return proc

def stop_server(proc):
    proc.terminate()
    proc.wait()


@pytest.fixture(scope="session", autouse=True)
def backend_server():
    proc = start_server()
    yield  # tests run here
    stop_server(proc)

def test_make_room():
    r = httpx.post(f"{BASE_URL}/api/rooms/")
    assert r.status_code == 201
    return r.json()["roomId"]

def test_get_videos_initially_empty():
    room_id = test_make_room()
    r = httpx.get(f"{BASE_URL}/api/videos/{room_id}")
    assert r.status_code == 200
    assert r.json() == []

def test_post_video_adds_video():
    room_id = test_make_room()
    video_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    post_res = httpx.post(f"{BASE_URL}/api/videos/{room_id}", json={"url": video_url})
    assert post_res.status_code == 200
    json_data = post_res.json()
    assert json_data["success"] is True
    assert json_data["video"]["url"] == video_url

    # Confirm GET returns it
    get_res = httpx.get(f"{BASE_URL}/api/videos/{room_id}")
    assert get_res.status_code == 200
    assert len(get_res.json()) == 1
    assert get_res.json()[0]["url"] == video_url

def test_post_video_missing_url_returns_400():
    room_id = test_make_room()
    r = httpx.post(f"{BASE_URL}/api/videos/{room_id}", json={})
    assert r.status_code == 400
    assert r.json()["error"] == "Missing URL"

@pytest.mark.xfail(reason="Deliberate fail: expects 1 video in empty room")
def test_get_videos_returns_one_even_empty():
    room_id = test_make_room()
    r = httpx.get(f"{BASE_URL}/api/videos/{room_id}")
    assert r.status_code == 200
    # This assertion is intentionally wrong
    assert len(r.json()) == 1

@pytest.mark.xfail(reason="Deliberate fail: asserting wrong URL")
def test_post_video_adds_wrong_url():
    room_id = test_make_room()
    video_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    post_res = httpx.post(f"{BASE_URL}/api/videos/{room_id}", json={"url": video_url})
    assert post_res.status_code == 200
    json_data = post_res.json()
    # Intentionally wrong URL assertion
    assert json_data["video"]["url"] == "https://example.com/fakevideo"
