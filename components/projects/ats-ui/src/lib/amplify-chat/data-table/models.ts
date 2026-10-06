// Record model for the Amplify chat data-table rows (Figma novo-data-table-row-chat 6174:165788).
// Figma's two row variants ("prospect - existing content", "prospect - not in BH") are data
// examples, not code variants: the row renders from one AmplifyChatProspect.

/** One prospect contact returned by Amplify (a Prospect search result). */
export interface AmplifyChatProspect {
  /** Stable id, used to track rows and selection. */
  id: string | number;
  /** Full name: the record-name link in the first column. */
  name: string;
  /** Photo URL. Without one the avatar shows the name's initials. */
  avatarUrl?: string;
  /** Already a Contact in Bullhorn ("Existing Contact") or not yet ("Not in Bullhorn"). */
  inBullhorn: boolean;
  /** Job title, e.g. "District Security Director". */
  title?: string;
  /** Company name. Not a Figma column; used by cards and for row labels. */
  company?: string;
  /** Mobile phone. Unset: "Reveal Phone Number" when not in Bullhorn, else "Not on file". */
  mobilePhone?: string | null;
  /** Email. Unset: "Reveal Email" when not in Bullhorn, else "Not on file". */
  email?: string | null;
}

/** Columns of the prospect chat table, in Figma order (6171:165361). */
export type AmplifyChatProspectColumn = 'name' | 'inBullhorn' | 'title' | 'mobilePhone' | 'email';

/** Header labels (Figma text; shown uppercase by the header cell style). */
export const AMPLIFY_CHAT_PROSPECT_COLUMN_LABELS: Record<AmplifyChatProspectColumn, string> = {
  name: 'Name',
  inBullhorn: 'In Bullhorn?',
  title: 'Job Title',
  mobilePhone: 'Mobile Phone',
  email: 'Email',
};

/** All columns, Figma order. Docked chat shows at most 4: pass a subset. */
export const AMPLIFY_CHAT_PROSPECT_COLUMNS: AmplifyChatProspectColumn[] = ['name', 'inBullhorn', 'title', 'mobilePhone', 'email'];

/** Which contact field a "Reveal …" link asks for. */
export type AmplifyChatRevealField = 'mobilePhone' | 'email';

/** Initials for an avatar fallback: first + last word, uppercase ("Fred Johnson" → "FJ"). */
export function amplifyChatInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  const first = words[0][0] ?? '';
  const last = words.length > 1 ? (words[words.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase();
}
