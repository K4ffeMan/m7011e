import os
import pytest
from playwright.sync_api import sync_playwright

@pytest.fixture(scope="session")
def browser():
    headless = os.getenv("CI") == "true"
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        yield browser
        browser.close()

@pytest.fixture
def context(browser):
    context = browser.new_context(ignore_https_errors=True)
    yield context
    context.close()

@pytest.fixture
def page(context):
    page = context.new_page()
    yield page
    page.close()
