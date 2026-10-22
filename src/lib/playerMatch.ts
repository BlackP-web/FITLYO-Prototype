import type { PlayerMatch } from '@/types/player'

type LegacyPlayerMatch = PlayerMatch & { deposit?: unknown }

export function getPlayerMatchFee(match: PlayerMatch): number {
  const legacyMatch = match as LegacyPlayerMatch
  const value = match.fee ?? legacyMatch.deposit
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0
}

export function formatPlayerMatchFee(match: PlayerMatch): string {
  return `${getPlayerMatchFee(match).toLocaleString('vi-VN')}đ`
}
