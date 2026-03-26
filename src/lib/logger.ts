export function logError(context: string, error: unknown) {
  console.error('[ChatPulse]', context, error instanceof Error ? error.message : error);
}
