import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  Star,
  Clock,
  Phone,
  Navigation,
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  Settings,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Wrench,
  Building2,
  Activity,
  Search,
  Check,
  Flame,
  ArrowUpRight,
  Download,
  CalendarDays,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useFitlyoStore } from '../store/useFitlyoStore'

/* ────────────────────────────────────────────
   Data Structures
   ──────────────────────────────────────────── */
export interface FieldManagerVenue {
  id: string
  name: string
  address: string
  totalCourts: number
  activeCourts: number
  todayBookings: number
  todayRevenue: number
  monthlyRevenue: number
  occupancyRate: number
  pendingMaintenance: number
  status: 'active' | 'maintenance' | 'closed'
  phone?: string
  rating?: number
  reviewCount?: number
}

export interface Court {
  id: string
  name: string
  number: number
  type: 'indoor' | 'outdoor'
  surface: string
  status: 'active' | 'maintenance' | 'closed'
}

export interface TimeSlot {
  id: string
  courtName: string
  courtNumber: number
  startTime: string
  endTime: string
  status: 'available' | 'booked' | 'maintenance' | 'blocked'
  bookedBy?: string
  players?: number
  price: number
  type?: 'regular' | 'tournament' | 'coaching' | 'private'
  contactPhone?: string
  isPeak?: boolean
}

interface MaintenanceTicket {
  id: string
  venueId: string
  venueName: string
  courtName: string
  issue: string
  priority: 'high' | 'medium' | 'low'
  reportedDate: string
  assignedTo: string
  estimatedCost: number
  status: 'pending' | 'in_progress' | 'resolved'
}

/* ────────────────────────────────────────────
   Sample Initial Data
   ──────────────────────────────────────────── */
const initialVenues: FieldManagerVenue[] = [
  {
    id: 'ven_1',
    name: 'Cụm sân D-Sports Pickleball Thủ Đức',
    address: '123 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức',
    totalCourts: 4,
    activeCourts: 4,
    todayBookings: 18,
    todayRevenue: 3420000,
    monthlyRevenue: 92500000,
    occupancyRate: 85,
    pendingMaintenance: 1,
    status: 'active',
    phone: '0908.112.233',
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: 'ven_2',
    name: 'Cụm sân Thủ Thiêm Sports Hub',
    address: 'Khu đô thị An Phú - An Khánh, TP. Thủ Đức',
    totalCourts: 6,
    activeCourts: 5,
    todayBookings: 24,
    todayRevenue: 5180000,
    monthlyRevenue: 138000000,
    occupancyRate: 78,
    pendingMaintenance: 1,
    status: 'active',
    phone: '0912.445.566',
    rating: 4.9,
    reviewCount: 89,
  },
  {
    id: 'ven_3',
    name: 'Thảo Điền Pickleball Club',
    address: '28 Thảo Điền, P. Thảo Điền, TP. Thủ Đức',
    totalCourts: 5,
    activeCourts: 5,
    todayBookings: 22,
    todayRevenue: 5500000,
    monthlyRevenue: 145000000,
    occupancyRate: 92,
    pendingMaintenance: 0,
    status: 'active',
    phone: '0938.889.900',
    rating: 4.95,
    reviewCount: 156,
  },
  {
    id: 'ven_4',
    name: 'Cụm sân Pickleball Vinhomes Grand Park',
    address: 'Phân khu The Rainbow, P. Long Thạnh Mỹ, TP. Thủ Đức',
    totalCourts: 6,
    activeCourts: 5,
    todayBookings: 19,
    todayRevenue: 3230000,
    monthlyRevenue: 86400000,
    occupancyRate: 72,
    pendingMaintenance: 2,
    status: 'maintenance',
    phone: '0903.889.911',
    rating: 4.7,
    reviewCount: 64,
  },
]

const initialCourts: Court[] = [
  {
    id: 'court_1',
    name: 'Sân 1 (Trong nhà Pro)',
    number: 1,
    type: 'indoor',
    surface: 'Cushion Acrylic 8 lớp',
    status: 'active',
  },
  {
    id: 'court_2',
    name: 'Sân 2 (Trong nhà Pro)',
    number: 2,
    type: 'indoor',
    surface: 'Cushion Acrylic 8 lớp',
    status: 'active',
  },
  {
    id: 'court_3',
    name: 'Sân 3 (Mái che thi đấu)',
    number: 3,
    type: 'outdoor',
    surface: 'Asphalt Hard Court',
    status: 'active',
  },
  {
    id: 'court_4',
    name: 'Sân 4 (Ngoài trời VIP)',
    number: 4,
    type: 'outdoor',
    surface: 'Polyurethane Giảm chấn',
    status: 'maintenance',
  },
]

const standardSlotsConfig = [
  { slotNumber: 1, startTime: '06:00', endTime: '07:30', isPeak: false },
  { slotNumber: 2, startTime: '07:30', endTime: '09:00', isPeak: false },
  { slotNumber: 3, startTime: '15:30', endTime: '17:00', isPeak: false },
  { slotNumber: 4, startTime: '17:00', endTime: '18:30', isPeak: false },
  { slotNumber: 5, startTime: '18:30', endTime: '20:00', isPeak: true },
  { slotNumber: 6, startTime: '20:00', endTime: '21:30', isPeak: false },
]

