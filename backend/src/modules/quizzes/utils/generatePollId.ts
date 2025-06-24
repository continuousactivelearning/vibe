export function generatePollId(): string {
  return 'poll_' + Math.random().toString(36).substring(2, 9);
}
// This function generates a unique poll ID by concatenating 'poll_' with a random string.