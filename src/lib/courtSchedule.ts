export const COURT_OPEN_TIME = '06:00'
export const COURT_CLOSE_TIME = '21:00'
export const COURT_SLOT_DURATION_MINUTES = 90

export const COURT_SLOT_TIMES = [
  { slotNumber: 1, start: '06:00', end: '07:30' },
  { slotNumber: 2, start: '07:30', end: '09:00' },
  { slotNumber: 3, start: '09:00', end: '10:30' },
  { slotNumber: 4, start: '10:30', end: '12:00' },
  { slotNumber: 5, start: '12:00', end: '13:30' },
  { slotNumber: 6, start: '13:30', end: '15:00' },
  { slotNumber: 7, start: '15:00', end: '16:30' },
  { slotNumber: 8, start: '16:30', end: '18:00' },
  { slotNumber: 9, start: '18:00', end: '19:30' },
  { slotNumber: 10, start: '19:30', end: '21:00' },
].map((slot) => ({ ...slot, timeRange: `${slot.start} - ${slot.end}` }))

export const COURT_SLOT_NUMBERS = COURT_SLOT_TIMES.map((slot) => slot.slotNumber)
