import { NovoListEntity, NovoListField } from '../../novo-list/parts';
import { AmplifyChatClarifyOptionType } from './clarify-option';

/** One answer option of a clarifying question (maps to AmplifyChatClarifyOption inputs). */
export interface AmplifyChatClarifyOptionModel {
  label: string;
  type?: AmplifyChatClarifyOptionType;
  /** The "Recommended · …" note. The first option with one is what Skip answers. */
  recommended?: string;
  recordLink?: string;
  recordLinkEntity?: NovoListEntity;
  description?: string;
  entity?: NovoListEntity;
  fields?: NovoListField[];
  /** Value reported in the answer; defaults to `label`. */
  value?: string;
}

/** One question in the round. */
export interface AmplifyChatClarifyingQuestion {
  question: string;
  /** Short label for the answers message (user bubble `state=clarify answers`), e.g. "Job order"
   *  for "Which job order?". Defaults to the question. */
  label?: string;
  help?: string;
  /** 2–4 options. */
  options: AmplifyChatClarifyOptionModel[];
  /** Show the Something else row (with Skip). Default true. */
  allowSomethingElse?: boolean;
}

/** An answer to one question. `option` is the chosen index, or null for a typed answer. */
export interface AmplifyChatClarifyAnswer {
  question: string;
  /** The question's short `label` (or the question). */
  label: string;
  value: string;
  option: number | null;
  /** Set when the chosen option is a record: its entity, so the answer can show as an entity link. */
  entity?: NovoListEntity;
  /** How it was answered. */
  via: 'option' | 'custom' | 'skip';
}
