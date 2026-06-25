#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Download CAA monthly statistics (105-115 ROC years) and extract passenger counts."""

from __future__ import annotations

import csv
import re
import time
from pathlib import Path
from urllib.parse import urljoin

import requests
import xlrd
from bs4 import BeautifulSoup

BASE_LIST_URL = "https://www.caa.gov.tw/StatisticsYearMonthFile.aspx?a=1091&lang=1"
ROOT = Path(__file__).resolve().parent
RAW_DIR = ROOT / "caa_raw"
OUT_CSV = ROOT / "taiwan_air_passengers.csv"
META_CSV = ROOT / "caa_download_log.csv"

YEAR_MIN = 105  # 2016
YEAR_MAX = 115  # 2026

HALF_TAG = {"下": "lower", "上": "upper", "full": "full"}


def roc_to_ad(roc: int) -> int:
    return roc + 1911


def parse_summary_passengers(wb: xlrd.Book) -> int | None:
    if "提要分析" not in wb.sheet_names():
        return None
    sh = wb.sheet_by_name("提要分析")
    text = "".join(str(sh.cell_value(r, c)) for r in range(sh.nrows) for c in range(sh.ncols))
    patterns = [
        r"本月份進出各機場旅客(\d+)萬(\d+,?\d*)人次",
        r"進出各機場旅客(\d+)萬(\d+,?\d*)人次",
    ]
    for pat in patterns:
        m = re.search(pat, text)
        if m:
            return int(m.group(1)) * 10000 + int(m.group(2).replace(",", ""))
    return None


def parse_table3_passengers(wb: xlrd.Book, month: int) -> int | None:
    if "3" not in wb.sheet_names():
        return None
    sh = wb.sheet_by_name("3")
    target = f"{month}月"
    candidates: list[int] = []
    for r in range(sh.nrows):
        label = str(sh.cell_value(r, 0)).strip()
        if label != target:
            continue
        inout = sh.cell_value(r, 4)
        total = sh.cell_value(r, 2)
        val = inout if isinstance(inout, (int, float)) and inout > 0 else total
        if isinstance(val, (int, float)) and val > 100000:
            candidates.append(int(round(val)))
    return candidates[-1] if candidates else None


def extract_passengers(path: Path, month: int) -> tuple[int | None, str]:
    try:
        wb = xlrd.open_workbook(str(path), encoding_override="cp950")
    except Exception as exc:
        return None, f"open_failed:{exc}"

    val = parse_summary_passengers(wb)
    if val:
        return val, "summary"

    val = parse_table3_passengers(wb, month)
    if val:
        return val, "table3"

    return None, "not_found"


def scrape_year_links(session: requests.Session, roc_year: int) -> list[dict]:
    links: list[dict] = []
    page = 1
    while page <= 10:
        url = f"{BASE_LIST_URL}&symfsy={roc_year}&symfsm=&p={page}"
        resp = session.get(url, timeout=60)
        resp.raise_for_status()
        resp.encoding = "utf-8"
        soup = BeautifulSoup(resp.text, "html.parser")
        page_count = 0

        for tr in soup.select("table tr"):
            tds = tr.find_all("td")
            if len(tds) < 2:
                continue
            title = tds[0].get_text(" ", strip=True)
            m = re.search(r"(\d{2,3})年(\d{1,2})月(?:\((上|下)\))?", title)
            if not m or int(m.group(1)) != roc_year:
                continue
            month = int(m.group(2))
            half = m.group(3) or "full"
            page_count += 1
            for a in tds[1].find_all("a", href=True):
                href = a["href"]
                if "FileAtt.ashx" not in href:
                    continue
                label = (a.get("title") or a.get_text(" ", strip=True)).lower()
                if ".xls" not in label:
                    continue
                id_m = re.search(r"id=(\d+)", href)
                if not id_m:
                    continue
                links.append(
                    {
                        "roc_year": roc_year,
                        "ad_year": roc_to_ad(roc_year),
                        "month": month,
                        "half": half,
                        "file_id": id_m.group(1),
                        "title": title,
                        "url": urljoin(url, href),
                    }
                )

        if page_count == 0:
            break
        page += 1
        time.sleep(0.15)

    return links


def choose_best_files(links: list[dict]) -> dict[tuple[int, int], dict]:
    # 月報主要統計表（提要分析、表3）在 (上) 檔；(下) 多為附表
    priority = {"上": 0, "full": 1, "下": 2}
    best: dict[tuple[int, int], dict] = {}
    for item in links:
        key = (item["roc_year"], item["month"])
        if key not in best or priority[item["half"]] < priority[best[key]["half"]]:
            best[key] = item
    return best


def main() -> None:
    RAW_DIR.mkdir(exist_ok=True)
    session = requests.Session()
    session.headers.update(
        {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Academic-Research/1.0"}
    )

    print(f"Scraping ROC {YEAR_MIN}-{YEAR_MAX} from CAA...")
    links: list[dict] = []
    for roc in range(YEAR_MIN, YEAR_MAX + 1):
        year_links = scrape_year_links(session, roc)
        links.extend(year_links)
        print(f"  ROC {roc} ({roc_to_ad(roc)}): {len(year_links)} links")
        time.sleep(0.15)

    best = choose_best_files(links)
    print(f"Selected {len(best)} month entries")

    rows: list[dict] = []
    log_rows: list[dict] = []

    for (roc, month), meta in sorted(best.items()):
        ad = roc_to_ad(roc)
        tag = HALF_TAG.get(meta["half"], meta["half"])
        fname = f"{roc:03d}-{month:02d}-{tag}.xls"
        fpath = RAW_DIR / fname

        if not fpath.exists() or fpath.stat().st_size < 5000:
            print(f"Downloading {roc}年{month}月({meta['half']}) -> {fname}")
            resp = session.get(meta["url"], timeout=120)
            resp.raise_for_status()
            fpath.write_bytes(resp.content)
            time.sleep(0.15)

        passengers, method = extract_passengers(fpath, month)
        log_rows.append(
            {
                **meta,
                "file": fname,
                "passengers": passengers,
                "parse_method": method,
            }
        )

        if passengers is None:
            print(f"WARN parse failed: {fname} ({method})")
            continue

        rows.append(
            {
                "date": f"{ad:04d}-{month:02d}-01",
                "year": ad,
                "month": month,
                "roc_year": roc,
                "passengers": passengers,
                "source_file": fname,
                "parse_method": method,
            }
        )

    rows.sort(key=lambda x: x["date"])

    fieldnames = ["date", "year", "month", "roc_year", "passengers", "source_file", "parse_method"]
    with OUT_CSV.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    if log_rows:
        with META_CSV.open("w", newline="", encoding="utf-8-sig") as f:
            writer = csv.DictWriter(f, fieldnames=list(log_rows[0].keys()))
            writer.writeheader()
            writer.writerows(log_rows)

    ok = len(rows)
    fail = len(best) - ok
    print(f"Done: {ok} months parsed, {fail} failed -> {OUT_CSV}")
    if rows:
        print(f"Range: {rows[0]['date']} ~ {rows[-1]['date']}")


if __name__ == "__main__":
    main()
