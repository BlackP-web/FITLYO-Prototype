import { cn } from '@/lib/utils'
import brandMark from '@/assets/brand/Bieu_tuong_FITLYO.svg'
import brandMarkWhite from '@/assets/brand/Bieu_tuong_trang_FITLYO.svg'
import brandWordmark from '@/assets/brand/Logo_kem_ten_FITLYO.svg'
import brandWordmarkWhite from '@/assets/brand/Logo_trang_FITLYO.svg'

interface BrandLogoProps {
  kind?: 'wordmark' | 'mark'
  tone?: 'auto' | 'brand' | 'white'
  className?: string
  alt?: string
}

export function BrandLogo({
  kind = 'wordmark',
  tone = 'auto',
  className,
  alt = 'FITLYO',
}: BrandLogoProps) {
  const brandAsset = kind === 'mark' ? brandMark : brandWordmark
  const whiteAsset = kind === 'mark' ? brandMarkWhite : brandWordmarkWhite

  if (tone !== 'auto') {
    return (
      <img
        src={tone === 'white' ? whiteAsset : brandAsset}
        alt={alt}
        className={cn('block object-contain', className)}
      />
    )
  }

  return (
    <>
      <img src={brandAsset} alt={alt} className={cn('block object-contain dark:hidden', className)} />
      <img src={whiteAsset} alt={alt} className={cn('hidden object-contain dark:block', className)} />
    </>
  )
}
