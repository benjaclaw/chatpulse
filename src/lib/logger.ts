export function logError(context: string, error: unknown): void {
  console.error('[ChatPulse]', context, error instanceof Error ? error.message : error);
}
