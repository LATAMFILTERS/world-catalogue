"""Minimal Telegram Bot API client (long polling) with no third-party HTTP
dependency, so KLEO only needs the Python standard library at runtime.

The HTTP transport is injectable (``transport`` parameter) purely so tests
can run fully offline without touching the network or a real bot token.
"""

from __future__ import annotations

import json
import logging
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from typing import Callable, Iterable

logger = logging.getLogger("kleo.telegram")

TELEGRAM_MESSAGE_LIMIT = 4096
# Leave headroom under the hard Telegram limit for safety margins/formatting.
DEFAULT_CHUNK_LIMIT = 4000

Transport = Callable[[str, dict, float], dict]


def _urllib_transport(url: str, params: dict, timeout: float) -> dict:
    body = json.dumps(params).encode("utf-8")
    req = urllib.request.Request(
        url, data=body, headers={"Content-Type": "application/json"}, method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        payload = exc.read().decode("utf-8", errors="replace")
        raise TelegramApiError(f"HTTP {exc.code}: {payload}") from exc
    except urllib.error.URLError as exc:
        raise TelegramApiError(f"Network error calling {url}: {exc.reason}") from exc


class TelegramApiError(RuntimeError):
    pass


def chunk_message(text: str, limit: int = DEFAULT_CHUNK_LIMIT) -> list[str]:
    """Split *text* into chunks that each fit under Telegram's message size
    limit, preferring to break on newline boundaries so messages stay
    readable rather than cutting mid-line."""
    if text is None:
        return [""]
    if len(text) <= limit:
        return [text]

    chunks: list[str] = []
    remaining = text
    while len(remaining) > limit:
        window = remaining[:limit]
        split_at = window.rfind("\n")
        if split_at <= 0:
            split_at = limit
        chunks.append(remaining[:split_at])
        remaining = remaining[split_at:].lstrip("\n")
    if remaining:
        chunks.append(remaining)
    return chunks


@dataclass
class TelegramMessage:
    update_id: int
    chat_id: int
    text: str
    message_id: int | None = None

    @classmethod
    def from_update(cls, update: dict) -> "TelegramMessage | None":
        message = update.get("message") or update.get("edited_message")
        if not message or "text" not in message:
            return None
        chat = message.get("chat", {})
        return cls(
            update_id=update["update_id"],
            chat_id=chat.get("id"),
            text=message["text"],
            message_id=message.get("message_id"),
        )


class TelegramClient:
    def __init__(self, token: str, transport: Transport | None = None, timeout: float = 35.0):
        if not token:
            raise ValueError("A Telegram bot token is required")
        self.token = token
        self.base_url = f"https://api.telegram.org/bot{token}"
        self._transport = transport or _urllib_transport
        self.timeout = timeout

    def _call(self, method: str, params: dict) -> dict:
        url = f"{self.base_url}/{method}"
        data = self._transport(url, params, self.timeout)
        if not data.get("ok", False):
            raise TelegramApiError(f"{method} failed: {data}")
        return data

    def get_me(self) -> dict:
        """Calls Telegram's ``getMe`` to confirm the bot token is valid and
        the API is reachable. Used at startup so a bad token or network
        outage fails fast and visibly instead of only surfacing inside the
        poll loop's retry-and-log cycle."""
        data = self._call("getMe", {})
        return data.get("result", {})

    def get_updates(self, offset: int | None = None, poll_timeout: int = 25) -> list[TelegramMessage]:
        params: dict = {"timeout": poll_timeout}
        if offset is not None:
            params["offset"] = offset
        data = self._call("getUpdates", params)
        messages = []
        for update in data.get("result", []):
            msg = TelegramMessage.from_update(update)
            if msg is not None:
                messages.append(msg)
            else:
                # Still need the update_id to advance the offset even for
                # update types we don't handle (e.g. non-text messages).
                messages.append(
                    TelegramMessage(update_id=update["update_id"], chat_id=None, text="")
                )
        return messages

    def send_message(self, chat_id: int, text: str) -> None:
        for chunk in chunk_message(text):
            if not chunk:
                continue
            self._call("sendMessage", {"chat_id": chat_id, "text": chunk})
