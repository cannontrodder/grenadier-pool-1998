#!/usr/bin/env python3
"""Run one bounded practice-table browser case through Playwright CLI.

Each invocation has a 50-second outer bound. A failed case may perform one
health-only reload probe, but the original result and exit status remain failed.
"""

import argparse
import json
import http.server
import secrets
import threading
import os
import pathlib
import subprocess
import sys
import time
import urllib.parse


parser = argparse.ArgumentParser()
parser.add_argument("--url", default="http://127.0.0.1:8765/practice/")
parser.add_argument("--browser", choices=["webkit", "chrome"], default="webkit")
parser.add_argument(
    "--case",
    choices=["interaction", "pot", "keyboard", "native", "tuning", "placement", "placement-keyboard", "placement-cancel", "placement-native", "layouts", "motion"],
    default="interaction",
)
parser.add_argument("--layout", choices=["straight-pots", "cut-pots", "cushion-practice"], default="straight-pots")
parser.add_argument("--session")
parser.add_argument("--width", type=int, default=390)
parser.add_argument("--height", type=int, default=844)
parser.add_argument("--fault", choices=["missing", "stale", "action-timeout", "stalled-progress", "disconnect"])
parser.add_argument("--corner-angle", type=float, default=-2.5722794624891314)
parser.add_argument("--corner-pull", type=float, default=69.5)
args = parser.parse_args()

if args.case in ["native", "placement-native"] and args.browser != "chrome":
    parser.error("--case native requires --browser chrome")
if args.fault and (args.case in ["native", "motion"] or args.case.startswith("placement")):
    parser.error("fault injection is supported by interaction, pot, keyboard, tuning and layouts")
if args.width <= 0 or args.height <= 0:
    parser.error("viewport dimensions must be positive")

root = pathlib.Path(__file__).resolve().parents[2]
output = root / "output" / "playwright" / "practice"
output.mkdir(parents=True, exist_ok=True)
run_id = str(time.time_ns())
session = args.session or f"practice-{args.browser}-{args.case}-{run_id}"
cli = pathlib.Path(os.environ.get("CODEX_HOME", pathlib.Path.home() / ".codex"))
cli = cli / "skills" / "playwright" / "scripts" / "playwright_cli.sh"
if not cli.exists():
    raise SystemExit(f"Playwright CLI wrapper not found: {cli}")

deadline = time.monotonic() + 50
records = []
journal_path = output / f"journal-{run_id}.json"
journal_token = secrets.token_urlsafe(24)


class JournalHandler(http.server.BaseHTTPRequestHandler):
    """Bounded local sink: the journal survives a CLI worker or browser exit."""

    def log_message(self, *_):
        pass

    def do_POST(self):
        self.connection.settimeout(1)
        length = int(self.headers.get("Content-Length", "0"))
        if self.path != f"/{journal_token}" or not 0 < length <= 131072:
            self.send_error(400)
            return
        payload = json.loads(self.rfile.read(length))
        for key in ("recentActions", "recentObservations", "history", "errors"):
            payload[key] = payload.get(key, [])[-16:]
        temporary = journal_path.with_suffix(".tmp")
        temporary.write_text(json.dumps(payload, indent=2) + "\n")
        temporary.replace(journal_path)
        self.send_response(204)
        self.end_headers()


journal_server = http.server.HTTPServer(("127.0.0.1", 0), JournalHandler)
journal_thread = threading.Thread(target=lambda: journal_server.serve_forever(poll_interval=0.05), daemon=True)
journal_thread.start()
journal_url = f"http://127.0.0.1:{journal_server.server_port}/{journal_token}"


def remaining_timeout():
    remaining = deadline - time.monotonic()
    if remaining <= 0:
        raise subprocess.TimeoutExpired("practice browser case", 50)
    return max(0.25, remaining)


def invoke(command, *, checked=True, record=True):
    started = time.monotonic()
    try:
        process = subprocess.run(
            [str(cli), f"-s={session}", *command],
            cwd=root,
            text=True,
            capture_output=True,
            timeout=remaining_timeout(),
        )
    except subprocess.TimeoutExpired as error:
        if record:
            def decoded(value):
                return value.decode(errors="replace") if isinstance(value, bytes) else value or ""
            records.append({
                "command": list(command),
                "durationMs": round((time.monotonic() - started) * 1000),
                "returncode": None,
                "error": "outer case deadline exceeded",
                "stdout": decoded(error.stdout),
                "stderr": decoded(error.stderr),
            })
        raise
    entry = {
        "command": list(command),
        "durationMs": round((time.monotonic() - started) * 1000),
        "returncode": process.returncode,
        "stdout": process.stdout,
        "stderr": process.stderr,
    }
    if record:
        records.append(entry)
    if checked and (process.returncode or "### Error" in process.stdout):
        raise RuntimeError(f"Playwright CLI failed: {command[0]}")
    return process.stdout


def parse_result(raw):
    marker = "### Result\n"
    if marker not in raw:
        raise RuntimeError("Playwright CLI run-code returned no result marker")
    payload = raw.split(marker, 1)[1].lstrip()
    return json.JSONDecoder().raw_decode(payload)[0]


def with_harness_query(url):
    parsed = urllib.parse.urlsplit(url)
    query = dict(urllib.parse.parse_qsl(parsed.query, keep_blank_values=True))
    query.update(
        {
            "harnessCase": args.case,
            "harnessJournal": journal_url,
            "cornerAngle": str(args.corner_angle),
            "cornerPull": str(args.corner_pull),
        }
    )
    if args.case == "layouts":
        journeys = json.loads((root / "scripts/practice/layout-journeys.json").read_text())
        query["layout"] = args.layout
        query["journey"] = json.dumps(journeys[args.layout], separators=(",", ":"))
    if args.fault:
        query["harnessFault"] = args.fault
    return urllib.parse.urlunsplit(
        (parsed.scheme, parsed.netloc, parsed.path, urllib.parse.urlencode(query), parsed.fragment)
    )


