import type { Event } from '@/types'

/**
 * =======================================================================
 * C.O.D.E. CLUB — EVENT CONFIGURATION & FALLBACK DATA
 * =======================================================================
 * You can edit any event details directly in this file:
 * - Line 17+: ARCADE_C_EVENT definition
 * - Line 21: Event title ('Arcade.C')
 * - Line 24: Short description
 * - Line 27: Full markdown description
 * - Line 75: Venue location
 * - Line 76: Date and start time
 * - Line 77: End time
 * - Line 78: Registration deadline
 * - Line 83: Team size (min 2, max 3)
 * - Line 85: Registration fee in INR (200)
 * - Line 87: Eligibility criteria
 * - Line 92: Rules & guidelines
 * - Line 100: Schedule breakdown
 * - Line 108: Prizes (₹3,000 Cash Prize)
 * =======================================================================
 */

export const ARCADE_C_EVENT: Event = {
  id: 'arcade-c-2026',
  title: 'Arcade.C',
  slug: 'arcade-c',
  short_description:
    'A three-round technical arena combining C programming syntax surgery, generative AI reverse prompt engineering, and a collaborative code auction.',
  description: `Organized by C.O.D.E. (Community of Data Engineers), Department of CSE (Data Science) at RNS Institute of Technology, Bengaluru.

Arcade.C is a premier three-round technical showdown designed exclusively for 1st-year and 2nd-year engineering students. Test your debugging reflexes, master prompt engineering with Bing Image Creator, and strategize in a real-time collaborative coding auction!`,

  round1:
    `Each team receives two broken C code snippets—one easy and one medium—and must identify the errors and write corrected code.
• Format: Paper-based pen-and-paper. AI tools are strictly prohibited.
• Duration: 45–60 minutes.
• Scoring: 50 marks per question. Correctness determines the score, with partial marks for partially correct answers. Submission time is used as a tie-breaker.`,

  round2:

    // ROUND 2 — PROMPT PIXEL / REVERSE PROMPT IMAGING (100 Points)
    `Teams briefly view reference images on screen and craft their own prompts in Bing Image Creator to generate images resembling the references.
• Sub-round 1 (10 mins, 25 pts): 1 reference image → 1 generated image.
• Sub-round 2 (15 mins, 30 pts): 2 reference images → 2 separate generated images.
• Sub-round 3 (20 mins, 45 pts): 3 reference images → 3 separate generated images.
• Scoring: Evaluated on visual similarity, detail precision, and composition.`,

  // ROUND 3 — BID & WIN / CODE AUCTION (200 Points)
  round3: `
The lab is divided into three lanes, forming three mega-teams from participating teams. Three questions are drawn at random from a pool of six easy-to-medium questions and auctioned using 1,000-point allocations.
• Format: A new question round begins every 30 minutes, even if the previous question remains unsolved.
• Hints & Penalties:
  - 1st hint: -10 points
  - 2nd hint: -20 points
  - 3rd hint: -30 points
  - 4th hint: -10 points
  - 5th hint: -20 points (reveals full logic)
• Redistribution: Points earned by a mega-team are redistributed equally among all teams in its lane.
• Duration: 1–1.5 hours.`,

  decidingW:
    // DECIDING THE WINNER:
    `Scores from all three rounds will be tallied. The top-scoring team wins the grand cash prize. In case of a tie, Round 1 submission time will serve as the tie-breaker. All participants receive official certificates.`,
  banner_image_url: '/images/events/arcade-c-banner.png',
  venue: 'Data Science Dept Labs, RNSIT Campus, Bengaluru',
  starts_at: '2026-10-30T09:30:00+05:30',
  ends_at: '2026-10-30T16:30:00+05:30',
  registration_deadline: '2026-10-29T23:59:59+05:30',
  registration_open: true,
  published: true,
  is_featured: true,
  featured_button_text: 'Register for Arcade.C',
  team_min_size: 2,
  team_max_size: 3,
  fee_per_team: 200,
  payment_methods_enabled: ['upi_manual'],
  eligibility: `• Exclusively for 1st-Year and 2nd-Year undergraduate students at RNSIT.
• Teams must consist of 2 to 3 members.
• Maximum cap: Strictly limited to 18 teams on a first-come, first-served basis.`,
  rules: `1. All team members must report to the Data Science Department lab on 30th October 2026 by 9:15 AM with valid College ID cards.
2. AI tools, ChatGPT, Copilot, or external assistance are strictly prohibited during Round 1 and Round 3.
3. In Round 2, only Bing Image Creator is permitted.
4. Any malpractice or plagiarism will result in immediate disqualification.
5. In case of a tie, Round 1 submission time is decisive.
6. The decision of the judges and organizing committee is final and binding.`,
  schedule: `• 09:15 AM — Check-in & Lab Allocation
• 09:45 AM — Opening Briefing
• 10:00 AM – 11:00 AM — Round 1: Syntax Surgery (45–60 mins)
• 11:15 AM – 12:15 PM — Round 2: Prompt Pixel (45 mins)
• 12:15 PM – 01:15 PM — Lunch Break
• 01:30 PM – 03:00 PM — Round 3: Bid & Win / Code Auction (1.5 hours)
• 03:30 PM — Valedictory, Prize Distribution & Certificates`,
  prizes: `🏆 1st Place: ₹3,000 Cash Prize + Winner Trophy + Certificate of Excellence
🥈 2nd Place: Certificate of Merit
📜 All Participants: Official C.O.D.E. Club Participation Certificate`,
  faqs: `Q: Who can participate?
A: Any 1st-year or 2nd-year student from any branch at RNSIT.

Q: Can individuals register?
A: Teams must have 2 to 3 members. If you don't have a team, join the C.O.D.E WhatsApp group to find teammates.

Q: What is the registration fee?
A: ₹200 per team. Registration includes entry to all 3 rounds and certificates.

Q: Is prior competitive programming experience required?
A: Basic C programming knowledge is sufficient for Round 1! Round 2 tests creative AI prompting, and Round 3 involves team auction strategy.`,
  contact_email: 'code@rnsit.ac.in',
  contact_phone: '+91 98765 43210',
  created_at: '2026-10-13T00:00:00Z',
  updated_at: '2026-10-26T00:00:00Z',
}

export const FALLBACK_EVENTS: Event[] = [ARCADE_C_EVENT]

export function getArcadeCInsertPayload() {
  const { id, created_at, updated_at, ...rest } = ARCADE_C_EVENT
  return rest
}
