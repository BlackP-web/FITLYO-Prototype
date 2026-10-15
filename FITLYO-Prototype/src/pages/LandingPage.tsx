import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Award,
  BookOpen,
  Phone,
  Mail,
  Globe,
  Share2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Bell,
  Crown,
  LogOut,
  User as UserIcon,
  Search,
  Target,
  ShieldCheck,
  GraduationCap,
  Building2,
  Star,
} from 'lucide-react'
import { useFitlyoStore } from '@/store/useFitlyoStore'

/* ─────────────────────── MOCK DATA ─────────────────────── */

const heroSlides = [
  {
    id: 1,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCLPc6K_yXHrVqhQ50O8Yvng3Xc3FW9WsBAZF8yEx7kDVhgk1A01C7BOA6QtYUKQzwTl5Yd3vMOCZD3jxxZadzL7qsSQX0O70QAryhxAz4NJ6Ha9O8uKqTW1xzACaBWbBskSbwKY7gkjeeyw4C7kEhW-65lAE2SmUBrsOnUXgOzUC0aAVyYPBxoKjb5xkDd3WJfNMhFDx6_N-cQu_n9NuwzZIFhU8SlwlCiGfl4nLPO7OCfzzRug3uV',
    title: 'D-Pickleball Thảo Điền',
    availableCourts: '16 Sân khả dụng tối nay',
    badge: 'Cụm Sân Tiêu Biểu',
    rating: '4.95 / 5.0',
    reviews: '8.5k+ • Sân trong nhà máy lạnh',
  },
  {
    id: 2,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCbNpyC1SZInfMoOzFE6jfbAimGTADYpa_fqXc2us-iSl84ltn91luorsnk4uTGx_0RSMBn8k02b-Iwx0-UaHn8IydCBeJn_-C4uOVhgjZSlDXfUDgaOOEGjHU834m4Wassy2OQdf9KfX40QJ6Cwd61wQUzHAk6Q7fQPX7Ak03Ef_WcDcALQos1VvHNdgDhZpGe5U6cPkG3VGkQQ0Kx01tDX0K-kz9SFm4q64D68ZEfFCL5WkwHLs8-',
    title: 'D-Sports Pickleball Linh Chiểu',
    availableCourts: '38 Sân khả dụng hôm nay',
    badge: 'Cụm Sân Tiêu Biểu',
    rating: '4.90 / 5.0',
    reviews: '12k+ • Chuẩn DUPR',
  },
  {
    id: 3,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAC42tO8SYWipgKgRyhc7lafyb_eClVst_krHsKS4HH79pKPLMYd86cpnMMjSsG1gKphoj5qdBVFFMOa-DXB4g7ahsE-1Pfzb-T8m5E396udZKUvn-ItibJ22Rcwm8g1LDmsCS5SfP4WU2VYNfhO_Om5jB1z67Os29In35uIutlJv8vNH6c8RiDjyxugyDdCth2KO55CT42kBLCFExQbQJ_sxjKsvjIc8mK_DoINIg9bORT1tbFCbSW',
    title: 'Saigon Rackets Hiệp Phú',
    availableCourts: '10 Sân khả dụng tối nay',
    badge: 'Cụm Sân Tiêu Biểu',
    rating: '4.85 / 5.0',
    reviews: '6.2k+ • Sân ngoài trời LED',
  },
  {
    id: 4,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDUso72D9hyAGiU81n112PpGJ5eHgXHVWxJy4Yetc2nMBOffpVg2LgD1cRlmyFJIycMAlfoRHB15cfXAEseVQqj5QDmytiE5NGh_TLWbd2qUqCLU_oinRq_AdXCfmovCjAKl6rMxeq2i_z2Ovz3s8yO_LNIn27jFpCSk-p7BDuoXHwKMuMtljmFyhfWJ7GOedrjdJNKy2_PIRFk9IpTHRNiN7qNgn11ajSrHlrKM521JUFYcy_iewHL',
    title: 'An Khánh Pickleball Club',
    availableCourts: '6 Sân khả dụng hôm nay',
    badge: 'Cụm Sân Tiêu Biểu',
    rating: '4.80 / 5.0',
    reviews: '5.1k+ • Mái che LED',
  },
]

