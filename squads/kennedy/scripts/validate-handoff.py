#!/usr/bin/env python3
"""
Kennedy Squad — Handoff Validator
Validates handoff YAML files against mandatory field requirements.

Usage:
    python validate-handoff.py <handoff-file.yaml>
    python validate-handoff.py --check-fields 'source_agent:kennedy-sales-letter,target_agent:kennedy-copy,current_phase:PHASE-2'

Returns:
    PASS (exit 0) — All mandatory fields populated
    FAIL (exit 1) — Missing mandatory fields

Version: 1.0.0
Created: 2026-02-11
Linked Veto: VT3-001
"""

import sys
import argparse
import os


# ============================================================================
# MANDATORY FIELDS — From templates/handoff-context-tmpl.yaml
# ============================================================================

MANDATORY_FIELDS = [
    "source_agent",
    "target_agent",
    "current_phase",
    "marketing_data_completeness",
    "key_decisions",
    "primary_objective",
    "all_phase_vetos_passed"
]

CONDITIONAL_FIELDS = {
    "campaign_type": {
        "required_if_phase": 1,
        "description": "Campaign type must be defined after PHASE-1"
    },
    "media_channels": {
        "required_if_phase": 2,
        "description": "Media channels must be listed after PHASE-2"
    },
    "response_targets": {
        "required_if_phase": 2,
        "description": "Response targets must be set after PHASE-2"
    }
}


def parse_yaml_simple(filepath):
    """Simple YAML parser — extracts key-value pairs without pyyaml dependency."""
    data = {}
    if not os.path.exists(filepath):
        print(f"ERROR: File not found: {filepath}")
        sys.exit(1)

    current_section = ""
    with open(filepath, 'r') as f:
        for line in f:
            stripped = line.strip()

            # Skip comments and empty lines
            if not stripped or stripped.startswith("#"):
                continue

            # Track sections
            if stripped.endswith(":") and not stripped.startswith("-"):
                current_section = stripped[:-1].strip()
                continue

            # Extract key-value pairs
            if ":" in stripped:
                parts = stripped.split(":", 1)
                key = parts[0].strip().lstrip("- ")
                value = parts[1].strip().strip('"').strip("'")

                # Map to our field names
                if key == "source_agent":
                    data["source_agent"] = value
                elif key == "target_agent":
                    data["target_agent"] = value
                elif key == "current_phase":
                    data["current_phase"] = value
                elif key == "completeness":
                    data["marketing_data_completeness"] = value
                elif key == "primary_objective":
                    data["primary_objective"] = value
                elif key == "all_phase_vetos_passed":
                    data["all_phase_vetos_passed"] = value
                elif key == "decision":
                    data["key_decisions"] = value
                elif key == "campaign_type":
                    data["campaign_type"] = value
                elif key == "media_channels":
                    data["media_channels"] = value
                elif key in ("response_rate", "roi_target"):
                    data["response_targets"] = value

    return data


def parse_inline(inline_str):
    """Parse inline format: 'key:value,key:value,...'"""
    result = {}
    pairs = inline_str.strip().strip("'\"").split(",")
    for pair in pairs:
        if ":" in pair:
            key, value = pair.strip().split(":", 1)
            result[key.strip()] = value.strip()
    return result


def get_phase_number(phase_str):
    """Extract phase number from string like 'PHASE-2'."""
    try:
        return int(phase_str.replace("PHASE-", "").replace("phase-", ""))
    except (ValueError, AttributeError):
        return 0


def validate(data):
    """Validate handoff data against mandatory fields."""
    passed = []
    failed = []
    warnings = []

    # Check mandatory fields
    for field in MANDATORY_FIELDS:
        value = data.get(field, "")
        if value and value not in ("", "false", "False", "0", "null", "None", "N/A"):
            passed.append(field)
        else:
            failed.append(field)

    # Check conditional fields based on phase
    current_phase = get_phase_number(data.get("current_phase", "PHASE-0"))
    for field, rules in CONDITIONAL_FIELDS.items():
        if current_phase >= rules["required_if_phase"]:
            value = data.get(field, "")
            if not value or value in ("", "null", "None", "[]"):
                warnings.append({
                    "field": field,
                    "description": rules["description"]
                })

    return passed, failed, warnings


def print_results(passed, failed, warnings, data):
    """Print validation results."""
    total = len(MANDATORY_FIELDS)
    pass_count = len(passed)

    print("\n" + "=" * 70)
    print(f"HANDOFF VALIDATION RESULTS: {pass_count}/{total}")
    print("=" * 70)

    # Show transfer info
    source = data.get("source_agent", "?")
    target = data.get("target_agent", "?")
    phase = data.get("current_phase", "?")
    print(f"\n  Transfer: {source} --> {target} (Phase: {phase})")

    if passed:
        print(f"\n  PASSED ({len(passed)}/{total}):")
        for field in passed:
            print(f"    [PASS] {field}: {data.get(field, '')[:50]}")

    if failed:
        print(f"\n  FAILED ({len(failed)}/{total}):")
        for field in failed:
            print(f"    [FAIL] {field}: MISSING or EMPTY")

    if warnings:
        print(f"\n  WARNINGS ({len(warnings)}):")
        for w in warnings:
            print(f"    [WARN] {w['field']}: {w['description']}")

    print("\n" + "-" * 70)

    if not failed:
        print("RESULT: PASS — Handoff context is complete.")
        print("Transfer approved. Context preserved for target agent.")
    else:
        print(f"RESULT: FAIL — {len(failed)} mandatory field(s) missing.")
        print("VETO VT3-001 TRIGGERED: Cannot handoff without complete context.")
        print("Fill template: templates/handoff-context-tmpl.yaml")

    print("-" * 70 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Kennedy Squad Handoff Validator (VT3-001)"
    )
    parser.add_argument(
        "file",
        nargs="?",
        help="Path to handoff YAML file"
    )
    parser.add_argument(
        "--check-fields",
        type=str,
        help="Inline field check: 'source_agent:X,target_agent:Y,...'"
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Only output PASS or FAIL"
    )

    args = parser.parse_args()

    # Parse input
    if args.check_fields:
        data = parse_inline(args.check_fields)
    elif args.file:
        data = parse_yaml_simple(args.file)
    else:
        parser.print_help()
        print("\nERROR: Provide a YAML file or --check-fields")
        sys.exit(1)

    # Validate
    passed, failed, warnings = validate(data)

    # Output
    if args.quiet:
        print("PASS" if not failed else "FAIL")
    else:
        print_results(passed, failed, warnings, data)

    # Exit code
    sys.exit(0 if not failed else 1)


if __name__ == "__main__":
    main()
