import { Box, SvgIcon, Typography } from '@mui/material'
import { memo } from 'react'

import iconDark from '@/assets/image/icon_dark.svg?react'

/**
 * HeroBanner - 首页顶部品牌横幅
 *
 * 16:5 比例容器，用于放置 AI 生成的科技感背景图。
 * 叠加白色 YSCLUB 品牌文字 + 应用图标，确保与深色背景形成鲜明对比。
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
        height: { xs: 70, sm: 90, md: 110 },
        minHeight: 60,
        maxHeight: 140,
        borderRadius: 2,
        overflow: 'hidden',
        background: backgroundImage
          ? `${backgroundImage} center/cover no-repeat`
          : 'linear-gradient(135deg, #080F24 0%, #0F1F3D 30%, #132244 60%, #080F24 100%)',
        border: '1px solid rgba(35, 120, 245, 0.12)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* 品牌文字叠加层 */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: { xs: 2, sm: 3, md: 4 },
          gap: { xs: 1, sm: 1.5 },
          background:
            'linear-gradient(90deg, rgba(8,15,36,0.7) 0%, rgba(8,15,36,0.3) 60%, transparent 100%)',
        }}
      >
        {/* 应用图标 */}
        <SvgIcon
          component={iconDark}
          sx={{
            width: { xs: 28, sm: 36, md: 42 },
            height: { xs: 28, sm: 36, md: 42 },
            flexShrink: 0,
            filter: 'drop-shadow(0 2px 8px rgba(0, 85, 255, 0.4))',
          }}
          inheritViewBox
        />
        {/* YSCLUB 白色品牌文字 */}
        <Typography
          sx={{
            fontSize: { xs: 22, sm: 28, md: 34 },
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '2px',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.6)',
            lineHeight: 1,
          }}
        >
          YSCLUB
        </Typography>
      </Box>
    </Box>
  )
})

HeroBanner.displayName = 'HeroBanner'

export default HeroBanner
