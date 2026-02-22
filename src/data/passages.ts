import { HallucinationPassage } from "@/types/hallucination";

export const passages: HallucinationPassage[] = [
  // ─── CATEGORY 1: Obvious Fabrications ───
  {
    id: "of-001",
    prompt: `According to a 2023 study by MIT, [the average person encounters 47 AI-generated images per day without knowing it]{claim-1}. [The study was published in Nature Machine Intelligence]{claim-2} and [surveyed over 10,000 participants across 15 countries]{claim-3}. [Researchers found that most people could only identify AI images about 40% of the time]{claim-4}.`,
    category: "obvious-fabrications",
    difficulty: "easy",
    claimAnnotations: {
      "claim-1": { isHallucination: true, explanation: "This specific statistic is fabricated. No MIT study established this number." },
      "claim-2": { isHallucination: true, explanation: "No such study was published in Nature Machine Intelligence." },
      "claim-3": { isHallucination: true, explanation: "The survey details are entirely made up." },
      "claim-4": { isHallucination: false, explanation: "Multiple real studies show humans detect AI images roughly 40% of the time." },
    },
    enrichment: {
      whyItMatters: "AI frequently generates fake citations and statistics with complete confidence.",
      realWorldExample: "A lawyer used ChatGPT for legal research and cited 6 completely fabricated court cases in a filing.",
      proTip: "Red flags: very specific numbers, full citation details, claims that perfectly support the narrative.",
    },
  },
  {
    id: "of-002",
    prompt: `The Golden Gate Bridge, [designed by architect Frank Lloyd Wright]{claim-1}, was completed in [1937]{claim-2}. [It spans approximately 1.7 miles across the San Francisco Bay]{claim-3} and was once [the longest suspension bridge in the world]{claim-4}. The bridge's signature [International Orange color was originally intended as a temporary primer]{claim-5}.`,
    category: "obvious-fabrications",
    difficulty: "easy",
    claimAnnotations: {
      "claim-1": { isHallucination: true, explanation: "The Golden Gate Bridge was designed by Joseph Strauss, not Frank Lloyd Wright." },
      "claim-2": { isHallucination: false, explanation: "The bridge was indeed completed in 1937." },
      "claim-3": { isHallucination: false, explanation: "The total length is about 1.7 miles." },
      "claim-4": { isHallucination: false, explanation: "It was the longest suspension bridge from 1937 until 1964." },
      "claim-5": { isHallucination: false, explanation: "The orange primer was indeed meant to be temporary but became permanent." },
    },
    enrichment: {
      whyItMatters: "AI confidently substitutes famous names into plausible contexts.",
      realWorldExample: "ChatGPT has attributed buildings to wrong architects in homework answers that students submitted.",
      proTip: "When a famous name appears, verify the specific connection — AI loves namedropping.",
    },
  },
  {
    id: "of-003",
    prompt: `[Marie Curie was the first woman to win a Nobel Prize]{claim-1}, receiving it in [1903 for her work on radioactivity]{claim-2}. She later won a second Nobel Prize in [Chemistry in 1911]{claim-3}. [Her notebooks are still so radioactive they must be stored in lead-lined boxes]{claim-4}, and [she died in 1930 from aplastic anemia]{claim-5} caused by prolonged radiation exposure.`,
    category: "obvious-fabrications",
    difficulty: "easy",
    claimAnnotations: {
      "claim-1": { isHallucination: false, explanation: "Marie Curie was indeed the first woman to win a Nobel Prize." },
      "claim-2": { isHallucination: false, explanation: "She won the 1903 Nobel Prize in Physics for research on radiation." },
      "claim-3": { isHallucination: false, explanation: "She won the Nobel Prize in Chemistry in 1911." },
      "claim-4": { isHallucination: false, explanation: "Her notebooks are indeed stored in lead-lined boxes at the Bibliothèque nationale." },
      "claim-5": { isHallucination: true, explanation: "Marie Curie died in 1934, not 1930." },
    },
    enrichment: {
      whyItMatters: "Small date errors in otherwise accurate text are easy to miss.",
      realWorldExample: "Wikipedia editors constantly fix AI-generated date errors that look plausible.",
      proTip: "Dates are one of AI's weakest areas. Always double-check specific years.",
    },
  },
  // ─── CATEGORY 2: Plausible But Wrong ───
  {
    id: "pw-001",
    prompt: `The human brain [uses approximately 20% of the body's total energy]{claim-1} despite being [only about 2% of body weight]{claim-2}. Contrary to popular myth, [we actually use 100% of our brain]{claim-3}, not just 10%. The brain contains [approximately 86 billion neurons]{claim-4}, each forming [an average of 10,000 synaptic connections]{claim-5} with other neurons.`,
    category: "plausible-but-wrong",
    difficulty: "easy",
    claimAnnotations: {
      "claim-1": { isHallucination: false, explanation: "The brain does use about 20% of the body's energy." },
      "claim-2": { isHallucination: false, explanation: "The brain is roughly 2% of body weight." },
      "claim-3": { isHallucination: false, explanation: "We do use all parts of our brain, the 10% myth is false." },
      "claim-4": { isHallucination: false, explanation: "The estimate of 86 billion neurons is well-established research." },
      "claim-5": { isHallucination: true, explanation: "The average is roughly 7,000 synaptic connections per neuron, not 10,000." },
    },
    enrichment: {
      whyItMatters: "Plausible-sounding numbers are the hardest hallucinations to catch without domain knowledge.",
      realWorldExample: "Medical misinformation often contains slightly inflated statistics that sound authoritative.",
      proTip: "Round numbers (10,000, 100,000) in scientific claims are often AI approximations.",
    },
  },
  {
    id: "pw-002",
    prompt: `[JavaScript was created by Brendan Eich in 1995]{claim-1} while working at Netscape. [It was originally called Mocha, then LiveScript]{claim-2}, before being renamed to JavaScript. Despite the name, [JavaScript is actually based on Java's syntax and runtime]{claim-3}. Today, [it's the most widely used programming language according to Stack Overflow surveys]{claim-4}, and [Node.js, created by Ryan Dahl in 2009, brought JavaScript to server-side development]{claim-5}.`,
    category: "plausible-but-wrong",
    difficulty: "easy",
    claimAnnotations: {
      "claim-1": { isHallucination: false, explanation: "Brendan Eich created JavaScript in 1995 at Netscape." },
      "claim-2": { isHallucination: false, explanation: "It was initially called Mocha, then LiveScript, then JavaScript." },
      "claim-3": { isHallucination: true, explanation: "JavaScript is NOT based on Java. It was influenced by Self and Scheme. The name was a marketing decision." },
      "claim-4": { isHallucination: false, explanation: "JavaScript has topped Stack Overflow's most-used language surveys for years." },
      "claim-5": { isHallucination: false, explanation: "Ryan Dahl created Node.js in 2009." },
    },
    enrichment: {
      whyItMatters: "Plausible misconceptions are the most dangerous because they reinforce existing confusion.",
      realWorldExample: "Many junior developers believe JavaScript is related to Java because of AI-generated explanations.",
      proTip: "If a claim reinforces a common misconception, that's actually a red flag.",
    },
  },
];

export function getPassage(id: string): HallucinationPassage | undefined {
  return passages.find((p) => p.id === id);
}

export function getPassagesByCategory(category: string): HallucinationPassage[] {
  return passages.filter((p) => p.category === category);
}
