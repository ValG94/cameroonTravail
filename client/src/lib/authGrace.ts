/**
 * Grace period post-login/register.
 *
 * Problème résolu : sur mobile (surtout iOS Safari 4G), après un
 * login réussi, le navigateur peut mettre 1 à 3 secondes à
 * committer le Set-Cookie header. Pendant ce laps de temps, les
 * queries protégées qui partent au montage du dashboard tombent en
 * UNAUTHORIZED, ce qui déclenche le subscriber global de main.tsx
 * qui force un hard redirect vers /connexion → l'utilisateur est
 * "déconnecté" 3-5s après s'être logué.
 *
 * Fix : marquer un timestamp en sessionStorage lors d'un login /
 * register réussi. Le subscriber ignore les UNAUTHED pendant N
 * secondes après ce timestamp. Passé ce délai, si l'utilisateur
 * est réellement déconnecté, le redirect s'exécute normalement.
 *
 * SessionStorage (vs localStorage) : automatiquement purgé à la
 * fermeture de l'onglet, donc pas de résidu si l'utilisateur
 * ferme et rouvre.
 */

const GRACE_KEY = "auth:justLoggedInAt";
const GRACE_WINDOW_MS = 15_000;

export function markJustLoggedIn(): void {
  try {
    sessionStorage.setItem(GRACE_KEY, String(Date.now()));
  } catch {
    // Safari en navigation privée peut throw sur sessionStorage
  }
}

export function isJustLoggedIn(): boolean {
  try {
    const raw = sessionStorage.getItem(GRACE_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < GRACE_WINDOW_MS;
  } catch {
    return false;
  }
}

export function clearJustLoggedIn(): void {
  try {
    sessionStorage.removeItem(GRACE_KEY);
  } catch {}
}
