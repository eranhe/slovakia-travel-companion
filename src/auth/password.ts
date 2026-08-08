const APP_PASSWORD = 'hersko'

export function verifyPassword(candidate: string): boolean {
  return candidate === APP_PASSWORD
}
