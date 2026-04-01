#!/usr/bin/env python3
"""
Kennedy Squad — Marketing Data Validator
Validates marketing data completeness before campaign design.

Usage:
    python validate-marketing-data.py --inline 'results_triangle:Y,usp:Y,target_market:Y,offer:Y,tracking:Y'
    python validate-marketing-data.py --file marketing_data.yaml
    python validate-marketing-data.py --interactive

Returns:
    PASS (exit 0) — All required fields present
    FAIL (exit 1) — Missing required fields

Version: 1.0.0
Created: 2026-02-11
"""

import sys
import argparse
import os


# ============================================================================
# REQUIRED FIELDS — Based on Kennedy's Results Triangle + 10 No B.S. Rules
# ============================================================================

REQUIRED_FIELDS = {
    "results_triangle": {
        "name": "Results Triangle (Message + Market + Media)",
        "description": "RIGHT Message + RIGHT Market + RIGHT Media = Results",
        "kennedy_source": "No B.S. Direct Marketing, Chapter 1",
        "remediation": "Define: What is your core message? Who is your starving crowd? What media reaches them?"
    },
    "usp": {
        "name": "Unique Selling Proposition",
        "description": "Why you vs. every other option, including doing nothing",
        "kennedy_source": "Ultimate Marketing Plan, Chapter 2",
        "remediation": "Use Kennedy's 4 USP Pathways: Be first, be best, be different, or be specialized."
    },
    "target_market": {
        "name": "Target Market Profile",
        "description": "Demographics + psychographics + buying behavior of ideal customer",
        "kennedy_source": "No B.S. Direct Marketing, Money Pyramid",
        "remediation": "Define who they are, what keeps them up at 3AM, and where they are on the Money Pyramid."
    },
    "offer": {
        "name": "Direct Response Offer",
        "description": "Clear offer with CTA, guarantee, and urgency",
        "kennedy_source": "No B.S. Direct Marketing, Rule #1",
        "remediation": "Create an offer with: what you sell, why respond NOW, clear instructions, and guarantee."
    },
    "tracking": {
        "name": "Tracking & Measurement",
        "description": "Mechanisms to track response and measure ROI",
        "kennedy_source": "No B.S. Direct Marketing, Rule #4",
        "remediation": "Set up: unique phone numbers, tracked URLs, source codes, and ROI calculation."
    }
}

# Optional but recommended
RECOMMENDED_FIELDS = {
    "money_pyramid_tier": {
        "name": "Money Pyramid Tier",
        "description": "Which tier of the Money Pyramid you are targeting",
        "remediation": "Identify: 1% ultra-rich, 4% rich, 15% comfortable, 60% paycheck, 20% broke"
    },
    "lead_magnet": {
        "name": "Lead Magnet / Bait",
        "description": "Free value offered to attract prospects",
        "remediation": "Create a lead magnet that solves a specific problem for your target market."
    },
    "follow_up_system": {
        "name": "Follow-Up System",
        "description": "Multi-step follow-up sequence",
        "remediation": "Design a minimum 5-step, multi-media follow-up sequence."
    }
}


def parse_inline(inline_str):
    """Parse inline format: 'key:Y,key:N,...'"""
    result = {}
    pairs = inline_str.strip().strip("'\"").split(",")
    for pair in pairs:
        if ":" in pair:
            key, value = pair.strip().split(":", 1)
            result[key.strip()] = value.strip().upper()
    return result


