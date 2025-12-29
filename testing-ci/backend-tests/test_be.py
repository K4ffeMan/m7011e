import httpx
import uuid
import pytest

BASE_URL = "http://localhost:5000"

def getNewRoomId():
    return str(uuid.uuid4())[:6]

def test_post_video_adds_video():
    room_id = getNewRoomId()
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
    room_id = getNewRoomId()
    r = httpx.post(f"{BASE_URL}/api/videos/{room_id}", json={})
    assert r.status_code == 400
    assert r.json()["error"] == "Missing URL"

@pytest.mark.xfail(reason="Deliberate fail: asserting wrong URL")
def test_post_video_adds_wrong_url():
    room_id = getNewRoomId()
    video_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    post_res = httpx.post(f"{BASE_URL}/api/videos/{room_id}", json={"url": video_url})
    assert post_res.status_code == 200
    json_data = post_res.json()
    # Intentionally wrong URL assertion
    assert json_data["video"]["url"] == "https://example.com/fakevideo"
