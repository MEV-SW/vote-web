export interface Candidate {
  id: number;
  name: string;
  team?: string | null;
  tagline?: string | null;
  image_url?: string | null;
  figma_url?: string | null;
  tint: number;
}

export type PollType = 'open' | 'restricted';
export type PollKind = 'vote' | 'form';
export type VerifyMethod = 'pin' | 'sso';
export type IdentityMode = 'identified' | 'secret';
export type VerifyField = 'name' | 'email' | 'phone';
export type QuestionType = 'short_text' | 'long_text' | 'single_choice' | 'multi_choice' | 'scale';

export interface QuestionOption {
  id: number;
  label: string;
  order_num: number;
}

export interface Question {
  id: number;
  title: string;
  help_text?: string | null;
  type: QuestionType;
  required: boolean;
  order_num: number;
  scale_min: number;
  scale_max: number;
  options: QuestionOption[];
}

export interface PollPublic {
  id: number;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  category: string;
  status: string;
  closes_at?: string | null;
  max_selections: number;
  kind: PollKind;
  poll_type: PollType;
  verify_method: VerifyMethod;
  identity_mode: IdentityMode;
  candidates: Candidate[];
  questions: Question[];
}

export interface Poll extends PollPublic {
  eligible_count: number;
  verify_fields: VerifyField[];
}

export interface EligibleVoter {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  voted: boolean;
  voted_at?: string | null;
}

export interface VerifyVoterResponse {
  verified: boolean;
  voter_token: string | null;
  ballot_token?: string | null;
  voter_name: string;
  already_voted?: boolean;
  pin_required: boolean;
  pin_setup: boolean;
  identity_mode?: IdentityMode;
}

export interface VoteEntry {
  rank: number;
  candidate_id: number;
}

export interface AnswerSubmit {
  question_id: number;
  text_value?: string | null;
  scale_value?: number | null;
  option_ids?: number[];
}

export interface CheckResponse {
  voted: boolean;
  votes?: VoteEntry[] | null;
  answers?: AnswerSubmit[] | null;
}

export interface PollPublicListItem {
  id: number;
  title: string;
  category: string;
  status: string;
  candidates: number;
  questions?: number;
  max_selections: number;
  poll_type: PollType;
  kind?: PollKind;
  identity_mode?: IdentityMode;
  ballots: number;
  closes_at?: string | null;
  desc?: string | null;
}

export interface PollListItem {
  id: number;
  title: string;
  category: string;
  status: string;
  candidates: number;
  questions?: number;
  max_selections: number;
  poll_type: PollType;
  kind?: PollKind;
  verify_method?: VerifyMethod;
  identity_mode?: IdentityMode;
  ballots: number;
  eligible: number;
  created_at: string;
  closes_at?: string | null;
  desc?: string | null;
}

export interface ResultRow {
  candidate_id: number;
  name: string;
  team?: string | null;
  tagline?: string | null;
  tint: number;
  r1: number;
  r2: number;
  r3: number;
  r4?: number;
  r5?: number;
  score: number;
}

export interface ResultsOut {
  total_ballots: number;
  eligible_count: number;
  participation_rate: number;
  rows: ResultRow[];
}

export interface FormOptionCount {
  option_id: number;
  label: string;
  count: number;
}

export interface FormQuestionSummary {
  question_id: number;
  title: string;
  type: QuestionType;
  required: boolean;
  response_count: number;
  option_counts: FormOptionCount[];
  scale_avg?: number | null;
  scale_counts: Record<number, number>;
  texts: string[];
}

export interface FormAnswerOut {
  question_id: number;
  title: string;
  type: QuestionType;
  text_value?: string | null;
  scale_value?: number | null;
  option_labels: string[];
}

export interface FormResponseOut {
  ballot_id: number;
  submitted_at: string;
  voter_name?: string | null;
  voter_email?: string | null;
  answers: FormAnswerOut[];
}

export interface FormResultsOut {
  total_responses: number;
  eligible_count: number;
  participation_rate: number;
  questions: FormQuestionSummary[];
  responses: FormResponseOut[];
}

export interface CandidateDraft {
  name: string;
  team?: string;
  tagline?: string;
}

export interface PollCreatePayload {
  title: string;
  subtitle?: string;
  description?: string;
  category?: string;
  closes_at?: string;
  eligible_count?: number;
  max_selections?: number;
  poll_type?: PollType;
  verify_fields?: VerifyField[];
  kind?: PollKind;
  verify_method?: VerifyMethod;
  identity_mode?: IdentityMode;
  candidates: CandidateDraft[];
}

export interface EligibleVoterCreate {
  name?: string;
  email?: string;
  phone?: string;
}

export interface QuestionCreatePayload {
  title: string;
  help_text?: string;
  type: QuestionType;
  required?: boolean;
  scale_min?: number;
  scale_max?: number;
  options?: { label: string }[];
}

export interface AuthConfig {
  mode: string;
  local_enabled: boolean;
  oidc_enabled: boolean;
  issuer?: string | null;
  client_id?: string | null;
}
