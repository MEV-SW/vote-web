import { apiFetch } from './client';
import type {
  AnswerSubmit,
  CheckResponse,
  FormResultsOut,
  Poll,
  PollPublic,
  PollPublicListItem,
  ResultsOut,
  VerifyVoterResponse,
  VoteEntry,
} from '../types/api';

export function listPublicPolls() {
  return apiFetch<PollPublicListItem[]>('/polls');
}

export function getPoll(pollId: number) {
  return apiFetch<Poll>(`/polls/${pollId}`);
}

export function getPollPublic(pollId: number) {
  return apiFetch<PollPublic>(`/polls/${pollId}/public`);
}

export function getPublicResults(pollId: number) {
  return apiFetch<ResultsOut>(`/polls/${pollId}/results`);
}

export function verifyVoter(
  pollId: number,
  payload: { name?: string; email?: string; phone?: string; pin?: string },
) {
  return apiFetch<VerifyVoterResponse>(`/polls/${pollId}/verify`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function checkVote(
  pollId: number,
  fingerprint: string,
  voterToken?: string | null,
  ballotToken?: string | null,
) {
  const params = new URLSearchParams({ fingerprint });
  if (voterToken) params.set('voter_token', voterToken);
  if (ballotToken) params.set('ballot_token', ballotToken);
  return apiFetch<CheckResponse>(`/polls/${pollId}/check?${params.toString()}`);
}

export function submitVote(
  pollId: number,
  fingerprint: string,
  votes: VoteEntry[],
  voterToken?: string | null,
  ballotToken?: string | null,
) {
  return apiFetch<{ ok: boolean }>(`/polls/${pollId}/vote`, {
    method: 'POST',
    body: JSON.stringify({
      fingerprint,
      votes,
      voter_token: voterToken ?? undefined,
      ballot_token: ballotToken ?? undefined,
    }),
  });
}

export function submitFormResponse(
  pollId: number,
  fingerprint: string,
  answers: AnswerSubmit[],
  voterToken?: string | null,
) {
  return apiFetch<{ ok: boolean }>(`/polls/${pollId}/responses`, {
    method: 'POST',
    body: JSON.stringify({
      fingerprint,
      answers,
      voter_token: voterToken ?? undefined,
    }),
  });
}

export function getPublicFormResults(pollId: number) {
  return apiFetch<FormResultsOut>(`/polls/${pollId}/form-results`);
}
