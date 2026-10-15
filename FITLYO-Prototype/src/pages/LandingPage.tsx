import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Phone,
  Star,
  Target,
  TicketCheck,
  Users,
  WalletCards,
  X,
  Zap,
} from 'lucide-react'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { Button } from '@/components/ui/button'
import { roleHome, useAuthStore } from '@/store/useAuthStore'

type VenueFilter = 'all' | 'indoor' | 'outdoor' | 'price' | 'rating'

const heroSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1400&auto=format&fit=crop',
    title: 'D-Pickleball Thảo Điền',
    area: 'Thảo Điền · TP. Thủ Đức',
    availability: '16 sân trống tối nay',
    rating: '4.95',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1400&auto=format&fit=crop',
    title: 'Saigon Rackets Hiệp Phú',
    area: 'Hiệp Phú · TP. Thủ Đức',
    availability: '10 sân trống tối nay',
    rating: '4.85',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1400&auto=format&fit=crop',
    title: 'D-Sports Linh Chiểu',
    area: 'Linh Chiểu · TP. Thủ Đức',
    availability: '8 sân trống hôm nay',
    rating: '4.90',
  },
]

const venues = [
  {
    id: 'd-pickleball-thao-dien',
    name: 'D-Pickleball Thảo Điền',
    area: 'Thảo Điền',
    type: 'Trong nhà máy lạnh',
    indoor: true,
    price: 180000,
    rating: 4.95,
    reviews: 142,
    distance: 0.8,
    courts: '4 sân tiêu chuẩn',
    image: heroSlides[0].image,
    slots: ['17:00', '18:30', '20:00'],
  },
  {
    id: 'saigon-rackets-hiep-phu',
    name: 'Saigon Rackets Hiệp Phú',
    area: 'Hiệp Phú',
    type: 'Ngoài trời LED',
    indoor: false,
    price: 140000,
    rating: 4.9,
    reviews: 98,
    distance: 2.1,
    courts: '6 sân thi đấu',
    image: heroSlides[1].image,
    slots: ['15:30', '17:00', '18:30'],
  },
  {
    id: 'd-sports-linh-chieu',
    name: 'D-Sports Pickleball Linh Chiểu',
    area: 'Linh Chiểu',
    type: 'Trong nhà premium',
    indoor: true,
    price: 200000,
    rating: 4.9,
    reviews: 175,
    distance: 1.2,
    courts: '8 sân chuyên nghiệp',
    image: heroSlides[2].image,
    slots: ['17:00', '18:30', '20:00'],
  },
  {
    id: 'thu-thiem-sports-hub',
    name: 'Thủ Thiêm Sports Hub',
    area: 'An Phú',
    type: 'Ngoài trời LED',
    indoor: false,
    price: 150000,
    rating: 4.85,
    reviews: 85,
    distance: 1.9,
    courts: '6 sân tiêu chuẩn',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop',
    slots: ['14:00', '17:00', '20:00'],
  },
  {
    id: 'an-khanh-pickleball-club',
    name: 'An Khánh Pickleball Club',
    area: 'An Khánh',
    type: 'Trong nhà máy lạnh',
    indoor: true,
    price: 160000,
    rating: 4.8,
    reviews: 210,
    distance: 3.4,
    courts: '4 sân có mái che',
    image: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=1200&auto=format&fit=crop',
    slots: ['15:30', '18:30', '20:00'],
  },
  {
    id: 'an-phu-racket-club',
    name: 'An Phú Racket Club',
    area: 'An Phú',
    type: 'Mái che ngoài trời',
    indoor: false,
    price: 135000,
    rating: 4.75,
    reviews: 64,
    distance: 2.8,
    courts: '4 sân cộng đồng',
    image: 'https://images.unsplash.com/photo-1544919982-b61976f0ba43?w=1200&auto=format&fit=crop',
    slots: ['12:30', '17:00', '19:00'],
  },
]

