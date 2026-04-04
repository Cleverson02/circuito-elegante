# Execution Plan — Batch Enrichment of 92 Hotels

**Start Date:** 2026-04-04 (today)  
**Target Completion:** 2026-04-05 (24 hours)  
**Agent:** @hotel-enrichment:enrichment-chief  
**Method:** Progressive rollout (Phase 6a → 6b → 6c)

---

## Phase 6a: Initial Batch (Hotels 1-10)

### Objective
Validate chatbot-interviewer v2.0.0 across small sample before scaling to all 92.

### Command
```
@hotel-enrichment:enrichment-chief
*enrich-batch 1-10
```

### Expected Duration
1-2 hours (10 hotels × 5-10 min per hotel)

### Success Criteria
- ✅ Completeness: >= 75% per hotel
- ✅ Quality Score: >= 0.80 per hotel
- ✅ Chatbot success rate: >= 85% (at least 2 hotels with chatbot)
- ✅ No fatal errors or hangs
- ✅ Fallback to web-scraper working when chatbot unavailable

### Monitoring During Execution

Watch for:
1. **Console output:** Each hotel logs enrichment progress
2. **Data quality:** Check fields being filled (should match 58-field taxonomy)
3. **Chatbot detection:** Log should show "Asksuite", "Tawk.to", etc. or "No chatbot detected"
4. **Timeouts:** Any hotel taking >10 min → likely stuck, investigate
5. **Quality issues:** Null fields or low quality score → manual review needed

### What to Look For

**Success indicators:**
- `Hotel X: completeness 85%, quality 0.90` ✅
- `Hotel Y: chatbot detected (Asksuite), 5 questions answered` ✅
- `Hotel Z: no chatbot, fallback to web-scraper, completeness 70%` ✅

**Warning indicators:**
- `Hotel X: timeout after 5 minutes` ⚠️
- `Hotel Y: quality score 0.65 (below threshold)` ⚠️
- `Hotel Z: chatbot failed, fallback also failed` ❌

### Go/No-Go Decision

**GO (Expand to Phase 6b):** If 8+ of 10 hotels pass criteria
- Decision threshold: >= 80% hotels successful
- Next step: Run Phase 6b (hotels 1-30)

**NO-GO (Investigate):** If < 8 of 10 hotels pass
- Stop batch execution
- Review failed hotel logs
- Identify pattern (HE_005 failure? HE_006 failure? Scraper issue?)
- Fix chatbot-interviewer or escalate
- Re-run Phase 6a with fixed version

---

## Phase 6b: Expanded Batch (Hotels 1-30)

### Objective
Expand to 30 hotels (includes 10 from Phase 6a) to build confidence before full rollout.

### Command
```
@hotel-enrichment:enrichment-chief
*enrich-batch 1-30
```

### Expected Duration
2-4 hours (30 hotels × 5-10 min each, some already cached)

### Success Criteria (Phase 6b Only, excluding 6a)
- ✅ Completeness: >= 75% per hotel (new batch)
- ✅ Quality Score: >= 0.80 per hotel
- ✅ No new error patterns vs Phase 6a
- ✅ Chatbot type distribution visible (Asksuite, Tawk.to, etc.)

### New Insights Expected

By 30 hotels, should see:
- Chatbot type distribution (~how many Asksuite, Tawk.to, etc.)
- Common null fields (wifi, event_space, etc.)
- Fallback effectiveness (% hotels without chatbot)
- Actual completion time per hotel
- Any unique chatbot patterns not seen in Phase 6a

### Go/No-Go Decision

**GO (Proceed to Phase 6c):** If combined (6a+6b) success > 85%
- Decision threshold: >= 25 of 30 hotels successful
- Next step: Run Phase 6c (all 92 hotels)

**NO-GO (Debug):** If success <= 85%
- Analyze failed hotels (which types failing?)
- Possible issues:
  - HE_006 doesn't handle some CSS patterns
  - HE_005 delays insufficient for slow chatbots
  - Web-scraper failing on certain site structures
- Fix and re-run Phase 6b

---

## Phase 6c: Full Deployment (All 92 Hotels)

### Objective
Complete enrichment of all 92 hotels in batch.

### Command
```
@hotel-enrichment:enrichment-chief
*enrich-all
```

### Expected Duration
8-12 hours total (can run while you do other work)

### Success Criteria (Full Batch)
- ✅ >= 85% of 92 hotels at 75%+ completeness
- ✅ >= 90% of 92 hotels at 0.80+ quality score
- ✅ Zero critical failures (no data corruption)
- ✅ All enrichment data validated before publishing

### Final Quality Gate

Before publishing to PostgreSQL:
```
Data Quality Check:
  ✅ No null-filled hotels (completeness < 30%)
  ✅ No contradictory data (same field different values)
  ✅ No obvious spam/garbage (e.g., urls in description)
  ✅ All timestamps reasonable (enriched_at)
  ✅ All sources documented (which agent provided which field)
```

If any hotel fails gate:
- Flag for manual review
- Mark as "needs_validation" in database
- Do NOT publish until reviewed

### Expected Outcome

Based on Phase 5 Test #1 + Phase 6a/6b validation:

```
Final Enrichment Results (92 hotels):

Completeness Distribution:
  90-100%: ~30 hotels (33%)  - Excellent
  80-90%:  ~45 hotels (49%)  - Good
  70-80%:  ~15 hotels (16%)  - Acceptable
  <70%:    ~2 hotels  (2%)   - Requires manual enrichment

Quality Score Distribution:
  0.90+:   ~50 hotels (54%)  - Excellent
  0.80-0.90: ~35 hotels (38%) - Good
  0.70-0.80: ~7 hotels  (8%)   - Acceptable

Data Sources:
  Chatbot: ~46 hotels (50%)  - Interviewed via chatbot-interviewer
  Web:     ~92 hotels (100%) - Scraped via web-scraper
  Extract: ~92 hotels (100%) - Structured via data-extractor
  OTA:     ~30 hotels (33%)  - Validated via OTA sources

Expected Timeline:
  Phase 6a: 2026-04-04 (1-2 hours)
  Phase 6b: 2026-04-04 (2-4 hours, after 6a approval)
  Phase 6c: 2026-04-04/05 (8-12 hours, can run overnight)
  Total:    ~24 hours wall-clock time
```

---

## Monitoring & Alerts

### Real-time Dashboard

During Phase 6c, track:
```
Hotels Processed:     45/92  (49%)
Average Completeness: 82%
Average Quality:      0.87
Hotels with Chatbot:  24 (52%)
Fallback Rate:        50%
Failures:             0
ETA Completion:       2026-04-05 09:00
```

### Alert Thresholds

Stop and investigate if:
- **Failure Rate > 10%** (e.g., 10+ hotels failing out of 100)
- **Quality Drop > 5%** (e.g., hotels dropping from 0.85 → 0.80)
- **Chatbot Success < 70%** (fewer questions answered than expected)
- **Timeout Rate > 10%** (indicates HE_005 issue)
- **Any hotel hangs > 15 min** (kill and move to next)

### Troubleshooting

If alert triggered:
1. **Pause batch** (don't continue adding new hotels)
2. **Review logs** of last 3-5 hotels that failed
3. **Identify pattern:**
   - Same chatbot type failing? → HE_006 issue
   - Many timeouts? → HE_005 issue
   - Mostly web-scraper failures? → Web scraper issue
   - Random failures? → Check network/API rate limits
4. **Fix root cause** (update chatbot-interviewer or web-scraper)
5. **Re-run** failed batch with fix

---

## Post-Completion (Day 2)

### Data Validation
1. **Completeness Review:** Sort by completeness, review <70% hotels
2. **Quality Review:** Check any 0.70-0.80 quality score hotels
3. **Manual Enrichment:** For critical missing fields (location, email, etc.)
4. **PostgreSQL Publish:** Once validation complete, upsert to database

### Analysis & Reporting
1. **Completeness Report:** By category (accommodations, infrastructure, etc.)
2. **Chatbot Effectiveness:** Which types of chatbots most effective?
3. **Common Gaps:** Which fields hardest to fill?
4. **Fallback Analysis:** How well did web-scraper perform?

### Next Steps
1. **Stella Concierge:** Integrate enriched hotel data
2. **Feedback Loop:** Any data gaps? Can trigger focused re-enrichment
3. **Monitoring:** Track data freshness over time

---

## Quick Reference Commands

```bash
# Phase 6a: Initial batch
@hotel-enrichment:enrichment-chief
*enrich-batch 1-10

# Phase 6b: Expanded batch (after 6a pass)
@hotel-enrichment:enrichment-chief
*enrich-batch 1-30

# Phase 6c: Full deployment (after 6b pass)
@hotel-enrichment:enrichment-chief
*enrich-all

# Check status during batch
*status

# Check specific hotel
*show-hotel 15

# Stop batch (if needed)
*stop

# Get report
*coverage-report
```

---

## Decision Tree

```
START Phase 6a (10 hotels)
│
├─ Success (>85%)?
│  │
│  └─ YES → Phase 6b (1-30 hotels)
│             │
│             ├─ Success (>85%)?
│             │  │
│             │  └─ YES → Phase 6c (all 92)
│             │             │
│             │             └─ Complete, validate, publish ✅
│             │
│             └─ NO → Debug, fix, re-run 6b ↩️
│
└─ NO → Debug, fix, re-run 6a ↩️
```

---

## Time Estimate

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| 6a | 1-2h | Today 09:00 | Today 11:00 |
| 6b | 2-4h | Today 11:30 | Today 15:30 |
| 6c | 8-12h | Today 16:00 | Tomorrow 04:00 |
| Validation | 1-2h | Tomorrow 09:00 | Tomorrow 11:00 |
| **Total** | **~24h** | Today | Tomorrow |

---

## Success Definition

Batch enrichment is **COMPLETE & SUCCESSFUL** when:

```
✅ All 92 hotels processed
✅ >= 85% hotels at 75%+ completeness  
✅ >= 90% hotels at 0.80+ quality
✅ All data validated (no errors)
✅ Data published to PostgreSQL
✅ Ready for Stella concierge integration
```

---

**Status:** Ready to execute Phase 6a  
**Awaiting:** User confirmation to begin batch enrichment  
**Command:** `@hotel-enrichment:enrichment-chief *enrich-batch 1-10`
