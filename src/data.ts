export const PALETTE = {
  paper: '#faf8f3',
  card: '#ffffff',
  ink: '#111111',
  inkSoft: '#56524c',
  rule: '#dcd6c8',
  ruleSoft: '#ebe6da',
  slate: '#1f3a6e',
  accent: '#c2522a',
  ambig: '#8a857b',
};

export interface Option {
  label: string;
  score: number; // -2 to +2
  blurb: string;
}

export interface Question {
  id: string;
  short: string;
  title: string;
  prompt: string;
  options: Option[];
}

export interface Case {
  id: string;
  title: string;
  shortTitle: string;
  era: string;
  blurb: string;
  questions: Question[];
  instructorNote: string;
}

export interface VerdictBand {
  key: string;
  label: string;
  side: 'sustaining' | 'ambiguous' | 'disruptive';
  t: number;
}

export function verdictFor(score: number): VerdictBand {
  if (score <= -6) return { key: 'strong-sus', label: 'Strongly sustaining', side: 'sustaining', t: 0.05 };
  if (score <= -2) return { key: 'sus', label: 'Sustaining-leaning', side: 'sustaining', t: 0.25 };
  if (score <= 1)  return { key: 'amb', label: 'Ambiguous / hybrid', side: 'ambiguous', t: 0.50 };
  if (score <= 5)  return { key: 'dis', label: 'Disruptive-leaning', side: 'disruptive', t: 0.75 };
  return                  { key: 'strong-dis', label: 'Strongly disruptive', side: 'disruptive', t: 0.95 };
}

const BASE_QUESTIONS = (casePrompts: { wtp: string; incentive: string; core: string; foothold: string; performance: string }): Question[] => [
  {
    id: 'wtp',
    short: 'Mainstream WTP',
    title: 'Mainstream willingness to pay',
    prompt: casePrompts.wtp,
    options: [
      { label: 'Much lower WTP',      score: 2,  blurb: 'Mainstream customers preferred the existing alternative.' },
      { label: 'Slightly lower',      score: 1,  blurb: 'Most mainstream customers were indifferent or skeptical.' },
      { label: 'Similar',             score: 0,  blurb: 'Mixed — about even with the existing alternative.' },
      { label: 'Slightly higher',     score: -1, blurb: 'Many mainstream customers welcomed the improvement.' },
      { label: 'Much higher WTP',     score: -2, blurb: 'Mainstream customers clearly preferred the new offering.' },
    ],
  },
  {
    id: 'incentive',
    short: 'Incumbent incentive',
    title: 'Incumbent incentive to respond',
    prompt: casePrompts.incentive,
    options: [
      { label: 'No incentive',          score: 2,  blurb: 'Adopting it would have eaten into their best business.' },
      { label: 'Weak',                  score: 1,  blurb: 'Limited upside; easy to dismiss as a niche.' },
      { label: 'Mixed',                 score: 0,  blurb: 'Some upside, some cannibalization.' },
      { label: 'Strong',                score: -1, blurb: 'Clear financial reason to respond.' },
      { label: 'Very strong incentive', score: -2, blurb: 'Their best customers wanted exactly this.' },
    ],
  },
  {
    id: 'core',
    short: 'Core customer reaction',
    title: 'Core customer reaction',
    prompt: casePrompts.core,
    options: [
      { label: 'Very upset',       score: 2,  blurb: 'Core customers would have rejected the change.' },
      { label: 'Somewhat upset',   score: 1,  blurb: 'Some friction with existing loyalists.' },
      { label: 'Indifferent',      score: 0,  blurb: 'No strong feelings either way.' },
      { label: 'Somewhat pleased', score: -1, blurb: 'Most would have welcomed it.' },
      { label: 'Very pleased',     score: -2, blurb: 'Core customers wanted the upgrade.' },
    ],
  },
  {
    id: 'foothold',
    short: 'Entry foothold',
    title: 'Entry foothold',
    prompt: casePrompts.foothold,
    options: [
      { label: 'Clearly mainstream',  score: -2, blurb: 'Targeted the incumbents\' core customers head-on.' },
      { label: 'Mostly mainstream',   score: -1, blurb: 'Mostly fishing in the existing pond.' },
      { label: 'Mixed',               score: 0,  blurb: 'Some new market, some incumbent customers.' },
      { label: 'Mostly underserved',  score: 1,  blurb: 'Mostly people who couldn\'t reliably get a taxi.' },
      { label: 'Clearly underserved', score: 2,  blurb: 'Almost entirely non-consumers and overlooked customers.' },
    ],
  },
  {
    id: 'performance',
    short: 'Performance tradeoff',
    title: 'Initial performance tradeoff',
    prompt: casePrompts.performance,
    options: [
      { label: 'Clearly better',  score: -2, blurb: 'Strictly dominated the incumbent on what customers cared about.' },
      { label: 'Somewhat better', score: -1, blurb: 'Better on most mainstream dimensions.' },
      { label: 'Mixed',           score: 0,  blurb: 'Better on some, worse on others.' },
      { label: 'Somewhat worse',  score: 1,  blurb: 'Worse on traditional metrics, better on convenience.' },
      { label: 'Clearly worse',   score: 2,  blurb: 'Notably worse on the metrics mainstream customers cared about.' },
    ],
  },
];

