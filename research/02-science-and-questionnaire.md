# Scientific basis for the questionnaire

## Constructs measured
- **Big Five (O, C, E, A, N)** — items written in the style of the public-domain IPIP (Goldberg et al., 2006). Balanced keying (half reversed) to dampen acquiescence bias (Paulhus, 1991).
- **Honesty-Humility** is noted (HEXACO; Ashton & Lee, 2007) but folded into Agreeableness in v1 to keep the test short.
- **Moral foundations (MFQ-2 six)** — Care, Equality, Proportionality, Loyalty, Authority, Purity (Atari, Haidt, Graham et al., 2023). Earlier model: Graham, Haidt & Nosek (2009). Liberty foundation for libertarians: Iyer et al. (2012).
- **Political axes** — Economic (equality ↔ markets), Authority (liberty ↔ order), Culture (progress ↔ tradition), Scope (national ↔ global). Multi-dimensional structure: Feldman & Johnston (2014); Everett (2013) separates social and economic conservatism.
- **Authoritarianism / dominance** — order items draw on the RWA concept (Altemeyer, 1981) and dual-process model (Duckitt & Sibley, 2009); equality items on SDO (Pratto et al., 1994; Ho et al., 2015). Items are paraphrased concepts, not copied scale items.
- **Values** — Schwartz's circumplex (Schwartz, 1992; Schwartz et al., 2012) informs trade-off pairs (security vs. self-direction, universalism vs. achievement).
- **Personality ↔ politics** links (used only for type descriptions, not scoring): Gerber et al. (2010); Jost et al. (2003).

## Item design rules
1. Three formats: Likert statement (balanced keyed), forced trade-off (A vs. B slider, both options desirable — ipsative-style, cf. Brown & Maydeu-Olivares, 2011), and scenario (pick one of 3–4 actions, each with a weight vector).
2. Every item loads on 2+ dimensions so no single answer "is" the label.
3. Scenarios are concrete (a town budget, a neighbor's dog, a workplace mistake) rather than abstract slogans.

## Adaptive engine (simplified CAT)
Inspired by computerized adaptive testing (van der Linden & Glas, 2000), but heuristic, not a calibrated IRT model:
- Each dimension keeps a weighted mean and accumulated information (sum of |loading|).
- Uncertainty_d = 1 / sqrt(1 + info_d).
- Next item = argmax over unused eligible items of Σ |loading_d| · uncertainty_d (+ small random jitter to vary order).
- **Branching**: follow-up items carry a condition (e.g. only shown if current Economic score > +0.3, to distinguish market-libertarian vs. business-conservative). Conditions are re-evaluated every turn.
- Stop when every dimension's uncertainty < threshold, min 24 / max 40 items.
- Results show a confidence meter per dimension.

## Limits (honest)
Item loadings are expert-assigned, not fitted to population data; no norms, so "percentile" language is avoided. This is a reflective tool, not a clinical or validated instrument.

## References
- Altemeyer, B. (1981). *Right-Wing Authoritarianism*. University of Manitoba Press.
- Ashton, M. C., & Lee, K. (2007). Empirical, theoretical, and practical advantages of the HEXACO model of personality structure. *Personality and Social Psychology Review, 11*(2), 150–166.
- Atari, M., Haidt, J., Graham, J., Koleva, S., Stevens, S. T., & Dehghani, M. (2023). Morality beyond the WEIRD: How the nomological network of morality varies across cultures. *Journal of Personality and Social Psychology, 125*(5), 1157–1188.
- Brown, A., & Maydeu-Olivares, A. (2011). Item response modeling of forced-choice questionnaires. *Educational and Psychological Measurement, 71*(3), 460–502.
- Duckitt, J., & Sibley, C. G. (2009). A dual-process motivational model of ideology, politics, and prejudice. *Psychological Inquiry, 20*(2–3), 98–109.
- Everett, J. A. C. (2013). The 12 item Social and Economic Conservatism Scale (SECS). *PLoS ONE, 8*(12), e82131.
- Feldman, S., & Johnston, C. (2014). Understanding the determinants of political ideology: Implications of structural complexity. *Political Psychology, 35*(3), 337–358.
- Gerber, A. S., Huber, G. A., Doherty, D., Dowling, C. M., & Ha, S. E. (2010). Personality and political attitudes. *American Political Science Review, 104*(1), 111–133.
- Goldberg, L. R., Johnson, J. A., Eber, H. W., et al. (2006). The international personality item pool and the future of public-domain personality measures. *Journal of Research in Personality, 40*(1), 84–96.
- Graham, J., Haidt, J., & Nosek, B. A. (2009). Liberals and conservatives rely on different sets of moral foundations. *JPSP, 96*(5), 1029–1046.
- Haidt, J. (2012). *The Righteous Mind*. Pantheon.
- Ho, A. K., Sidanius, J., Kteily, N., et al. (2015). The nature of social dominance orientation. *JPSP, 109*(6), 1003–1028.
- Iyer, R., Koleva, S., Graham, J., Ditto, P., & Haidt, J. (2012). Understanding libertarian morality. *PLoS ONE, 7*(8), e42366.
- Jost, J. T., Glaser, J., Kruglanski, A. W., & Sulloway, F. J. (2003). Political conservatism as motivated social cognition. *Psychological Bulletin, 129*(3), 339–375.
- McCrae, R. R., & Costa, P. T. (1989). Reinterpreting the Myers-Briggs Type Indicator from the perspective of the five-factor model. *Journal of Personality, 57*(1), 17–40.
- Paulhus, D. L. (1991). Measurement and control of response bias. In Robinson, Shaver & Wrightsman (Eds.), *Measures of Personality and Social Psychological Attitudes*. Academic Press.
- Pew Research Center (2021). *Beyond Red vs. Blue: The Political Typology*.
- Pittenger, D. J. (2005). Cautionary comments regarding the Myers-Briggs Type Indicator. *Consulting Psychology Journal, 57*(3), 210–221.
- Pratto, F., Sidanius, J., Stallworth, L. M., & Malle, B. F. (1994). Social dominance orientation. *JPSP, 67*(4), 741–763.
- Schwartz, S. H. (1992). Universals in the content and structure of values. *Advances in Experimental Social Psychology, 25*, 1–65.
- Schwartz, S. H., et al. (2012). Refining the theory of basic individual values. *JPSP, 103*(4), 663–688.
- van der Linden, W. J., & Glas, C. A. W. (Eds.) (2000). *Computerized Adaptive Testing: Theory and Practice*. Kluwer.
