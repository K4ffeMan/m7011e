import os
import httpx
import subprocess
import time
import pytest

BASE_URL = "http://localhost:5000"

def test_make_room():
    headers = {"X-Test-Mode": "true"}
    r = httpx.post(f"{BASE_URL}/api/rooms/", headers=headers, timeout=20)
    assert r.status_code == 201
    return r.json()["roomId"]

def test_get_videos_initially_empty():
    headers = {"X-Test-Mode": "true"}
    room_id = test_make_room()
    r = httpx.get(f"{BASE_URL}/api/videos/{room_id}", headers=headers)
    assert r.status_code == 200
    assert r.json() == []

def test_post_video_adds_video():
    headers = {"X-Test-Mode": "true"}
    room_id = test_make_room()
    video_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    post_res = httpx.post(f"{BASE_URL}/api/videos/{room_id}", json={"url": video_url}, headers=headers)
    assert post_res.status_code == 200
    json_data = post_res.json()
    assert json_data.get("status") == "video queued"

    time.sleep(2)

    # Confirm GET returns it
    get_res = httpx.get(f"{BASE_URL}/api/videos/{room_id}", headers=headers)
    assert get_res.status_code == 200
    assert len(get_res.json()) == 1
    assert get_res.json()[0]["url"] == video_url

def test_post_video_missing_url_returns_400():
    headers = {"X-Test-Mode": "true"}
    room_id = test_make_room()
    r = httpx.post(f"{BASE_URL}/api/videos/{room_id}", json={}, headers=headers)
    assert r.status_code == 400
    assert r.json()["error"] == "missing a url"

@pytest.mark.xfail(reason="Deliberate fail: expects 1 video in empty room")
def test_get_videos_returns_one_even_empty():
    headers = {"X-Test-Mode": "true"}
    room_id = test_make_room()
    r = httpx.get(f"{BASE_URL}/api/videos/{room_id}", headers=headers)
    assert r.status_code == 200
    # This assertion is intentionally wrong
    assert len(r.json()) == 1

@pytest.mark.xfail(reason="Deliberate fail: asserting wrong URL")
def test_post_video_adds_wrong_url():
    headers = {"X-Test-Mode": "true"}
    room_id = test_make_room()
    video_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    post_res = httpx.post(f"{BASE_URL}/api/videos/{room_id}", json={"url": video_url}, headers=headers)
    assert post_res.status_code == 200
    json_data = post_res.json()
    # Intentionally wrong URL assertion
    assert json_data["video"]["url"] == "https://example.com/fakevideo"
