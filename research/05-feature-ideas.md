# 05 — Feature ideas for Meridian (shard-progression edition)
Date: 2026-11-05 · Method: ~26 web searches plus reads of competitor pages and repos (8values results.html source, 9Axes, PolitiScales, Pew 2026 typology/quiz, Plexality's paid-report teardowns of 16P/Truity/RHETI, Open Psychometrics raw data, Johari/kevan.org, More in Common Perception Gap, iSideWith FAQ, Ground News, Crystal), plus academic sources. I skimmed the local code and didn't do a full live UI walkthrough. No user interviews.
Tags: **[Shard]** = works as a gem-shard unlock (a questionnaire to earn it, and a tool/panel/chart it opens). **[Core]** = belongs in the base product. Effort S/M/L. Evidence grade A (strong peer-reviewed) to E (hunch).

## What competitors ship that Meridian doesn't (verified)
- **Party/leader plots**: politicalcompass.org publishes election charts (UK 2024, US 2024) and lets you overlay yourself. Meridian has famous matches but no party/candidate overlay.
- **Nearest-ideology label with honest caveat**: 8values matches you against 52 ideologies by weighted distance and labels it "much less accurate than the axes". LeftValues and RightValues do the same within one side. 9Axes has 9 axes (Federal/Unitary, Militarist/Pacifist, Assimilationist/Multicultural…).
- **Badges for edge positions**: PolitiScales awards badges (Anarchist, Pragmatist, Conspiracist, Vegan, Monarchist…) and a generated flag on 8 axes, including Ecology/Production, Revolution/Reform and Rehabilitative/Punitive justice.
- **Real population reference**: Pew assigns you to 9 groups based on n=10,357 (Nov 2025) and explicitly says some people fit no group well. Open Psychometrics shows percentiles and dumps raw data, including about 1M IPIP-FFM responses plus RIASEC (n≈146k) and ECR attachment (n≈51k).
- **Issue weighting**: iSideWith weights issues by the importance you set and drops skipped ones.
- **Friends rate you**: kevan.org Johari lets friends pick adjectives through a link and shows blind spots and façade. 16P compares partners only by invite or by guessing the type. Truity has no two-person data comparison (Plexality teardown).
- **Perception tests**: More in Common's Perception Gap quiz scores how badly you misjudge the other side.
- **Aspects/facets with norms**: UnderstandMyself reports 10 BFAS aspects with percentiles from a normative sample of about 10k.
- **Teams**: 16P Team Assessments (portal, team reports, workshops).
- **News diet**: Ground News "My News Bias" plus Blindspot.
- 16P's paid reports are "static type e-books, zero personalization" (Plexality bought them). That is the gap Meridian's data-driven honesty exploits.

## Questionnaires & measurement
1. **Thematic shard modules with rotating item banks** [Shard][Core]: each theme (Economy, Justice, Foreign policy, Tech & AI, Ecology, Religion & state, Family, Speech) is an 8–12 item CAT session drawn from a pool of 40+ items, so replays bring new questions. Completing one adds a shard and refines one axis. Why: this is the progression engine Brian wants. Gap: every values test (8values, 9Axes, PolitiScales) is a fixed form. Evidence B (CAT literature). Effort M–L (writing the item bank is the real cost). Risk: item quality; keep the item-writing rules in 02.
2. **Sub-axis expansion: 4 → 12 political facets** [Shard]: each shard reveals facets under an axis, e.g. Economic → redistribution / regulation / trade / labor; Authority → policing & justice (rehabilitative vs punitive, as in PolitiScales), surveillance, democracy-vs-expertise; Global → militarism/pacifism, immigration/assimilation (9Axes); plus Ecology/Production and Revolution/Reform. Why: it answers "more political detail" without bloating the first test. Evidence B (multidimensional ideology, Feldman & Johnston 2014). M.
3. **Trade-off / budget allocator questionnaire** [Shard]: "You have 100 points of public spending" or "rank these 6 goods when they conflict". The answers are ipsative, so they can't all be agreed with. It produces a Priorities chart and feeds issue weights (like iSideWith's importance). Gap: Likert agree-bias is everywhere. Evidence B (forced-choice reduces acquiescence). M.
4. **Moral dilemmas lab** [Shard]: Moral-Machine-style paired scenarios (sacrifice, loyalty vs fairness, purity trade-offs), with "would you do it for $X?" taboo trade-offs from Graham et al. 2009 Study 3. Outputs: sacredness index plus a consequentialist/deontological lean. There is already a "Moral Dilemmas" quiz; upgrade it to scored output. Evidence B. M.
5. **Big Five aspects (BFAS-style 10 aspects)** [Shard]: a 2nd-tier shard that splits each trait in two (Compassion/Politeness, Industriousness/Orderliness, and so on). Use IPIP public-domain items, not the copyrighted BFAS. UnderstandMyself charges for this. Evidence A. M.
6. **Values circumplex (Schwartz-style 10 values)** [Shard]: unlocks a circular chart. Use ORVIS/IPIP-like or self-written items, since PVQ licensing needs checking. Values link politics to personality and fill the "why". Evidence A for the model, licensing caveat. M.
7. **Thinking-style shard: Actively Open-Minded Thinking + intellectual humility** [Shard]: AOT 13-item (Stanovich & Toplak 2023, published) plus an IH short form. Output: a "How you hold beliefs" panel. Very on-brand and not flattering by default. Evidence B. S.
8. **Affective polarization thermometer** [Shard]: feeling thermometers for parties and groups (the ANES standard). Shows the out-group warmth gap next to your positions, so you can see you are moderate in views but hot in temper. Evidence A (standard measure). S. Risk: sensitive; keep it private by default.
9. **Interests (RIASEC) shard → real careers tab** [Shard]: replace the trait-guessed careers with a 48-item public-domain Interest Item Pool. The open dataset (n≈146k) gives real norms. Evidence A. M.
10. **Attachment (ECR-style) shard → Relationships tab upgrade** [Shard]: the relationships tab currently infers from Big Five. Open ECR data exists (n≈51k). Evidence B. M. Risk: keep it non-clinical in tone.
11. **Response-quality engine** [Core]: balanced keying check, acquiescence index, longstring/too-fast flags, and a soft "this session looked rushed, retake this module?" prompt. It feeds the 80% confidence gate. Evidence A (careless-responding literature). S–M.

