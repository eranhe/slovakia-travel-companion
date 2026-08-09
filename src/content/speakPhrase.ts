/** Speak a phrase with the Web Speech API (SK / PL when voices exist). */

export type SpeakLang = 'sk' | 'pl'

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function pickVoice(lang: SpeakLang): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  const prefix = lang === 'sk' ? 'sk' : 'pl'
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ??
    voices.find((v) => v.lang.toLowerCase().includes(prefix)) ??
    null
  )
}

export function speakPhrase(text: string, lang: SpeakLang): void {
  if (!canSpeak() || !text.trim()) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = lang === 'sk' ? 'sk-SK' : 'pl-PL'
  const voice = pickVoice(lang)
  if (voice) utter.voice = voice
  utter.rate = 0.9
  window.speechSynthesis.speak(utter)
}

/** Warm the voice list (Chrome loads voices async). */
export function warmSpeechVoices(): void {
  if (!canSpeak()) return
  window.speechSynthesis.getVoices()
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    window.speechSynthesis.getVoices()
  })
}