def write_evidence(name, payload):
    path = output / f"{name}-{run_id}.json"
    path.write_text(json.dumps(payload, indent=2) + "\n")
    return path


try:
    # Close only this harness-owned named session so repeat runs begin cleanly.
    invoke(["close"], checked=False)
    invoke(
        [
            "open",
            with_harness_query(args.url),
            "--browser",
            args.browser,
        ]
    )
    invoke(["resize", str(args.width), str(args.height)])

    script = (
        "scripts/practice/motion-check.js"
        if args.case == "motion"
        else "scripts/practice/native-touch.js"
        if args.case == "native"
        else "scripts/practice/placement-check.js"
        if args.case.startswith("placement")
        else "scripts/practice/browser-check.js"
    )
    raw = invoke(["run-code", "--filename", script])
    result = parse_result(raw)
    if result.get("status") == "CHECKPOINT" and args.fault == "disconnect":
        checkpoint = write_evidence("before-disconnect", {"result": result, "commands": records})
        # Closing the real browser may terminate the CLI worker before its reply.
        # In either ordering, the following ordinary observation must fail.
        invoke(["run-code", "async page => { await page.context().browser().close(); }"], checked=False)
        try:
            response = invoke(["run-code", "async page => await page.evaluate(() => window.practice.observe())"])
            parse_result(response)
        except RuntimeError as disconnect_error:
            disconnect_record = records[-1]
            diagnostics = disconnect_record["stdout"] + disconnect_record["stderr"]
            if not any(marker in diagnostics for marker in ["Session closed", "not open", "closed", "No open"]):
                raise
            result = {
                **result,
                "status": "FAIL",
                "classification": "harness-failure",
                "error": f"HARNESS: browser session disconnected: {disconnect_error}",
                "errors": [*result["errors"], diagnostics],
                "checkpoint": str(checkpoint),
                "elapsedMs": round((50 - (deadline - time.monotonic())) * 1000),
            }
        else:
            raise RuntimeError("Observation unexpectedly succeeded after browser disconnect")
    evidence = write_evidence(
        f"{session}-{args.width}x{args.height}",
        {"result": result, "commands": records},
    )

    if result.get("status") == "FAIL":
        classification = result.get("classification", "uncertain")
        recovery = None
        # Preserve the original bundle first. This one reload is only a health probe.
        if classification == "harness-failure":
            try:
                invoke(["reload"])
                health_raw = invoke(
                    [
                        "run-code",
                        "async page => { await page.waitForTimeout(100); return await page.evaluate(() => window.practice?.observe?.()?.health || null); }",
                    ]
                )
                recovery = {
                    "probe": parse_result(health_raw),
                    "originalEvidence": str(evidence),
                    "statusUnchanged": "FAIL",
                }
            except Exception as recovery_error:  # noqa: BLE001 - retained evidence path matters
                recovery = {
                    "error": str(recovery_error),
                    "originalEvidence": str(evidence),
                    "statusUnchanged": "FAIL",
                }
            write_evidence("recovery-probe", recovery)

        expected_errors = {
            "missing": ("harness-failure", "missing or malformed observation"),
            "stale": ("harness-failure", "stale observation stream"),
            "action-timeout": ("harness-failure", "action blocked Re-rack"),
            "stalled-progress": ("game-failure", "released shot makes progress did not complete"),
            "disconnect": ("harness-failure", "browser session disconnected:"),
        }
        expected_class, expected_error = expected_errors.get(args.fault, (None, None))
        expected_fault = bool(
            args.fault and result.get("faultActive")
            and classification == expected_class
            and expected_error in result.get("error", "")
        )
        print(
            json.dumps(
                {
                    "status": "EXPECTED FAILURE" if expected_fault else "FAIL",
                    "originalStatus": "FAIL",
                    "fault": args.fault,
                    "classification": classification,
                    "error": result.get("error"),
                    "evidence": str(evidence),
                    "recovery": recovery,
                }
            )
        )
        sys.exit(0 if expected_fault else 1)

    if result.get("status") != "PASS":
        raise RuntimeError("Browser case returned no explicit PASS or FAIL result")
    if args.fault:
        raise RuntimeError("Injected harness fault was not detected")
    print(
        json.dumps(
            {
                "status": "PASS",
                "case": args.case,
                "assertions": result.get("assertions", len(result.get("checks", []))),
                "buildRevision": result.get("buildRevision"),
                "viewport": result.get(
                    "viewport", {"width": args.width, "height": args.height}
                ),
                "evidence": str(evidence),
            }
        )
    )
except (Exception, subprocess.TimeoutExpired) as error:  # noqa: BLE001 - classify boundary
    evidence = write_evidence(
        "harness-failure",
        {
            "status": "FAIL",
            "classification": "harness-failure",
            "error": str(error),
            "journal": json.loads(journal_path.read_text()) if journal_path.exists() else None,
            "commands": records,
        },
    )
    print(
        json.dumps(
            {
                "status": "FAIL",
                "classification": "harness-failure",
                "error": str(error),
                "evidence": str(evidence),
            }
        )
    )
    sys.exit(1)
finally:
    journal_server.shutdown()
    journal_server.server_close()
    # Each case owns its browser. Do not leave idle animation loops competing
    # with later simulation/browser checks after evidence has been retained.
    try:
        invoke(["close"], checked=False, record=False)
    except (Exception, subprocess.TimeoutExpired):
        pass