## Results & interpretation tools
12. **Confidence-gated type reveal ("crystallizing gem")** [Core]: the gem is cloudy and shows the top 2–3 candidate types with probabilities until posterior ≥80%, then crystallizes. Show "Next best shard to raise confidence: Justice module (+11%)". Why: it turns honesty (uncertainty) into the game loop. Gap: no competitor shows type uncertainty. Pew admits poor fits only in its FAQ. Evidence B. M.
13. **Multi-compass gallery** [Shard per chart]: users unlock chart lenses: classic 2D (Econ×Authority), Culture×Global, a Moral-foundations radar, Values circumplex, Personality→politics bridge chart, and a 3D-ish rotating "Meridian sphere" (wildcard). Each chart comes with a one-paragraph "what this chart hides" caption. M.
14. **Ideology atlas with honest nearest-match** [Shard]: about 60 ideologies placed on all axes, shown as top-3 nearest with distance plus "where you diverge from each". It borrows 8values' caveat and goes beyond it with per-axis divergence. Fills the "ideology labels" ask. Evidence C (positions are expert-placed). M. Risk: placements get contested, so publish them in the Research tab and accept corrections.
15. **Party & leader overlay** [Shard]: plot parties and candidates for US/UK/CA/AU, sourced from expert surveys (e.g. Chapel Hill Expert Survey for Europe, Manifesto Project) rather than politicalcompass's opaque placement. Evidence B with sources. M. Risk: needs upkeep and is a neutrality magnet; cite every placement.
16. **"Why am I here?" explainer** [Core]: tap any dot or score and see the 3–5 answers that moved it most, editable ("I'd answer this differently now" → instant rescore). Gap: no competitor shows item-level attribution. S–M. High trust payoff.
17. **Sensitivity / what-if sliders** [Shard]: drag one axis and watch your type and ideology matches change, showing how close you are to boundaries. Evidence n/a. S.
18. **Pew typology mapper (US)** [Shard]: an optional 16-item block closely modeled on Pew's published wording, with an "approximate Pew group" output. Pew data is real population (B+). Risk: Pew terms of use and wording copyright, so paraphrase and link out. S–M.

## Social / share / compare
19. **Friend-rates-you (informant shard)** [Shard]: a share link where friends answer 15 Big Five items about you. You see a Johari-style grid of agreement, blind spots and façade. Science: friends see Openness better and you see Neuroticism better (Vazire SOKA 2010, A). Viral, and genuinely informative. Needs data handoff (URL-encoded or a tiny backend). M.
20. **Two-person overlay compare** [Core]: paste or scan a friend's result code and both gems and compasses overlay, with the "3 issues you'd argue about" and "foundations you share". 16P needs invites or guesses; Truity has none. S–M (encode results in a hash; location.hash is already used).
21. **Steelman / Perception Gap game** [Shard]: "Guess how a typical Firebrand answered this", scored against aggregate data or the type's expert profile. Inspired by More in Common and the ideological Turing test. Evidence B (perception-gap research). M. Risk: without real aggregate data the "truth" is model-based; label it so.
22. **Group / household / class map** [Shard or later]: a room code puts everyone's anonymous dots on one compass, with a spread metric. Use cases: classrooms and debate clubs. L (needs a backend). Lighter than 16P Teams.
23. **Share cards that show uncertainty** [Core]: gem plus confidence ring plus "range" whiskers on the compass card. It differentiates from false-precision dots. S.

