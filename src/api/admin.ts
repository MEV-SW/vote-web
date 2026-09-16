import { apiFetch, ApiError } from './client';
import type {
  AuthConfig,
  Candidate,
  EligibleVoter,
  EligibleVoterCreate,
  FormResultsOut,
  Poll,
  PollCreatePayload,
  PollListItem,
  Question,
  QuestionCreatePayload,
  QuestionOption,
  ResultsOut,
} from '../types/api';

export function getAuthConfig() {
  return apiFetch<AuthConfig>('/admin/auth/config');
}

export function login(username: string, password: string) {
  return apiFetch<{ access_token: string }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

/** Swap short Keycloak access token for Vote session JWT (browser SSO). */
export function exchangeOidcToken(keycloakAccessToken: string) {
  return apiFetch<{ access_token: string }>('/admin/auth/exchange', {
    method: 'POST',
  }, keycloakAccessToken);
}

export function listPolls(token: string) {
  return apiFetch<PollListItem[]>('/admin/polls', {}, token);
}

export function createPoll(token: string, payload: PollCreatePayload) {
  return apiFetch<Poll>('/admin/polls', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
}

export function getPollAdmin(token: string, pollId: number) {
  return apiFetch<Poll>(`/admin/polls/${pollId}`, {}, token);
}

export function updatePoll(
  token: string,
  pollId: number,
  payload: Record<string, unknown>,
) {
  return apiFetch<Poll>(`/admin/polls/${pollId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, token);
}

export function deletePoll(token: string, pollId: number) {
  return apiFetch<void>(`/admin/polls/${pollId}`, {
    method: 'DELETE',
  }, token);
}

export function addCandidate(
  token: string,
  pollId: number,
  payload: { name: string; team?: string; tagline?: string; image_url?: string; figma_url?: string | null },
) {
  return apiFetch<Candidate>(`/admin/polls/${pollId}/candidates`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
}

export function updateCandidate(
  token: string,
  pollId: number,
  candidateId: number,
  payload: { name?: string; team?: string; tagline?: string; image_url?: string; figma_url?: string | null },
) {
  return apiFetch<Candidate>(`/admin/polls/${pollId}/candidates/${candidateId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, token);
}

export function listEligibleVoters(token: string, pollId: number) {
  return apiFetch<EligibleVoter[]>(`/admin/polls/${pollId}/voters`, {}, token);
}

export function addEligibleVoter(token: string, pollId: number, payload: EligibleVoterCreate) {
  return apiFetch<EligibleVoter>(`/admin/polls/${pollId}/voters`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
}

export function addEligibleVotersBulk(token: string, pollId: number, voters: EligibleVoterCreate[]) {
  return apiFetch<EligibleVoter[]>(`/admin/polls/${pollId}/voters/bulk`, {
    method: 'POST',
    body: JSON.stringify({ voters }),
  }, token);
}

export function deleteEligibleVoter(token: string, pollId: number, voterId: number) {
  return apiFetch<void>(`/admin/polls/${pollId}/voters/${voterId}`, {
    method: 'DELETE',
  }, token);
}

export function revokeVoterVote(token: string, pollId: number, voterId: number) {
  return apiFetch<{ revoked: boolean }>(`/admin/polls/${pollId}/voters/${voterId}/vote`, {
    method: 'DELETE',
  }, token);
}

export function deleteCandidate(token: string, pollId: number, candidateId: number) {
  return apiFetch<void>(`/admin/polls/${pollId}/candidates/${candidateId}`, {
    method: 'DELETE',
  }, token);
}

export function getResults(token: string, pollId: number) {
  return apiFetch<ResultsOut>(`/admin/polls/${pollId}/results`, {}, token);
}

export function resetPollVotes(token: string, pollId: number) {
  return apiFetch<{ deleted_ballots: number }>(`/admin/polls/${pollId}/reset`, {
    method: 'POST',
  }, token);
}

export function getResultsCsvUrl(pollId: number) {
  return `/api/admin/polls/${pollId}/results/csv`;
}

export function getFormResults(token: string, pollId: number) {
  return apiFetch<FormResultsOut>(`/admin/polls/${pollId}/form-results`, {}, token);
}

export function getFormResultsCsvUrl(pollId: number) {
  return `/api/admin/polls/${pollId}/form-results/csv`;
}

export function addQuestion(token: string, pollId: number, payload: QuestionCreatePayload) {
  return apiFetch<Question>(`/admin/polls/${pollId}/questions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
}

export function updateQuestion(
  token: string,
  pollId: number,
  questionId: number,
  payload: Partial<QuestionCreatePayload>,
) {
  return apiFetch<Question>(`/admin/polls/${pollId}/questions/${questionId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, token);
}

export function deleteQuestion(token: string, pollId: number, questionId: number) {
  return apiFetch<void>(`/admin/polls/${pollId}/questions/${questionId}`, {
    method: 'DELETE',
  }, token);
}

export function addQuestionOption(token: string, pollId: number, questionId: number, label: string) {
  return apiFetch<QuestionOption>(`/admin/polls/${pollId}/questions/${questionId}/options`, {
    method: 'POST',
    body: JSON.stringify({ label }),
  }, token);
}

export function updateQuestionOption(
  token: string,
  pollId: number,
  questionId: number,
  optionId: number,
  payload: { label?: string; order_num?: number },
) {
  return apiFetch<QuestionOption>(`/admin/polls/${pollId}/questions/${questionId}/options/${optionId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, token);
}

export function deleteQuestionOption(token: string, pollId: number, questionId: number, optionId: number) {
  return apiFetch<void>(`/admin/polls/${pollId}/questions/${questionId}/options/${optionId}`, {
    method: 'DELETE',
  }, token);
}

async function uploadImageLocal(token: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  return apiFetch<{ url: string }>('/admin/upload/image', {
    method: 'POST',
    body: form,
  }, token);
}

export async function uploadImage(token: string, file: File) {
  const contentType = file.type || 'image/jpeg';

  let presign: { upload_url: string; public_url: string };
  try {
    presign = await apiFetch<{ upload_url: string; public_url: string }>(
      '/admin/upload/presign',
      {
        method: 'POST',
        body: JSON.stringify({ filename: file.name, content_type: contentType }),
      },
      token,
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 503) {
      return uploadImageLocal(token, file);
    }
    throw e;
  }

  const putRes = await fetch(presign.upload_url, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': contentType },
  });
  if (!putRes.ok) {
    throw new ApiError(putRes.status, `S3 업로드 실패 (${putRes.status})`);
  }
  return { url: presign.public_url };
}
