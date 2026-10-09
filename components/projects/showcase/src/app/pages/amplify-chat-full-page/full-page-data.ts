import {
  AmplifyChatCardItem, AmplifyChatClarifyingQuestion, AmplifyChatLinkEntity, AmplifyChatProspect, AmplifyChatProspectColumn, AmplifyChatSelectionAction, AmplifyChatSource,
} from 'ats-ui';

/** The canned reply compositions the shell rotates through. */
export type ReplyFormat = 'table' | 'prose' | 'cards' | 'draft' | 'clarify' | 'answer';

export type Turn =
  | { id: number; kind: 'user'; text: string; tag?: { label: string; entity: AmplifyChatLinkEntity } }
  | { id: number; kind: 'reply'; format: ReplyFormat; thinking?: boolean; stopped?: boolean; selection?: number[] };

/** Figma short / long conversation (6237:176854, 6267:181805): the opening question. */
export const FIRST_QUESTION = "Can you show me 5 contacts at Verizon that aren't in the ATS yet?";

/** Order the canned replies come in after a send (the first send gets the Figma table reply). */
export const ROTATION: ReplyFormat[] = ['table', 'prose', 'cards', 'clarify', 'draft'];

/** Status line while a reply of this format is thinking. */
export const THINKING: Record<ReplyFormat, string> = {
  table: 'Searching Prospect…',
  prose: 'Ranking 14 job orders…',
  cards: 'Checking Verizon contacts in your ATS…',
  clarify: 'Thinking…',
  draft: 'Drafting the email…',
  answer: 'Searching candidates…',
};

// Figma global-chat-full-page sample: the Verizon prospects table.
export const PROSPECTS: AmplifyChatProspect[] = [
  { id: 1, name: 'Marie Smith', inBullhorn: false, title: 'District Security Director', company: 'Verizon', mobilePhone: '679-274-4162' },
  { id: 2, name: 'Fred Johnson', inBullhorn: false, title: 'District Security Director', company: 'Verizon', mobilePhone: null },
  { id: 3, name: 'Nina Patel', inBullhorn: false, title: 'IT Director', company: 'Verizon', mobilePhone: '679-274-4162' },
  { id: 4, name: 'Owen Reed', inBullhorn: false, title: 'IT Operations Manager', company: 'Verizon', mobilePhone: '679-274-4162' },
  { id: 5, name: 'Leila Nguyen', inBullhorn: false, title: 'Infrastructure Manager', company: 'Verizon', mobilePhone: null },
];
export const COLUMNS: AmplifyChatProspectColumn[] = ['name', 'inBullhorn', 'title', 'mobilePhone'];
export const PROSPECT_SOURCES: AmplifyChatSource[] = PROSPECTS.map((p) => ({ label: p.name, entity: 'prospect', href: '#' }));

export const SELECTION_ACTIONS: AmplifyChatSelectionAction[] = [
  { id: 'list', label: 'Add to list', icon: 'list-outline' },
  { id: 'sequence', label: 'Add to Outreach sequence', icon: 'automation', preview: true },
];

export const JOB_SOURCES: AmplifyChatSource[] = [
  { label: 'Senior Java Developer', entity: 'job', href: '#' },
  { label: 'Data Engineer', entity: 'job', href: '#' },
  { label: 'Project Manager', entity: 'job', href: '#' },
];

export const CARD_ITEMS: AmplifyChatCardItem[] = [
  { id: 'ms', name: 'Marie Smith', jobTitle: 'Head of HR', email: 'marie.smith@verizon.com', signals: ['HR leader', 'Dept: People', 'Prior contact'] },
  { id: 'jc', name: 'James Chen', jobTitle: 'VP of Engineering', email: 'james.chen@verizon.com', signals: ['Tech leader', 'Dept: Network', 'Mutual intro'] },
  { id: 'pp', name: 'Priya Patel', jobTitle: 'Director of Operations', email: 'priya.patel@verizon.com', signals: ['Ops leader', 'Dept: Field Ops', 'High activity'] },
].map((c) => ({ id: c.id, name: c.name, jobTitle: c.jobTitle, fields: [{ type: 'email' as const, text: c.email }], inBullhorn: false, signals: c.signals }));

export const DRAFT = `Hi Jordan,

I came across your profile and think you could be a strong fit for a Senior Java Developer role with one of our clients in Boston. Would you be open to a quick call this week?

Best,
Chloe`;

/** The clarifying round Amplify asks before a candidate search. */
export const CLARIFY_ROUND: AmplifyChatClarifyingQuestion[] = [
  {
    question: 'Which job order?',
    help: 'Amplify only searches records you can access.',
    options: [
      { type: 'record', label: '425 | Software Engineer', recommended: 'Recommended · you own it',
        fields: [{ type: 'company', text: 'Verizon' }, { type: 'date', text: 'May 2, 2024' }, { type: 'status', text: 'Open' }] },
      { type: 'record', label: '431 | Java Developer', fields: [{ type: 'company', text: 'Comcast' }, { type: 'date', text: 'Jun 4, 2024' }, { type: 'status', text: 'Accepting candidates' }] },
    ],
  },
  {
    question: 'How far from Boston should Amplify look?',
    options: [
      { label: 'Within 25 mi of Boston', recommended: 'Recommended · from', recordLink: 'JO-425' },
      { label: 'Within 50 mi of Boston' },
      { label: 'Include remote candidates' },
    ],
  },
];
