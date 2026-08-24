const CREDENTIAL_KEY = 'llf_agent_biometric_credential_v1';

function randomChallenge(): ArrayBuffer {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bytes.buffer as ArrayBuffer;
}

function encodeBase64Url(value: ArrayBuffer): string {
  let binary = '';
  for (const byte of new Uint8Array(value)) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function decodeBase64Url(value: string): ArrayBuffer {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0)).buffer;
}

export function biometricLockSupported(): boolean {
  return window.isSecureContext && Boolean(window.PublicKeyCredential && navigator.credentials);
}

export function biometricLockConfigured(): boolean {
  return Boolean(window.localStorage.getItem(CREDENTIAL_KEY));
}

export async function configureBiometricLock(agentUserId: string, displayName: string): Promise<void> {
  if (!biometricLockSupported()) throw new Error('biometric_lock_unsupported');
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: randomChallenge(),
      rp: { name: 'Local Lead Forge' },
      user: {
        id: new TextEncoder().encode(agentUserId),
        name: displayName,
        displayName,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'discouraged',
        userVerification: 'required',
      },
      attestation: 'none',
      timeout: 60_000,
    },
  }) as PublicKeyCredential | null;
  if (!credential) throw new Error('biometric_setup_cancelled');
  window.localStorage.setItem(CREDENTIAL_KEY, encodeBase64Url(credential.rawId));
}

export async function unlockWithBiometrics(): Promise<void> {
  if (!biometricLockSupported()) throw new Error('biometric_lock_unsupported');
  const credentialId = window.localStorage.getItem(CREDENTIAL_KEY);
  if (!credentialId) throw new Error('biometric_lock_not_configured');
  const credential = await navigator.credentials.get({
    publicKey: {
      challenge: randomChallenge(),
      allowCredentials: [{
        type: 'public-key',
        id: decodeBase64Url(credentialId),
        transports: ['internal'],
      }],
      userVerification: 'required',
      timeout: 60_000,
    },
  });
  if (!credential) throw new Error('biometric_unlock_cancelled');
}

export function removeBiometricLock(): void {
  window.localStorage.removeItem(CREDENTIAL_KEY);
}
