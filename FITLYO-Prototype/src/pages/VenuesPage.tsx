import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  MapPin,
  Star,
  Clock,
  Search,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useFitlyoStore } from '@/store/useFitlyoStore'

export const VenuesPage: React.FC = () => {
  const navigate = useNavigate()
  const { venues } = useFitlyoStore()
  const [search, setSearch] = useState('')

  const filteredVenues = venues.filter((v) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      v.name.toLowerCase().includes(q) ||
      v.address.toLowerCase().includes(q) ||
      v.area.toLowerCase().includes(q)
    )
  })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="rounded-xl border hover:bg-muted"
              title="Về Trang Chủ"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Badge variant="default" className="text-xs">
                  SCR_VENUE_01
                </Badge>
                <span className="text-xs font-semibold text-muted-foreground">
                  Pickleball Venues Catalog • TP. Thủ Đức
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Cụm Sân Pickleball Chuẩn Thi Đấu
              </h1>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/matches/detail')}
            className="text-xs font-semibold"
          >
            Xem Kèo Ghép
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm cụm sân tại Thảo Điền, Linh Chiểu, An Phú..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredVenues.map((venue) => (
            <div
              key={venue.id}
              className="group rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  <img
                    src={venue.imageUrl}
                    alt={venue.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-background/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-foreground">
                    {venue.totalCourts} sân tiêu chuẩn
                  </span>
                  <span className="absolute top-3 right-3 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                    <Clock className="w-3 h-3" /> Còn {venue.availableSlotsToday} slot hôm nay
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {venue.name}
                    </h3>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-current" /> {venue.rating} ({venue.reviewCount})
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span>{venue.address}</span>
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {venue.amenities.map((item, idx) => (
                      <span
                        key={idx}
                        className="bg-muted px-2 py-0.5 rounded text-[11px] text-muted-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-border/40 mt-3 pt-3">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Mức giá 6 slot:</span>
                  <span className="font-bold text-xs text-foreground">{venue.priceRange}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate('/fm/calendar')}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <span>Xem 6 Slot Trống</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VenuesPage
