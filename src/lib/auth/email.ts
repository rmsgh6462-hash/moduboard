/** Auth 이메일은 login_id@도메인 형태로 통일합니다. */
export const AUTH_EMAIL_DOMAIN = "moduboard.local";

export function toAuthEmail(loginIdOrEmail: string): string {
  const value = loginIdOrEmail.trim().toLowerCase();
  if (value.includes("@")) return value;
  return `${value}@${AUTH_EMAIL_DOMAIN}`;
}

export function fromAuthEmail(email: string | null | undefined): string {
  if (!email) return "";
  const normalized = email.trim().toLowerCase();
  const suffix = `@${AUTH_EMAIL_DOMAIN}`;
  if (normalized.endsWith(suffix)) {
    return normalized.slice(0, -suffix.length);
  }
  return normalized;
}

/** 학급 코드 + 번호 → 학생 login_id (예: modo52 + 1 → modo5201) */
export function buildStudentLoginId(classCode: string, studentNum: number): string {
  const code = classCode.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const num = String(studentNum).padStart(2, "0");
  return `${code}${num}`;
}