def parse_yaml_file(filepath):
    """Parse a YAML file for field status (simplified, no pyyaml dependency)."""
    result = {}
    if not os.path.exists(filepath):
        print(f"ERROR: File not found: {filepath}")
        sys.exit(1)

    with open(filepath, 'r') as f:
        for line in f:
            line = line.strip()
            if ":" in line and not line.startswith("#"):
                key, value = line.split(":", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'").upper()
                if key in REQUIRED_FIELDS or key in RECOMMENDED_FIELDS:
                    result[key] = value
    return result


def validate(data):
    """Validate marketing data against required fields."""
    passed = []
    failed = []
    warnings = []

    # Check required fields
    for field_key, field_info in REQUIRED_FIELDS.items():
        value = data.get(field_key, "").upper()
        if value in ("Y", "YES", "TRUE", "1", "COMPLETE"):
            passed.append(field_key)
        else:
            failed.append(field_key)

    # Check recommended fields
    for field_key, field_info in RECOMMENDED_FIELDS.items():
        value = data.get(field_key, "").upper()
        if value not in ("Y", "YES", "TRUE", "1", "COMPLETE"):
            warnings.append(field_key)

    return passed, failed, warnings


def run_interactive():
    """Interactive mode — ask about each field."""
    print("\n" + "=" * 70)
    print("KENNEDY SQUAD — Marketing Data Validator (Interactive)")
    print("Based on Dan Kennedy's 10 No B.S. Rules of Direct Marketing")
    print("=" * 70 + "\n")

    data = {}

    print("REQUIRED FIELDS (must all be Y to PASS):\n")
    for field_key, field_info in REQUIRED_FIELDS.items():
        while True:
            response = input(f"  {field_info['name']}? (Y/N): ").strip().upper()
            if response in ("Y", "N", "YES", "NO"):
                data[field_key] = response
                break
            print("    Please answer Y or N.")

    print("\nRECOMMENDED FIELDS (optional but important):\n")
    for field_key, field_info in RECOMMENDED_FIELDS.items():
        while True:
            response = input(f"  {field_info['name']}? (Y/N): ").strip().upper()
            if response in ("Y", "N", "YES", "NO"):
                data[field_key] = response
                break
            print("    Please answer Y or N.")

    return data


def print_results(passed, failed, warnings):
    """Print validation results."""
    total = len(REQUIRED_FIELDS)
    pass_count = len(passed)

    print("\n" + "=" * 70)
    print(f"MARKETING DATA VALIDATION RESULTS: {pass_count}/{total}")
    print("=" * 70)

    if passed:
        print(f"\n  PASSED ({len(passed)}/{total}):")
        for field in passed:
            print(f"    [PASS] {REQUIRED_FIELDS[field]['name']}")

    if failed:
        print(f"\n  FAILED ({len(failed)}/{total}):")
        for field in failed:
            info = REQUIRED_FIELDS[field]
            print(f"    [FAIL] {info['name']}")
            print(f"           Source: {info['kennedy_source']}")
            print(f"           Fix: {info['remediation']}")

    if warnings:
        print(f"\n  WARNINGS ({len(warnings)} recommended fields missing):")
        for field in warnings:
            info = RECOMMENDED_FIELDS[field]
            print(f"    [WARN] {info['name']}")
            print(f"           Fix: {info['remediation']}")

    print("\n" + "-" * 70)

    if not failed:
        print("RESULT: PASS — All required marketing data present.")
        print("Kennedy would say: 'Good. Now go make it rain.'")
    else:
        print(f"RESULT: FAIL — {len(failed)} required field(s) missing.")
        print("Kennedy would say: 'Fix these BEFORE spending a dime on marketing.'")

    print("-" * 70 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Kennedy Squad Marketing Data Validator"
    )
    parser.add_argument(
        "--inline",
        type=str,
        help="Inline data: 'results_triangle:Y,usp:Y,...'"
    )
    parser.add_argument(
        "--file",
        type=str,
        help="Path to YAML file with marketing data"
    )
    parser.add_argument(
        "--interactive",
        action="store_true",
        help="Interactive mode"
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Only output PASS or FAIL"
    )

    args = parser.parse_args()

    # Parse input
    if args.interactive:
        data = run_interactive()
    elif args.inline:
        data = parse_inline(args.inline)
    elif args.file:
        data = parse_yaml_file(args.file)
    else:
        parser.print_help()
        print("\nERROR: Provide --inline, --file, or --interactive")
        sys.exit(1)

    # Validate
    passed, failed, warnings = validate(data)

    # Output
    if args.quiet:
        if not failed:
            print("PASS")
            sys.exit(0)
        else:
            print("FAIL")
            sys.exit(1)
    else:
        print_results(passed, failed, warnings)

    # Exit code
    sys.exit(0 if not failed else 1)


if __name__ == "__main__":
    main()