const courtsData = [
  {
    id: 'd-pickleball-thao-dien',
    name: 'D-Pickleball Thảo Điền',
    badge: 'Phổ biến',
    typeTag: 'Trong nhà máy lạnh',
    price: '180.000đ',
    rating: '4.95',
    reviewsCount: '142',
    distance: '0.8 km',
    courtsCount: '4 sân tiêu chuẩn',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCbNpyC1SZInfMoOzFE6jfbAimGTADYpa_fqXc2us-iSl84ltn91luorsnk4uTGx_0RSMBn8k02b-Iwx0-UaHn8IydCBeJn_-C4uOVhgjZSlDXfUDgaOOEGjHU834m4Wassy2OQdf9KfX40QJ6Cwd61wQUzHAk6Q7fQPX7Ak03Ef_WcDcALQos1VvHNdgDhZpGe5U6cPkG3VGkQQ0Kx01tDX0K-kz9SFm4q64D68ZEfFCL5WkwHLs8-',
    slots: [
      { time: '17:00', available: true, isPeak: false },
      { time: '18:30', available: true, isPeak: true },
      { time: '19:00', available: false, isPeak: false },
      { time: '20:00', available: true, isPeak: false },
    ],
  },
  {
    id: 'saigon-rackets-hiep-phu',
    name: 'Saigon Rackets Hiệp Phú',
    badge: 'Ưa chuộng',
    typeTag: 'Đèn LED ngoài trời',
    price: '220.000đ',
    rating: '4.90',
    reviewsCount: '98',
    distance: '2.1 km',
    courtsCount: '6 sân (4 trong nhà + 2 ngoài trời)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCLPc6K_yXHrVqhQ50O8Yvng3Xc3FW9WsBAZF8yEx7kDVhgk1A01C7BOA6QtYUKQzwTl5Yd3vMOCZD3jxxZadzL7qsSQX0O70QAryhxAz4NJ6Ha9O8uKqTW1xzACaBWbBskSbwKY7gkjeeyw4C7kEhW-65lAE2SmUBrsOnUXgOzUC0aAVyYPBxoKjb5xkDd3WJfNMhFDx6_N-cQu_n9NuwzZIFhU8SlwlCiGfl4nLPO7OCfzzRug3uV',
    slots: [
      { time: '17:00', available: true, isPeak: false },
      { time: '18:30', available: true, isPeak: true },
      { time: '19:00', available: true, isPeak: false },
      { time: '20:00', available: false, isPeak: false },
    ],
  },
  {
    id: 'an-khanh-pickleball-club',
    name: 'An Khánh Pickleball Club',
    badge: 'Giá tốt',
    typeTag: 'Trong nhà máy lạnh',
    price: '160.000đ',
    rating: '4.80',
    reviewsCount: '210',
    distance: '3.4 km',
    courtsCount: '4 sân có mái che',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAC42tO8SYWipgKgRyhc7lafyb_eClVst_krHsKS4HH79pKPLMYd86cpnMMjSsG1gKphoj5qdBVFFMOa-DXB4g7ahsE-1Pfzb-T8m5E396udZKUvn-ItibJ22Rcwm8g1LDmsCS5SfP4WU2VYNfhO_Om5jB1z67Os29In35uIutlJv8vNH6c8RiDjyxugyDdCth2KO55CT42kBLCFExQbQJ_sxjKsvjIc8mK_DoINIg9bORT1tbFCbSW',
    slots: [
      { time: '15:30', available: false, isPeak: false },
      { time: '17:00', available: true, isPeak: false },
      { time: '18:30', available: true, isPeak: true },
      { time: '20:00', available: true, isPeak: false },
    ],
  },
  {
    id: 'thu-thiem-sports-hub',
    name: 'Thủ Thiêm Sports Hub (An Phú)',
    badge: 'Đẳng cấp',
    typeTag: 'Đèn LED giải đấu',
    price: '150.000đ',
    rating: '4.85',
    reviewsCount: '85',
    distance: '1.9 km',
    courtsCount: '6 sân ngoài trời',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBxGyNaVnznr3bkMe9f85qSPoefCLz9qrlxiauMxBDg1yvPz0XdYZn5dV6tRXjVKDsh5eck18I7VuaE6o5GRMIvFfQK_bMZdbcv-BsgTDnkXZm6DNKlkgHf1iTMxoi6Ll9pP_-EAAgNBTeIKXqRJzGF6c7GDn31nxu-PiIAAg4A7QN_A0D0OlXghAb9GojShqjYDi9uNWHx-SamBevfIZNDudBNRYUylHJPFIJQXCpjScM04ZB_nWyo',
    slots: [
      { time: '17:00', available: true, isPeak: false },
      { time: '18:30', available: true, isPeak: true },
      { time: '19:00', available: true, isPeak: false },
      { time: '20:00', available: true, isPeak: false },
    ],
  },
  {
    id: 'd-sports-linh-chieu',
    name: 'D-Sports Pickleball Linh Chiểu',
    badge: 'Quy mô lớn',
    typeTag: 'Trong nhà máy lạnh Premium',
    price: '200.000đ',
    rating: '4.90',
    reviewsCount: '175',
    distance: '1.2 km',
    courtsCount: '8 sân chuyên nghiệp',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDUso72D9hyAGiU81n112PpGJ5eHgXHVWxJy4Yetc2nMBOffpVg2LgD1cRlmyFJIycMAlfoRHB15cfXAEseVQqj5QDmytiE5NGh_TLWbd2qUqCLU_oinRq_AdXCfmovCjAKl6rMxeq2i_z2Ovz3s8yO_LNIn27jFpCSk-p7BDuoXHwKMuMtljmFyhfWJ7GOedrjdJNKy2_PIRFk9IpTHRNiN7qNgn11ajSrHlrKM521JUFYcy_iewHL',
    slots: [
      { time: '15:30', available: true, isPeak: false },
      { time: '17:00', available: true, isPeak: false },
      { time: '18:30', available: true, isPeak: true },
      { time: '20:00', available: true, isPeak: false },
    ],
  },
  {
    id: 'an-phu-racket-club',
    name: 'An Phú Racket Club - Thủ Đức',
    badge: 'Mát mẻ',
    typeTag: 'Mái che ngoài trời',
    price: '140.000đ',
    rating: '4.75',
    reviewsCount: '64',
    distance: '2.8 km',
    courtsCount: '4 sân thi đấu',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCbNpyC1SZInfMoOzFE6jfbAimGTADYpa_fqXc2us-iSl84ltn91luorsnk4uTGx_0RSMBn8k02b-Iwx0-UaHn8IydCBeJn_-C4uOVhgjZSlDXfUDgaOOEGjHU834m4Wassy2OQdf9KfX40QJ6Cwd61wQUzHAk6Q7fQPX7Ak03Ef_WcDcALQos1VvHNdgDhZpGe5U6cPkG3VGkQQ0Kx01tDX0K-kz9SFm4q64D68ZEfFCL5WkwHLs8-',
    slots: [
      { time: '17:00', available: true, isPeak: false },
      { time: '18:30', available: false, isPeak: true },
      { time: '19:00', available: true, isPeak: false },
      { time: '20:00', available: true, isPeak: false },
    ],
  },
]

