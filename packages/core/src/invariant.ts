export const invariant = <T>(
  value: T | undefined,
  msg = 'Invariant violation',
): T => {
  if (!value) throw new Error(msg)
  return value
}
