import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Award,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Trophy,
  Target,
  Zap,
  HelpCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { PublicAuthHeader } from '@/components/auth/PublicAuthHeader'

interface Question {
  id: number
  title: string
  subtitle: string
  options: {
    label: string
    text: string
    desc: string
    score: number
  }[]
}

const quizQuestions: Question[] = [
  {
    id: 1,
    title: 'BẠN ĐÃ CÓ KINH NGHIỆM CHƠI CÁC MÔN THỂ THAO VỢT NÀO TRƯỚC ĐÂY?',
    subtitle: 'Kinh nghiệm thể thao vợt bổ trợ rất lớn cho phản xạ và cảm giác bóng Pickleball.',
    options: [
      {
        label: 'A',
        text: 'Chưa từng chơi môn thể thao dùng vợt nào',
        desc: 'Hoàn toàn mới nhập môn thể thao vận động (DUPR 1.5 - 2.0)',
        score: 1.75,
      },
      {
        label: 'B',
        text: 'Có chơi Cầu lông hoặc Bóng bàn phong trào',
        desc: 'Cổ tay linh hoạt, phản xạ nhanh, cảm giác mặt vợt tốt (DUPR 2.25 - 2.5)',
        score: 2.25,
      },
      {
        label: 'C',
        text: 'Từng chơi Tennis từ 1 - 3 năm',
        desc: 'Lực tay tốt, bộ chân vững, quen với bóng nảy mặt sân cứng (DUPR 2.75 - 3.0)',
        score: 2.75,
      },
      {
        label: 'D',
        text: 'Chơi Tennis / Cầu lông bán chuyên nghiệp hoặc thi đấu giải',
        desc: 'Nắm vững chiến thuật tấn công, thể lực và bộ chân hoàn hảo (DUPR 3.25+)',
        score: 3.25,
      },
    ],
  },
  {
    id: 2,
    title: 'BẠN KIỂM SOÁT KỸ THUẬT "DINKING TRÊN LƯỚI" NHƯ THẾ NÀO?',
    subtitle: 'Dinking là kỹ thuật cốt lõi quyết định 70% các pha bóng giằng co tại Kitchen Zone.',
    options: [
      {
        label: 'A',
        text: 'Chưa hiểu rõ khái niệm Dinking, thường đánh bóng bổng lên cao',
        desc: 'Trình độ Newbie: Dễ bị đối thủ đập bóng trên lưới (DUPR 1.75)',
        score: 1.75,
      },
      {
        label: 'B',
        text: 'Có thể giữ bóng dink qua lại 3 - 5 nhịp, thỉnh thoảng lỗi chạm lưới',
        desc: 'Trình độ Cơ bản: Bắt đầu làm chủ quỹ đạo bóng thấp (DUPR 2.50)',
        score: 2.5,
      },
      {
        label: 'C',
        text: 'Kiểm soát điểm rơi tốt, đổi hướng bóng và dink chéo sân theo ý muốn',
        desc: 'Trình độ Trung cấp: Kiên nhẫn chờ thời cơ đối thủ hớ hênh (DUPR 3.00)',
        score: 3.0,
      },
      {
        label: 'D',
        text: 'Đấu lưới nhịp độ cao (Hands battle), thành thạo tấn công Volley và Speed-up',
        desc: 'Trình độ Nâng cao: Khả năng phản xạ và dập bóng chớp nhoáng (DUPR 3.50+)',
        score: 3.5,
      },
    ],
  },
  {
    id: 3,
    title: 'KỸ THUẬT GIAO BÓNG VÀ TRẢ GIAO BÓNG (SERVE & RETURN) CỦA BẠN?',
    subtitle: 'Cú trả giao bóng sâu cuối sân giúp đội giao bóng khó lên lưới chiếm ưu thế.',
    options: [
      {
        label: 'A',
        text: 'Giao bóng còn hay hỏng, bóng thường rơi ngắn giữa sân',
        desc: 'Chưa kiểm soát được độ xoáy và điểm rơi cuối sân (DUPR 2.0)',
        score: 2.0,
      },
      {
        label: 'B',
        text: 'Giao bóng vào sân ổn định, trả bóng an toàn qua lưới',
        desc: 'Đảm bảo bóng trong cuộc nhưng chưa có nhiều tính tấn công (DUPR 2.5)',
        score: 2.5,
      },
      {
        label: 'C',
        text: 'Giao bóng sâu có độ xoáy, trả bóng cắm sâu vào góc yếu của đối thủ',
        desc: 'Tạo lợi thế ngay từ quả bóng thứ 2 để đồng đội tiến lên lưới (DUPR 3.0)',
        score: 3.0,
      },
      {
        label: 'D',
        text: 'Giao bóng uy lực nhiều biến hóa, trả bóng sâu hiểm hóc kiểm soát thế trận',
        desc: 'Khai thác tối đa điểm yếu của đối thủ bằng độ xoáy và lực (DUPR 3.5+)',
        score: 3.5,
      },
    ],
  },
  {
    id: 4,
    title: 'BẠN THỰC HIỆN CÚ ĐÁNH THỨ 3 (THIRD SHOT DROP) NHƯ THẾ NÀO?',
    subtitle: 'Thả bóng nhẹ rơi vào ô Kitchen giúp hai người cuối sân an toàn tiến lên lưới.',
    options: [
      {
        label: 'A',
        text: 'Chưa biết Third Shot Drop, thường chỉ đánh bóng bạt (Drive) hết lực',
        desc: 'Thường bị đối thủ đứng lưới bắt bài vỗ bóng ăn điểm (DUPR 2.0)',
        score: 2.0,
      },
      {
        label: 'B',
        text: 'Đã tập nhưng tỷ lệ thành công khoảng 30 - 40%, bóng hay rúc lưới',
        desc: 'Đang trong quá trình hoàn thiện cảm giác thả bóng mềm (DUPR 2.5)',
        score: 2.5,
      },
      {
        label: 'C',
        text: 'Thực hiện ổn định >60%, linh hoạt chọn giữa Drop thả chậm hoặc Drive bất ngờ',
        desc: 'Hiểu rõ khi nào cần thả bóng để reset thế trận và tiến lên lưới (DUPR 3.0)',
        score: 3.0,
      },
      {
        label: 'D',
        text: 'Thuần thục Drop từ mọi vị trí khó, phối hợp hoàn hảo với đồng đội',
        desc: 'Làm chủ nhịp độ trận đấu, di chuyển lên lưới chiếm lĩnh Kitchen (DUPR 3.5+)',
        score: 3.5,
      },
    ],
  },
  {
    id: 5,
    title: 'HIỂU BIẾT LUẬT KHU VỰC KITCHEN & CHIẾN THUẬT DI CHUYỂN ĐÔI?',
    subtitle: 'Non-Volley Zone (Kitchen) là luật đặc trưng quan trọng nhất của Pickleball.',
    options: [
      {
        label: 'A',
        text: 'Thỉnh thoảng vẫn vô tình dẫm vạch Kitchen khi bắt Volley trên không',
        desc: 'Cần thêm thời gian làm quen với kỷ luật bộ chân (DUPR 2.0)',
        score: 2.0,
      },
      {
        label: 'B',
        text: 'Nắm vững luật Kitchen, nhưng chưa ăn ý khi di chuyển che chắn với đồng đội',
        desc: 'Đứng đúng vị trí nhưng thỉnh thoảng tranh bóng hoặc để hở giữa sân (DUPR 2.5)',
        score: 2.5,
      },
      {
        label: 'C',
        text: 'Di chuyển đồng bộ như "nối sợi dây", bọc lót góc sân và gọi bóng rõ ràng',
        desc: 'Biết chia khoảng sân, bọc lót bóng lốp và giữ vững vạch Kitchen (DUPR 3.0)',
        score: 3.0,
      },
      {
        label: 'D',
        text: 'Thành thạo kỹ thuật Stacking, Erne poaching và chiến thuật giải đấu',
        desc: 'Tối ưu tay thuận của cả 2 VĐV và làm chủ không gian lưới (DUPR 3.5+)',
        score: 3.5,
      },
    ],
  },
]

