import pytest

from kleo.telegram_client import (
    TELEGRAM_MESSAGE_LIMIT,
    TelegramApiError,
    TelegramClient,
    TelegramMessage,
    chunk_message,
)


def test_chunk_message_returns_single_chunk_when_under_limit():
    text = "short message"
    assert chunk_message(text) == [text]


def test_chunk_message_splits_long_text_into_chunks_under_the_limit():
    line = "x" * 80
    text = "\n".join([line] * 200)  # way over the default chunk limit
    chunks = chunk_message(text, limit=500)
    assert len(chunks) > 1
    for chunk in chunks:
        assert len(chunk) <= 500
    # No content lost: every original line appears in some chunk.
    rejoined = "\n".join(chunks)
    for original_line in text.split("\n"):
        assert original_line in rejoined


def test_chunk_message_respects_telegram_hard_limit_by_default():
    text = "y" * 10000
    chunks = chunk_message(text)
    for chunk in chunks:
        assert len(chunk) < TELEGRAM_MESSAGE_LIMIT


def test_telegram_message_from_update_parses_text_message():
    update = {
        "update_id": 42,
        "message": {"message_id": 7, "chat": {"id": 999}, "text": "/status"},
    }
    msg = TelegramMessage.from_update(update)
    assert msg.update_id == 42
    assert msg.chat_id == 999
    assert msg.text == "/status"


def test_telegram_message_from_update_ignores_non_text_updates():
    update = {"update_id": 43, "message": {"message_id": 8, "chat": {"id": 999}, "sticker": {}}}
    assert TelegramMessage.from_update(update) is None


def test_send_message_calls_transport_once_per_chunk():
    calls = []

    def fake_transport(url, params, timeout):
        calls.append(params)
        return {"ok": True, "result": {}}

    client = TelegramClient("123:fake", transport=fake_transport)
    long_text = "z" * 9000
    client.send_message(555, long_text)

    assert len(calls) >= 2
    for call in calls:
        assert call["chat_id"] == 555
        assert len(call["text"]) <= 4000


def test_get_me_returns_bot_info():
    def fake_transport(url, params, timeout):
        assert url.endswith("/getMe")
        return {"ok": True, "result": {"id": 42, "username": "kleo_bot"}}

    client = TelegramClient("123:fake", transport=fake_transport)
    me = client.get_me()
    assert me == {"id": 42, "username": "kleo_bot"}


def test_get_me_raises_on_invalid_token():
    def fake_transport(url, params, timeout):
        return {"ok": False, "error_code": 401, "description": "Unauthorized"}

    client = TelegramClient("123:fake", transport=fake_transport)
    with pytest.raises(TelegramApiError):
        client.get_me()


def test_get_updates_advances_offset_via_update_id():
    def fake_transport(url, params, timeout):
        return {
            "ok": True,
            "result": [
                {"update_id": 1, "message": {"chat": {"id": 999}, "text": "hello"}},
            ],
        }

    client = TelegramClient("123:fake", transport=fake_transport)
    messages = client.get_updates(offset=None)
    assert len(messages) == 1
    assert messages[0].chat_id == 999
    assert messages[0].text == "hello"
