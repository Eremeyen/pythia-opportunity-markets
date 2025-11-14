// NOTE: For now we hard-map everyone to a single sponsor id.
// In production, the wallet address itself should be the sponsor id
// or mapped deterministically from an allowlist / backend lookup.
export function getCurrentSponsorId(_address?: string): string {
  return "sp-1";
}


