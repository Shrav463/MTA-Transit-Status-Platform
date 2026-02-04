import json
import os
from datetime import datetime, timezone

import requests

CACHE = {"stations": None, "equip_by_complex": None, "coords": None, "coords_ts": 0}

DT_FMT = "%m/%d/%Y %I:%M:%S %p"

# NY Open Data dataset (coordinates by complex_id)
COORDS_URL = (
    "https://data.ny.gov/resource/5f5g-n3cz.json"
    "?$select=complex_id,complex_name,gtfs_latitude,gtfs_longitude"
    "&$limit=50000"
)

# Cache coords for 24 hours (Lambda warm reuse)
COORDS_TTL_SECONDS = 24 * 60 * 60


def _resp(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*",
        },
        "body": json.dumps(body),
    }


def _headers():
    h = {"Accept": "application/json"}
    key = (os.getenv("MTA_API_KEY") or "").strip()
    if key:
        h["x-api-key"] = key
    return h


def _fetch_json(url: str, extra_headers=None):
    h = _headers()
    if extra_headers:
        h.update(extra_headers)
    r = requests.get(url, headers=h, timeout=20)
    r.raise_for_status()
    return r.json()


def _split_lines(trainno: str):
    if not trainno:
        return []
    parts = [p.strip() for p in str(trainno).split("/") if p.strip()]
    return parts


def _parse_dt(s: str):
    try:
        return datetime.strptime(s, DT_FMT).replace(tzinfo=timezone.utc)
    except Exception:
        return None


def _load_equipment():
    """
    Equipment feed fields (confirmed):
      station, trainno, equipmentno, equipmenttype, stationcomplexid, isactive
    We use stationcomplexid as the stationId for our API.
    """
    if CACHE["stations"] is not None and CACHE["equip_by_complex"] is not None:
        return CACHE["stations"], CACHE["equip_by_complex"]

    eq_url = (os.getenv("MTA_EQUIPMENT_URL") or "").strip()
    if not eq_url:
        raise RuntimeError("Missing MTA_EQUIPMENT_URL env var")

    items = _fetch_json(eq_url)
    if not isinstance(items, list):
        items = items.get("data") or items.get("results") or []

    stations_map = {}          # complexId -> {id,name,lines}
    equip_by_complex = {}      # complexId -> {elevators:set, escalators:set}

    for it in items:
        if str(it.get("isactive", "Y")).upper() != "Y":
            continue

        complex_id = str(it.get("stationcomplexid") or "").strip()
        station_name = str(it.get("station") or "").strip()
        trainno = str(it.get("trainno") or "").strip()

        equip_id = str(it.get("equipmentno") or "").strip()
        equip_type = str(it.get("equipmenttype") or "").upper().strip()  # "EL" or "ES"

        if not complex_id or not station_name or not equip_id:
            continue

        lines = _split_lines(trainno)
        if complex_id not in stations_map:
            stations_map[complex_id] = {"id": complex_id, "name": station_name, "lines": lines}
        else:
            existing = set(stations_map[complex_id].get("lines") or [])
            for ln in lines:
                existing.add(ln)
            stations_map[complex_id]["lines"] = sorted(existing)

        equip_by_complex.setdefault(complex_id, {"elevators": set(), "escalators": set()})
        if equip_type == "EL":
            equip_by_complex[complex_id]["elevators"].add(equip_id)
        elif equip_type == "ES":
            equip_by_complex[complex_id]["escalators"].add(equip_id)

    stations = list(stations_map.values())
    stations.sort(key=lambda s: s["name"].lower())

    equip_by_complex_json = {
        cid: {"elevators": sorted(list(v["elevators"])), "escalators": sorted(list(v["escalators"]))}
        for cid, v in equip_by_complex.items()
    }

    CACHE["stations"] = stations
    CACHE["equip_by_complex"] = equip_by_complex_json
    return stations, equip_by_complex_json


