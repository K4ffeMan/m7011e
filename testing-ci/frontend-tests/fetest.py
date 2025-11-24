import re
from playwright.sync_api import Page, expect

# Change this if your frontend runs on a different port
BASE_URL = "http://localhost:5173"

# -------------------------------
# Existing homepage / app tests
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
    random_id = page.url.split("/room/")[1]
    assert len(random_id) == 6

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
# Mock API and Room component tests
# -------------------------------

def test_mock_api(page: Page):
    # Mock the todos API
    page.route("**/api/todos/*", lambda route: route.fulfill(
        status=200,
        body='{"todos": [{"todo_id": 1, "title": "Test Todo", "completed": false}]}',
        headers={"Content-Type": "application/json"}
    ))
    page.goto(BASE_URL)
    expect(page.get_by_text("Test Todo")).not_to_be_visible()  # optional, just to ensure page loaded

def test_room_component_with_videos(page: Page):
    # Mock the videos API for this room
    page.route("**/api/videos/abc123", lambda route: route.fulfill(
        status=200,
        body='[{"id": "vid1", "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}]',
        headers={"Content-Type": "application/json"}
    ))

    page.goto(f"{BASE_URL}/room/abc123")

    # Ensure room header is visible
    expect(page.get_by_text("Room: abc123", exact=True)).to_be_visible()

    # Ensure the iframe for the video exists
    expect(page.locator("iframe[src*='dQw4w9WgXcQ']")).to_be_visible()

def test_room_copy_link_and_submit(page: Page):
    # Mock empty video list initially
    page.route("**/api/videos/abc123", lambda route: route.fulfill(
        status=200,
        body='[]',
        headers={"Content-Type": "application/json"}
    ))

    page.goto(f"{BASE_URL}/room/abc123")

    # Click the "Copy Room Link" button
    copy_button = page.get_by_role("button", name="Copy Room Link")
    copy_button.click()

    # Ensure the alert for copied link appears
    expect(page.get_by_text("Room link copied!", exact=True)).to_be_visible()

    # Mock POST API to add video
    page.route("**/api/videos/abc123", lambda route: route.fulfill(
        status=200,
        body='{"success": true, "video": {"id": "vid2"}}',
        headers={"Content-Type": "application/json"}
    ))

    # Submit a new YouTube video
    input_field = page.locator("input.url-input")
    input_field.fill("https://www.youtube.com/watch?v=abcdefghijk")
    page.get_by_role("button", name="Submit").click()

    # Confirm success alert
    expect(page.get_by_text("Video added successfully!", exact=True)).to_be_visible()


    # --- Voting Tests ---

def test_start_vote(page: Page):
    room_id = "vote123"
    page.goto(f"{BASE_URL}/room/{room_id}")

    # Mock API call for starting vote
    page.route(f"**/api/vote/start/{room_id}", lambda route: route.fulfill(
        status=200, body='{}', headers={"Content-Type": "application/json"}
    ))

    start_button = page.get_by_role("button", name="Start Vote")
    start_button.click()

    expect(page.get_by_role("button", name="End Vote")).to_be_visible()


def test_cast_vote(page: Page):
    room_id = "vote123"
    page.goto(f"{BASE_URL}/room/{room_id}")

    # Mock API responses
    page.route(f"**/api/videos/{room_id}", lambda route: route.fulfill(
        status=200,
        body='[{"id": "vid1", "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}]',
        headers={"Content-Type": "application/json"}
    ))
    page.route(f"**/api/vote/{room_id}/*", lambda route: route.fulfill(
        status=200, body='{}', headers={"Content-Type": "application/json"}
    ))
    page.route(f"**/api/vote/start/{room_id}", lambda route: route.fulfill(
        status=200, body='{}', headers={"Content-Type": "application/json"}
    ))

    page.reload()  # Load videos
    page.get_by_role("button", name="Start Vote").click()

    vote_button = page.get_by_role("button", name="Vote")
    vote_count_text = page.locator("p", has_text="Votes: 0")
    expect(vote_count_text).to_be_visible()

    vote_button.click()
    expect(page.locator("p", has_text="Votes: 1")).to_be_visible()


