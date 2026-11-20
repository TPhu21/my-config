#!/usr/bin/env python3
"""Sanitized, read-only summary of Shadowrocket Proxy SQLite logs.

Usage:
  python analyze_shadowrocket.py log1.db log2.db --json report.json

Outputs ONLY aggregate counts of allowlisted service domains and time range.
Never outputs request URLs, scripts, user agents, tokens, headers or images.
"""
import argparse
import json
import sqlite3
from pathlib import Path

HOSTS = {
    "api.locketcamera.com": "Locket API",
    "us-central1-locket-4252a.cloudfunctions.net": "Cloud Functions",
    "api.revenuecat.com": "RevenueCat",
    "firebaseremoteconfig.googleapis.com": "Firebase Remote Config",
    "firebaseremoteconfigrealtime.googleapis.com": "Firebase Remote Config Realtime",
}


def analyze(path):
    result = {
        "filename": Path(path).name,
        "total_connections": 0,
        "known_service_counts": {name: 0 for name in HOSTS.values()},
        "first_recorded": None,
        "last_recorded": None,
        "protocol_metadata_available": False,
        "note": "",
    }
    with sqlite3.connect(Path(path).resolve().as_uri() + "?mode=ro", uri=True) as db:
        tables = {row[0] for row in db.execute(
            "SELECT name FROM sqlite_master WHERE type='table'")}
        if "logging" not in tables:
            result["note"] = "Empty log: no logging table."
            return result
        result["total_connections"] = db.execute(
            "SELECT COUNT(*) FROM logging").fetchone()[0]
        first, last = db.execute(
            "SELECT MIN(created), MAX(created) FROM logging").fetchone()
        result["first_recorded"], result["last_recorded"] = first, last
        for (url,) in db.execute("SELECT url FROM logging"):
            value = str(url or "").lower().strip()
            for host, label in HOSTS.items():
                if value in {host, host + ":443", host + ":80"}:
                    result["known_service_counts"][label] += 1
                    break
        result["note"] = (
            "Proxy logs show connection destinations, not HTTP methods, "
            "paths, request/response schemas, or AI quota status."
        )
        return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("db", nargs="+", type=Path)
    parser.add_argument("--json", type=Path)
    args = parser.parse_args()
    results = [analyze(path) for path in args.db]
    for item in results:
        print(f"\n{item['filename']}: {item['total_connections']} connections")
        print(f"  Time range: {item['first_recorded']} to {item['last_recorded']}")
        for name, count in item["known_service_counts"].items():
            print(f"  {name}: {count}")
        print(f"  {item['note']}")
    if args.json:
        args.json.write_text(json.dumps(results, indent=2, ensure_ascii=False),
                             encoding="utf-8")
        print(f"\nSanitized report: {args.json}")


if __name__ == "__main__":
    main()
