# 06 — More feature ideas for Meridian (batch 2, #41–#72)

Builds on 05 and doesn't repeat it. The same tags apply: [Shard] = unlocked by a shard, [Core] = part of the base app. Evidence: A strong / B decent / C plausible / D speculative. Effort: S/M/L.
Method: 20 new web searches on 2026-11-05, desk research only, no user testing.

## Key findings that shaped this batch
- **Moral reframing works.** Feinberg & Willer (2015, 5 studies) found arguments framed in the *target's* foundations persuade better (conservatives via loyalty/purity, liberals via fairness). Purity framing nearly closed the left–right gap on environmental attitudes (2013). Evidence A–B. This is the science behind a real "talk across the divide" tool.
- **Strengthening Democracy Challenge megastudy** (Science 2024, n=32k, 25 treatments): 23 of 25 cut partisan animosity, by up to 10.5 pp. The strongest moves were sympathetic dissimilar people, shared identity ("exhausted majority"), and correcting misperceptions. **Lower animosity did not reliably lower antidemocratic attitudes.** Evidence A.
- **Braver Angels Red/Blue RCT** (n=165): about 22% less hostility after one week. Explicit effects faded by six months, but the behavioral one persisted. Evidence B. This is the "reciprocal reflection, no persuading" format.
- **Barnum risk is real.** In one study, bogus feedback was rated *more accurate* than real 16PF feedback (1985). Inverted feedback is the only kind people reliably reject. People's acceptance of a result is not evidence that it is valid. Evidence A. Meridian can turn this into a feature.
- **Entertainment taste follows personality.** Rentfrow 2011 (n>3k) found five factors (Communal, Aesthetic, Dark, Thrilling, Cerebral). Personality adds variance beyond demographics (R ≈ .27–.64). Evidence B.
- **States vary a lot within a person.** Fleeson's experience sampling shows within-person variance is often greater than between-person variance. The mean is stable, and variability is itself a stable trait. Evidence A. This supports a diary feature.
- **Couples match strongly on politics and religion, but only weakly on personality.** Political similarity comes mostly from who people choose, not from converging later. Evidence A.
- **Parent–child party ID**: correlations of .47–.61 in adolescence, falling to about .38 in adulthood. Transmission of other values is weaker. Evidence A.
- **Voting advice apps** (Wahl-O-Mat): a field RCT found they raise knowledge of party positions but have no causal effect on turnout. Evidence A–B. Promise to inform people, not to mobilize them.
- **Translated Big Five scales hold up partly.** BFI-2 translations reach metric invariance but usually not scalar, so raw scores aren't directly comparable across languages. Evidence A.
- **Implementation intentions**: d = .65 in 2006, but only d ≈ .15–.35 after bias correction across 642 tests (2024). Evidence A. Show effect sizes honestly.
- Data/APIs: Ballotpedia `elections_by_point` (lat/long/date → measures; local coverage is limited to the top 100 cities, CA, and VA); Vote Smart `Candidates.getByZip`; Kialo Edu (pro/con trees); AllSides Mismatch (class-to-class dialogue guides); Bad News (inoculation game).

---

