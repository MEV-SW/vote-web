const key = (pollId: number) => `ballot_token_${pollId}`;

export function getBallotToken(pollId: number): string | null {
  return sessionStorage.getItem(key(pollId));
}

export function setBallotToken(pollId: number, token: string) {
  sessionStorage.setItem(key(pollId), token);
}

export function clearBallotToken(pollId: number) {
  sessionStorage.removeItem(key(pollId));
}
