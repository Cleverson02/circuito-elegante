#!/usr/bin/env python3
"""
Kennedy Squad — Antipattern Validator
Checks marketing campaigns for Dan Kennedy antipatterns (common mistakes).

Usage:
    python validate-antipattern.py --interactive
    python validate-antipattern.py --inline 'institutional_ad:N,no_tracking:N,no_offer:N,...'
    python validate-antipattern.py --file campaign_audit.yaml

Returns:
    PASS (exit 0) — No antipatterns detected
    VETO (exit 1) — Antipatterns detected, campaign blocked

Version: 1.0.0
Created: 2026-02-11
Linked Veto: VT1-008
"""

import sys
import argparse
import os


# ============================================================================
# ANTIPATTERNS — Based on Kennedy's 9 Fatal Marketing Mistakes + 10 Rules
# ============================================================================

CRITICAL_ANTIPATTERNS = {
    "institutional_ad": {
        "name": "Institutional/Image Advertising",
        "severity": "CRITICAL",
        "description": "Spending money on brand/image advertising with no direct response mechanism",
        "kennedy_quote": "Image advertising is the refuge of the lazy marketer and the playground of the ad agency getting rich off your ignorance.",
        "source": "No B.S. Direct Marketing, Rule #1",
        "remediation": "Add a clear offer, call to action, tracking mechanism, and response deadline to EVERY piece."
    },
    "no_tracking": {
        "name": "No Tracking/Measurement",
        "severity": "CRITICAL",
        "description": "Marketing without tracking codes, unique phone numbers, or response measurement",
        "kennedy_quote": "If you can't measure it, you can't manage it, and you sure as hell shouldn't be funding it.",
        "source": "No B.S. Direct Marketing, Rule #4",
        "remediation": "Add unique tracking codes, dedicated phone numbers, and tracked URLs to every campaign."
    },
    "no_offer": {
        "name": "No Clear Offer",
        "severity": "CRITICAL",
        "description": "Marketing piece without a specific, compelling offer",
        "kennedy_quote": "There will ALWAYS be an offer. Or more than one. Always.",
        "source": "No B.S. Direct Marketing, Rule #1",
        "remediation": "Add a specific offer with: what they get, what it costs, why respond now, how to respond."
    },
    "no_urgency": {
        "name": "No Reason to Respond NOW",
        "severity": "CRITICAL",
        "description": "No deadline, scarcity, or urgency mechanism",
        "kennedy_quote": "There will always be a reason to respond right now.",
        "source": "No B.S. Direct Marketing, Rule #2",
        "remediation": "Add: real deadline, limited quantity, expiring bonus, price increase date."
    },
    "no_follow_up": {
        "name": "No Follow-Up System",
        "severity": "CRITICAL",
        "description": "Single-touch marketing with no follow-up sequence",
        "kennedy_quote": "Fortune is in the follow-up. Most sales happen after the 5th to 12th contact.",
        "source": "Magnetic Marketing, 9 Fatal Mistakes #5",
        "remediation": "Design a minimum 5-step, multi-media follow-up sequence."
    }
}

