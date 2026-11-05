# Site audit — existing personality & political tests
Method note: written from first-hand familiarity with these sites' public test flows; not a live re-crawl on 2026-11-05. Specific UI details may have changed.

| Site | Model | Main weak points |
|---|---|---|
| 16personalities.com | MBTI-style 4 letters + "-A/-T" (NERIS model) | Dichotomous types from continuous traits (people near midpoints flip type on retest); statements are transparent ("You enjoy social gatherings"); results are flattering, Barnum-style prose; no politics/values; no uncertainty shown. Design is polished but cartoon-generic. |
| politicalcompass.org | 2 axes (economic, social) | ~62 propositions, many dated or double-barreled; strongly leading wording; 4-point forced agree scale; known to cluster users bottom-left; no methodology published; minimal results (a dot); dated design. |
| 8values | 4 axes (econ, diplo, civil, society) | Fixed 70 items, all agree/disagree; obvious keying; ideology label from nearest point but no explanation; no personality. |
| SapplyValues | 3 axes (+ progressive/conservative) | Same fixed-form Likert; most items 'statement → obvious side'; sparse results. |
| IDRlabs | Dozens of tests incl. political coordinates | Ad-heavy, cluttered; tests are short clones; results are a bar chart with generic text; disclaimers bury the validity question. |
| Truity | Big Five, Enneagram, TypeFinder (MBTI-like) | Big Five test is sound but basic; best detail behind paywall; no politics. |
| Open-Psychometrics / IPIP | Public-domain scales (IPIP-NEO, HEXACO, etc.) | Scientifically honest, raw scores and percentiles — but bare-bones UI and little interpretation. |
| Pew Political Typology | 9 US typology groups from cluster analysis of a national survey | Grounded in real population data; but US-specific, ~16 questions, no personality, groups describe voter blocs not individuals. |

## Cross-cutting problems to fix
1. **Leading questions** — the answer you'd pick is the label you get. Fix: trade-offs, scenarios, items that load on several dimensions, balanced positive/negative keying.
2. **2-axis oversimplification** — economics and culture correlate only modestly in many populations (Feldman & Johnston 2014). Fix: 4 political axes + 6 moral foundations.
3. **Type reliability** — MBTI dichotomies have weak test–retest at the letter level and map onto Big Five anyway (McCrae & Costa 1989; Pittenger 2005). Fix: score continuous traits, show confidence, assign nearest type *and* runner-up.
4. **Vague results** — Fix: per-dimension score with plain-language meaning, strengths/weaknesses tied to actual scores, glossary.
5. **Fixed form, long and boring** — Fix: adaptive item selection based on current uncertainty, branching follow-ups.
6. **Dated design / ads** — Fix: no ads, editorial design, illustrated mascots and islands.
