export async function fetchWithAuth(
  input: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1]
): Promise<Response> {
  return await fetch(input, init);
}