const coachesData = [
  {
    id: 'hoang-minh-triet',
    name: 'Hoàng Minh Triết',
    dupr: '4.80',
    cert: 'PPR Level 2',
    rating: '4.90',
    reviewsCount: '132',
    court: 'Sân chính: D-Pickleball Thảo Điền',
    specialty: 'Kỹ thuật: Dinking nâng cao, Chiến thuật đôi nam nữ & Kiểm soát Non-Volley Zone.',
    rate: '400.000đ',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDUso72D9hyAGiU81n112PpGJ5eHgXHVWxJy4Yetc2nMBOffpVg2LgD1cRlmyFJIycMAlfoRHB15cfXAEseVQqj5QDmytiE5NGh_TLWbd2qUqCLU_oinRq_AdXCfmovCjAKl6rMxeq2i_z2Ovz3s8yO_LNIn27jFpCSk-p7BDuoXHwKMuMtljmFyhfWJ7GOedrjdJNKy2_PIRFk9IpTHRNiN7qNgn11ajSrHlrKM521JUFYcy_iewHL',
  },
  {
    id: 'dang-thao-linh',
    name: 'Đặng Thảo Linh',
    dupr: '4.60',
    cert: 'PPR Coach',
    rating: '4.95',
    reviewsCount: '88',
    court: 'Sân chính: Saigon Rackets Hiệp Phú',
    specialty: 'Kỹ thuật: Tăng tốc trên lưới (Kitchen Speed-up), Đấu tay nhanh & Chuyển tiếp.',
    rate: '350.000đ',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCLPc6K_yXHrVqhQ50O8Yvng3Xc3FW9WsBAZF8yEx7kDVhgk1A01C7BOA6QtYUKQzwTl5Yd3vMOCZD3jxxZadzL7qsSQX0O70QAryhxAz4NJ6Ha9O8uKqTW1xzACaBWbBskSbwKY7gkjeeyw4C7kEhW-65lAE2SmUBrsOnUXgOzUC0aAVyYPBxoKjb5xkDd3WJfNMhFDx6_N-cQu_n9NuwzZIFhU8SlwlCiGfl4nLPO7OCfzzRug3uV',
  },
  {
    id: 'le-tuan-khang',
    name: 'Lê Tuấn Khang',
    dupr: '5.15',
    cert: 'IPTPA Master',
    rating: '4.95',
    reviewsCount: '210',
    court: 'Sân chính: D-Sports Linh Chiểu',
    specialty: 'Kỹ thuật: Chiến thuật giải đấu, Đấu đối kháng nâng cao & Chuẩn hóa DUPR.',
    rate: '500.000đ',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAC42tO8SYWipgKgRyhc7lafyb_eClVst_krHsKS4HH79pKPLMYd86cpnMMjSsG1gKphoj5qdBVFFMOa-DXB4g7ahsE-1Pfzb-T8m5E396udZKUvn-ItibJ22Rcwm8g1LDmsCS5SfP4WU2VYNfhO_Om5jB1z67Os29In35uIutlJv8vNH6c8RiDjyxugyDdCth2KO55CT42kBLCFExQbQJ_sxjKsvjIc8mK_DoINIg9bORT1tbFCbSW',
  },
  {
    id: 'nguyen-bao-ngoc',
    name: 'Nguyễn Bảo Ngọc',
    dupr: '4.40',
    cert: 'PPR Coach',
    rating: '4.85',
    reviewsCount: '76',
    court: 'Sân chính: An Khánh Pickleball Club',
    specialty: 'Kỹ thuật: Bộ chân di chuyển, Kỷ luật vạch Non-Volley & Bài tập cơ bản.',
    rate: '320.000đ',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBxGyNaVnznr3bkMe9f85qSPoefCLz9qrlxiauMxBDg1yvPz0XdYZn5dV6tRXjVKDsh5eck18I7VuaE6o5GRMIvFfQK_bMZdbcv-BsgTDnkXZm6DNKlkgHf1iTMxoi6Ll9pP_-EAAgNBTeIKXqRJzGF6c7GDn31nxu-PiIAAg4A7QN_A0D0OlXghAb9GojShqjYDi9uNWHx-SamBevfIZNDudBNRYUylHJPFIJQXCpjScM04ZB_nWyo',
  },
]

const curriculumData = [
  {
    id: 'course-101',
    level: 'Cấp độ 101',
    duprRange: 'Từ số 0 đến DUPR 2.5',
    title: 'Nền Tảng Nhập Môn',
    sessions: '6 buổi • 90 phút/buổi',
    description: 'Học luật thi đấu USAPA, kỹ năng cầm vợt, kỹ thuật Dinking cơ bản, giao bóng sâu và trả giao bóng ổn định.',
    leadCoach: 'Nguyễn Bảo Ngọc',
    price: '1.800.000đ',
  },
  {
    id: 'course-201',
    level: 'Cấp độ 201',
    duprRange: 'DUPR 2.5 — 3.5',
    title: 'Chiến Thuật Trung Cấp',
    sessions: '8 buổi • 90 phút/buổi',
    description: 'Làm chủ cú thả bóng 3 (Drop shot), Reset trước lưới, Đấu lưới Dinking tốc độ cao, Xếp đôi Stacking và đổi hướng bóng.',
    leadCoach: 'Hoàng Minh Triết',
    price: '2.500.000đ',
    isFeatured: true,
  },
  {
    id: 'course-301',
    level: 'Cấp độ 301',
    duprRange: 'DUPR 3.5 — 4.5+',
    title: 'Thi Đấu Nâng Cao',
    sessions: '10 buổi • 120 phút/buổi',
    description: 'Tăng tốc bóng tốc độ cao, kỹ thuật Erne & ATP poaching, phản công chớp nhoáng và phân tích video chuyển động chậm.',
    leadCoach: 'Lê Tuấn Khang',
    price: '3.600.000đ',
  },
  {
    id: 'course-junior',
    level: 'Lớp Trẻ Em',
    duprRange: 'Độ tuổi 7 — 15',
    title: 'Học Viện Junior',
    sessions: '8 buổi • 60 phút/buổi',
    description: 'Bộ chân nhanh nhẹn, phối hợp mắt tay, tinh thần thể thao Fair-play USAPA và các trận đấu giao lưu hào hứng.',
    leadCoach: 'Đặng Thảo Linh',
    price: '1.600.000đ',
  },
]