## A. Narrative & storytelling results
41. **"Your story so far" narrative report** [Shard]: a magazine-style long read built only from the user's scores and their answer attributions. Every sentence footnotes the item or score behind it, and anything not backed by data is cut. Evidence B. Built-in counter-Barnum: no sentence would fit everyone. M. Risk: writing templates at scale.
42. **Barnum test, in the open** [Shard]: show the user two reports, their real one and a generic or inverted one, without saying which is which, then reveal. Teaches the Forer effect using Meridian itself. It's the strongest honesty move available, and nobody else dares do it. Evidence A (Forer, 1985 16PF study). S. Risk: some users feel tricked; frame it as an opt-in experiment.
43. **Turning-point interview** [Shard]: 5 McAdams-style prompts (high point, low point, turning point, the value you'd defend, a mind you changed). The result is tagged for agency, communion, redemption and contamination themes, linked to your values. Kept private and local-only. Evidence B (narrative identity predicts well-being trajectories). M. Risk: emotional content; add support links and no scoring of trauma.
44. **"The opposite of you" portrait** [Shard]: a respectful first-person profile of the person whose scores are the mirror image of yours, written as a sympathetic individual. This is the megastudy's top-performing strategy. Evidence A (SDC "sympathetic dissimilar person"). S–M.

## B. Civic & local
45. **Ballot companion** [Shard, election season]: enter a ZIP and see your measures and races from Ballotpedia or Vote Smart. Meridian shows *which of your axes each measure touches*, never "vote X". The value is knowledge, and the copy says so (Wahl-O-Mat RCT). Evidence B. M–L (API keys, cost, coverage gaps). Risk: neutrality; show both sides' official arguments.
46. **Local-issue lens** [Shard]: city-scale dilemmas (zoning, policing budget, transit vs parking, school calendars) as a separate local axis set. National labels often don't predict local positions, so this produces new insight. Evidence C. M.
47. **"Who represents me?" distance chart** [Shard]: plot your officials from roll-call scores (DW-NOMINATE/Voteview for Congress) against your Economic axis only, with a strong caveat that a one-dimensional mapping is approximate. Evidence B for the data, C for the mapping. M.

## C. Games (not Perception Gap)
48. **Reframe Rally** [Shard]: you get a position you oppose and an opponent's top foundations, and you pick the framing that would persuade *them*. Scored against Feinberg–Willer patterns. It trains moral empathy, not winning. Evidence A–B. M.
49. **Spot the manipulation** [Shard]: a Bad News-style inoculation mini-game. Six cards of political rhetoric; tag the technique (outrage bait, false dilemma, scapegoating). Use balanced left and right examples, with an audit published. Evidence A (inoculation research). M.
50. **Common Ground hunt** [Shard]: two users or a group answer 20 rapid items, and the game scores *agreements found*, not disagreements. Uses the shared-identity finding. Evidence A–B. S–M (URL hash, like #20).
51. **Ideology "Guess Who"**: 20 yes/no questions to identify a hidden ideology from the atlas (#14). It's playful learning of the taxonomy, with no real people mocked. Evidence n/a. S.

## D. Couples, family & groups (beyond #20/#22)
52. **Couple mode, honest edition** [Shard]: two-person results that headline what research says matters, value and political similarity, and *de-emphasize* personality matching (Luo 2017: personality similarity weakly predicts satisfaction). Adds a "where we'll need rules" card. Evidence A. M.
53. **Family tree compass** [Shard]: three generations on one chart, with a published caption: party transmission is about .38–.6, other values are weaker, and here's where your family fits. Evidence A (Jennings & Niemi). M. Risk: holiday flashpoints; it's an opt-in household room.
54. **Conflict mediation scripts** [Shard]: pick a topic and the other person's (estimated or shared) foundations. You get a 4-step script: reflect their value, say what you share, restate your view in their moral language, ask a question. This is Braver Angels' "understand, don't persuade" rule. Evidence A–B. M. Risk: manipulation optics; frame it as understanding, and show the script openly to both parties.
55. **Household chore & money style** (non-political): conscientiousness/orderliness facets plus a quick money-attitudes block, which keeps couples using the app between elections. Evidence C. S.

## E. Longitudinal & self-experiments
56. **Trait diary (experience sampling)** [Shard]: 3 pings a day for 14 days ("in the last hour, how talkative / anxious / organized were you?"). Results are your *distribution*, not a dot, as in Fleeson's density distributions. Shows "you're an introvert who acts extraverted 30% of the time". Evidence A. M (notifications need PWA/push).
57. **Your political timeline** [Shard]: pin moments (an election, a news event, a move, a new job), then retake modules. A line chart shows axis drift with confidence bands, plus the reliability badge (#27) to separate real change from noise. Evidence B. M.
58. **Micro-experiments menu** [Shard]: one-week n-of-1 experiments ("read one op-ed from the other side daily", "no news after 8pm", "one act of kindness to an out-partisan"). Pre/post thermometer plus a self-report, and an honest "n=1, here's what it can't show" footer. Evidence C. S–M.
59. **Prediction ledger** [Shard]: you forecast things about yourself and the world ("I'll score higher on Openness next quarter", "this ballot measure passes") and get Brier scores. Calibration is a thinking-style shard that pairs with AOT (#7). Evidence B (forecasting literature). S.
60. **If-then commitments** (upgrades #31): any trait goal gets a structured if-then plan, with the *bias-corrected* effect size shown (d ≈ .15–.35, not the hyped .65). Evidence A. S.

## F. Recommendations & prep kits
61. **Taste engine: books, films, podcasts** [Shard]: map Big Five to Rentfrow's 5 entertainment factors, plus a "steelman shelf" of the best works from the side you're furthest from. Every pick shows *why* ("Aesthetic, Openness 82nd pct"). Evidence B. M. Risk: curation upkeep; start with 150 hand-picked titles.
62. **Debate prep kit** [Shard]: pick a motion, and Meridian builds a Kialo-style pro/con tree. It flags which side your scores predict you'll find easy, assigns you the *other* side, and adds the opponent's likely foundations. Export to PDF. Evidence B. M.
63. **Understanding briefs by type**: one page per type, "what this person needs to hear before they can hear you". Shareable, kind, specific. Evidence B (moral reframing). S per type.

## G. Educator & campus
64. **Classroom pack** [Core, free]: teacher room code (#22), a 50-minute lesson plan, a pre/post affective thermometer, an anonymized class map, and discussion norms adapted from AllSides "Relationships First". No student accounts, so it's COPPA/FERPA-light. Evidence B. M–L. This is the best distribution channel.
65. **Campus club kit**: a 3-session dialogue series modeled on Mismatch / Braver Angels, printable facilitator cards, and a club-level spread chart. It positions Meridian as a bridge-builder rather than a sorting hat. Evidence B. M.

## H. Gem identity, IRL & expression
66. **Gem as genuine data-art** [Core]: facets are encoded deterministically from scores (cut = Big Five, color = moral foundations, inclusions = uncertainty, cloudiness = the confidence gap). A legend explains it, so no two gems match and each one *means* something. Evidence n/a. M. This is the heart of the visual identity.
67. **IRL exports** [Shard]: a print-ready poster (gem, compass, traits) in A3/letter, a sticker sheet, a wallet card with a QR code to the result hash, and an STL file to 3D-print your gem. Evidence n/a. S–M. Monetization-adjacent (#70).
68. **Meridian Wrapped (annual)** [Core]: once a year, what changed, which shards you earned, and your calibration score. Wrapped works because of controlled self-presentation plus belonging, so allow selective hiding of political cards. S–M.

## I. Platform: offline, accessibility, international
69. **Local-first PWA** [Core]: installable, works offline with IndexedDB, a versioned JSON export/import, and an optional encrypted file backup. "Your politics never leave your phone" becomes a selling point. Evidence n/a (web.dev guidance). M.
70. **Plain-language and screen-reader mode** [Core]: simplified wording forms (as with MPQ-SF simplified), 3–5 response options, an "I don't know" option, full ARIA support, sonified or tabular charts. Mark these as a separate *form* with its own norms. Evidence B. M.
71. **Honest i18n** [Core]: translations add a per-language badge ("scores comparable within language, not across"), because BFI-2 translations miss scalar invariance. Political modules are country-aware (axis meanings shift). Evidence A. L.

## J. Value without paywalling truth
72. **Supporter tier ("Patron shards")**: every score, chart and piece of science stays free. Pay for *craft*: extra gem finishes, the poster print, deep-dive reading courses, classroom-scale rooms, and the annual Wrapped video. Publish a "what's free forever" pledge. Evidence C. S–M.

### Humor bonus (73)
73. **"Your compass at the dinner table"** comic-strip share cards: gentle self-deprecating lines about *your own* traits ("High Conscientiousness: has opinions about the dishwasher"). Never about the other side. S. Risk: tone; review every line.

---

## Build next — top 8 from THIS batch
1. **Gem as data-art (#66)**: makes the shard loop visible and meaningful. Every shard changes a facet for a stated reason.
2. **Local-first PWA + export (#69)**: the privacy story for political data, and it unlocks the diary notifications in #56.
3. **Conflict mediation scripts (#54) + Understanding briefs (#63)**: grounded in A-grade science, useful the day after a family argument, and the most distinctive "honest" utility.
4. **Barnum test in the open (#42) + footnoted narrative report (#41)**: the brand thesis turned into features.
5. **Trait diary (#56)**: the first real longitudinal hook, with results nobody else shows (your distribution).
6. **Classroom pack (#64)**: distribution plus credibility. Free for teachers and built on the room code.
7. **Reframe Rally (#48)**: a game that trains the skill the megastudy says works. Highly replayable as a shard source.
8. **Taste engine with steelman shelf (#61)**: a non-political daily-use reason to return, with evidence behind it.

**Wildcards:** the 3D-printable gem STL (#67), the "opposite of you" portrait (#44), the prediction ledger with Brier scores (#59), and the family tree compass (#53).
**Hardest to do well:** the ballot companion (#45: coverage, neutrality, cost) and honest i18n (#71: needs per-language norms).