## Data & science upgrades
24. **Real Big Five norms from Open Psychometrics IPIP-FFM (n≈1M)** [Core]: re-key Meridian's Big Five items to IPIP where possible to get honest percentiles. Removes the "no population norms" disclaimer for personality. Evidence A (sample is self-selected, so say so). M.
25. **MFQ reference points** [Core]: show published liberal, conservative and libertarian means (Graham 2009/2011, n≈34k) next to the user's foundations, with the 2021 meta-analysis caveat that YourMorals effects are inflated about 2× by self-selection. Evidence A. S.
26. **Opt-in anonymous data donation → Meridian's own norms** [Core]: a consent checkbox plus a periodic "State of Meridian" public report. Over time it builds the population data competitors lack. L (backend, privacy). Risk: political data is sensitive (GDPR special category), so it must be aggregate only.
27. **Test–retest reliability badge** [Shard]: retake a module after ≥2 weeks and see your personal reliability (r between sessions). Honest and novel. S.
28. **Public methodology changelog & item audit page** [Core]: every item with its loadings and version. 8values publishes JS; Meridian can publish readable docs. S.

## Retention & product surface
29. **Shard map / gem progression UI** [Core]: facets of the gem light up per module; each shard card says what it unlocks (a panel, chart or tool) and its confidence gain. S–M (design mostly done per Design).
30. **Daily "one dilemma"** [Shard source]: one fresh item a day, with a community split shown after answering (once data donation exists). Streak-light, no guilt mechanics. S.
31. **Change tracker with volitional-change goals** [Shard]: pick a trait to nudge, get weekly implementation-intention prompts, retest at 16 weeks. Evidence B (Hudson 2015; meta d≈0.22). M. Risk: avoid self-help kitsch; cite effect sizes.
32. **Life-event retest prompts**: "Moved, new job, election season? Retest Authority." S.
33. **Dark/light editorial themes per gem** [Core]: gem palette tints the UI. S (already planned).

## Wildcards
34. **News-diet mirror** [Shard]: paste or import 10 outlets you read and get a bias spread versus your compass position (using AllSides/Ad Fontes public ratings, with licensing check). Ground News charts this for a subscription. M. Risk: ratings licensing.
35. **Historical time machine**: "Your 2026 position in 1960 / 1990 terms": the Overton shift visualized using Manifesto Project party data over time. L. Weak evidence for individuals (C/D), but a great editorial piece.
36. **Country / culture mapper**: Inglehart-Welzel map placement ("your values most resemble…"), using WVS public data. IDRlabs already does this, but crudely. M.
37. **AI "debate sparring partner"** [Shard, late]: argue with an opponent whose positions are tuned to your nearest opposite type. High wow, but needs an LLM backend, cost, and moderation. L. Flag: brand risk. Ship last if at all.
38. **Personality-from-writing check** (vs Crystal/Apply Magic Sauce): paste text and see predicted traits versus your self-report. **Weak idea**: low validity (r≈.2–.3), privacy-creepy, off-brand. Don't build.
39. **Income/net-worth estimates** (existing): **recommend demoting or removing**. Trait→income effects are small and this feature undercuts the honesty identity more than anything else in the app.
40. **Rarity scores** (existing): fine, but only once real norms exist (#24/#26); until then label them "model estimate".

## Build first — top 8 (leverage: differentiation × shareability × honesty × fits the shard loop)
1. **Confidence-gated crystallizing gem (#12) + shard map (#29)**: the spine. Uncertainty becomes the game.
2. **Thematic modules with rotating item banks (#1)**: the shard source and the endless replay.
3. **Friend-rates-you informant shard (#19)**: the most viral, scientifically grounded (SOKA), and nobody does it with Big Five data.
4. **Ideology atlas with per-axis divergence (#14) + 12 sub-axes (#2)**: delivers "more political detail and labels" better than 8values/9Axes.
5. **Multi-compass gallery (#13)**: each chart is a visible reward with a "what this hides" caption.
6. **"Why am I here?" attribution + rescore (#16)**: cheap, and the strongest trust signal against Barnum competitors.
7. **Real norms: IPIP-FFM percentiles + MFQ reference points (#24, #25)**: kills the biggest disclaimer.
8. **Two-person overlay compare (#20)**: cheap via URL hash, shareable, and a gateway to #22.
Runners-up: Trade-off allocator (#3), AOT/humility shard (#7), Perception Gap game (#21).
Cut or demote: writing-based prediction (#38), income estimates (#39).