const initialTimeSlots: TimeSlot[] = [
  // Court 1
  { id: 'ts_1_1', courtName: 'Sân 1 (Trong nhà Pro)', courtNumber: 1, startTime: '06:00', endTime: '07:30', status: 'available', price: 150000 },
  { id: 'ts_1_2', courtName: 'Sân 1 (Trong nhà Pro)', courtNumber: 1, startTime: '07:30', endTime: '09:00', status: 'booked', type: 'coaching', bookedBy: 'HLV Tuấn Kiệt (Lớp Cơ bản)', players: 4, price: 180000, contactPhone: '0908.112.233' },
  { id: 'ts_1_3', courtName: 'Sân 1 (Trong nhà Pro)', courtNumber: 1, startTime: '15:30', endTime: '17:00', status: 'booked', type: 'regular', bookedBy: 'Kèo Social DUPR 2.0-2.5', players: 4, price: 180000, contactPhone: '0912.334.455' },
  { id: 'ts_1_4', courtName: 'Sân 1 (Trong nhà Pro)', courtNumber: 1, startTime: '17:00', endTime: '18:30', status: 'booked', type: 'private', bookedBy: 'Anh Thành (Bao trọn sân)', players: 4, price: 200000, contactPhone: '0918.334.455' },
  { id: 'ts_1_5', courtName: 'Sân 1 (Trong nhà Pro)', courtNumber: 1, startTime: '18:30', endTime: '20:00', status: 'booked', type: 'regular', bookedBy: 'Kèo Đôi Nam Nữ Hot (DUPR 3.5)', players: 4, price: 220000, isPeak: true, contactPhone: '0909.556.677' },
  { id: 'ts_1_6', courtName: 'Sân 1 (Trong nhà Pro)', courtNumber: 1, startTime: '20:00', endTime: '21:30', status: 'available', price: 160000 },

  // Court 2
  { id: 'ts_2_1', courtName: 'Sân 2 (Trong nhà Pro)', courtNumber: 2, startTime: '06:00', endTime: '07:30', status: 'available', price: 150000 },
  { id: 'ts_2_2', courtName: 'Sân 2 (Trong nhà Pro)', courtNumber: 2, startTime: '07:30', endTime: '09:00', status: 'available', price: 180000 },
  { id: 'ts_2_3', courtName: 'Sân 2 (Trong nhà Pro)', courtNumber: 2, startTime: '15:30', endTime: '17:00', status: 'available', price: 180000 },
  { id: 'ts_2_4', courtName: 'Sân 2 (Trong nhà Pro)', courtNumber: 2, startTime: '17:00', endTime: '18:30', status: 'booked', type: 'regular', bookedBy: 'Kèo Phong Trào DUPR 3.0-3.5', players: 4, price: 200000, contactPhone: '0988.776.655' },
  { id: 'ts_2_5', courtName: 'Sân 2 (Trong nhà Pro)', courtNumber: 2, startTime: '18:30', endTime: '20:00', status: 'booked', type: 'regular', bookedBy: 'Kèo Giờ Vàng Giao Lưu', players: 4, price: 220000, isPeak: true, contactPhone: '0903.112.998' },
  { id: 'ts_2_6', courtName: 'Sân 2 (Trong nhà Pro)', courtNumber: 2, startTime: '20:00', endTime: '21:30', status: 'booked', type: 'tournament', bookedBy: 'Mini Cup Giao Hữu CLB', players: 4, price: 200000, contactPhone: '0977.223.344' },

  // Court 3
  { id: 'ts_3_1', courtName: 'Sân 3 (Mái che thi đấu)', courtNumber: 3, startTime: '06:00', endTime: '07:30', status: 'booked', type: 'regular', bookedBy: 'CLB Pickleball Thủ Đức', players: 4, price: 150000, contactPhone: '0911.223.344' },
  { id: 'ts_3_2', courtName: 'Sân 3 (Mái che thi đấu)', courtNumber: 3, startTime: '07:30', endTime: '09:00', status: 'booked', type: 'regular', bookedBy: 'Trần Văn Long', players: 2, price: 180000, contactPhone: '0933.445.566' },
  { id: 'ts_3_3', courtName: 'Sân 3 (Mái che thi đấu)', courtNumber: 3, startTime: '15:30', endTime: '17:00', status: 'booked', type: 'tournament', bookedBy: 'Tập huấn VĐV Trẻ TP.HCM', players: 4, price: 220000, contactPhone: '0901.887.766' },
  { id: 'ts_3_4', courtName: 'Sân 3 (Mái che thi đấu)', courtNumber: 3, startTime: '17:00', endTime: '18:30', status: 'booked', type: 'coaching', bookedBy: 'HLV Hoàng Long (PT 1:1)', players: 2, price: 250000, contactPhone: '0918.776.554' },
  { id: 'ts_3_5', courtName: 'Sân 3 (Mái che thi đấu)', courtNumber: 3, startTime: '18:30', endTime: '20:00', status: 'booked', type: 'private', bookedBy: 'Chị Lan - Doanh nhân Group', players: 6, price: 240000, isPeak: true, contactPhone: '0933.778.899' },
  { id: 'ts_3_6', courtName: 'Sân 3 (Mái che thi đấu)', courtNumber: 3, startTime: '20:00', endTime: '21:30', status: 'available', price: 160000 },

  // Court 4
  { id: 'ts_4_1', courtName: 'Sân 4 (Ngoài trời VIP)', courtNumber: 4, startTime: '06:00', endTime: '07:30', status: 'maintenance', price: 0 },
  { id: 'ts_4_2', courtName: 'Sân 4 (Ngoài trời VIP)', courtNumber: 4, startTime: '07:30', endTime: '09:00', status: 'maintenance', price: 0 },
  { id: 'ts_4_3', courtName: 'Sân 4 (Ngoài trời VIP)', courtNumber: 4, startTime: '15:30', endTime: '17:00', status: 'maintenance', price: 0 },
  { id: 'ts_4_4', courtName: 'Sân 4 (Ngoài trời VIP)', courtNumber: 4, startTime: '17:00', endTime: '18:30', status: 'maintenance', price: 0 },
  { id: 'ts_4_5', courtName: 'Sân 4 (Ngoài trời VIP)', courtNumber: 4, startTime: '18:30', endTime: '20:00', status: 'maintenance', price: 0, isPeak: true },
  { id: 'ts_4_6', courtName: 'Sân 4 (Ngoài trời VIP)', courtNumber: 4, startTime: '20:00', endTime: '21:30', status: 'maintenance', price: 0 },
]

const initialMaintenanceTickets: MaintenanceTicket[] = [
  {
    id: 'mt_1',
    venueId: 'ven_1',
    venueName: 'Cụm sân D-Sports Pickleball Thủ Đức',
    courtName: 'Sân 4 (Ngoài trời VIP)',
    issue: 'Thay mới lưới thi đấu USAPA và cân chỉnh trụ căng cáp',
    priority: 'high',
    reportedDate: '13/10/2026',
    assignedTo: 'Kỹ thuật viên Nguyễn Hoàng',
    estimatedCost: 1850000,
    status: 'in_progress',
  },
  {
    id: 'mt_2',
    venueId: 'ven_2',
    venueName: 'Cụm sân Thủ Thiêm Sports Hub',
    courtName: 'Sân 2 (Ngoài trời)',
    issue: 'Thay cụm 2 bóng đèn LED 400W bị chập chờn chiếu sáng góc',
    priority: 'high',
    reportedDate: '12/10/2026',
    assignedTo: 'Đội Điện Chiếu Sáng Thành Đạt',
    estimatedCost: 2400000,
    status: 'pending',
  },
  {
    id: 'mt_3',
    venueId: 'ven_4',
    venueName: 'Cụm sân Vinhomes Grand Park',
    courtName: 'Sân 5 (Ngoài trời)',
    issue: 'Trám xử lý vết rạn bề mặt Cushion Polyurethane sau mưa lớn',
    priority: 'medium',
    reportedDate: '11/10/2026',
    assignedTo: 'Công ty Thi Công Sân Thể Thao Pro',
    estimatedCost: 3500000,
    status: 'pending',
  },
  {
    id: 'mt_4',
    venueId: 'ven_4',
    venueName: 'Cụm sân Vinhomes Grand Park',
    courtName: 'Sân 6 (Ngoài trời)',
    issue: 'Vệ sinh rãnh thoát nước mưa và xịt khử rêu mốc viền sân',
    priority: 'low',
    reportedDate: '10/10/2026',
    assignedTo: 'Tổ Vệ Sinh Cụm Sân',
    estimatedCost: 600000,
    status: 'resolved',
  },
]

type ActiveTab = 'overview' | 'courts' | 'bookings' | 'revenue' | 'maintenance'

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

const formatShortVND = (amount: number) => {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} Tỷ`
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`
  return amount.toString()
}

