import re
from playwright.sync_api import Page, expect

BASE_URL = "http://localhost:5173"

# -------------------------------
# Helper functions
# -------------------------------
def mock_videos(page: Page, room_id: str, videos=None):
    videos = videos or []
    body = str(videos).replace("'", '"')  # Convert list of dicts to JSON-like string
    page.route(f"**/api/videos/{room_id}", lambda route: route.fulfill(
        status=200,
        body=body,
        headers={"Content-Type": "application/json"}
    ))

def start_vote(page: Page, room_id: str):
    mock_videos(page, room_id, [{"id": "vid1", "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}])
    page.route(f"**/api/vote/start/{room_id}", lambda route: route.fulfill(
        status=200,
        body='{}',
        headers={"Content-Type": "application/json"}
    ))
    page.goto(f"{BASE_URL}/room/{room_id}")
    button = page.get_by_test_id("start-vote-button").filter(has_text="Start Vote").first
    expect(button).to_be_visible(timeout=5000)
    button.click()
    return button

# -------------------------------
# Homepage / App Tests
# -------------------------------
def test_homepage_loads(page: Page):
    page.goto(BASE_URL)
    expect(page.get_by_text("Youtube Video Selector")).to_be_visible()
    expect(page.locator("img[alt='YouTube logo']")).to_be_visible()
    expect(page.locator("img[alt='TKL logo']")).to_be_visible()
    expect(page.get_by_role("button", name=re.compile("count is"))).to_be_visible()

def test_counter_button_works(page: Page):
    page.goto(BASE_URL)
    button = page.get_by_role("button", name=re.compile("count is"))
    initial_value = int(button.inner_text().split()[-1])
    button.click()
    new_value = int(button.inner_text().split()[-1])
    assert new_value == initial_value + 2

def test_go_to_random_room(page: Page):
    page.goto(BASE_URL)
    page.get_by_role("button", name="Go to Random Room").click()
    assert "/room/" in page.url
    assert len(page.url.split("/room/")[1]) == 6

def test_login_route(page: Page):
    page.goto(f"{BASE_URL}/login")
    expect(page).to_have_url(f"{BASE_URL}/login")

def test_register_route(page: Page):
    page.goto(f"{BASE_URL}/register")
    expect(page).to_have_url(f"{BASE_URL}/register")

def test_room_page_loads(page: Page):
    page.goto(f"{BASE_URL}/room/abc123")
    expect(page.get_by_text("Room: abc123", exact=True)).to_be_visible()

# -------------------------------
# Mock API & Room Component Tests
# -------------------------------
def test_mock_api(page: Page):
    page.route("**/api/todos/*", lambda route: route.fulfill(
        status=200,
        body='{"todos": [{"todo_id": 1, "title": "Test Todo", "completed": false}]}',
        headers={"Content-Type": "application/json"}
    ))
    page.goto(BASE_URL)
    expect(page.get_by_text("Test Todo")).not_to_be_visible()

def test_room_component_with_videos(page: Page):
    mock_videos(page, "abc123", [{"id": "vid1", "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}])
    page.goto(f"{BASE_URL}/room/abc123")
    expect(page.get_by_text("Room: abc123", exact=True)).to_be_visible()
    expect(page.locator("iframe[src*='dQw4w9WgXcQ']")).to_be_visible()

def test_room_copy_link_and_submit(page: Page):
    mock_videos(page, "abc123")
    page.goto(f"{BASE_URL}/room/abc123")
    page.get_by_test_id("copy-link-button").click()
    expect(page.get_by_text("Room link copied!", exact=True)).to_be_visible()

    page.route("**/api/videos/abc123", lambda route: route.fulfill(
        status=200,
        body='{"success": true, "video": {"id": "vid2"}}',
        headers={"Content-Type": "application/json"}
    ))
    page.locator("input.url-input").fill("https://www.youtube.com/watch?v=abcdefghijk")
    page.get_by_test_id("submit-video-button").click()
    expect(page.get_by_text("Video added successfully!", exact=True)).to_be_visible()

# -------------------------------
# Voting Tests
# -------------------------------
def test_start_vote(page: Page):
    room_id = "vote123"
    start_vote(page, room_id)
    expect(page.locator("text=Cannot add videos while voting is active")).to_be_visible()

def test_cannot_add_video_while_voting_active(page: Page):
    room_id = "vote_block_test"
    start_vote(page, room_id)
    input_field = page.locator("input[placeholder='Enter YouTube URL']")
    expect(input_field).to_be_disabled()
    expect(page.locator("text=Cannot add videos while voting is active")).to_be_visible()

# -------------------------------
# Edge / Failure Tests
# -------------------------------
def test_submit_invalid_youtube_url(page: Page):
    room_id = "edge123"
    mock_videos(page, room_id)
    page.goto(f"{BASE_URL}/room/{room_id}")
    page.locator("input.url-input").fill("https://example.com/not-a-youtube-url")
    page.get_by_test_id("submit-video-button").click()
    expect(page.get_by_text("Please enter a valid YouTube URL!", exact=True)).to_be_visible()

def test_vote_without_starting(page: Page):
    room_id = "edge123"
    mock_videos(page, room_id, [{"id": "vid1", "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}])
    page.goto(f"{BASE_URL}/room/{room_id}")
    vote_button = page.get_by_test_id("vote-button-vid1")
    expect(vote_button).to_have_count(0)

def test_end_vote_without_starting(page: Page):
    room_id = "edge123"
    page.goto(f"{BASE_URL}/room/{room_id}")
    page.route(f"**/api/vote/end/{room_id}", lambda route: route.fulfill(
        status=400,
        body='{"error": "Voting not started"}',
        headers={"Content-Type": "application/json"}
    ))
    end_button = page.get_by_test_id("end-vote-button")
    if end_button.is_visible():
        end_button.click()
        expect(page.get_by_text("Failed to end vote", exact=True)).to_be_visible()

def test_submit_empty_youtube_url(page: Page):
    room_id = "edge123"
    mock_videos(page, room_id)
    page.goto(f"{BASE_URL}/room/{room_id}")
    page.locator("input.url-input").fill("")
    page.get_by_test_id("submit-video-button").click()
    expect(page.get_by_text("Video added successfully!", exact=True)).to_have_count(0)
    expect(page.get_by_text("Please enter a valid YouTube URL!", exact=True)).to_have_count(0)

def test_room_with_failed_video_fetch(page: Page):
    room_id = "edge123"
    page.route(f"**/api/videos/{room_id}", lambda route: route.fulfill(
        status=500,
        body='{"error": "Internal Server Error"}',
        headers={"Content-Type": "application/json"}
    ))
    page.goto(f"{BASE_URL}/room/{room_id}")
    expect(page.get_by_role("alert")).to_contain_text("Failed to load videos")