export const CASES: Case[] = [
  {
    id: 'uber',
    title: 'Uber vs. Taxis',
    shortTitle: 'Uber',
    era: 'San Francisco · 2010–2012',
    blurb: 'Uber entered urban transportation with app-based ride-hailing, real-time tracking, digital payment, driver ratings, and dynamic pricing. Compare this to traditional taxis at the time of Uber\'s entry — judge it then, not now.',
    instructorNote: `Uber often tilts <strong>sustaining</strong>, not disruptive. Mainstream taxi riders did value app-based booking, tracking, and cashless payment — taxi companies could have profitably adopted those features, and core customers would have welcomed them. Uber entered head-on against the incumbents' existing customers rather than from an overlooked or low-end foothold, and on most dimensions riders cared about it was better, not worse, from day one. Christensen himself argued Uber is sustaining for these reasons. The asset-light platform model, regulatory arbitrage, and surge pricing make it strategically novel — but novelty isn't the same as disruption in his sense.`,
    questions: BASE_QUESTIONS({
      wtp: 'At entry, would mainstream taxi riders have valued Uber\'s app-booking, tracking, cashless pay, and ratings more than traditional taxi service?',
      incentive: 'Would taxi companies have made more money by adopting app-based booking, driver tracking, digital payment, and ratings?',
      core: 'Would taxi customers have been pleased — or upset — if taxi companies had implemented Uber-like features?',
      foothold: 'Did Uber primarily enter through ignored non-consumers, or did it compete for existing taxi/limo customers?',
      performance: 'On the dimensions mainstream riders cared most about, was Uber initially better, similar, or worse than taxis?',
    }),
  },
  {
    id: 'tesla',
    title: 'Tesla vs. Automakers',
    shortTitle: 'Tesla',
    era: 'Silicon Valley · 2008–2013',
    blurb: 'Tesla entered the auto market with the Roadster and early Model S — high-end electric vehicles with software-defined performance, over-the-air updates, and a direct sales model. Consider incumbents like GM, Ford, and Toyota at the time of entry.',
    instructorNote: `Tesla is <strong>not a classic low-end disruption</strong>. It entered at the high end of the market with expensive, status-signaling vehicles — exactly the opposite of the foothold pattern Christensen describes. Mainstream car buyers couldn't afford the Roadster or early Model S. Incumbents had weak incentives to prioritize EVs when their most profitable customers were still buying gasoline trucks and SUVs. Tesla is better understood as a high-end or new-market entry that subsequently improved and moved downstream. Some argue it has had disruptive consequences over time — but at entry, the trajectory was high-to-low, not low-to-mainstream.`,
    questions: BASE_QUESTIONS({
      wtp: 'Did mainstream car buyers have a higher willingness to pay for Tesla\'s electric drivetrain, software features, and design relative to comparable size gasoline vehicles?',
      incentive: 'Did incumbent automakers have strong incentives to produce EVs once Tesla entered with their vehicles?',
      core: 'Would incumbents\' core customers have welcomed a shift toward EVs at the time of Tesla\'s entry?',
      foothold: 'Did Tesla enter through low-end or overlooked customers, or through premium/high-status early adopters?',
      performance: 'Was Tesla initially worse on mainstream dimensions such as performance, design or quality?',
    }),
  },
  {
    id: 'iphone',
    title: 'iPhone vs. Smartphones',
    shortTitle: 'iPhone',
    era: 'Cupertino · 2007–2010',
    blurb: 'Apple introduced the iPhone as a device combining phone, internet browser, music player, touchscreen interface, and app ecosystem. Compare it to incumbent phones — including BlackBerry and Nokia — at the time of entry.',
    instructorNote: `The iPhone is <strong>not a simple case of classic disruption</strong>. It entered at the premium end of the market and improved dimensions many existing smartphone users already valued — internet access, media, interface. BlackBerry users, corporate IT departments, and existing smartphone buyers had reason to notice it immediately. Incumbents had strong incentives to respond. However, the iPhone did redefine the basis of competition (from keyboards to touchscreens, from enterprise to consumer) and dramatically expanded the market. This makes it a useful <em>debate case</em>: students can argue both sides. The strongest argument for disruption is the new-market expansion; the strongest argument against is the premium entry point and high WTP from day one.`,
    questions: BASE_QUESTIONS({
      wtp: 'Did high-end phone users initially value the iPhone\'s touchscreen, browser, media experience, and design more than existing smartphones like BlackBerry?',
      incentive: 'Did incumbent phone makers and carriers have incentives to respond with better mobile internet, touchscreens, and app ecosystems?',
      core: 'Would incumbents\' core customers — corporate BlackBerry users, enterprise IT — have welcomed iPhone-like features?',
      foothold: 'Did the iPhone begin with low-end or non-consuming customers, or with premium mainstream consumers willing to pay a premium?',
      performance: 'Was the iPhone initially worse on core smartphone dimensions (e.g., browsing, user experience, design, etc.)?',
    }),
  },
  {
    id: 'llm',
    title: 'LLMs for Search',
    shortTitle: 'LLMs',
    era: 'Global · 2022–present',
    blurb: 'In November 2022, OpenAI released ChatGPT, a large language model (LLM) that quickly gained attention for its ability to generate human-like text and answer questions on a wide range of topics. Consider how the incumbent search engines (Google, Microsoft, etc.) would view this innovation at the time of ChatGPT\'s release.',
    instructorNote: `LLMs are best understood as a <strong>hybrid or ambiguous case</strong> — which makes them valuable for discussion. In many enterprise contexts, they look sustaining: Microsoft, Google, Salesforce, and Adobe all have strong incentives to integrate LLM capabilities, and core customers welcome Copilot-style features. But in other contexts, LLMs are disruptive: they give non-experts — junior analysts, small businesses, individuals — access to capabilities that previously required expensive specialized labor. The disruption may not be to Microsoft Word; it may be to consulting firms, junior knowledge workers, and specialized service providers who served the non-consuming market. Encourage students to specify <em>which incumbents</em> they're analyzing and <em>which customer segment</em> they have in mind.`,
    questions: BASE_QUESTIONS({
      wtp: 'Do mainstream customers of search engines find that LLMs produce better search results, and thus, have a higher willingness to pay for search engines with LLM capabilities?',
      incentive: 'Are incumbents like Google and Microsoft losing search traffic or advertising money to LLMs such as ChatGPT? If they are, they have a strong incentive to respond; if they are not losing customers, then the incentive is weak',
      core: 'Are core customers of Google search pleased if Google search added LLM-based answers?',
      foothold: 'Are LLMs initially serving overlooked or non-consuming users who previously couldn\'t afford or wwere not satisfied with Google search, or are they serving mainstream users of Google search?',
      performance: 'When LLMs launched, were they better or worse in terms of delivering accurate or fast results than Google search?',
    }),
  },
];