export const FieldManagerPage: React.FC = () => {
  const navigate = useNavigate()
  const { showToast, selectedDate } = useFitlyoStore()

  // State
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [venues, setVenues] = useState<FieldManagerVenue[]>(initialVenues)
  const [courts, setCourts] = useState<Court[]>(initialCourts)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(initialTimeSlots)
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(initialMaintenanceTickets)

  // Modals state
  const [selectedSlotForAction, setSelectedSlotForAction] = useState<TimeSlot | null>(null)
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false)
  const [isAddVenueOpen, setIsAddVenueOpen] = useState(false)
  const [isAddCourtOpen, setIsAddCourtOpen] = useState(false)
  const [isEditCourtOpen, setIsEditCourtOpen] = useState<Court | null>(null)
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false)
  const [isVenueSettingsOpen, setIsVenueSettingsOpen] = useState<FieldManagerVenue | null>(null)
  const [isAddTicketOpen, setIsAddTicketOpen] = useState(false)

  // Booking Form State
  const [newBookingData, setNewBookingData] = useState({
    courtNumber: 1,
    timeRange: '18:30 - 20:00',
    type: 'private' as const,
    customerName: '',
    phone: '',
    players: 4,
    price: 200000,
  })

  // Venue Form State
  const [newVenueData, setNewVenueData] = useState({
    name: '',
    address: '',
    phone: '',
    totalCourts: 4,
  })

  // Maintenance Form State
  const [newTicketData, setNewTicketData] = useState({
    venueId: 'ven_1',
    courtName: 'Sân 1 (Trong nhà Pro)',
    issue: '',
    priority: 'medium' as const,
    assignedTo: 'Đội bảo trì nội bộ',
    estimatedCost: 500000,
  })

  // Filter states
  const [bookingFilterCourt, setBookingFilterCourt] = useState<string>('all')
  const [bookingFilterType, setBookingFilterType] = useState<string>('all')
  const [bookingSearch, setBookingSearch] = useState('')

  // Aggregated Stats
  const totalVenuesCount = venues.length
  const activeVenuesCount = venues.filter((v) => v.status === 'active').length
  const totalTodayBookings = venues.reduce((acc, v) => acc + v.todayBookings, 0)
  const totalTodayRevenue = venues.reduce((acc, v) => acc + v.todayRevenue, 0)
  const totalMonthlyRevenue = venues.reduce((acc, v) => acc + v.monthlyRevenue, 0)
  const avgOccupancy = Math.round(
    venues.reduce((acc, v) => acc + v.occupancyRate, 0) / (venues.length || 1)
  )
  const pendingMaintenanceCount = maintenanceTickets.filter((t) => t.status !== 'resolved').length

  // Handlers
  const handleDeleteVenue = (venueId: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa cụm sân "${name}" khỏi danh mục quản lý?`)) {
      setVenues((prev) => prev.filter((v) => v.id !== venueId))
      showToast(`Đã xóa cụm sân ${name}`, 'info')
    }
  }

  const handleToggleCourtStatus = (courtId: string) => {
    setCourts((prev) =>
      prev.map((c) => {
        if (c.id === courtId) {
          const nextStatus: Court['status'] =
            c.status === 'active'
              ? 'maintenance'
              : c.status === 'maintenance'
              ? 'closed'
              : 'active'
          showToast(`Đã cập nhật trạng thái ${c.name} sang: ${nextStatus.toUpperCase()}`, 'info')
          return { ...c, status: nextStatus }
        }
        return c
      })
    )
  }

  const handleAddBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBookingData.customerName) {
      showToast('Vui lòng nhập tên khách hàng', 'error')
      return
    }

    const courtObj = courts.find((c) => c.number === Number(newBookingData.courtNumber))
    const courtName = courtObj ? courtObj.name : `Sân ${newBookingData.courtNumber}`

    const newSlot: TimeSlot = {
      id: `ts_custom_${Date.now()}`,
      courtName,
      courtNumber: Number(newBookingData.courtNumber),
      startTime: newBookingData.timeRange.split(' - ')[0],
      endTime: newBookingData.timeRange.split(' - ')[1],
      status: 'booked',
      type: newBookingData.type,
      bookedBy: newBookingData.customerName,
      contactPhone: newBookingData.phone || '0908.000.111',
      players: Number(newBookingData.players),
      price: Number(newBookingData.price),
    }

    // Update in timeSlots
    setTimeSlots((prev) => {
      // Find matching slot if exists or prepend
      const idx = prev.findIndex(
        (s) =>
          s.courtNumber === Number(newBookingData.courtNumber) &&
          s.startTime === newSlot.startTime
      )
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = newSlot
        return copy
      }
      return [newSlot, ...prev]
    })

    // Increase today's bookings
    setVenues((prev) =>
      prev.map((v) =>
        v.id === 'ven_1'
          ? {
              ...v,
              todayBookings: v.todayBookings + 1,
              todayRevenue: v.todayRevenue + Number(newBookingData.price),
            }
          : v
      )
    )

    showToast('Tạo đặt sân thành công!', 'success')
    setIsAddBookingOpen(false)
    setNewBookingData({
      courtNumber: 1,
      timeRange: '18:30 - 20:00',
      type: 'private',
      customerName: '',
      phone: '',
      players: 4,
      price: 200000,
    })
  }

  const handleSlotStatusChange = (
    newStatus: TimeSlot['status'],
    newType?: TimeSlot['type'],
    note?: string
  ) => {
    if (!selectedSlotForAction) return

    setTimeSlots((prev) =>
      prev.map((s) => {
        if (s.id === selectedSlotForAction.id) {
          return {
            ...s,
            status: newStatus,
            type: newType || s.type,
            bookedBy: note || (newStatus === 'available' ? undefined : s.bookedBy),
          }
        }
        return s
      })
    )

    showToast('Đã cập nhật trạng thái slot thành công!', 'success')
    setSelectedSlotForAction(null)
  }

  const handleAddVenueSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVenueData.name || !newVenueData.address) {
      showToast('Vui lòng điền đủ tên và địa chỉ cụm sân', 'error')
      return
    }

    const newVenue: FieldManagerVenue = {
      id: `ven_${Date.now()}`,
      name: newVenueData.name,
      address: newVenueData.address,
      phone: newVenueData.phone || '0909.123.456',
      totalCourts: Number(newVenueData.totalCourts) || 4,
      activeCourts: Number(newVenueData.totalCourts) || 4,
      todayBookings: 0,
      todayRevenue: 0,
      monthlyRevenue: 0,
      occupancyRate: 0,
      pendingMaintenance: 0,
      status: 'active',
      rating: 5.0,
      reviewCount: 0,
    }

    setVenues((prev) => [newVenue, ...prev])
    showToast(`Đã thêm cụm sân "${newVenue.name}"!`, 'success')
    setIsAddVenueOpen(false)
    setNewVenueData({ name: '', address: '', phone: '', totalCourts: 4 })
  }

  const handleAddTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTicketData.issue) {
      showToast('Vui lòng nhập nội dung sự cố bảo trì', 'error')
      return
    }

    const targetVenue = venues.find((v) => v.id === newTicketData.venueId)
    const newTicket: MaintenanceTicket = {
      id: `mt_${Date.now()}`,
      venueId: newTicketData.venueId,
      venueName: targetVenue ? targetVenue.name : 'Cụm sân FITLYO',
      courtName: newTicketData.courtName,
      issue: newTicketData.issue,
      priority: newTicketData.priority,
      reportedDate: selectedDate,
      assignedTo: newTicketData.assignedTo,
      estimatedCost: Number(newTicketData.estimatedCost) || 0,
      status: 'pending',
    }

    setMaintenanceTickets((prev) => [newTicket, ...prev])
    showToast('Đã tạo phiếu bảo trì mới!', 'success')
    setIsAddTicketOpen(false)
    setNewTicketData({
      venueId: 'ven_1',
      courtName: 'Sân 1 (Trong nhà Pro)',
      issue: '',
      priority: 'medium',
      assignedTo: 'Đội bảo trì nội bộ',
      estimatedCost: 500000,
    })
  }

  // Filtered Bookings for Table
  const filteredBookings = timeSlots.filter((slot) => {
    if (slot.status === 'available') return false
    if (bookingFilterCourt !== 'all' && slot.courtNumber.toString() !== bookingFilterCourt)
      return false
    if (bookingFilterType !== 'all' && slot.type !== bookingFilterType) return false
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase()
      const matchName = slot.bookedBy?.toLowerCase().includes(q)
      const matchCourt = slot.courtName.toLowerCase().includes(q)
      const matchPhone = slot.contactPhone?.includes(q)
      if (!matchName && !matchCourt && !matchPhone) return false
    }
    return true
  })

  return (
    <div className="space-y-6 pb-20">
      {/* ────────────────────────────────────────────
          Page Header
          ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="text-xs" withDot pulseDot>
              SCR_FM_DASH
            </Badge>
            <span className="text-xs font-semibold text-muted-foreground">
              FITLYO Field Manager OS • Quản lý Cụm Sân Chuyên Nghiệp
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Bảng Điều Khiển Quản Lý Sân</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Giám sát vận hành thời gian thực, doanh thu, đặt chỗ và tình trạng bảo trì.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-card border rounded-xl p-1 shadow-xs">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => showToast('Chuyển sang ngày trước', 'info')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1.5 px-3 text-xs sm:text-sm font-bold text-foreground">
              <CalendarDays className="w-4 h-4 text-emerald-600" />
              <span>{selectedDate}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => showToast('Chuyển sang ngày tiếp theo', 'info')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Button
            size="sm"
            onClick={() => setIsAddBookingOpen(true)}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Đặt Sân Nhanh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddVenueOpen(true)}
            className="gap-1.5"
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Thêm Cụm Sân</span>
          </Button>
        </div>
      </div>

      {/* ────────────────────────────────────────────
          Section A: Stats Overview Cards (Top Row)
          ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Venues */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs hover:border-emerald-500/40 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Tổng Cụm Sân
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-foreground">
              {totalVenuesCount}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              ({activeVenuesCount} Đang mở)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            <span>100% đối tác xác thực</span>
          </div>
        </div>

        {/* Today's Bookings */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs hover:border-emerald-500/40 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Lượt Đặt Hôm Nay
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-foreground">
              {totalTodayBookings}
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +16.4%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            So với TB 7 ngày ({Math.round(totalTodayBookings * 0.86)} lượt)
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs hover:border-emerald-500/40 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Doanh Thu Hôm Nay
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-foreground">
              {formatShortVND(totalTodayRevenue)}
            </span>
            <span className="text-xs text-muted-foreground">VND</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>Tháng này: {formatShortVND(totalMonthlyRevenue)}</span>
          </div>
        </div>

        {/* Average Occupancy Rate */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs hover:border-emerald-500/40 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Công Suất Lấp Đầy
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-foreground">
              {avgOccupancy}%
            </span>
            <span className="text-xs font-semibold text-emerald-600">Rất Tốt</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                avgOccupancy > 75
                  ? 'bg-emerald-500'
                  : avgOccupancy > 50
                  ? 'bg-amber-500'
                  : 'bg-orange-500'
              }`}
              style={{ width: `${avgOccupancy}%` }}
            />
          </div>
        </div>

        {/* Pending Maintenance Alerts */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs hover:border-emerald-500/40 hover:shadow-sm transition-all col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Yêu Cầu Bảo Trì
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                pendingMaintenanceCount > 0
                  ? 'bg-orange-500/15 text-orange-600'
                  : 'bg-emerald-500/10 text-emerald-600'
              }`}
            >
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-foreground">
              {pendingMaintenanceCount}
            </span>
            <span
              className={`text-xs font-semibold ${
                pendingMaintenanceCount > 0 ? 'text-orange-600' : 'text-emerald-600'
              }`}
            >
              {pendingMaintenanceCount > 0 ? 'Cần Xử Lý' : 'Hoàn Hảo'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
            {pendingMaintenanceCount > 0 ? (
              <span className="text-orange-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> 1 sự cố khẩn cấp
              </span>
            ) : (
              <span className="text-emerald-600 flex items-center gap-1">
                <Check className="w-3 h-3" /> Tất cả sân sẵn sàng
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────
          Section B: Tabbed Content Area (5 Tabs)
          ──────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border/60 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-card text-foreground shadow-sm border border-border/70 font-bold'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-600" />
          <span>Tổng Quan (Overview)</span>
        </button>

        <button
          onClick={() => setActiveTab('courts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'courts'
              ? 'bg-card text-foreground shadow-sm border border-border/70 font-bold'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Lịch Sân & Ma Trận (Courts)</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'bg-card text-foreground shadow-sm border border-border/70 font-bold'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-600" />
          <span>Lượt Đặt Chỗ (Bookings)</span>
          <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {filteredBookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('revenue')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'revenue'
              ? 'bg-card text-foreground shadow-sm border border-border/70 font-bold'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Doanh Thu (Revenue)</span>
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'maintenance'
              ? 'bg-card text-foreground shadow-sm border border-border/70 font-bold'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
          }`}
        >
          <Wrench className="w-4 h-4 text-emerald-600" />
          <span>Hàng Đợi Bảo Trì (Maintenance)</span>
          {pendingMaintenanceCount > 0 && (
            <span className="bg-orange-500/20 text-orange-700 dark:text-orange-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {pendingMaintenanceCount}
            </span>
          )}
        </button>
      </div>

      {/* ────────────────────────────────────────────
          TAB 1: OVERVIEW
          ──────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span>Danh Sách Cụm Sân Quản Lý</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Quản lý trạng thái, công suất khai thác và doanh thu từng địa điểm
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => setIsAddVenueOpen(true)}
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Cụm Sân</span>
            </Button>
          </div>

          {/* Venue Management Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {venues.map((venue) => (
              <div
                key={venue.id}
                className="group rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-extrabold text-base sm:text-lg text-foreground group-hover:text-emerald-600 transition-colors truncate">
                          {venue.name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                            venue.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                              : venue.status === 'maintenance'
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                              : 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30'
                          }`}
                        >
                          {venue.status === 'active'
                            ? 'Hoạt động'
                            : venue.status === 'maintenance'
                            ? 'Bảo trì'
                            : 'Tạm đóng'}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{venue.address}</span>
                      </p>

                      {venue.phone && (
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1">
                          <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span>{venue.phone}</span>
                          {venue.rating && (
                            <>
                              <span className="text-muted-foreground/50">•</span>
                              <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                                <Star className="w-3 h-3 fill-current" /> {venue.rating} ({venue.reviewCount})
                              </span>
                            </>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Edit, Analytics, Delete action icons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        title="Chỉnh sửa thông tin"
                        onClick={() => {
                          showToast(`Mở hộp thoại sửa cụm sân: ${venue.name}`, 'info')
                        }}
                        className="p-1.5 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        title="Báo cáo phân tích"
                        onClick={() => {
                          setActiveTab('revenue')
                          showToast(`Xem báo cáo tài chính của: ${venue.name}`, 'info')
                        }}
                        className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button
                        title="Xóa cụm sân"
                        onClick={() => handleDeleteVenue(venue.id, venue.name)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metrics 4-Col Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3.5 pt-3 border-t border-border/50">
                    <div className="bg-muted/40 rounded-xl p-2.5">
                      <span className="text-[10px] text-muted-foreground font-semibold block uppercase">
                        Sân con
                      </span>
                      <span className="text-base font-extrabold text-foreground">
                        {venue.activeCourts}/{venue.totalCourts}
                      </span>
                      <span className="text-[10px] text-emerald-600 block font-medium">Đang mở</span>
                    </div>

                    <div className="bg-muted/40 rounded-xl p-2.5">
                      <span className="text-[10px] text-muted-foreground font-semibold block uppercase">
                        Hôm nay
                      </span>
                      <span className="text-base font-extrabold text-foreground">
                        {venue.todayBookings}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">Lượt booking</span>
                    </div>

                    <div className="bg-muted/40 rounded-xl p-2.5">
                      <span className="text-[10px] text-muted-foreground font-semibold block uppercase">
                        Doanh thu
                      </span>
                      <span className="text-base font-extrabold text-foreground">
                        {formatShortVND(venue.todayRevenue)}
                      </span>
                      <span className="text-[10px] text-emerald-600 block font-medium">VND hôm nay</span>
                    </div>

                    <div className="bg-muted/40 rounded-xl p-2.5">
                      <span className="text-[10px] text-muted-foreground font-semibold block uppercase">
                        Bảo trì
                      </span>
                      <span className="text-base font-extrabold text-foreground">
                        {venue.pendingMaintenance}
                      </span>
                      <span
                        className={`text-[10px] block font-medium ${
                          venue.pendingMaintenance > 0 ? 'text-orange-600' : 'text-emerald-600'
                        }`}
                      >
                        {venue.pendingMaintenance > 0 ? 'Cần xử lý' : 'Đạt chuẩn'}
                      </span>
                    </div>
                  </div>

                  {/* Occupancy Rate with Progress Bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        Tỷ lệ lấp đầy hôm nay:
                      </span>
                      <span className="font-extrabold text-foreground">{venue.occupancyRate}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          venue.occupancyRate > 75
                            ? 'bg-emerald-500'
                            : venue.occupancyRate > 50
                            ? 'bg-amber-500'
                            : 'bg-orange-500'
                        }`}
                        style={{ width: `${venue.occupancyRate}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="pt-3 border-t border-border/50 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveTab('courts')
                      showToast(`Đã chuyển sang ma trận lịch cụm: ${venue.name}`, 'info')
                    }}
                    className="gap-1 text-xs border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Xem Lịch</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsStaffModalOpen(true)}
                    className="gap-1 text-xs"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Nhân Viên</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveTab('maintenance')
                      showToast(`Xem hàng đợi bảo trì: ${venue.name}`, 'info')
                    }}
                    className="gap-1 text-xs"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Bảo Trì</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsVenueSettingsOpen(venue)}
                    className="gap-1 text-xs"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Cài Đặt</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Operations Strip */}
          <div className="rounded-2xl border border-border/70 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">
                  Điều Phối Lịch Chuyên Nghiệp Theo Chuẩn 6 Slot
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mỗi khung giờ 90 phút tối ưu doanh thu sân và luồng khách thi đấu DUPR.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/fm/calendar')}
                className="gap-1.5 text-xs"
              >
                <CalendarDays className="w-3.5 h-3.5 text-primary" />
                <span>Xem Ma Trận Fullscreen</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────
          TAB 2: COURTS (Grid Calendar + Management)
          ──────────────────────────────────────────── */}
      {activeTab === 'courts' && (
        <div className="space-y-6">
          {/* Section Subheader */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span>Ma Trận Lịch Sân & Điều Hành Khung Giờ</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Cụm sân D-Sports Pickleball Thủ Đức • Khung giờ tiêu chuẩn 90 phút/slot
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setIsAddBookingOpen(true)}
                className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Đặt Chỗ</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddCourtOpen(true)}
                className="gap-1.5 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Sân Con</span>
              </Button>
            </div>
          </div>

          {/* Color-coded Legend Bar */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 text-xs bg-card p-3.5 rounded-2xl border border-border/70 scrollbar-none shadow-xs">
            <span className="font-bold text-foreground uppercase tracking-wider text-[11px] shrink-0 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-600" /> Chú giải:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-md bg-emerald-500 shadow-xs" />
              <span className="font-medium text-foreground">Trống (Available)</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-md bg-blue-500 shadow-xs" />
              <span className="font-medium text-foreground">Kèo Social DUPR (Regular)</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-md bg-amber-500 shadow-xs" />
              <span className="font-medium text-foreground">Giải đấu (Tournament)</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-md bg-purple-500 shadow-xs" />
              <span className="font-medium text-foreground">Giờ dạy Coach (Coaching)</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-md bg-teal-500 shadow-xs" />
              <span className="font-medium text-foreground">Khách bao sân (Private)</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-md bg-slate-500 shadow-xs" />
              <span className="font-medium text-foreground">Bảo trì (Maintenance)</span>
            </div>
          </div>

          {/* Real-time 6-Slot Grid Table */}
          <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-xs">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b bg-muted/60 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="p-3.5 sm:p-4 min-w-[140px] sm:min-w-[170px] border-r">
                    KHUNG GIỜ (SLOT)
                  </th>
                  {courts.map((court) => (
                    <th
                      key={court.id}
                      className="p-3.5 sm:p-4 min-w-[190px] sm:min-w-[230px] border-r last:border-r-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                            <span>{court.name}</span>
                            <span
                              className={`w-2 h-2 rounded-full ${
                                court.status === 'active'
                                  ? 'bg-emerald-500'
                                  : court.status === 'maintenance'
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                              }`}
                            />
                          </div>
                          <div className="text-[11px] font-normal text-muted-foreground mt-0.5">
                            {court.surface} • {court.type === 'indoor' ? 'Trong nhà' : 'Ngoài trời'}
                          </div>
                        </div>

                        <button
                          onClick={() => setIsEditCourtOpen(court)}
                          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-emerald-600"
                          title="Sửa thông tin sân"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {standardSlotsConfig.map((slotCfg) => (
                  <tr key={slotCfg.slotNumber} className="hover:bg-muted/10 transition-colors">
                    {/* Time Slot Column Header */}
                    <td className="p-3.5 sm:p-4 border-r bg-muted/20 font-semibold align-top">
                      <div className="flex items-center gap-1.5 text-foreground font-bold text-sm">
                        <span>Slot {slotCfg.slotNumber}</span>
                        {slotCfg.isPeak && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/15 text-orange-600 dark:text-orange-400">
                            <Flame className="w-3 h-3 animate-pulse" /> Giờ Vàng
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{slotCfg.startTime} - {slotCfg.endTime}</span>
                      </div>
                    </td>

                    {/* Court Slots */}
                    {courts.map((court) => {
                      const slotData = timeSlots.find(
                        (s) =>
                          s.courtNumber === court.number &&
                          s.startTime === slotCfg.startTime
                      ) || {
                        id: `ts_${court.number}_${slotCfg.slotNumber}`,
                        courtName: court.name,
                        courtNumber: court.number,
                        startTime: slotCfg.startTime,
                        endTime: slotCfg.endTime,
                        status: 'available' as const,
                        price: 180000,
                      }

                      const isAvailable = slotData.status === 'available'
                      const isBooked = slotData.status === 'booked'
                      const isMaintenance = slotData.status === 'maintenance'
                      const bookingType = slotData.type || 'regular'

                      let colorClasses = 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500 hover:bg-emerald-500/10'
                      let badgeColor = 'bg-emerald-500 text-white'
                      let label = 'TRỐNG'

                      if (isMaintenance || court.status === 'maintenance') {
                        colorClasses = 'border-slate-500/30 bg-slate-500/10 opacity-70'
                        badgeColor = 'bg-slate-500 text-white'
                        label = 'BẢO TRÌ'
                      } else if (isBooked) {
                        if (bookingType === 'tournament') {
                          colorClasses = 'border-amber-500/40 bg-amber-500/10 hover:border-amber-500'
                          badgeColor = 'bg-amber-500 text-white'
                          label = 'GIẢI ĐẤU'
                        } else if (bookingType === 'coaching') {
                          colorClasses = 'border-purple-500/40 bg-purple-500/10 hover:border-purple-500'
                          badgeColor = 'bg-purple-500 text-white'
                          label = 'LỚP COACH'
                        } else if (bookingType === 'private') {
                          colorClasses = 'border-teal-500/40 bg-teal-500/10 hover:border-teal-500'
                          badgeColor = 'bg-teal-500 text-white'
                          label = 'BAO RIÊNG'
                        } else {
                          colorClasses = 'border-blue-500/40 bg-blue-500/10 hover:border-blue-500'
                          badgeColor = 'bg-blue-500 text-white'
                          label = 'KÈO SOCIAL'
                        }
                      }

                      return (
                        <td
                          key={court.id}
                          className="p-2.5 sm:p-3 border-r last:border-r-0 align-top"
                        >
                          <div
                            onClick={() => setSelectedSlotForAction(slotData)}
                            className={`group relative flex flex-col justify-between rounded-xl p-3 border transition-all duration-200 cursor-pointer text-xs min-h-[96px] shadow-xs ${colorClasses}`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${badgeColor}`}>
                                  {label}
                                </span>
                                {slotData.price > 0 && (
                                  <span className="font-bold text-foreground text-[11px]">
                                    {formatVND(slotData.price)}
                                  </span>
                                )}
                              </div>

                              {isAvailable ? (
                                <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-1 mt-1 group-hover:underline">
                                  <Plus className="w-3 h-3" />
                                  <span>Bấm để mở đặt chỗ</span>
                                </p>
                              ) : isBooked ? (
                                <div className="space-y-0.5 mt-1">
                                  <p className="font-bold text-foreground text-xs truncate">
                                    {slotData.bookedBy}
                                  </p>
                                  {slotData.contactPhone && (
                                    <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                                      <Phone className="w-2.5 h-2.5" />
                                      {slotData.contactPhone}
                                    </p>
                                  )}
                                  {slotData.players && (
                                    <span className="inline-block text-[10px] font-semibold text-muted-foreground">
                                      {slotData.players} VĐV
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <p className="text-[11px] text-muted-foreground mt-1">
                                  Đang bảo trì / vệ sinh
                                </p>
                              )}
                            </div>

                            <span className="text-[10px] text-muted-foreground/70 self-end mt-1 flex items-center gap-0.5">
                              <Eye className="w-2.5 h-2.5" /> Thao tác
                            </span>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Court Management List & Status Toggle */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-emerald-600" />
                  <span>Quản Lý Danh Sách Sân Con & Trạng Thái Hoạt Động</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Thay đổi trạng thái để tạm dừng booking hoặc chuyển sang bảo dưỡng tức thời.
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddCourtOpen(true)}
                className="gap-1.5 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Sân Mới</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {courts.map((court) => (
                <div
                  key={court.id}
                  className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{court.name}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {court.type === 'indoor' ? 'Trong nhà' : 'Ngoài trời'} • Sân #{court.number}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        court.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : court.status === 'maintenance'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                          : 'bg-red-500/15 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {court.status === 'active'
                        ? 'Hoạt động'
                        : court.status === 'maintenance'
                        ? 'Bảo trì'
                        : 'Đóng'}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    Mặt sân: <b className="text-foreground">{court.surface}</b>
                  </p>

                  <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleCourtStatus(court.id)}
                      className="flex-1 text-[11px] h-7 gap-1"
                    >
                      <Activity className="w-3 h-3 text-emerald-600" />
                      <span>Đổi Trạng Thái</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditCourtOpen(court)}
                      className="h-7 w-7 p-0"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────
          TAB 3: BOOKINGS (Table + Filter + Add)
          ──────────────────────────────────────────── */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Quản Lý Lượt Đặt Sân Trong Ngày</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Tổng cộng {filteredBookings.length} lượt booking đang hoạt động • {selectedDate}
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => setIsAddBookingOpen(true)}
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo Đặt Chỗ Mới</span>
            </Button>
          </div>

          {/* Filter Bar */}
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm khách hàng, số điện thoại, tên kèo..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-xs focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Court filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground text-[11px] font-semibold">Sân:</span>
                <select
                  value={bookingFilterCourt}
                  onChange={(e) => setBookingFilterCourt(e.target.value)}
                  className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs focus:outline-none"
                >
                  <option value="all">Tất cả sân (1 - 4)</option>
                  {courts.map((c) => (
                    <option key={c.number} value={c.number.toString()}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground text-[11px] font-semibold">Loại:</span>
                <select
                  value={bookingFilterType}
                  onChange={(e) => setBookingFilterType(e.target.value)}
                  className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs focus:outline-none"
                >
                  <option value="all">Tất cả loại đặt</option>
                  <option value="regular">Kèo Social DUPR (Regular)</option>
                  <option value="tournament">Giải đấu (Tournament)</option>
                  <option value="coaching">Lớp Coach (Coaching)</option>
                  <option value="private">Bao sân riêng (Private)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="p-3.5">ID / Sân</th>
                    <th className="p-3.5">Khung Giờ</th>
                    <th className="p-3.5">Phân Loại</th>
                    <th className="p-3.5">Khách Đặt / Nội Dung</th>
                    <th className="p-3.5">Số VĐV</th>
                    <th className="p-3.5 text-right">Giá Tiền</th>
                    <th className="p-3.5 text-center">Trạng Thái</th>
                    <th className="p-3.5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground text-xs">
                        Không tìm thấy lượt đặt sân nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => {
                      const typeBadge = {
                        regular: { label: 'Kèo Social', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-300' },
                        tournament: { label: 'Giải Đấu', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
                        coaching: { label: 'Lớp Coach', color: 'bg-purple-500/15 text-purple-700 dark:text-purple-300' },
                        private: { label: 'Bao Riêng', color: 'bg-teal-500/15 text-teal-700 dark:text-teal-300' },
                      }[b.type || 'regular']

                      return (
                        <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3.5 font-semibold text-foreground whitespace-nowrap">
                            <span className="text-emerald-600 font-mono text-[11px] block">
                              #{b.id.slice(-6)}
                            </span>
                            <span>{b.courtName}</span>
                          </td>
                          <td className="p-3.5 text-muted-foreground whitespace-nowrap">
                            <div className="flex items-center gap-1 font-medium text-foreground">
                              <Clock className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{b.startTime} - {b.endTime}</span>
                              {b.isPeak && (
                                <Flame className="w-3 h-3 text-orange-500 animate-pulse" />
                              )}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeBadge.color}`}>
                              {typeBadge.label}
                            </span>
                          </td>
                          <td className="p-3.5 text-foreground max-w-[220px]">
                            <p className="font-bold truncate">{b.bookedBy}</p>
                            {b.contactPhone && (
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Phone className="w-2.5 h-2.5" /> {b.contactPhone}
                              </p>
                            )}
                          </td>
                          <td className="p-3.5 text-muted-foreground whitespace-nowrap">
                            <span className="flex items-center gap-1 font-semibold text-foreground">
                              <Users className="w-3 h-3" /> {b.players || 4} người
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-black text-foreground whitespace-nowrap">
                            {formatVND(b.price)}
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                              <span>Đã Cọc</span>
                            </span>
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  showToast(`Đã xác nhận Check-in cho: ${b.bookedBy}`, 'success')
                                }}
                                className="h-7 text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                              >
                                Check-in
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm(`Hủy lượt đặt của ${b.bookedBy}?`)) {
                                    setTimeSlots((prev) =>
                                      prev.map((s) =>
                                        s.id === b.id
                                          ? { ...s, status: 'available', bookedBy: undefined }
                                          : s
                                      )
                                    )
                                    showToast('Đã hủy đặt chỗ!', 'info')
                                  }
                                }}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────
          TAB 4: REVENUE (Dashboard + Stats Per Venue)
          ──────────────────────────────────────────── */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>Báo Cáo Doanh Thu & Hiệu Quả Khai Thác</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Tổng hợp luồng tiền thực tế từ các nguồn đặt sân, dạy học và giải đấu
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => showToast('Đang tải xuống báo cáo doanh thu Excel...', 'info')}
              className="gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Báo Cáo (Excel)</span>
            </Button>
          </div>

          {/* Revenue Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                Doanh thu Hôm nay
              </span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                {formatVND(totalTodayRevenue)}
              </p>
              <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18.5% so với hôm qua</span>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-5 shadow-xs">
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
                Doanh thu Tháng này
              </span>
              <p className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-300 mt-1">
                {formatVND(totalMonthlyRevenue)}
              </p>
              <div className="mt-2 text-xs text-blue-600 flex items-center gap-1 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Đạt 88% chỉ tiêu tháng</span>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                TB Mỗi Sân / Ngày
              </span>
              <p className="text-2xl sm:text-3xl font-black text-foreground mt-1">
                {formatVND(Math.round(totalTodayRevenue / 21))}
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                Dựa trên 21 sân hoạt động
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Tỷ Lệ Thu Trực Tuyến
              </span>
              <p className="text-2xl sm:text-3xl font-black text-foreground mt-1">
                94.2%
              </p>
              <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Qua VietQR & Ví FITLYO</span>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown by Venue */}
          <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-border/60">
              <h3 className="font-bold text-base text-foreground">
                Doanh Thu Từng Cụm Sân Trong Hệ Thống
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Xếp theo tỷ trọng đóng góp doanh thu tháng 10/2026
              </p>
            </div>

            <div className="divide-y divide-border/50">
              {venues.map((venue) => {
                const pct =
                  totalMonthlyRevenue > 0
                    ? Math.round((venue.monthlyRevenue / totalMonthlyRevenue) * 100)
                    : 0
                return (
                  <div key={venue.id} className="p-4 sm:p-5 hover:bg-muted/20 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-foreground">{venue.name}</h4>
                          <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-semibold text-muted-foreground">
                            {venue.totalCourts} sân
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{venue.address}</p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-base font-black text-foreground">
                          {formatVND(venue.monthlyRevenue)}
                        </p>
                        <p className="text-xs text-emerald-600 font-semibold">
                          Hôm nay: {formatVND(venue.todayRevenue)} ({venue.todayBookings} bookings)
                        </p>
                      </div>
                    </div>

                    {/* Target Progress Bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-emerald-600 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground shrink-0">{pct}% tổng</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Revenue by Booking Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
              <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Cơ Cấu Nguồn Doanh Thu
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>1. Kèo Ghép Trận Social DUPR</span>
                    <span className="text-blue-600">45% • {formatShortVND(totalTodayRevenue * 0.45)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>2. Khách Bao Sân Trọn Gói (Private)</span>
                    <span className="text-teal-600">30% • {formatShortVND(totalTodayRevenue * 0.30)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: '30%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>3. Lớp Học Huấn Luyện Viên (Coaching)</span>
                    <span className="text-purple-600">18% • {formatShortVND(totalTodayRevenue * 0.18)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '18%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>4. Giải Đấu & Sự Kiện (Tournaments)</span>
                    <span className="text-amber-600">7% • {formatShortVND(totalTodayRevenue * 0.07)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '7%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-foreground mb-1 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Chính Sách Đối Soát Tự Động FITLYO
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tiền đặt cọc và thanh toán từ người chơi được tự động chuyển về tài khoản Chủ Sân (Field Manager) định kỳ mỗi 24 giờ. Phí sàn cố định chỉ 3.5% trên mỗi giao dịch thành công.
                </p>
              </div>

              <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                  Kỳ đối soát kế tiếp: 00:00 Đêm nay
                </span>
                <p className="text-emerald-700 dark:text-emerald-400">
                  Số tiền dự kiến giải ngân:{' '}
                  <b>{formatVND(Math.round(totalTodayRevenue * 0.965))}</b> (Sau trừ phí sàn)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────
          TAB 5: MAINTENANCE (Queue + Priority)
          ──────────────────────────────────────────── */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-600" />
                <span>Hàng Đợi Yêu Cầu & Phiếu Bảo Trì</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Theo dõi sửa chữa lưới, đèn chiếu sáng, mặt sân giảm chấn và thiết bị
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => setIsAddTicketOpen(true)}
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo Phiếu Bảo Trì Mới</span>
            </Button>
          </div>

          {/* Maintenance Ticket List */}
          <div className="space-y-3">
            {maintenanceTickets.map((ticket) => {
              const priorityBadge = {
                high: { label: 'Khẩn Cấp', color: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30' },
                medium: { label: 'Trung Bình', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' },
                low: { label: 'Bình Thường', color: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30' },
              }[ticket.priority]

              const statusBadge = {
                pending: { label: 'Chờ Tiếp Nhận', color: 'bg-amber-500/15 text-amber-700' },
                in_progress: { label: 'Đang Sửa Chữa', color: 'bg-blue-500/15 text-blue-700' },
                resolved: { label: 'Đã Hoàn Thành', color: 'bg-emerald-500/15 text-emerald-700' },
              }[ticket.status]

              return (
                <div
                  key={ticket.id}
                  className={`rounded-2xl border bg-card p-4 sm:p-5 shadow-xs transition-all ${
                    ticket.status === 'resolved'
                      ? 'border-border/40 opacity-70'
                      : 'border-border/70 hover:border-emerald-500/40 hover:shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="font-bold text-sm text-foreground">
                          {ticket.courtName}
                        </span>
                        <span className="text-xs text-muted-foreground">• {ticket.venueName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${priorityBadge.color}`}>
                          {priorityBadge.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm font-semibold text-foreground mt-1">
                        {ticket.issue}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
                        <span>Ngày báo: <b>{ticket.reportedDate}</b></span>
                        <span>Phụ trách: <b>{ticket.assignedTo}</b></span>
                        <span>Chi phí ước tính: <b className="text-foreground">{formatVND(ticket.estimatedCost)}</b></span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                      {ticket.status !== 'resolved' ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setMaintenanceTickets((prev) =>
                              prev.map((t) =>
                                t.id === ticket.id ? { ...t, status: 'resolved' } : t
                              )
                            )
                            showToast(`Đã hoàn thành sửa chữa: ${ticket.issue}`, 'success')
                          }}
                          className="text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Đánh Dấu Xong</span>
                        </Button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <Check className="w-4 h-4" /> Đã Nghiệm Thu
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────
          MODAL 1: Slot Details & Action Sheet
          ──────────────────────────────────────────── */}
      {selectedSlotForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  ĐIỀU HÀNH KHUNG GIỜ THỜI GIAN THỰC
                </span>
                <h3 className="font-extrabold text-lg text-foreground mt-0.5">
                  {selectedSlotForAction.courtName} • Khung {selectedSlotForAction.startTime} - {selectedSlotForAction.endTime}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Trạng thái hiện tại:{' '}
                  <b className="uppercase text-foreground">{selectedSlotForAction.status}</b>
                  {selectedSlotForAction.type && ` (${selectedSlotForAction.type})`}
                </p>
              </div>
              <button
                onClick={() => setSelectedSlotForAction(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {selectedSlotForAction.status === 'available' ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Slot này đang mở trống. Bạn có thể chọn phương án điều hành bên dưới:
                </p>

                <Button
                  onClick={() =>
                    handleSlotStatusChange('booked', 'regular', 'Kèo Social DUPR Mở Rộng')
                  }
                  className="w-full justify-start gap-2.5 h-10 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  <Activity className="w-4 h-4" />
                  <span>1. Mở Kèo Ghép Trận DUPR (Đưa Lên Feed)</span>
                </Button>

                <Button
                  onClick={() =>
                    handleSlotStatusChange('booked', 'private', 'Khách VIP Bao Sân Riêng')
                  }
                  className="w-full justify-start gap-2.5 h-10 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>2. Khóa Cho Khách Bao Sân Riêng</span>
                </Button>

                <Button
                  onClick={() =>
                    handleSlotStatusChange('booked', 'coaching', 'Lớp Huấn Luyện Viên')
                  }
                  className="w-full justify-start gap-2.5 h-10 text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                >
                  <Users className="w-4 h-4" />
                  <span>3. Phân Phối Cho Giờ Học Coach</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    handleSlotStatusChange('maintenance', undefined, 'Bảo trì khẩn cấp')
                  }
                  className="w-full justify-start gap-2.5 h-10 text-xs text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40"
                >
                  <Wrench className="w-4 h-4" />
                  <span>4. Khóa Slot Để Vệ Sinh / Bảo Trì Sân</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="rounded-xl bg-muted/40 p-3.5 space-y-1.5">
                  <span className="font-bold text-foreground block">Thông tin chi tiết:</span>
                  <p><b>Khách đặt / Kèo:</b> {selectedSlotForAction.bookedBy}</p>
                  <p><b>Giá cọc:</b> {formatVND(selectedSlotForAction.price)}</p>
                  {selectedSlotForAction.contactPhone && (
                    <p><b>SĐT liên hệ:</b> {selectedSlotForAction.contactPhone}</p>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handleSlotStatusChange('available', undefined, undefined)}
                  className="w-full text-xs text-destructive hover:bg-destructive/10"
                >
                  Giải Phóng Slot (Hủy Đặt / Mở Lại Trống)
                </Button>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSlotForAction(null)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────
          MODAL 2: Add Booking Modal
          ──────────────────────────────────────────── */}
      {isAddBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-600" />
                  Tạo Lượt Đặt Sân Nhanh Tại Quầy
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ghi nhận khách đặt trực tiếp hoặc khách vãng lai gọi điện
                </p>
              </div>
              <button
                onClick={() => setIsAddBookingOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBookingSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">Chọn Sân</label>
                  <select
                    value={newBookingData.courtNumber}
                    onChange={(e) =>
                      setNewBookingData({ ...newBookingData, courtNumber: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:border-emerald-600"
                  >
                    {courts.map((c) => (
                      <option key={c.number} value={c.number}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-foreground block mb-1">Khung Giờ (Slot)</label>
                  <select
                    value={newBookingData.timeRange}
                    onChange={(e) =>
                      setNewBookingData({ ...newBookingData, timeRange: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="06:00 - 07:30">06:00 - 07:30 (Slot 1)</option>
                    <option value="07:30 - 09:00">07:30 - 09:00 (Slot 2)</option>
                    <option value="15:30 - 17:00">15:30 - 17:00 (Slot 3)</option>
                    <option value="17:00 - 18:30">17:00 - 18:30 (Slot 4)</option>
                    <option value="18:30 - 20:00">18:30 - 20:00 (Slot 5 - Giờ Vàng)</option>
                    <option value="20:00 - 21:30">20:00 - 21:30 (Slot 6)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Phân Loại Đặt Chỗ</label>
                <select
                  value={newBookingData.type}
                  onChange={(e) =>
                    setNewBookingData({
                      ...newBookingData,
                      type: e.target.value as typeof newBookingData.type,
                    })
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:border-emerald-600"
                >
                  <option value="private">Khách bao sân riêng (Private)</option>
                  <option value="regular">Kèo Social DUPR (Regular)</option>
                  <option value="coaching">Giờ dạy HLV (Coaching)</option>
                  <option value="tournament">Giải đấu / Sự kiện (Tournament)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Tên Khách Hàng / Nhóm</label>
                <input
                  type="text"
                  placeholder="VD: Anh Minh DUPR 3.0"
                  value={newBookingData.customerName}
                  onChange={(e) =>
                    setNewBookingData({ ...newBookingData, customerName: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">Số Điện Thoại</label>
                  <input
                    type="tel"
                    placeholder="VD: 0912.334.556"
                    value={newBookingData.phone}
                    onChange={(e) =>
                      setNewBookingData({ ...newBookingData, phone: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-foreground block mb-1">Giá Tiền (VND)</label>
                  <input
                    type="number"
                    step={10000}
                    value={newBookingData.price}
                    onChange={(e) =>
                      setNewBookingData({ ...newBookingData, price: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddBookingOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Xác Nhận Đặt Chỗ
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────
          MODAL 3: Add Venue Modal
          ──────────────────────────────────────────── */}
      {isAddVenueOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  Thêm Cụm Sân Mới
                </h3>
                <p className="text-xs text-muted-foreground">
                  Đăng ký cơ sở sân mới vào mạng lưới quản lý FITLYO
                </p>
              </div>
              <button
                onClick={() => setIsAddVenueOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVenueSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1">Tên Cụm Sân</label>
                <input
                  type="text"
                  placeholder="VD: An Phú Pickleball Arena"
                  value={newVenueData.name}
                  onChange={(e) => setNewVenueData({ ...newVenueData, name: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Địa Chỉ</label>
                <input
                  type="text"
                  placeholder="VD: 55 Mai Chí Thọ, P. An Phú, TP. Thủ Đức"
                  value={newVenueData.address}
                  onChange={(e) => setNewVenueData({ ...newVenueData, address: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">Hotline / Zalo</label>
                  <input
                    type="tel"
                    placeholder="VD: 0909.888.777"
                    value={newVenueData.phone}
                    onChange={(e) => setNewVenueData({ ...newVenueData, phone: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-foreground block mb-1">Số Lượng Sân Con</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newVenueData.totalCourts}
                    onChange={(e) =>
                      setNewVenueData({ ...newVenueData, totalCourts: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddVenueOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Lưu Cụm Sân
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────
          MODAL 4: Add Maintenance Ticket Modal
          ──────────────────────────────────────────── */}
      {isAddTicketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-emerald-600" />
                  Tạo Phiếu Yêu Cầu Bảo Trì
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ghi nhận sự cố hư hỏng lưới, mặt sân hoặc đèn chiếu sáng
                </p>
              </div>
              <button
                onClick={() => setIsAddTicketOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTicketSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1">Chọn Cụm Sân</label>
                <select
                  value={newTicketData.venueId}
                  onChange={(e) =>
                    setNewTicketData({ ...newTicketData, venueId: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:border-emerald-600"
                >
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">Sân Gặp Sự Cố</label>
                  <input
                    type="text"
                    placeholder="VD: Sân 2 (Ngoài trời)"
                    value={newTicketData.courtName}
                    onChange={(e) =>
                      setNewTicketData({ ...newTicketData, courtName: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-foreground block mb-1">Mức Độ Ưu Tiên</label>
                  <select
                    value={newTicketData.priority}
                    onChange={(e) =>
                      setNewTicketData({
                        ...newTicketData,
                        priority: e.target.value as typeof newTicketData.priority,
                      })
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="high">Khẩn cấp (High)</option>
                    <option value="medium">Trung bình (Medium)</option>
                    <option value="low">Bình thường (Low)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Mô Tả Sự Cố</label>
                <textarea
                  rows={3}
                  placeholder="VD: Rách lưới ở ô trung tâm, cần thay mới trước khung giờ vàng 18:30"
                  value={newTicketData.issue}
                  onChange={(e) =>
                    setNewTicketData({ ...newTicketData, issue: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">Người Phụ Trách</label>
                  <input
                    type="text"
                    value={newTicketData.assignedTo}
                    onChange={(e) =>
                      setNewTicketData({ ...newTicketData, assignedTo: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-foreground block mb-1">Chi Phí Dự Kiến (VND)</label>
                  <input
                    type="number"
                    step={50000}
                    value={newTicketData.estimatedCost}
                    onChange={(e) =>
                      setNewTicketData({
                        ...newTicketData,
                        estimatedCost: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddTicketOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Gửi Phiếu Bảo Trì
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────
          MODAL 5: Staff Management Modal
          ──────────────────────────────────────────── */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  Đội Ngũ Nhân Viên & Trực Ca
                </h3>
                <p className="text-xs text-muted-foreground">
                  Phân ca trực quầy tiếp tân, giám sát sân và kỹ thuật viên bảo dưỡng
                </p>
              </div>
              <button
                onClick={() => setIsStaffModalOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                <div>
                  <p className="font-bold text-foreground">Nguyễn Hoàng Sơn</p>
                  <p className="text-[11px] text-muted-foreground">Quản lý ca chiều (14:00 - 22:00) • 0912.888.777</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700">
                  Đang trực
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                <div>
                  <p className="font-bold text-foreground">Trần Thị Bích</p>
                  <p className="text-[11px] text-muted-foreground">Thu ngân & Quầy nước (06:00 - 14:00) • 0933.112.233</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">
                  Hết ca
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                <div>
                  <p className="font-bold text-foreground">Lê Văn Hùng</p>
                  <p className="text-[11px] text-muted-foreground">Kỹ thuật viên sân & Lưới (On-call) • 0908.445.566</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-700">
                  Sẵn sàng
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => showToast('Tính năng thêm nhân viên mới đang mở', 'info')}
                className="gap-1.5 text-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm Nhân Viên
              </Button>
              <Button size="sm" onClick={() => setIsStaffModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────
          MODAL 6: Venue Settings Modal
          ──────────────────────────────────────────── */}
      {isVenueSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-600" />
                  Cấu Hình Cụm Sân: {isVenueSettingsOpen.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Thiết lập bảng giá tiêu chuẩn và giờ hoạt động
                </p>
              </div>
              <button
                onClick={() => setIsVenueSettingsOpen(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1">Giờ mở cửa hàng ngày</label>
                <input
                  type="text"
                  defaultValue="05:30 - 22:30 (Thứ 2 - Chủ Nhật)"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Đơn giá giờ thường (Slot 1-4, 6)</label>
                <input
                  type="text"
                  defaultValue="180.000 ₫ / 90 phút"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Đơn giá giờ vàng (Slot 5: 18:30 - 20:00)</label>
                <input
                  type="text"
                  defaultValue="220.000 ₫ / 90 phút"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Chính sách hủy sân</label>
                <input
                  type="text"
                  defaultValue="Hoàn cọc 100% trước 12h, hoàn 50% trước 6h"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVenueSettingsOpen(null)}
              >
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  showToast('Đã lưu cấu hình bảng giá cụm sân!', 'success')
                  setIsVenueSettingsOpen(null)
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Lưu Thay Đổi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────
          MODAL 7: Edit Court Modal
          ──────────────────────────────────────────── */}
      {isEditCourtOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
                  <Edit className="w-5 h-5 text-emerald-600" />
                  Sửa Thông Tin Sân #{isEditCourtOpen.number}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isEditCourtOpen.name}
                </p>
              </div>
              <button
                onClick={() => setIsEditCourtOpen(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                showToast(`Đã cập nhật thông tin ${isEditCourtOpen.name}`, 'success')
                setIsEditCourtOpen(null)
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-foreground block mb-1">Tên Hiển Thị Sân</label>
                <input
                  type="text"
                  value={isEditCourtOpen.name}
                  onChange={(e) =>
                    setIsEditCourtOpen({ ...isEditCourtOpen, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Loại Sân</label>
                <select
                  value={isEditCourtOpen.type}
                  onChange={(e) =>
                    setIsEditCourtOpen({
                      ...isEditCourtOpen,
                      type: e.target.value as Court['type'],
                    })
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
                >
                  <option value="indoor">Sân Trong Nhà (Indoor)</option>
                  <option value="outdoor">Sân Ngoài Trời / Mái Che (Outdoor)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Chất Liệu Mặt Sân</label>
                <input
                  type="text"
                  value={isEditCourtOpen.surface}
                  onChange={(e) =>
                    setIsEditCourtOpen({ ...isEditCourtOpen, surface: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Trạng Thái Sân</label>
                <select
                  value={isEditCourtOpen.status}
                  onChange={(e) =>
                    setIsEditCourtOpen({
                      ...isEditCourtOpen,
                      status: e.target.value as Court['status'],
                    })
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
                >
                  <option value="active">Đang hoạt động (Active)</option>
                  <option value="maintenance">Đang bảo trì (Maintenance)</option>
                  <option value="closed">Tạm đóng (Closed)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditCourtOpen(null)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Cập Nhật
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────
          MODAL 8: Add New Court Modal
          ──────────────────────────────────────────── */}
      {isAddCourtOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-600" />
                  Thêm Sân Con Mới
                </h3>
                <p className="text-xs text-muted-foreground">
                  Mở rộng thêm sân con cho cụm sân D-Sports Pickleball
                </p>
              </div>
              <button
                onClick={() => setIsAddCourtOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const nextNum = courts.length + 1
                const newCourt: Court = {
                  id: `court_${nextNum}`,
                  name: `Sân ${nextNum} (Mới Mở)`,
                  number: nextNum,
                  type: 'indoor',
                  surface: 'Cushion Acrylic 8 lớp',
                  status: 'active',
                }
                setCourts((prev) => [...prev, newCourt])
                showToast(`Đã thêm ${newCourt.name} thành công!`, 'success')
                setIsAddCourtOpen(false)
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-foreground block mb-1">Tên Sân Con</label>
                <input
                  type="text"
                  defaultValue={`Sân ${courts.length + 1} (Trong nhà)`}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Mặt Sân Tiêu Chuẩn</label>
                <input
                  type="text"
                  defaultValue="Cushion Acrylic 8 lớp tiêu chuẩn USAPA"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddCourtOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Xác Nhận Thêm Sân
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FieldManagerPage