/* ─────────────────────── COMPONENT ─────────────────────── */

export function LandingPage() {
  const navigate = useNavigate()
  const { currentUser, isLoggedIn, handleLogout } = useFitlyoStore()

  // Carousel
  const [currentSlide, setCurrentSlide] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Quick Search Form
  const [searchLocation, setSearchLocation] = useState('Thảo Điền, Hiệp Phú')
  const [searchDate, setSearchDate] = useState('Hôm nay, 14/10')
  const [searchSlot, setSearchSlot] = useState('18:30 - 20:00 (Slot 5)')
  const [searchFormat, setSearchFormat] = useState('Đánh Đôi (4 người)')

  // Court results visibility
  const [showAvailableCourts, setShowAvailableCourts] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Venue filter / sort
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'indoor' | 'outdoor' | 'price' | 'rating'>('all')
  const [sortBy, setSortBy] = useState('distance')

  // Profile menu
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  // Mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Auto-play carousel
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 4000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    setShowAvailableCourts(true)
    setTimeout(() => {
      setIsSearching(false)
      const el = document.getElementById('danh-muc-san')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
  }

  const scrollToSection = (id: string, open?: boolean) => {
    if (open) setShowAvailableCourts(true)
    setTimeout(() => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, open ? 120 : 0)
  }

  return (
    <div className="w-full min-h-screen bg-[#f8f9ff] text-[#0b1c30] font-sans antialiased">
      {/* Canvas centred at 1440px */}
      <div className="w-full max-w-[1440px] mx-auto relative flex flex-col min-h-screen shadow-2xl">

        {/* ══════════════════════════════════════════════════════
            STICKY HEADER
        ══════════════════════════════════════════════════════ */}
        <header className="sticky top-0 z-50 w-full bg-[#f8f9ff]/95 backdrop-blur-md border-b border-slate-200">
          <div className="h-20 px-4 sm:px-8 lg:px-12 flex items-center justify-between">

            {/* LEFT: Logo + City Badge */}
            <div className="flex items-center gap-4 sm:gap-6">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-2 cursor-pointer focus:outline-none"
              >
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-black text-[#0b1c30] tracking-tight leading-none">FITLYO</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A] mb-1.5 animate-pulse" />
                </div>
                <span className="text-xs tracking-widest text-[#16A34A] font-bold px-2 py-0.5 bg-green-100 rounded">
                  PICKLEBALL
                </span>
              </button>

              <div className="hidden sm:block h-6 w-px bg-slate-300" />

              <div className="hidden md:flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 text-[#0b1c30] text-xs font-semibold">
                <MapPin className="w-4 h-4 text-[#16A34A]" />
                <span>TP. Thủ Đức</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </div>
            </div>

            {/* CENTER: Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollToSection('danh-muc-san', true)}
                className="h-10 flex items-center px-4 rounded-xl bg-[#16A34A] text-white font-semibold text-sm transition"
              >
                Sân Bóng
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('doi-ngu-hlv')}
                className="h-10 flex items-center px-4 rounded-xl font-medium text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                Huấn Luyện Viên
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('giao-trinh-dao-tao')}
                className="h-10 flex items-center px-4 rounded-xl font-medium text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                Giáo Trình DUPR
              </button>
              <button
                type="button"
                onClick={() => navigate('/matches/detail')}
                className="h-10 flex items-center px-4 rounded-xl font-medium text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                Kèo Đấu
              </button>
            </nav>

            {/* RIGHT: Auth Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {!isLoggedIn ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="hidden sm:flex h-10 px-4 rounded-xl border border-slate-300 text-slate-800 font-semibold text-sm hover:bg-slate-100 transition items-center"
                  >
                    ĐĂNG NHẬP
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/auth/register')}
                    className="h-10 px-4 rounded-xl bg-[#16A34A] hover:bg-green-700 text-white font-extrabold text-sm shadow-md shadow-green-600/30 transition flex items-center"
                  >
                    THAM GIA NGAY
                  </button>
                </>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full border border-slate-200 hover:bg-slate-100 transition"
                  >
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-9 h-9 rounded-full object-cover border border-[#16A34A]"
                    />
                    <span className="hidden md:inline text-xs font-bold text-slate-800 pr-1">
                      {currentUser.name}
                    </span>
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                      <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <UserIcon className="w-4 h-4 text-[#16A34A]" /> Hồ Sơ DUPR
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Bell className="w-4 h-4 text-[#16A34A]" /> Thông Báo
                      </button>
                      <div className="border-t border-slate-100 my-1" />
                      <button
                        type="button"
                        onClick={() => {
                          handleLogout()
                          setIsProfileMenuOpen(false)
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Đăng Xuất
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition"
              >
                <div className="space-y-1.5">
                  <span className="block w-5 h-0.5 bg-current" />
                  <span className="block w-4 h-0.5 bg-current" />
                  <span className="block w-5 h-0.5 bg-current" />
                </div>
              </button>
            </div>
          </div>

          {/* Mobile menu dropdown */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
              {[
                { label: 'Sân Bóng', action: () => { scrollToSection('danh-muc-san', true); setIsMobileMenuOpen(false) } },
                { label: 'Huấn Luyện Viên', action: () => { scrollToSection('doi-ngu-hlv'); setIsMobileMenuOpen(false) } },
                { label: 'Giáo Trình DUPR', action: () => { scrollToSection('giao-trinh-dao-tao'); setIsMobileMenuOpen(false) } },
                { label: 'Kèo Đấu', action: () => { navigate('/matches/detail'); setIsMobileMenuOpen(false) } },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="flex-1 h-10 rounded-xl border border-slate-300 text-sm font-semibold"
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/auth/register')}
                  className="flex-1 h-10 rounded-xl bg-[#16A34A] text-white text-sm font-bold"
                >
                  Đăng ký
                </button>
              </div>
            </div>
          )}
        </header>

        {/* ══════════════════════════════════════════════════════
            MAIN
        ══════════════════════════════════════════════════════ */}
        <main className="px-4 sm:px-8 lg:px-12 flex flex-col space-y-16 py-10 sm:py-14">

          {/* ── 1. HERO (12 col: 7 Carousel | 5 Search Card) ── */}
          <section className="grid grid-cols-12 gap-6 items-center">

            {/* LEFT: Hero Carousel */}
            <div className="col-span-12 lg:col-span-7 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-slate-900 aspect-[7/5] group">
                {/* Slides */}
                <div
                  className="w-full h-full flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {heroSlides.map((slide) => (
                    <div key={slide.id} className="w-full h-full shrink-0 relative">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      {/* Top badge */}
                      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md flex items-center gap-1.5">
                        <span className="text-[#84CC16] text-xs">⚡</span>
                        <span className="text-white text-xs font-semibold">{slide.availableCourts}</span>
                      </div>

                      {/* Bottom info */}
                      <div className="absolute bottom-4 left-4 z-10">
                        <span className="text-[10px] uppercase tracking-wider bg-[#16A34A]/90 backdrop-blur-md px-2 py-0.5 rounded font-bold text-white">
                          {slide.badge}
                        </span>
                        <p className="text-lg font-bold mt-1 text-white">{slide.title}</p>
                      </div>
                      <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md flex items-center gap-2 z-10">
                        <span className="text-[#84CC16] font-bold text-xs">★</span>
                        <span className="text-white text-xs font-medium">{slide.rating}</span>
                        <span className="text-slate-400 text-[11px]">{slide.reviews}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Prev / Next */}
                <button
                  type="button"
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition z-20"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition z-20"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
                  {heroSlides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        currentSlide === idx ? 'w-6 bg-[#16A34A]' : 'w-2 bg-white/70 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Value Props + Search Card */}
            <div className="col-span-12 lg:col-span-5 flex flex-col space-y-5">
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-green-100 text-[#16A34A]">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                <span className="text-xs uppercase tracking-wider font-extrabold">
                  Mạng lưới Pickleball TP. Thủ Đức Trực Tuyến
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-xs text-slate-700 font-semibold">42 Cụm Sân</span>
              </div>

              {/* Headline */}
              <div className="flex flex-col space-y-2">
                <h1 className="text-[30px] sm:text-[34px] leading-[38px] sm:leading-[42px] text-slate-900 tracking-tight font-black">
                  Đặt sân pickleball gần bạn{' '}
                  <span className="text-[#16A34A]">và bắt đầu chơi ngay</span>
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed pt-1">
                  Giữ chỗ sân tức thì, ghép kèo DUPR cân bằng trình độ, huấn luyện viên chứng chỉ quốc tế và hệ thống 6 slot chuẩn hóa tại TP. Thủ Đức.
                </p>
              </div>

              {/* Search Card */}
              <div className="p-5 rounded-2xl bg-white shadow-xl border border-slate-200 flex flex-col space-y-4">
                <form onSubmit={handleSearchSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Khu vực */}
                    <div className="relative flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition min-h-[48px] border border-slate-200 focus-within:ring-2 focus-within:ring-[#16A34A] focus-within:border-transparent">
                      <div className="flex flex-col min-w-0 pr-2 pointer-events-none">
                        <span className="text-[10px] uppercase text-slate-500 font-bold leading-tight tracking-wider">Khu vực</span>
                        <span className="text-xs text-slate-900 font-bold truncate mt-0.5">{searchLocation}</span>
                      </div>
                      <MapPin className="w-4 h-4 text-[#16A34A] shrink-0 pointer-events-none" />
                      <select
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Chọn khu vực"
                      >
                        <option>Thảo Điền, Hiệp Phú</option>
                        <option>Thảo Điền, An Khánh</option>
                        <option>An Phú, Bình Trưng Đông</option>
                        <option>Linh Chiểu, Hiệp Phú</option>
                        <option>Tăng Nhơn Phú, Long Thạnh Mỹ</option>
                        <option>Toàn TP. Thủ Đức</option>
                      </select>
                    </div>

                    {/* Ngày chơi */}
                    <div className="relative flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition min-h-[48px] border border-slate-200 focus-within:ring-2 focus-within:ring-[#16A34A] focus-within:border-transparent">
                      <div className="flex flex-col min-w-0 pr-2 pointer-events-none">
                        <span className="text-[10px] uppercase text-slate-500 font-bold leading-tight tracking-wider">Ngày chơi</span>
                        <span className="text-xs text-slate-900 font-bold truncate mt-0.5">{searchDate}</span>
                      </div>
                      <Calendar className="w-4 h-4 text-slate-500 shrink-0 pointer-events-none" />
                      <select
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Chọn ngày"
                      >
                        <option>Hôm nay, 14/10</option>
                        <option>Ngày mai, 15/10</option>
                        <option>Thứ Năm, 16/10</option>
                        <option>Thứ Sáu, 17/10</option>
                        <option>Thứ Bảy, 18/10</option>
                        <option>Chủ Nhật, 19/10</option>
                      </select>
                    </div>

                    {/* Khung giờ */}
                    <div className="relative flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition min-h-[48px] border border-slate-200 focus-within:ring-2 focus-within:ring-[#16A34A] focus-within:border-transparent">
                      <div className="flex flex-col min-w-0 pr-2 pointer-events-none">
                        <span className="text-[10px] uppercase text-slate-500 font-bold leading-tight tracking-wider">Khung giờ</span>
                        <span className="text-xs text-slate-900 font-bold truncate mt-0.5">{searchSlot}</span>
                      </div>
                      <Clock className="w-4 h-4 text-slate-500 shrink-0 pointer-events-none" />
                      <select
                        value={searchSlot}
                        onChange={(e) => setSearchSlot(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Chọn slot"
                      >
                        <option>12:30 - 14:00 (Slot 1)</option>
                        <option>14:00 - 15:30 (Slot 2)</option>
                        <option>15:30 - 17:00 (Slot 3)</option>
                        <option>17:00 - 18:30 (Slot 4)</option>
                        <option>18:30 - 20:00 (Slot 5)</option>
                        <option>20:00 - 21:30 (Slot 6)</option>
                      </select>
                    </div>

                    {/* Thể thức */}
                    <div className="relative flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition min-h-[48px] border border-slate-200 focus-within:ring-2 focus-within:ring-[#16A34A] focus-within:border-transparent">
                      <div className="flex flex-col min-w-0 pr-2 pointer-events-none">
                        <span className="text-[10px] uppercase text-slate-500 font-bold leading-tight tracking-wider">Thể thức</span>
                        <span className="text-xs text-slate-900 font-bold truncate mt-0.5">{searchFormat}</span>
                      </div>
                      <Users className="w-4 h-4 text-slate-500 shrink-0 pointer-events-none" />
                      <select
                        value={searchFormat}
                        onChange={(e) => setSearchFormat(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Chọn thể thức"
                      >
                        <option>Đánh Đôi (4 người)</option>
                        <option>Đánh Đơn (2 người)</option>
                        <option>Ghép Kèo DUPR</option>
                        <option>Huấn Luyện 1-1</option>
                      </select>
                    </div>
                  </div>

                  {/* Search button */}
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="h-12 w-full px-6 rounded-xl bg-[#16A34A] hover:bg-green-700 active:scale-[0.99] text-white font-extrabold text-sm inline-flex items-center justify-center gap-2 shadow-lg shadow-green-600/30 transition-all disabled:opacity-80"
                  >
                    {isSearching ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Đang tìm kiếm cụm sân...</span>
                      </>
                    ) : (
                      <>
                        <span>Tìm kiếm sân đấu ngay</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Checkmarks */}
              <div className="flex items-center gap-4 text-slate-600 text-xs px-1 flex-wrap">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> Vé QR tức thì
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> Ký quỹ Escrow bảo lãnh
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> Mượn vợt miễn phí
                </span>
              </div>
            </div>
          </section>

          {/* ── 2. COURT RESULTS (ẨN MẶC ĐỊNH, hiện khi search) ── */}
          {showAvailableCourts && (
            <section
              id="danh-muc-san"
              className="flex flex-col space-y-6 scroll-mt-24"
            >
              {/* Header */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-slate-900">12 cụm sân khả dụng</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-[#16A34A] text-xs font-black uppercase tracking-wider">
                      CÓ SẴN HÔM NAY
                    </span>
                  </div>

                  {/* Dynamic filter chips */}
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { icon: <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />, label: `TP. Thủ Đức, ${searchLocation}` },
                      { icon: <Calendar className="w-3.5 h-3.5 text-[#16A34A]" />, label: searchDate },
                      { icon: <Clock className="w-3.5 h-3.5 text-[#16A34A]" />, label: searchSlot },
                      { icon: <Users className="w-3.5 h-3.5 text-[#16A34A]" />, label: searchFormat },
                    ].map((chip, i) => (
                      <div key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                        {chip.icon}
                        <span>{chip.label}</span>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.querySelector('form')
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }}
                      className="text-xs font-bold text-[#16A34A] hover:underline px-2 py-1.5"
                    >
                      Sửa bộ lọc
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAvailableCourts(false)}
                      className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-700 transition"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Thu gọn</span>
                    </button>
                  </div>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2 shrink-0">
                  <label className="text-xs uppercase font-bold text-slate-500">Sắp xếp theo:</label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="h-10 pl-3.5 pr-8 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 appearance-none outline-none focus:ring-2 focus:ring-[#84CC16] cursor-pointer"
                    >
                      <option value="distance">Gần nhất (Khoảng cách)</option>
                      <option value="price">Giá thấp nhất</option>
                      <option value="rating">Đánh giá cao nhất</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { key: 'all', label: 'Tất cả', count: '12' },
                  { key: 'indoor', label: 'Trong nhà máy lạnh' },
                  { key: 'outdoor', label: 'Ngoài trời LED' },
                  { key: 'price', label: 'Giá dưới 150k' },
                  { key: 'rating', label: 'Đánh giá 4.8+' },
                ].map((pill) => (
                  <button
                    key={pill.key}
                    type="button"
                    onClick={() => setSelectedFilter(pill.key as typeof selectedFilter)}
                    className={`h-9 px-4 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                      selectedFilter === pill.key
                        ? 'bg-[#16A34A] text-white shadow-sm font-extrabold'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pill.label}
                    {pill.count && (
                      <span className="ml-1 text-[10px] bg-black/20 px-1.5 rounded-full">{pill.count}</span>
                    )}
                  </button>
                ))}
                <button
                  type="button"
                  className="h-9 px-3.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold inline-flex items-center gap-1.5 shrink-0"
                >
                  <span>Tiện ích</span>
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>

              {/* 6 Court Cards Grid (2 col x 3 row) */}
              <div className="grid grid-cols-12 gap-6">
                {courtsData.map((court) => (
                  <div
                    key={court.id}
                    className="col-span-12 md:col-span-6 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-5"
                  >
                    {/* Thumbnail */}
                    <div className="w-full sm:w-44 shrink-0 relative rounded-xl overflow-hidden bg-slate-100 h-48 sm:h-auto sm:min-h-[190px]">
                      <img
                        src={court.image}
                        alt={court.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#16A34A] text-white text-[10px] font-black uppercase tracking-wider">
                        {court.badge}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col justify-between flex-1 min-w-0 space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-green-50 text-[#16A34A] text-xs font-bold">{court.typeTag}</span>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-base font-black text-[#16A34A]">{court.price}</span>
                            <span className="text-[10px] text-slate-500 uppercase font-semibold">/giờ</span>
                          </div>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 truncate">{court.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                            ★ {court.rating} <span className="font-normal text-slate-400">({court.reviewsCount})</span>
                          </span>
                          <span>•</span>
                          <span>{court.distance}</span>
                          <span>•</span>
                          <span>{court.courtsCount}</span>
                        </div>

                        {/* Slots */}
                        <div className="pt-1">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                            Ca Slot Khả Dụng
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {court.slots.map((slot, si) =>
                              slot.available ? (
                                <button
                                  key={si}
                                  type="button"
                                  onClick={() => navigate('/matches/detail')}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                    slot.isPeak
                                      ? 'bg-[#16A34A] text-white shadow-sm'
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                                  }`}
                                >
                                  {slot.time}
                                </button>
                              ) : (
                                <span
                                  key={si}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100/60 text-slate-400 text-xs line-through cursor-not-allowed"
                                >
                                  {slot.time}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => navigate('/coaches')}
                          className="text-xs text-[#16A34A] hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>HLV & Khóa học</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/matches/detail')}
                          className="h-9 px-4 rounded-xl bg-[#16A34A] hover:bg-green-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                        >
                          Đặt sân ngay
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load more */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/venues')}
                  className="h-11 px-8 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 text-sm font-bold shadow-sm inline-flex items-center gap-2 transition cursor-pointer"
                >
                  <span>Xem thêm cụm sân tại TP. Thủ Đức</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Helper banner */}
              <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#16A34A] shrink-0">
                    <Search className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">Không tìm thấy khung giờ hoặc sân đấu phù hợp quanh bạn?</span>
                    <span className="text-xs text-slate-500">Thử mở rộng bán kính tìm kiếm sang các phường lân cận tại Thủ Đức hoặc đổi ca Slot.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFilter('all')}
                  className="h-9 px-4 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 text-xs font-bold transition shrink-0 cursor-pointer"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            </section>
          )}

          {/* ── 3. GIÁ TRỊ CỐT LÕI ── */}
          <section className="flex flex-col space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-[#16A34A] text-xs font-bold uppercase tracking-wider">
                <Star className="w-3.5 h-3.5" /> 3 Giá Trị Vượt Trội Của FITLYO
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Giải Quyết Triệt Để Mọi Nỗi Đau Khi Chơi Pickleball
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Target className="w-7 h-7" />,
                  title: 'Ghép Kèo DUPR Chuẩn Quốc Tế',
                  desc: 'Không lo lệch trình. Thuật toán ghép trận lọc ±0.25 điểm DUPR, đảm bảo mọi trận đấu cân bằng và hấp dẫn.',
                  color: 'bg-green-100 text-[#16A34A]',
                },
                {
                  icon: <Clock className="w-7 h-7" />,
                  title: 'Ma Trận 6 Slot 90 Phút Cố Định',
                  desc: 'Khung giờ chuẩn hóa từ 12:30 đến 21:30. Tối ưu Giờ Vàng 18:30-20:00. Đặt trước lên đến 14 ngày.',
                  color: 'bg-orange-100 text-orange-600',
                },
                {
                  icon: <ShieldCheck className="w-7 h-7" />,
                  title: 'Ký Quỹ Escrow Bảo Lãnh Cọc',
                  desc: 'Bảo lãnh tiền cọc 100%. Bùng kèo phạt 100% cọc. Hoàn tiền tự động khi hủy sân do thời tiết.',
                  color: 'bg-blue-100 text-blue-600',
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm hover:shadow-md hover:border-[#16A34A]/40 transition-all"
                >
                  <div className={`w-14 h-14 rounded-2xl ${card.color} flex items-center justify-center`}>
                    {card.icon}
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-900">{card.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── 4. COACHES ── */}
          <section id="doi-ngu-hlv" className="flex flex-col space-y-6 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div className="flex flex-col space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <Award className="text-[#16A34A] w-6 h-6" />
                  <h2 className="text-2xl font-black text-slate-900">Huấn Luyện Viên Pickleball Đạt Chuẩn</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-[#16A34A] text-xs font-black uppercase">
                    IPTPA & PPR Certified
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  Đội ngũ HLV được Admin thẩm định bằng cấp, giảng dạy trực tiếp tại TP. Thủ Đức.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/coaches')}
                className="h-10 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold transition flex items-center gap-1.5 shrink-0"
              >
                Xem tất cả HLV
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {coachesData.map((coach) => (
                <div
                  key={coach.id}
                  className="rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-[#16A34A]/40 transition-all overflow-hidden flex flex-col"
                >
                  <div className="relative h-44 sm:h-52 bg-slate-100">
                    <img src={coach.image} alt={coach.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <span className="text-[10px] bg-[#16A34A] text-white px-2 py-0.5 rounded font-bold">
                        {coach.cert}
                      </span>
                      <p className="text-white text-sm font-extrabold mt-0.5">{coach.name}</p>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-semibold">DUPR: <span className="text-[#16A34A] font-black">{coach.dupr}</span></span>
                      <span className="text-xs text-amber-600 font-bold">★ {coach.rating} <span className="text-slate-400 font-normal">({coach.reviewsCount})</span></span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{coach.specialty}</p>
                    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-base font-black text-[#16A34A]">{coach.rate}</span>
                        <span className="text-[10px] text-slate-400 ml-0.5">/buổi</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/coaches')}
                        className="h-8 px-3 rounded-lg bg-[#16A34A] hover:bg-green-700 text-white text-xs font-bold transition cursor-pointer"
                      >
                        Xem hồ sơ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 5. CURRICULUM ── */}
          <section id="giao-trinh-dao-tao" className="flex flex-col space-y-6 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div className="flex flex-col space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="text-[#16A34A] w-6 h-6" />
                  <h2 className="text-2xl font-black text-slate-900">Giáo Trình Đào Tạo Có Cấu Trúc</h2>
                </div>
                <p className="text-sm text-slate-500">
                  DUPR liên kết từng cấp độ bài học, thiết kế để nâng dần kỹ năng từng bước vững chắc.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {curriculumData.map((course) => (
                <div
                  key={course.id}
                  className={`rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-3 ${
                    course.isFeatured ? 'border-[#16A34A] ring-1 ring-[#16A34A]/30' : 'border-slate-200'
                  }`}
                >
                  {course.isFeatured && (
                    <span className="self-start px-2 py-0.5 rounded-full bg-[#84CC16] text-white text-[10px] font-black uppercase tracking-wider">
                      Khuyên dùng
                    </span>
                  )}
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">{course.level}</span>
                    <p className="text-xs text-[#16A34A] font-bold">{course.duprRange}</p>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">{course.title}</h3>
                  <p className="text-xs text-slate-500">{course.sessions}</p>
                  <p className="text-xs text-slate-600 leading-relaxed flex-1">{course.description}</p>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    HLV phụ trách: <span className="font-bold text-slate-700">{course.leadCoach}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-[#16A34A]">{course.price}</span>
                    <button
                      type="button"
                      onClick={() => navigate('/coaches')}
                      className="h-8 px-3 rounded-lg bg-[#16A34A] hover:bg-green-700 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Đăng ký
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 6. PARTNER CTA ── */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-white p-6 sm:p-8 flex flex-col gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-[#16A34A] flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Trở thành Huấn Luyện Viên FITLYO</h3>
                <p className="text-sm text-slate-500 mt-1">Tiếp cận hàng ngàn học viên, quản lý lịch dạy thông minh và tăng thu nhập bền vững.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/auth/register')}
                className="self-start h-10 px-5 rounded-xl bg-[#16A34A] hover:bg-green-700 text-white text-sm font-bold transition inline-flex items-center gap-2"
              >
                ĐĂNG KÝ LÀM HLV
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-6 sm:p-8 flex flex-col gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Đưa Cụm Sân Lên Nền Tảng FITLYO</h3>
                <p className="text-sm text-slate-500 mt-1">Tăng công suất lấp đầy, quản lý ma trận 6 slot chuyên nghiệp và tiếp cận cộng đồng người chơi chất lượng.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/fm/calendar')}
                className="self-start h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition inline-flex items-center gap-2"
              >
                ĐĂNG KÝ CỤM SÂN
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        </main>

        {/* ══════════════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════════════ */}
        <footer className="w-full bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto">
          <div className="px-4 sm:px-8 lg:px-12 pt-16 pb-8">
            <div className="grid grid-cols-12 gap-8 pb-12">
              {/* Col 4: Brand */}
              <div className="col-span-12 md:col-span-4 flex flex-col space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-white tracking-tight">FITLYO</span>
                  <span className="text-xs tracking-widest text-[#84CC16] font-bold px-2 py-0.5 bg-slate-800 rounded">
                    PICKLEBALL
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Nền tảng thể thao Pickleball thông minh đầu tiên tại TP. Thủ Đức. Ghép kèo DUPR cân bằng, đặt sân 6 slot chuẩn hóa, ký quỹ Escrow bảo đảm cọc.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  {[Globe, Share2, Mail].map((Icon, i) => (
                    <button
                      key={i}
                      type="button"
                      className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Col 2: Links */}
              <div className="col-span-6 md:col-span-2 flex flex-col space-y-3">
                <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Nền tảng</h4>
                {['Kèo Đấu DUPR', 'Đặt Sân 6 Slot', 'Huấn Luyện Viên', 'Giáo Trình DUPR'].map((link) => (
                  <button key={link} type="button" className="text-sm text-slate-400 hover:text-white transition text-left">
                    {link}
                  </button>
                ))}
              </div>

              {/* Col 2: Support */}
              <div className="col-span-6 md:col-span-2 flex flex-col space-y-3">
                <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Hỗ trợ</h4>
                {['Về chúng tôi', 'Điều khoản dịch vụ', 'Chính sách Escrow', 'Trung tâm trợ giúp'].map((link) => (
                  <button key={link} type="button" className="text-sm text-slate-400 hover:text-white transition text-left">
                    {link}
                  </button>
                ))}
              </div>

              {/* Col 4: Contact */}
              <div className="col-span-12 md:col-span-4 flex flex-col space-y-4">
                <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Liên hệ & Hỗ trợ</h4>
                {[
                  { icon: <Phone className="w-4 h-4" />, text: '0901 234 567 (8:00 – 22:00)' },
                  { icon: <Mail className="w-4 h-4" />, text: 'hotline@fitlyo.vn' },
                  { icon: <MapPin className="w-4 h-4" />, text: 'TP. Thủ Đức, TP. Hồ Chí Minh' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-slate-400">
                    <span className="text-[#84CC16]">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-600 text-center sm:text-left">
                © 2026 FITLYO. Dự án Khởi nghiệp EXE101 – FPT University.
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <button type="button" className="hover:text-slate-400 transition">Chính sách quyền riêng tư</button>
                <span>•</span>
                <button type="button" className="hover:text-slate-400 transition">Điều khoản</button>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}

export default LandingPage
