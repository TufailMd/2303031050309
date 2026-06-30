"""
Stage 6 - Priority Inbox
-------------------------
Fetches notifications from the provided Notification API and efficiently
maintains the top N (default 10) most important UNREAD notifications.

Priority rule (as specified):
    1. Weight   -> placement > result > event   (primary sort key)
    2. Recency  -> newer notifications win ties on weight (secondary key)

Design choice - Bounded Min-Heap:
    Instead of sorting the entire notification list every time a new
    notification arrives (O(n log n) per update), we maintain a
    fixed-size MIN-HEAP of capacity N.

      - The heap root always holds the CURRENT WEAKEST notification
        among the top N (lowest weight, and if tied, the oldest).
      - When a new notification arrives:
            * If heap has < N items        -> push it,            O(log N)
            * Else if it beats the heap root -> pop root, push it, O(log N)
            * Else                           -> ignore it,         O(1)
    This means maintaining the Top-N as new notifications stream in
    costs O(log N) per arrival, regardless of how many total
    notifications have been processed (n) - independent of n. We never
    need to look at, sort, or re-scan old notifications.

No database is used; notifications are only ever stored in this
in-memory heap of size N, fetched live from the API.
"""

import heapq
import os
import time
from datetime import datetime
from itertools import count
import requests

API_URL = "http://4.224.186.213/evaluation-service/notifications"

# Lower index = higher priority, as required: placement > result > event
TYPE_WEIGHT = {
    "Placement": 3,
    "Result": 2,
    "Event": 1,
}
DEFAULT_WEIGHT = 0  # unknown types sink to the bottom


def parse_timestamp(ts: str) -> float:
    """Convert API timestamp string to a sortable epoch float."""
    return datetime.strptime(ts, "%Y-%m-%d %H:%M:%S").timestamp()


class PriorityInbox:
    """
    Maintains the top-N highest priority notifications using a
    bounded min-heap, so it scales efficiently as new notifications
    keep arriving (O(log N) per insert, O(1) memory growth - capped at N).
    """

    def __init__(self, capacity: int = 10):
        self.capacity = capacity
        self._heap = []  # list of (weight, timestamp, tie_breaker, notification)
        self._counter = count()  # tie-breaker so heap never compares dicts
        self._seen_ids = set()  # avoid re-processing duplicate notifications

    def _score(self, notification: dict):
        weight = TYPE_WEIGHT.get(notification.get("Type"), DEFAULT_WEIGHT)
        ts = parse_timestamp(notification["Timestamp"])
        return weight, ts

    def add(self, notification: dict):
        """O(log N) - call this for every new notification that arrives."""
        nid = notification.get("ID")
        if nid in self._seen_ids:
            return  # already processed this notification
        self._seen_ids.add(nid)

        weight, ts = self._score(notification)
        entry = (weight, ts, next(self._counter), notification)

        if len(self._heap) < self.capacity:
            heapq.heappush(self._heap, entry)
        elif entry > self._heap[0]:
            # new notification outranks the current weakest of the top N
            heapq.heapreplace(self._heap, entry)
        # else: notification doesn't make the cut, discard it (O(1))

    def add_many(self, notifications: list):
        for n in notifications:
            self.add(n)

    def get_top_n(self) -> list:
        """
        Returns the current top-N notifications, ordered highest
        priority first. Only sorts the N items in the heap (cheap),
        never the full notification history.
        """
        ranked = sorted(self._heap, key=lambda e: (e[0], e[1]), reverse=True)
        return [entry[3] for entry in ranked]


def fetch_notifications(url: str = API_URL, headers: dict | None = None) -> list:
    """
    Fetch notifications from the Notification API.
    The API is a protected route and requires a Bearer access token.

    The token is read from the NOTIF_API_TOKEN environment variable
    by default (so it never needs to be hardcoded / committed to git).
    You can also pass a custom `headers` dict to override this.
    """
    if headers is None:
        token = os.environ.get("NOTIF_API_TOKEN")
        if not token:
            raise RuntimeError(
                "No API token found. Set it first, e.g.\n"
                "  Windows CMD:        set NOTIF_API_TOKEN=your_token_here\n"
                "  Windows PowerShell:  $env:NOTIF_API_TOKEN=\"your_token_here\"\n"
                "  Linux/Mac:           export NOTIF_API_TOKEN=your_token_here"
            )
        headers = {"Authorization": f"Bearer {token}"}

    response = requests.get(url, headers=headers, timeout=10)
    if not response.ok:
        print(f"\n[DEBUG] API returned {response.status_code}")
        print(f"[DEBUG] Response body: {response.text}\n")
    response.raise_for_status()
    data = response.json()
    return data.get("notifications", [])


def print_top_n(notifications: list, n: int):
    print(f"\nTop {n} Priority Notifications\n" + "-" * 40)
    for i, notif in enumerate(notifications, start=1):
        weight = TYPE_WEIGHT.get(notif.get("Type"), DEFAULT_WEIGHT)
        print(
            f"{i:>2}. [{notif['Type']:<10}] (weight={weight}) "
            f"{notif['Message']:<25} | {notif['Timestamp']} | id={notif['ID']}"
        )


def main(top_n: int = 10, poll_interval_seconds: int = 5, poll_cycles: int = 1):
    """
    Fetches notifications and prints the top N priority notifications.
    Set poll_cycles > 1 to simulate repeatedly checking for new
    notifications (e.g. via polling or a webhook callback) and see
    the Priority Inbox update efficiently in place.
    """
    inbox = PriorityInbox(capacity=top_n)

    for cycle in range(1, poll_cycles + 1):
        notifications = fetch_notifications()
        inbox.add_many(notifications)  # only NEW ids actually get processed
        top = inbox.get_top_n()
        print(f"\n=== Poll cycle {cycle} ({len(notifications)} notifications fetched) ===")
        print_top_n(top, top_n)

        if cycle < poll_cycles:
            time.sleep(poll_interval_seconds)


if __name__ == "__main__":
    main(top_n=10, poll_cycles=1)