def _load_outages():
    """
    Outages feed fields (confirmed):
      station, trainno, equipment, equipmenttype, outagedate, estimatedreturntoservice, reason, isupcomingoutage
    """
    out_url = (os.getenv("MTA_OUTAGES_URL") or "").strip()
    if not out_url:
        raise RuntimeError("Missing MTA_OUTAGES_URL env var")

    items = _fetch_json(out_url)
    if not isinstance(items, list):
        items = items.get("data") or items.get("results") or []

    out = []
    now = datetime.now(timezone.utc)

    for it in items:
        equip_id = str(it.get("equipment") or "").strip()
        equip_type = str(it.get("equipmenttype") or "").upper().strip()
        reason = str(it.get("reason") or "").strip()

        is_upcoming = str(it.get("isupcomingoutage") or "N").upper() == "Y"
        od = _parse_dt(str(it.get("outagedate") or "").strip())
        rt = _parse_dt(str(it.get("estimatedreturntoservice") or "").strip())

        active = True
        if is_upcoming and od and od > now:
            active = False

        out.append({
            "equipment_id": equip_id,
            "equipment_type": equip_type,
            "reason": reason,
            "outage_date": it.get("outagedate"),
            "estimated_return_to_service": it.get("estimatedreturntoservice"),
            "is_upcoming": is_upcoming,
            "is_active": active,
        })

    return out


def _load_coords():
    """
    Returns dict: { complex_id: {lat: float, lng: float, name: str} }
    Cached for COORDS_TTL_SECONDS to avoid frequent calls.
    """
    now_ts = int(datetime.now(timezone.utc).timestamp())
    cached = CACHE.get("coords")
    cached_ts = int(CACHE.get("coords_ts") or 0)

    if cached is not None and (now_ts - cached_ts) < COORDS_TTL_SECONDS:
        return cached

    # Important: some public APIs block requests without a User-Agent
    rows = _fetch_json(COORDS_URL, extra_headers={"User-Agent": "mta-transit-aws/1.0"})

    coords = {}
    if isinstance(rows, list):
        for r in rows:
            cid = str(r.get("complex_id") or "").strip()
            lat = r.get("gtfs_latitude")
            lng = r.get("gtfs_longitude")
            if not cid or lat is None or lng is None:
                continue
            try:
                coords[cid] = {
                    "lat": float(lat),
                    "lng": float(lng),
                    "name": str(r.get("complex_name") or "").strip(),
                }
            except Exception:
                continue

    CACHE["coords"] = coords
    CACHE["coords_ts"] = now_ts
    return coords


def lambda_handler(event, context):
    try:
        path = event.get("rawPath") or event.get("path") or "/"
        qs = event.get("queryStringParameters") or {}
        station_id = (qs.get("stationId") or "").strip()

        # GET /stations
        if path.endswith("/stations"):
            stations, _ = _load_equipment()
            return _resp(200, stations)

        # GET /status?stationId=...
        if path.endswith("/status"):
            if not station_id:
                return _resp(400, {"error": "stationId is required"})

            _, equip_by_complex = _load_equipment()
            outages = _load_outages()

            equip = equip_by_complex.get(station_id, {"elevators": [], "escalators": []})
            elev_ids = set(equip.get("elevators", []))
            esc_ids = set(equip.get("escalators", []))

            elev_out_active = [o for o in outages if o["is_active"] and o["equipment_id"] in elev_ids]
            esc_out_active = [o for o in outages if o["is_active"] and o["equipment_id"] in esc_ids]

            elevator_status = "Operational" if len(elev_out_active) == 0 else "Out of Service"
            escalator_status = "Operational" if len(esc_out_active) == 0 else "Out of Service"

            alerts = []
            for o in outages:
                if o["equipment_id"] in elev_ids or o["equipment_id"] in esc_ids:
                    alerts.append({
                        "equipment_id": o["equipment_id"],
                        "equipment_type": o["equipment_type"],
                        "reason": o["reason"],
                        "outagedate": o["outage_date"],
                        "estimatedreturntoservice": o["estimated_return_to_service"],
                        "is_upcoming": o["is_upcoming"],
                        "is_active": o["is_active"],
                    })
            alerts = alerts[:12]

            return _resp(200, {
                "elevator_status": elevator_status,
                "escalator_status": escalator_status,
                "alerts": alerts,
                "last_updated": datetime.now(timezone.utc).isoformat(),
            })

        # GET /coords
        if path.endswith("/coords"):
            coords = _load_coords()
            return _resp(200, {"count": len(coords), "coords": coords})

        return _resp(404, {"error": "Not found"})
    except Exception as e:
        return _resp(500, {"error": str(e)})
