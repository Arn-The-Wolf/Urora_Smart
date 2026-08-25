"""E2E CRUD: operator ops then owner reports."""
from __future__ import annotations

import json
import uuid
from http.cookiejar import MozillaCookieJar
from pathlib import Path
from urllib.request import Request, build_opener, HTTPCookieProcessor
from urllib.error import HTTPError

BASE = "http://localhost:3000"
TINY = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
TINY2 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6nAAAAAElFTkSuQmCC"
TODAY = __import__("datetime").date.today().isoformat()


def client():
    jar = MozillaCookieJar()
    return build_opener(HTTPCookieProcessor(jar)), jar


def call(opener, method: str, path: str, body: dict | None = None):
    data = None if body is None else json.dumps(body).encode()
    req = Request(
        BASE + path,
        data=data,
        method=method,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
    )
    try:
        with opener.open(req, timeout=60) as res:
            raw = res.read().decode()
            return res.status, json.loads(raw) if raw else {}
    except HTTPError as e:
        raw = e.read().decode()
        try:
            payload = json.loads(raw) if raw else {}
        except json.JSONDecodeError:
            payload = {"raw": raw}
        return e.code, payload


def main():
    op, _ = client()
    print("=== OPERATOR LOGIN ===")
    status, payload = call(op, "POST", "/api/auth/login", {"email": "operator@urora.farm", "password": "farm1234"})
    assert status == 200, payload
    print("login", status)

    tag = f"TEST-{uuid.uuid4().hex[:8].upper()}"
    print("=== CREATE COW", tag, "===")
    status, payload = call(
        op,
        "POST",
        "/api/cattle",
        {
            "tagNumber": tag,
            "name": "Testa",
            "breed": "Friesian",
            "gender": "female",
            "status": "active",
            "photoUrls": [TINY, TINY2],
            "photoUrl": TINY,
            "notes": "E2E operator cow",
        },
    )
    assert status in (200, 201), payload
    cow_id = payload["cow"]["id"]
    assert len(payload["cow"]["photoUrls"]) == 2, payload["cow"]
    print("cowId", cow_id, "photos", len(payload["cow"]["photoUrls"]))

    print("=== UPDATE COW ===")
    status, payload = call(
        op,
        "PUT",
        f"/api/cattle/{cow_id}",
        {
            "tagNumber": tag,
            "name": "Testa Updated",
            "breed": "Friesian",
            "gender": "female",
            "status": "active",
            "photoUrls": [TINY],
            "notes": "Updated by operator",
        },
    )
    assert status == 200, payload
    assert payload["cow"]["name"] == "Testa Updated"
    assert len(payload["cow"]["photoUrls"]) == 1
    print("updated ok")

    print("=== MILK CREATE/UPDATE/DELETE ===")
    status, payload = call(
        op,
        "POST",
        "/api/milk",
        {"cowId": cow_id, "date": TODAY, "session": "morning", "liters": 8.5, "notes": "E2E milk"},
    )
    assert status in (200, 201), payload
    milk_id = payload["milking"]["id"]
    status, payload = call(
        op,
        "PUT",
        f"/api/milk/{milk_id}",
        {"cowId": cow_id, "date": TODAY, "session": "morning", "liters": 9.1, "notes": "updated"},
    )
    assert status == 200 and payload["milking"]["liters"] == 9.1, payload
    print("milk ok", milk_id)

    print("=== HEALTH CREATE/UPDATE ===")
    status, payload = call(
        op,
        "POST",
        "/api/health",
        {
            "cowId": cow_id,
            "date": TODAY,
            "kind": "illness",
            "status": "open",
            "diagnosis": "E2E mastitis",
            "treatment": "Strip",
            "isolated": True,
            "milkWithholdUntil": TODAY,
            "photoUrls": [TINY],
            "notes": "op health",
        },
    )
    assert status in (200, 201), payload
    health_id = payload["event"]["id"]
    status, payload = call(
        op,
        "PUT",
        "/api/health",
        {
            "id": health_id,
            "cowId": cow_id,
            "date": TODAY,
            "kind": "illness",
            "status": "recovering",
            "diagnosis": "E2E mastitis fixed",
            "treatment": "Strip",
            "isolated": False,
            "photoUrls": [TINY, TINY2],
            "notes": "updated",
        },
    )
    assert status == 200, payload
    assert payload["event"]["status"] == "recovering"
    assert len(payload["event"]["photoUrls"]) == 2
    print("health ok", health_id)

    print("=== OWNER LOGIN / LIVE VIEW ===")
    ow, _ = client()
    status, payload = call(ow, "POST", "/api/auth/login", {"email": "farmer@urora.farm", "password": "farm1234"})
    assert status == 200, payload
    status, payload = call(ow, "GET", "/api/cattle")
    assert status == 200, payload
    found = next(c for c in payload["cows"] if c["id"] == cow_id)
    assert found["name"] == "Testa Updated"
    print("owner sees cow", found["name"], "photos", len(found["photoUrls"]))

    status, payload = call(ow, "GET", f"/api/reports?kind=daily&date={TODAY}")
    assert status == 200 and "report" in payload, payload
    print("owner report ok")

    status, payload = call(ow, "GET", "/api/finance")
    assert status == 200 and "summary" in payload, payload
    print("owner finance ok")

    status, payload = call(op, "GET", "/api/finance")
    assert status == 403, payload
    print("operator finance forbidden ok")

    print("=== CLEANUP ===")
    status, _ = call(op, "DELETE", f"/api/health?id={health_id}")
    assert status == 200
    status, _ = call(op, "DELETE", f"/api/milk/{milk_id}")
    assert status == 200
    status, _ = call(op, "DELETE", f"/api/cattle/{cow_id}")
    assert status == 200
    status, payload = call(ow, "GET", "/api/cattle")
    assert all(c["id"] != cow_id for c in payload["cows"])
    print("E2E PASS")


if __name__ == "__main__":
    main()
