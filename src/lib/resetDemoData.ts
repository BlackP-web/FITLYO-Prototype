const preservedStorageKeys = new Set([
  'fitlyo-auth-session',
  'fitlyo-color-mode',
  'fitlyo-accessibility-v1',
])

export function resetDemoData() {
  if (typeof window === 'undefined') return

  const demoKeys = Array.from({ length: window.localStorage.length }, (_, index) => (
    window.localStorage.key(index)
  )).filter((key): key is string => (
    typeof key === 'string'
    && key.startsWith('fitlyo-')
    && !preservedStorageKeys.has(key)
  ))

  demoKeys.forEach((key) => window.localStorage.removeItem(key))
  window.sessionStorage.removeItem('fitlyo_temp_reg')
  window.location.reload()
}