export function SCR_AUTH_04() {
  const navigate = useNavigate()
  const { setDuprRating, setLoggedIn, updateUserProfile, showToast } = useFitlyoStore()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({
    0: 1, // Default option B
  })

  // Quick Seed Selector Modal or Tab
  const [activeTab, setActiveTab] = useState<'survey' | 'quick_seed' | 'has_dupr_id'>('survey')
  const [quickSeedValue, setQuickSeedValue] = useState<number>(2.5)
  const [duprIdInput, setDuprIdInput] = useState('')

  // Completion State
  const [isCompleted, setIsCompleted] = useState(false)
  const [finalDuprScore, setFinalDuprScore] = useState<number>(2.5)

  const currentQ = quizQuestions[currentQuestionIndex]
  const progressPercent = Math.round(((currentQuestionIndex + 1) / quizQuestions.length) * 100)

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }))
  }

  const handleNext = () => {
    if (selectedAnswers[currentQuestionIndex] === undefined) {
      handleSelectOption(1) // default to option B
    }

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      // Calculate average score
      calculateAndFinishSurvey()
    }
  }

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const calculateAndFinishSurvey = () => {
    let total = 0
    let count = 0
    quizQuestions.forEach((q, idx) => {
      const selectedOptionIdx = selectedAnswers[idx] ?? 1
      total += q.options[selectedOptionIdx].score
      count += 1
    })
    const rawAvg = total / count
    // Round to standard 2 decimal places (e.g. 2.25, 2.50, 2.75, 3.00)
    const rounded = Math.round(rawAvg * 4) / 4
    const finalScore = Number(rounded.toFixed(2))

    setFinalDuprScore(finalScore)
    setIsCompleted(true)

    // Save to user profile & store
    setDuprRating(finalScore)
    setLoggedIn(true)
    updateUserProfile({
      duprRating: finalScore,
      reputationScore: 100,
    })
  }

  const handleApplyQuickSeed = (seed: number) => {
    setFinalDuprScore(seed)
    setIsCompleted(true)
    setDuprRating(seed)
    setLoggedIn(true)
    updateUserProfile({
      duprRating: seed,
      reputationScore: 100,
    })
    if (showToast) showToast(`Đã thiết lập điểm DUPR Khởi điểm: ${seed.toFixed(2)}`, 'success')
  }

  const handleLinkDuprId = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanId = duprIdInput.trim().toUpperCase()
    if (!cleanId) return

    const mockScore = 3.25
    setFinalDuprScore(mockScore)
    setIsCompleted(true)
    setDuprRating(mockScore)
    setLoggedIn(true)
    updateUserProfile({
      duprRating: mockScore,
      reputationScore: 100,
    })
    if (showToast) showToast(`Đã liên kết thành công DUPR ID ${cleanId}!`, 'success')
  }

  const handleEnterPlatform = () => {
    if (showToast) showToast('Hồ sơ đã sẵn sàng! Chào mừng bạn vào sân.', 'success')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-secondary selection:text-secondary-foreground font-sans">
      <PublicAuthHeader action={!isCompleted ? (
          <button
            type="button"
            onClick={() => handleApplyQuickSeed(2.5)}
            className="rounded-xl px-3 py-2 text-xs font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            Bỏ qua · DUPR 2.50
          </button>
        ) : undefined} />

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-[620px] bg-card rounded-3xl shadow-xl border border-border/80 p-6 sm:p-8 space-y-6">
          {!isCompleted ? (
            <>
              {/* Header Wizard */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/35 text-primary text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>SCR_AUTH_04 • THUẬT TOÁN DUPR BAN ĐẦU</span>
                  </div>
                  <span className="text-xs font-black text-muted-foreground">
                    Câu {currentQuestionIndex + 1} / {quizQuestions.length}
                  </span>
                </div>

                {/* Tab Cho Phép Chọn Nhanh Hoặc Điền Form */}
                <div className="flex rounded-xl bg-muted p-1 gap-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveTab('survey')}
                    className={`flex-1 py-1.5 rounded-lg transition ${
                      activeTab === 'survey' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    📝 5 Câu Trắc Nghiệm Kỹ Thuật
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('quick_seed')}
                    className={`flex-1 py-1.5 rounded-lg transition ${
                      activeTab === 'quick_seed' ? 'bg-card text-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    ⚡ Chọn Nhanh DUPR
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('has_dupr_id')}
                    className={`flex-1 py-1.5 rounded-lg transition ${
                      activeTab === 'has_dupr_id' ? 'bg-card text-blue-600 shadow-xs' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    🌐 Đã Có Mã DUPR
                  </button>
                </div>

                {/* Progress Bar */}
                {activeTab === 'survey' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-muted-foreground">
                      <span>Tiến độ khảo sát</span>
                      <span className="text-primary">{progressPercent}% Hoàn thành</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* TAB 1: 5 Trắc Nghiệm Kỹ Thuật */}
              {activeTab === 'survey' && (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h2 className="text-sm sm:text-base font-black text-foreground leading-snug">
                      CÂU {currentQuestionIndex + 1}: {currentQ.title}
                    </h2>
                    <p className="text-xs text-muted-foreground">{currentQ.subtitle}</p>
                  </div>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, idx) => {
                      const isSelected = selectedAnswers[currentQuestionIndex] === idx
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectOption(idx)}
                          className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                            isSelected
                              ? 'border-primary bg-secondary/40 shadow-xs ring-2 ring-secondary/20'
                              : 'border-border bg-card hover:border-border hover:bg-muted/45'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
                              isSelected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {opt.label}
                          </div>
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                              {opt.text}
                            </p>
                            <p className="text-[11px] text-muted-foreground leading-snug">{opt.desc}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <button
                      type="button"
                      disabled={currentQuestionIndex === 0}
                      onClick={handlePrev}
                      className="h-10 px-4 rounded-xl border border-border text-xs font-bold text-foreground/85 hover:bg-muted/45 transition disabled:opacity-40 disabled:pointer-events-none inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Câu trước</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-extrabold shadow-md shadow-primary/20 transition inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>
                        {currentQuestionIndex < quizQuestions.length - 1 ? 'TIẾP THEO' : 'HOÀN TẤT & TÍNH ĐIỂM DUPR'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: Chọn Nhanh Điểm DUPR Hạt Giống (1.5 - 3.5) */}
              {activeTab === 'quick_seed' && (
                <div className="space-y-5 py-2">
                  <div className="text-center space-y-1">
                    <h3 className="text-base font-bold text-foreground">
                      Chọn nhanh mức DUPR phù hợp với bạn
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Bạn có thể bắt đầu với điểm ước lượng và hệ thống sẽ tự động hiệu chỉnh sau từng trận đấu.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { level: 'Người mới (Newbie)', range: '1.50 - 2.00', value: 1.75, desc: 'Mới làm quen, học luật thi đấu' },
                      { level: 'Cơ bản (Novice)', range: '2.25 - 2.50', value: 2.5, desc: 'Đánh đều tay, giữ bóng qua lưới', recommended: true },
                      { level: 'Trung cấp (Intermediate)', range: '2.75 - 3.00', value: 3.0, desc: 'Biết dink, kiểm soát nhịp độ' },
                      { level: 'Khá / Bán chuyên', range: '3.25 - 3.50', value: 3.5, desc: 'Tấn công dồn dập, speed-up tốt' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setQuickSeedValue(item.value)}
                        className={`p-3.5 rounded-2xl border-2 transition cursor-pointer relative ${
                          quickSeedValue === item.value
                            ? 'border-primary bg-secondary/35 shadow-xs'
                            : 'border-border bg-card hover:border-border'
                        }`}
                      >
                        {item.recommended && (
                          <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-primary text-white text-[9px] font-black uppercase">
                            Phổ biến
                          </span>
                        )}
                        <span className="text-xs font-black text-foreground block">{item.level}</span>
                        <span className="text-base font-black text-primary block my-0.5">DUPR {item.range}</span>
                        <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyQuickSeed(quickSeedValue)}
                    className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-extrabold text-sm shadow-md shadow-primary/20 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>ÁP DỤNG DUPR {quickSeedValue.toFixed(2)} & VÀO HỆ THỐNG</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* TAB 3: Đã Có Mã DUPR Quốc Tế */}
              {activeTab === 'has_dupr_id' && (
                <form onSubmit={handleLinkDuprId} className="space-y-4 py-2">
                  <div className="text-center space-y-1">
                    <h3 className="text-base font-bold text-foreground">
                      Đồng bộ điểm DUPR Quốc Tế
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Nhập mã ID DUPR đã được cấp trên hệ thống quốc tế (mydupr.com)
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/85">Mã DUPR ID hoặc Đường dẫn hồ sơ</label>
                    <input
                      type="text"
                      value={duprIdInput}
                      onChange={(e) => setDuprIdInput(e.target.value)}
                      placeholder="Ví dụ: #DUPR-98421 hoặc link hồ sơ"
                      className="w-full h-11 px-3.5 rounded-xl bg-muted/45 border border-border text-xs font-semibold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>KIỂM TRA & ĐỒNG BỘ DUPR ID</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </form>
              )}
            </>
          ) : (
            /* COMPLETION SCREEN: HUY HIỆU DUPR KHỞI ĐIỂM */
            <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary p-1 shadow-xl shadow-primary/20">
                  <div className="w-full h-full rounded-full bg-card flex flex-col items-center justify-center">
                    <Trophy className="w-8 h-8 text-primary" />
                    <span className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-wider mt-0.5">
                      DUPR SEED
                    </span>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                  ★ KHỞI TẠO
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground tracking-tight">
                  Chúc Mừng! Điểm DUPR Khởi Điểm Của Bạn
                </h2>
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-secondary/35 border border-secondary shadow-2xs">
                  <span className="text-3xl font-black text-primary tracking-tight">
                    {finalDuprScore.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">
                    / 8.00 (Chỉ số cân bằng ban đầu)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground max-w-md mx-auto pt-1 leading-relaxed">
                  Thuật toán FITLYO đã tự động cấu hình bộ lọc kèo đấu phù hợp trong phạm vi{' '}
                  <strong className="text-foreground font-extrabold">
                    {(finalDuprScore - 0.25).toFixed(2)} - {(finalDuprScore + 0.25).toFixed(2)}
                  </strong>{' '}
                  để đảm bảo không bị lệch trình!
                </p>
              </div>

              {/* Feature Unlocked Cards */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3.5 rounded-2xl bg-muted/45 border border-border space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Mở Khóa Kèo {finalDuprScore.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Tự động tham gia các kèo đấu DUPR tại TP. Thủ Đức không cần thẩm định lại.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/45 border border-border space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Tích Lũy Điểm Uy Tín</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Bắt đầu với 100% Uy tín Escrow, giữ vững uy tín khi tham gia đúng giờ.
                  </p>
                </div>
              </div>

              {/* Enter Button */}
              <button
                type="button"
                onClick={handleEnterPlatform}
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-extrabold text-sm shadow-lg shadow-primary/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>HOÀN TẤT & KHÁM PHÁ KÈO ĐẤU NGAY</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground/70">
        © 2026 FITLYO Pickleball • Nền tảng thể thao thông minh TP. Thủ Đức
      </footer>
    </div>
  )
}
export default SCR_AUTH_04