const coaches = [
  {
    name: 'HLV Lê Hoàng Dũng',
    certificate: 'IPTPA Level 2',
    dupr: '4.80',
    rating: '4.95',
    specialty: 'Dinking nâng cao · Chiến thuật đôi',
    rate: '400.000đ',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=700&auto=format&fit=crop',
  },
  {
    name: 'Đặng Thảo Linh',
    certificate: 'PPR Coach',
    dupr: '4.60',
    rating: '4.90',
    specialty: 'Kitchen speed-up · Phản xạ trên lưới',
    rate: '350.000đ',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=700&auto=format&fit=crop',
  },
  {
    name: 'Lê Tuấn Khang',
    certificate: 'IPTPA Master',
    dupr: '5.15',
    rating: '4.95',
    specialty: 'Chiến thuật giải đấu · Chuẩn hóa DUPR',
    rate: '500.000đ',
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=700&auto=format&fit=crop',
  },
  {
    name: 'Nguyễn Bảo Ngọc',
    certificate: 'PPR Coach',
    dupr: '4.40',
    rating: '4.85',
    specialty: 'Bộ chân · Nền tảng cho người mới',
    rate: '320.000đ',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=700&auto=format&fit=crop',
  },
]

const courses = [
  {
    level: 'Cấp độ 101',
    range: 'Từ số 0 đến DUPR 2.5',
    title: 'Nền tảng nhập môn',
    sessions: '6 buổi · 90 phút/buổi',
    description: 'Luật thi đấu, cầm vợt, giao bóng sâu và dinking cơ bản.',
    price: '1.800.000đ',
  },
  {
    level: 'Cấp độ 201',
    range: 'DUPR 2.5–3.5',
    title: 'Chiến thuật trung cấp',
    sessions: '8 buổi · 90 phút/buổi',
    description: 'Third-shot drop, reset trước lưới, stacking và chuyển hướng bóng.',
    price: '2.500.000đ',
    featured: true,
  },
  {
    level: 'Cấp độ 301',
    range: 'DUPR 3.5–4.5+',
    title: 'Thi đấu nâng cao',
    sessions: '10 buổi · 120 phút/buổi',
    description: 'Erne, ATP, phản công tốc độ cao và phân tích video.',
    price: '3.600.000đ',
  },
  {
    level: 'Lớp trẻ em',
    range: 'Độ tuổi 7–15',
    title: 'Học viện Junior',
    sessions: '8 buổi · 60 phút/buổi',
    description: 'Phối hợp mắt tay, bộ chân và tinh thần thể thao fair-play.',
    price: '1.600.000đ',
  },
]

const valueCards = [
  {
    icon: Target,
    eyebrow: 'Cân bằng',
    title: 'Ghép kèo đúng trình',
    description: 'DUPR được dùng làm lớp lọc cốt lõi để mỗi trận đủ cạnh tranh nhưng vẫn thoải mái.',
    tone: 'bg-secondary text-secondary-foreground',
  },
  {
    icon: WalletCards,
    eyebrow: 'Minh bạch',
    title: 'Cọc được bảo vệ',
    description: 'Chi phí, chính sách hoàn cọc và trạng thái thanh toán luôn rõ ràng trước khi xác nhận.',
    tone: 'bg-accent text-accent-foreground',
  },
  {
    icon: TicketCheck,
    eyebrow: 'Liền mạch',
    title: 'Một vé cho cả hành trình',
    description: 'Đặt sân, nhận Dynamic QR, check-in và đánh giá sau trận trong cùng một trải nghiệm.',
    tone: 'bg-primary text-primary-foreground',
  },
]

const formatCurrency = (value: number) => value.toLocaleString('vi-VN') + 'đ'

