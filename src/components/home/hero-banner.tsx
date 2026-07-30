import { Box } from '@mui/material'
import { memo } from 'react'

/**
 * HeroBanner - 首页顶部品牌横幅
 *
 * 16:5 比例容器，用于放置 AI 生成的科技感背景图。
 * 图片本身已包含所有品牌文案，无需额外叠加文字。
 */
interface HeroBannerProps {
  /** AI 生成的背景图片 URL (16:5 比例) */
  backgroundImage?: string
}

const HeroBanner = memo(({ backgroundImage }: HeroBannerProps) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 5',
        maxHeight: 110,
        minHeight: 80,
        borderRadius: 2,
        overflow: 'hidden',
        background: backgroundImage
          ? `${backgroundImage} center/cover no-repeat`
          : 'linear-gradient(135deg, #080F24 0%, #0F1F3D 30%, #132244 60%, #080F24 100%)',
        border: '1px solid rgba(35, 120, 245, 0.12)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    />
  )
})

HeroBanner.displayName = 'HeroBanner'

export default HeroBanner