WARNING_ANTIPATTERNS = {
    "competing_on_price": {
        "name": "Competing on Price",
        "severity": "WARNING",
        "description": "Positioning as the cheapest option instead of the most valuable",
        "kennedy_quote": "If you compete on price, you attract price shoppers. And price shoppers have zero loyalty.",
        "source": "Ultimate Marketing Plan, Chapter 2",
        "remediation": "Build a USP based on value, specialization, or uniqueness — not low price."
    },
    "no_usp": {
        "name": "No Unique Selling Proposition",
        "severity": "WARNING",
        "description": "No clear differentiation from competitors",
        "kennedy_quote": "Without a USP, you are a me-too commodity competing only on price.",
        "source": "Ultimate Marketing Plan, Chapter 2",
        "remediation": "Use Kennedy's 4 USP Pathways: be first, be best, be different, be specialized."
    },
    "no_guarantee": {
        "name": "No Risk Reversal / Guarantee",
        "severity": "WARNING",
        "description": "Asking prospect to bear all the risk",
        "kennedy_quote": "If you truly believe in your product, offer the strongest guarantee possible.",
        "source": "Ultimate Sales Letter, Step 21",
        "remediation": "Add: money-back guarantee, better-than-risk-reversal, or conditional guarantee."
    },
    "b_pile_format": {
        "name": "B-Pile Mail Format",
        "severity": "WARNING",
        "description": "Direct mail that looks like bulk/junk mail",
        "kennedy_quote": "Your letter gets sorted in 3 seconds. A-Pile gets opened. B-Pile gets trashed.",
        "source": "Ultimate Sales Letter, A-Pile/B-Pile Framework",
        "remediation": "Use: real stamps, hand-addressed or simulated handwriting, personal return address."
    },
    "no_referral_system": {
        "name": "No Referral System",
        "severity": "WARNING",
        "description": "No systematic approach to generating referrals",
        "kennedy_quote": "If you don't have a referral system, you don't have a marketing system.",
        "source": "Ultimate No BS Referral Machine",
        "remediation": "Implement Kennedy's 11-Point Referral System."
    },
    "vanity_metrics": {
        "name": "Vanity Metrics Focus",
        "severity": "WARNING",
        "description": "Tracking likes, followers, impressions instead of revenue and ROI",
        "kennedy_quote": "Likes don't deposit. Clicks don't pay rent. Only RESULTS matter.",
        "source": "No B.S. Social Media Marketing",
        "remediation": "Track only: leads, conversions, revenue, ROI, customer acquisition cost."
    },
    "no_list_building": {
        "name": "No List Building",
        "severity": "WARNING",
        "description": "Not capturing leads and building a house list",
        "kennedy_quote": "The most valuable asset in any business is the list.",
        "source": "Magnetic Marketing, 9 Fatal Mistakes #4",
        "remediation": "Add lead capture to every touchpoint. Build and maintain your house list."
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
    """Parse a YAML file for antipattern flags."""
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
                all_patterns = {**CRITICAL_ANTIPATTERNS, **WARNING_ANTIPATTERNS}
                if key in all_patterns:
                    result[key] = value
    return result


def run_interactive():
    """Interactive mode — check each antipattern."""
    print("\n" + "=" * 70)
    print("KENNEDY SQUAD — Antipattern Validator (Interactive)")
    print("Based on Dan Kennedy's 9 Fatal Mistakes + 10 No B.S. Rules")
    print("=" * 70)
    print("\nAnswer Y if the antipattern IS PRESENT (bad), N if it is NOT present (good).\n")

    data = {}

    print("CRITICAL ANTIPATTERNS (any Y = VETO):\n")
    for key, info in CRITICAL_ANTIPATTERNS.items():
        while True:
            response = input(f"  Is '{info['name']}' present? (Y/N): ").strip().upper()
            if response in ("Y", "N", "YES", "NO"):
                data[key] = response
                break
            print("    Please answer Y or N.")

    print("\nWARNING ANTIPATTERNS (Y = warning, recommended to fix):\n")
    for key, info in WARNING_ANTIPATTERNS.items():
        while True:
            response = input(f"  Is '{info['name']}' present? (Y/N): ").strip().upper()
            if response in ("Y", "N", "YES", "NO"):
                data[key] = response
                break
            print("    Please answer Y or N.")

    return data


def validate(data):
    """Validate campaign against antipatterns."""
    critical_found = []
    warnings_found = []
    clean = []

    # Check critical antipatterns
    for key, info in CRITICAL_ANTIPATTERNS.items():
        value = data.get(key, "").upper()
        if value in ("Y", "YES", "TRUE", "1", "PRESENT"):
            critical_found.append({"key": key, **info})
        else:
            clean.append(key)

    # Check warning antipatterns
    for key, info in WARNING_ANTIPATTERNS.items():
        value = data.get(key, "").upper()
        if value in ("Y", "YES", "TRUE", "1", "PRESENT"):
            warnings_found.append({"key": key, **info})
        else:
            clean.append(key)

    return critical_found, warnings_found, clean


def print_results(critical_found, warnings_found, clean):
    """Print validation results."""
    total_checked = len(CRITICAL_ANTIPATTERNS) + len(WARNING_ANTIPATTERNS)
    issues = len(critical_found) + len(warnings_found)

    print("\n" + "=" * 70)
    print(f"ANTIPATTERN VALIDATION: {total_checked - issues}/{total_checked} clean")
    print("=" * 70)

    if critical_found:
        print(f"\n  CRITICAL ANTIPATTERNS DETECTED ({len(critical_found)}):")
        for ap in critical_found:
            print(f"\n    [CRITICAL] {ap['name']}")
            print(f"    Description: {ap['description']}")
            print(f"    Kennedy: \"{ap['kennedy_quote'][:80]}...\"")
            print(f"    Source: {ap['source']}")
            print(f"    Fix: {ap['remediation']}")

    if warnings_found:
        print(f"\n  WARNING ANTIPATTERNS DETECTED ({len(warnings_found)}):")
        for ap in warnings_found:
            print(f"\n    [WARNING] {ap['name']}")
            print(f"    Description: {ap['description']}")
            print(f"    Fix: {ap['remediation']}")

    if clean:
        print(f"\n  CLEAN ({len(clean)}):")
        for key in clean[:5]:  # Show first 5 clean items
            print(f"    [CLEAN] {key}")
        if len(clean) > 5:
            print(f"    ... and {len(clean) - 5} more")

    print("\n" + "-" * 70)

    if critical_found:
        print(f"RESULT: VETO — {len(critical_found)} critical antipattern(s) detected.")
        print("Campaign BLOCKED until critical antipatterns are resolved.")
        print("Kennedy: 'Fix these or don't bother launching.'")
    elif warnings_found:
        print(f"RESULT: PASS (with {len(warnings_found)} warnings)")
        print("Campaign can proceed but consider fixing warnings for better results.")
    else:
        print("RESULT: PASS — No antipatterns detected.")
        print("Kennedy would say: 'Now that's No B.S. marketing.'")

    print("-" * 70 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Kennedy Squad Antipattern Validator (VT1-008)"
    )
    parser.add_argument(
        "--interactive",
        action="store_true",
        help="Interactive mode — check each antipattern"
    )
    parser.add_argument(
        "--inline",
        type=str,
        help="Inline flags: 'institutional_ad:N,no_tracking:N,...'"
    )
    parser.add_argument(
        "--file",
        type=str,
        help="Path to YAML file with antipattern flags"
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Only output PASS or VETO"
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
        print("\nERROR: Provide --interactive, --inline, or --file")
        sys.exit(1)

    # Validate
    critical_found, warnings_found, clean = validate(data)

    # Output
    if args.quiet:
        if critical_found:
            print("VETO")
            sys.exit(1)
        else:
            print("PASS")
            sys.exit(0)
    else:
        print_results(critical_found, warnings_found, clean)

    # Exit code: VETO (1) if critical antipatterns, PASS (0) otherwise
    sys.exit(1 if critical_found else 0)


if __name__ == "__main__":
    main()