export function LandingPage() {
  const navigate = useNavigate()
  const session = useAuthStore((state) => state.session)
  const logout = useAuthStore((state) => state.logout)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchLocation, setSearchLocation] = useState('TP. Thủ Đức')
  const [searchDate, setSearchDate] = useState('Hôm nay, 15/10')
  const [searchSlot, setSearchSlot] = useState('18:30–20:00 · Slot 5')
  const [searchFormat, setSearchFormat] = useState('Đánh đôi · 4 người')
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [venueFilter, setVenueFilter] = useState<VenueFilter>('all')
  const [sortBy, setSortBy] = useState('distance')

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % heroSlides.length)
    }, 5000)
    return () => window.clearInterval(intervalId)
  }, [])

  const filteredVenues = useMemo(() => {
    const result = venues.filter((venue) => {
      if (venueFilter === 'indoor') return venue.indoor
      if (venueFilter === 'outdoor') return !venue.indoor
      if (venueFilter === 'price') return venue.price <= 150000
      if (venueFilter === 'rating') return venue.rating >= 4.85
      return true
    })

    return [...result].sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price
      if (sortBy === 'rating') return b.rating - a.rating
      return a.distance - b.distance
    })
  }, [sortBy, venueFilter])

  const scrollTo = (sectionId: string) => {
    setMobileMenuOpen(false)
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const showVenueResults = () => {
    setShowResults(true)
    window.setTimeout(() => scrollTo('san-noi-bat'), 80)
  }

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSearching(true)
    window.setTimeout(() => {
      setIsSearching(false)
      showVenueResults()
    }, 450)
  }

  const nextSlide = () => setCurrentSlide((current) => (current + 1) % heroSlides.length)
  const previousSlide = () => setCurrentSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length)
  const playerDestination = session?.role === 'player' ? '/player/venues' : '/venues'
  const matchDestination = session?.role === 'player' ? '/player/matches' : '/matches/detail'

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-12">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Về đầu trang">
            <BrandLogo className="h-8 w-auto sm:h-9" />
          </button>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Điều hướng chính">
            <button type="button" onClick={showVenueResults} className="rounded-xl px-4 py-2 text-sm font-bold transition hover:bg-secondary/55">
              Khám phá sân
            </button>
            <button type="button" onClick={() => scrollTo('huan-luyen-vien')} className="rounded-xl px-4 py-2 text-sm font-bold transition hover:bg-secondary/55">
              Huấn luyện viên
            </button>
            <button type="button" onClick={() => scrollTo('giao-trinh')} className="rounded-xl px-4 py-2 text-sm font-bold transition hover:bg-secondary/55">
              Giáo trình DUPR
            </button>
            <button type="button" onClick={() => navigate(matchDestination)} className="rounded-xl px-4 py-2 text-sm font-bold transition hover:bg-secondary/55">
              Kèo đấu
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2 text-xs font-bold text-muted-foreground xl:flex">
              <MapPin className="h-4 w-4 text-primary" /> TP. Thủ Đức
            </div>
            <ThemeToggle />
            {session ? (
              <>
                <Button onClick={() => navigate(roleHome[session.role])} className="hidden rounded-xl sm:inline-flex">
                  Vào portal <ArrowRight />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Đăng xuất"
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                >
                  <LogOut />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')} className="hidden sm:inline-flex">Đăng nhập</Button>
                <Button onClick={() => navigate('/auth/register')} className="hidden rounded-xl sm:inline-flex">Tham gia ngay</Button>
              </>
            )}
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card lg:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-border bg-card px-4 py-4 shadow-xl lg:hidden">
            <div className="mx-auto grid max-w-[1320px] gap-1">
              <button type="button" onClick={showVenueResults} className="rounded-xl px-3 py-3 text-left text-sm font-bold hover:bg-muted">Khám phá sân</button>
              <button type="button" onClick={() => scrollTo('huan-luyen-vien')} className="rounded-xl px-3 py-3 text-left text-sm font-bold hover:bg-muted">Huấn luyện viên</button>
              <button type="button" onClick={() => scrollTo('giao-trinh')} className="rounded-xl px-3 py-3 text-left text-sm font-bold hover:bg-muted">Giáo trình DUPR</button>
              <button type="button" onClick={() => navigate(matchDestination)} className="rounded-xl px-3 py-3 text-left text-sm font-bold hover:bg-muted">Kèo đấu</button>
              {!session && (
                <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-3">
                  <Button variant="outline" onClick={() => navigate('/login')}>Đăng nhập</Button>
                  <Button onClick={() => navigate('/auth/register')}>Tham gia ngay</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative isolate overflow-hidden px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12 lg:px-12">
          <div className="absolute -left-36 top-20 -z-10 h-96 w-96 rounded-full bg-secondary/45 blur-3xl" />
          <div className="absolute -right-36 bottom-0 -z-10 h-96 w-96 rounded-full bg-accent/35 blur-3xl" />

          <div className="mx-auto max-w-[1320px]">
            <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-secondary/55 px-3.5 py-2 text-xs font-black uppercase tracking-[0.14em] text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Your Fit. Your Way.
                </div>
                <h1 className="mt-6 text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-[60px]">
                  Ra sân đúng giờ.
                  <span className="mt-2 block text-primary">Gặp đúng người.</span>
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Đặt sân, ghép kèo theo DUPR và học cùng huấn luyện viên đã xác thực — tất cả trong một hành trình rõ ràng, an toàn và đầy hứng thú.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button size="lg" onClick={showVenueResults} className="h-12 rounded-2xl px-6 font-black shadow-xl shadow-primary/15">
                    Tìm sân phù hợp <ArrowRight />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate(matchDestination)} className="h-12 rounded-2xl px-6 font-black">
                    Xem kèo đang mở
                  </Button>
                </div>
                <div className="mt-9 grid max-w-lg grid-cols-3 gap-3">
                  {[
                    ['42+', 'Cụm sân'],
                    ['1.8K', 'Người chơi'],
                    ['4.9/5', 'Đánh giá'],
                  ].map(([value, label]) => (
                    <div key={label} className="border-l-2 border-secondary pl-3">
                      <p className="text-xl font-black text-primary sm:text-2xl">{value}</p>
                      <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground sm:text-xs">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/30 bg-primary shadow-[0_35px_90px_rgba(20,63,66,0.22)]">
                  <div
                    className="flex h-full transition-transform duration-700 ease-out"
                    style={{ transform: 'translateX(-' + currentSlide * 100 + '%)' }}
                  >
                    {heroSlides.map((slide) => (
                      <article key={slide.id} className="relative h-full w-full shrink-0">
                        <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#102E31]/90 via-[#143F42]/10 to-transparent" />
                        <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-[#143F42]/70 px-3 py-2 text-xs font-bold text-white backdrop-blur-md">
                          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#AFF0D3]" />
                          {slide.availability}
                        </div>
                        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 text-white">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/65">{slide.area}</p>
                            <h2 className="mt-1 text-xl font-black sm:text-2xl">{slide.title}</h2>
                          </div>
                          <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-black backdrop-blur-md">
                            <Star className="mr-1 inline h-4 w-4 fill-[#FFB697] text-[#FFB697]" /> {slide.rating}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  <button type="button" onClick={previousSlide} aria-label="Ảnh trước" className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#143F42]/55 text-white backdrop-blur-md transition hover:bg-[#143F42]/80">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button type="button" onClick={nextSlide} aria-label="Ảnh tiếp theo" className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#143F42]/55 text-white backdrop-blur-md transition hover:bg-[#143F42]/80">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                <div className="absolute -bottom-5 -left-3 rounded-2xl border border-primary/10 bg-card/95 p-4 shadow-xl backdrop-blur-xl sm:-left-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground"><Zap className="h-5 w-5" /></div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground">Đặt nhanh hôm nay</p>
                      <p className="text-sm font-black">Còn 34 slot phù hợp</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSearch} className="brand-card relative z-10 mt-16 grid gap-2 rounded-[1.75rem] p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
              {[
                {
                  label: 'Khu vực',
                  icon: MapPin,
                  value: searchLocation,
                  onChange: setSearchLocation,
                  options: ['TP. Thủ Đức', 'Thảo Điền', 'An Phú', 'Hiệp Phú', 'Linh Chiểu'],
                },
                {
                  label: 'Ngày chơi',
                  icon: Calendar,
                  value: searchDate,
                  onChange: setSearchDate,
                  options: ['Hôm nay, 15/10', 'Ngày mai, 16/10', 'Thứ Bảy, 17/10', 'Chủ Nhật, 18/10'],
                },
                {
                  label: 'Khung giờ',
                  icon: Clock,
                  value: searchSlot,
                  onChange: setSearchSlot,
                  options: ['15:30–17:00 · Slot 3', '17:00–18:30 · Slot 4', '18:30–20:00 · Slot 5', '20:00–21:30 · Slot 6'],
                },
                {
                  label: 'Thể thức',
                  icon: Users,
                  value: searchFormat,
                  onChange: setSearchFormat,
                  options: ['Đánh đôi · 4 người', 'Đánh đơn · 2 người', 'Ghép kèo DUPR', 'Huấn luyện 1-1'],
                },
              ].map((field) => {
                const Icon = field.icon
                return (
                  <label key={field.label} className="flex min-w-0 items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-muted/65">
                    <Icon className="h-5 w-5 shrink-0 text-primary" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{field.label}</span>
                      <select value={field.value} onChange={(event) => field.onChange(event.target.value)} className="mt-0.5 w-full appearance-none bg-transparent text-sm font-black outline-none">
                        {field.options.map((option) => <option key={option}>{option}</option>)}
                      </select>
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </label>
                )
              })}
              <Button type="submit" disabled={isSearching} className="min-h-13 rounded-2xl bg-accent px-6 font-black text-accent-foreground hover:bg-accent/90">
                {isSearching ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <ArrowRight />}
                {isSearching ? 'Đang tìm...' : 'Tìm sân'}
              </Button>
            </form>

            <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-bold text-muted-foreground">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Vé QR tức thì</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Ký quỹ an toàn</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Lịch 6 slot rõ ràng</span>
            </div>
          </div>
        </section>

        {showResults && (
          <section id="san-noi-bat" className="scroll-mt-24 border-y border-border/70 bg-card/55 px-4 py-16 sm:px-6 lg:px-12">
            <div className="mx-auto max-w-[1320px]">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Kết quả theo lựa chọn của bạn</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{filteredVenues.length} cụm sân sẵn sàng</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{searchLocation} · {searchDate} · {searchSlot}</p>
                </div>
                <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold">
                  Sắp xếp
                  <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="bg-transparent font-black outline-none">
                    <option value="distance">Gần nhất</option>
                    <option value="price">Giá thấp nhất</option>
                    <option value="rating">Đánh giá cao nhất</option>
                  </select>
                </label>
              </div>

              <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
                {[
                  ['all', 'Tất cả'],
                  ['indoor', 'Trong nhà'],
                  ['outdoor', 'Ngoài trời'],
                  ['price', 'Dưới 150.000đ'],
                  ['rating', 'Đánh giá 4.85+'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setVenueFilter(key as VenueFilter)}
                    className={'shrink-0 rounded-full px-4 py-2 text-xs font-black transition ' + (venueFilter === key ? 'bg-primary text-primary-foreground' : 'border border-border bg-background text-muted-foreground hover:text-foreground')}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredVenues.map((venue) => (
                  <article key={venue.id} className="group overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative h-48 overflow-hidden">
                      <img src={venue.image} alt={venue.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#143F42]/70 to-transparent" />
                      <span className="absolute left-4 top-4 rounded-full bg-secondary px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-secondary-foreground">{venue.type}</span>
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                        <div><p className="text-xs text-white/70">{venue.area}</p><h3 className="mt-1 text-lg font-black">{venue.name}</h3></div>
                        <span className="rounded-xl bg-white/15 px-2.5 py-1.5 text-xs font-black backdrop-blur-md"><Star className="mr-1 inline h-3.5 w-3.5 fill-[#FFB697] text-[#FFB697]" />{venue.rating}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{venue.distance} km · {venue.courts}</span>
                        <span>{venue.reviews} đánh giá</span>
                      </div>
                      <div className="mt-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Slot khả dụng</p>
                        <div className="mt-2 flex gap-2">
                          {venue.slots.map((slot, index) => (
                            <button key={slot} type="button" onClick={() => navigate(playerDestination)} className={'rounded-lg px-2.5 py-1.5 text-xs font-black ' + (index === 1 ? 'bg-accent text-accent-foreground' : 'bg-muted text-foreground')}>
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                        <div><strong className="text-lg text-primary">{formatCurrency(venue.price)}</strong><span className="text-xs text-muted-foreground"> / giờ</span></div>
                        <Button size="sm" onClick={() => navigate(playerDestination)}>Xem sân <ArrowUpRight /></Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="px-4 py-20 sm:px-6 lg:px-12">
          <div className="mx-auto max-w-[1320px]">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Được thiết kế cho nhịp chơi thật</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Ít thao tác hơn. Nhiều thời gian trên sân hơn.</h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {valueCards.map((card) => {
                const Icon = card.icon
                return (
                  <article key={card.title} className="brand-card rounded-[1.6rem] p-6 sm:p-7">
                    <div className={'flex h-13 w-13 items-center justify-center rounded-2xl ' + card.tone}><Icon className="h-6 w-6" /></div>
                    <p className="mt-6 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">{card.eyebrow}</p>
                    <h3 className="mt-1 text-xl font-black">{card.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.description}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section id="huan-luyen-vien" className="scroll-mt-24 bg-secondary/28 px-4 py-20 sm:px-6 lg:px-12">
          <div className="mx-auto max-w-[1320px]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary"><Award className="h-4 w-4" /> Coach đã xác thực</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Học đúng kỹ thuật, tiến bộ có lộ trình.</h2>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Hồ sơ, chứng chỉ và lịch dạy đều được kiểm tra trước khi xuất hiện trên FITLYO.</p>
              </div>
              <Button variant="outline" onClick={() => navigate('/coaches')}>Xem tất cả Coach <ArrowRight /></Button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {coaches.map((coach) => (
                <article key={coach.name} className="group overflow-hidden rounded-[1.5rem] border border-border bg-card">
                  <div className="relative h-60 overflow-hidden">
                    <img src={coach.image} alt={coach.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#143F42]/85 via-transparent to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full bg-secondary px-3 py-1.5 text-[10px] font-black text-secondary-foreground">{coach.certificate}</span>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="font-black">{coach.name}</h3>
                      <p className="mt-1 text-xs text-white/70">DUPR {coach.dupr} · ★ {coach.rating}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="min-h-10 text-xs leading-5 text-muted-foreground">{coach.specialty}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <strong className="text-sm text-primary">{coach.rate}<span className="font-normal text-muted-foreground"> / buổi</span></strong>
                      <button type="button" onClick={() => navigate('/coaches')} className="text-xs font-black text-primary hover:underline">Xem hồ sơ</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="giao-trinh" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-12">
          <div className="brand-gradient mx-auto max-w-[1320px] overflow-hidden rounded-[2rem] px-5 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
            <div className="max-w-2xl">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#AFF0D3]"><BookOpen className="h-4 w-4" /> Giáo trình theo DUPR</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Biết mình đang ở đâu và bước tiếp theo là gì.</h2>
              <p className="mt-4 text-sm leading-6 text-white/65">Mỗi khóa học gắn với mục tiêu kỹ thuật cụ thể, lịch học rõ ràng và Coach phụ trách xuyên suốt.</p>
            </div>

            <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {courses.map((course) => (
                <article key={course.level} className={'relative rounded-[1.4rem] border p-5 backdrop-blur-sm ' + (course.featured ? 'border-[#AFF0D3] bg-[#AFF0D3] text-[#143F42]' : 'border-white/15 bg-white/8 text-white')}>
                  {course.featured && <span className="absolute right-4 top-4 rounded-full bg-[#143F42] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#AFF0D3]">Khuyên dùng</span>}
                  <p className={'text-[10px] font-black uppercase tracking-[0.16em] ' + (course.featured ? 'text-[#143F42]/60' : 'text-white/55')}>{course.level}</p>
                  <p className="mt-2 text-xs font-black">{course.range}</p>
                  <h3 className="mt-5 text-lg font-black">{course.title}</h3>
                  <p className={'mt-1 text-xs ' + (course.featured ? 'text-[#143F42]/65' : 'text-white/55')}>{course.sessions}</p>
                  <p className={'mt-4 min-h-18 text-xs leading-5 ' + (course.featured ? 'text-[#143F42]/75' : 'text-white/65')}>{course.description}</p>
                  <div className={'mt-5 flex items-center justify-between border-t pt-4 ' + (course.featured ? 'border-[#143F42]/15' : 'border-white/10')}>
                    <strong className="text-sm">{course.price}</strong>
                    <button type="button" onClick={() => navigate('/coaches')} className="text-xs font-black underline underline-offset-4">Đăng ký</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-12">
          <div className="mx-auto grid max-w-[1320px] gap-5 md:grid-cols-2">
            <article className="relative overflow-hidden rounded-[1.75rem] border border-primary/10 bg-secondary p-7 text-secondary-foreground sm:p-9">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border-[24px] border-white/20" />
              <GraduationCap className="h-8 w-8" />
              <h2 className="mt-8 text-2xl font-black">Bạn là Coach chuyên nghiệp?</h2>
              <p className="mt-2 max-w-md text-sm leading-6 opacity-70">Quản lý lịch dạy, khóa học và thu nhập trong một portal được thiết kế riêng cho Coach.</p>
              <Button onClick={() => navigate('/auth/register')} className="mt-6">Đăng ký làm Coach <ArrowRight /></Button>
            </article>
            <article className="relative overflow-hidden rounded-[1.75rem] border border-primary/10 bg-accent p-7 text-accent-foreground sm:p-9">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border-[24px] border-white/20" />
              <Building2 className="h-8 w-8" />
              <h2 className="mt-8 text-2xl font-black">Bạn đang vận hành cụm sân?</h2>
              <p className="mt-2 max-w-md text-sm leading-6 opacity-70">Tối ưu công suất 6 slot, check-in QR và doanh thu bằng portal Field Manager.</p>
              <Button onClick={() => navigate('/auth/register')} className="mt-6">Đưa sân lên FITLYO <ArrowRight /></Button>
            </article>
          </div>
        </section>
      </main>

      <footer className="bg-[#0E3033] px-4 py-12 text-white sm:px-6 lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
            <div>
              <BrandLogo tone="white" className="h-9 w-auto" />
              <p className="mt-5 max-w-sm text-sm leading-6 text-white/55">Nền tảng Pickleball giúp mỗi người tìm đúng sân, đúng bạn chơi và đúng lộ trình phát triển.</p>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.18em] text-[#AFF0D3]">Khám phá</h3>
              <div className="mt-4 grid gap-3 text-sm text-white/60">
                <button type="button" onClick={showVenueResults} className="text-left hover:text-white">Cụm sân</button>
                <button type="button" onClick={() => navigate(matchDestination)} className="text-left hover:text-white">Kèo đấu DUPR</button>
                <button type="button" onClick={() => navigate('/coaches')} className="text-left hover:text-white">Huấn luyện viên</button>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.18em] text-[#AFF0D3]">Hỗ trợ</h3>
              <div className="mt-4 grid gap-3 text-sm text-white/60">
                <span>Điều khoản dịch vụ</span>
                <span>Chính sách ký quỹ</span>
                <span>Trung tâm trợ giúp</span>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.18em] text-[#AFF0D3]">Liên hệ</h3>
              <div className="mt-4 grid gap-3 text-sm text-white/60">
                <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#FFB697]" /> 0901 234 567</span>
                <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#FFB697]" /> hello@fitlyo.vn</span>
                <span className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-[#FFB697]" /> TP. Thủ Đức, TP.HCM</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 FITLYO. Your Fit. Your Way.</p>
            <p>EXE101 · FPT University</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