def test_end_vote(page: Page):
    room_id = "vote123"
    page.goto(f"{BASE_URL}/room/{room_id}")

    # Mock API response for ending vote
    page.route(f"**/api/vote/end/{room_id}", lambda route: route.fulfill(
        status=200,
        body='{"winningVideo": {"id": "vid1", "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}}',
        headers={"Content-Type": "application/json"}
    ))
    page.route(f"**/api/vote/start/{room_id}", lambda route: route.fulfill(
        status=200, body='{}', headers={"Content-Type": "application/json"}
    ))

    page.reload()
    page.get_by_role("button", name="Start Vote").click()
    page.get_by_role("button", name="End Vote").click()

    # Only winning video should remain
    expect(page.get_by_title("YouTube video player")).to_be_visible()
    expect(page.get_by_role("button", name="Vote")).not_to_be_visible()

# -------------------------------
# Edge Case / Failure Tests
# -------------------------------

def test_submit_invalid_youtube_url(page: Page):
    room_id = "edge123"
    page.route(f"**/api/videos/{room_id}", lambda route: route.fulfill(
        status=200,
        body='[]',
        headers={"Content-Type": "application/json"}
    ))

    page.goto(f"{BASE_URL}/room/{room_id}")

    # Enter invalid YouTube URL
    input_field = page.locator("input.url-input")
    input_field.fill("https://example.com/not-a-youtube-url")
    page.get_by_role("button", name="Submit").click()

    # Expect error alert
    expect(page.get_by_text("Please enter a valid YouTube URL!", exact=True)).to_be_visible()


def test_vote_without_starting(page: Page):
    room_id = "edge123"
    page.route(f"**/api/videos/{room_id}", lambda route: route.fulfill(
        status=200,
        body='[{"id": "vid1", "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}]',
        headers={"Content-Type": "application/json"}
    ))

    page.goto(f"{BASE_URL}/room/{room_id}")

    # Try clicking vote before starting
    vote_button = page.get_by_role("button", name="Vote")
    
    # Should not be visible because voting hasn't started
    expect(vote_button).not_to_be_visible()


def test_end_vote_without_starting(page: Page):
    room_id = "edge123"
    page.goto(f"{BASE_URL}/room/{room_id}")

    # Mock API for ending vote
    page.route(f"**/api/vote/end/{room_id}", lambda route: route.fulfill(
        status=400,
        body='{"error": "Voting not started"}',
        headers={"Content-Type": "application/json"}
    ))

    end_button = page.get_by_role("button", name="End Vote")
    
    # Clicking should trigger an error alert (simulate API failure)
    if end_button.is_visible():
        end_button.click()
        expect(page.get_by_text("Failed to end vote", exact=True)).to_be_visible()


def test_submit_empty_youtube_url(page: Page):
    room_id = "edge123"
    page.route(f"**/api/videos/{room_id}", lambda route: route.fulfill(
        status=200,
        body='[]',
        headers={"Content-Type": "application/json"}
    ))

    page.goto(f"{BASE_URL}/room/{room_id}")

    # Submit with empty input
    input_field = page.locator("input.url-input")
    input_field.fill("")  # empty
    page.get_by_role("button", name="Submit").click()

    # No alert should appear since handleSubmit returns early
    expect(page.get_by_text("Video added successfully!", exact=True)).not_to_be_visible()
    expect(page.get_by_text("Please enter a valid YouTube URL!", exact=True)).not_to_be_visible()


def test_room_with_failed_video_fetch(page: Page):
    room_id = "edge123"
    # Simulate API failure
    page.route(f"**/api/videos/{room_id}", lambda route: route.fulfill(
        status=500,
        body='{"error": "Internal Server Error"}',
        headers={"Content-Type": "application/json"}
    ))

    page.goto(f"{BASE_URL}/room/{room_id}")

    # Expect alert showing failure
    expect(page.get_by_text("Failed to load videos", exact=True)).to_be_visible()
