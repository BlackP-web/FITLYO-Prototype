export interface CourtDisableSchedule {
  startAt: string
  endAt: string
}

export const toLocalDateTimeInput = (value: Date) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  const hour = String(value.getHours()).padStart(2, '0')
  const minute = String(value.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hour}:${minute}`
}

export const currentLocalDateTimeInput = () => toLocalDateTimeInput(new Date())

export const scheduleOverlapsSlot = (schedule: CourtDisableSchedule, date: string, timeRange: string) => {
  const [startTime, endTime] = timeRange.split(' - ')
  if (!startTime || !endTime) return false
  const slotStart = `${date}T${startTime}`
  const slotEnd = `${date}T${endTime}`
  return schedule.startAt < slotEnd && schedule.endAt > slotStart
}

export const scheduleOverlapsDate = (schedule: CourtDisableSchedule, date: string) => (
  scheduleOverlapsSlot(schedule, date, '06:00 - 21:00')
)

export const scheduleIsActiveAt = (schedule: CourtDisableSchedule, dateTime: string) => (
  schedule.startAt <= dateTime && dateTime < schedule.endAt
)
