import { Box, Typography, SvgIcon } from '@mui/material'
import {
  ShieldOutlined,
  BoltOutlined,
  PublicOutlined,
  DevicesOutlined,
} from '@mui/icons-material'
import { memo, useEffect, useRef, useState } from 'react'

import iconDark from '@/assets/image/icon_dark.svg?react'

/**
 * HeroBanner - 首页顶部品牌横幅（分层自适应版）
 *
 * 架构：背景图底层（z-index:1）+ 渐变遮罩层（z-index:2）+ 悬浮文字内容层（z-index:10）
 *
 * 自适应策略：
 * 1. 容器高度 120-200px，通过 ResizeObserver 监听高度变化
 * 2. 以 190px 为基准高度计算 scale（0.6~1.0），所有尺寸按 scale 等比缩放
 * 3. 内容使用 flexbox 垂直居中，确保任何高度下文字都在容器内
 * 4. 右侧手写标语在窄屏（<900px）时隐藏，避免与左侧文字重叠
 * 5. 底部功能标签在极窄屏（<600px）时隐藏
 */
const HeroBanner = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateScale = () => {
      const height = container.clientHeight
      // 参考高度 190px → scale=1，120px → scale≈0.63
      const newScale = Math.max(0.6, Math.min(1, height / 190))
      setScale(newScale)
    }

    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // 缩放辅助函数
  const s = (value: number) => `${value * scale}px`

  // 功能标签数据
  const featureTags = [
    { Icon: ShieldOutlined, title: '银行级加密', subtitle: '全程守护' },
    { Icon: BoltOutlined, title: '高速稳定', subtitle: '优质专线' },
    { Icon: PublicOutlined, title: '全球覆盖', subtitle: '200+国家' },
    { Icon: DevicesOutlined, title: '多端支持', subtitle: 'Win/Mac' },
  ]

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: 120, sm: 140, md: 160, lg: 175, xl: 190 },
        minHeight: 120,
        maxHeight: 200,
        borderRadius: 2,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* ========== 底层：背景图片 z-index:1 ========== */}
      <Box
        component="img"
        src="/images/hero-banner-bg.png"
        alt="YSCLUB Banner"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'left center',
          zIndex: 1,
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />

      {/* ========== 渐变遮罩层：增强左侧文字可读性 z-index:2 ========== */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'linear-gradient(90deg, rgba(8,15,36,0.7) 0%, rgba(8,15,36,0.3) 55%, transparent 100%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* ========== 上层：悬浮文字内容 z-index:10 ========== */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          pl: s(32),
          pr: s(32),
          overflow: 'hidden',
        }}
      >
        {/* 第一层：品牌栏 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: s(10),
            mb: s(6),
          }}
        >
          <SvgIcon
            component={iconDark}
            sx={{
              width: s(20),
              height: s(20),
              flexShrink: 0,
              filter: 'drop-shadow(0 0 4px rgba(0, 170, 255, 0.6))',
            }}
            inheritViewBox
          />
          <Typography
            sx={{
              fontSize: s(20),
              fontWeight: 600,
              color: '#FFFFFF',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            YSCLUB
          </Typography>
          <Typography
            sx={{
              fontSize: s(20),
              color: '#FFFFFF',
              opacity: 0.4,
              lineHeight: 1,
            }}
          >
            |
          </Typography>
          <Typography
            sx={{
              fontSize: s(16),
              color: '#FFFFFF',
              opacity: 0.85,
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            连接世界·让全球触手可及
          </Typography>
        </Box>

        {/* 第二层：主标题（蓝色外发光） */}
        <Typography
          sx={{
            fontSize: s(40),
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
            textShadow:
              '0 0 20px rgba(0, 170, 255, 0.5), 0 0 40px rgba(0, 128, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.4)',
          }}
        >
          安全连接 畅行全球
        </Typography>

        {/* 第三层：副标题 */}
        <Typography
          sx={{
            fontSize: s(15),
            color: '#FFFFFF',
            opacity: 0.8,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            mt: s(4),
          }}
        >
          更快·更稳定·更安全的专业级全球网络代理服务
        </Typography>

        {/* 第四层：四大功能标签组（窄屏隐藏） */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            gap: s(10),
            mt: s(8),
          }}
        >
          {featureTags.map(({ Icon, title, subtitle }) => (
            <Box
              key={title}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: s(6),
                px: s(12),
                py: s(6),
                borderRadius: s(10),
                bgcolor: 'rgba(15, 35, 75, 0.55)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(0, 170, 255, 0.15)',
              }}
            >
              <Icon sx={{ fontSize: s(14), color: '#FFFFFF' }} />
              <Box>
                <Typography
                  sx={{
                    fontSize: s(11),
                    fontWeight: 600,
                    color: '#FFFFFF',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: s(9),
                    color: '#FFFFFF',
                    opacity: 0.7,
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {subtitle}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* 第五层：右上角手写标语（窄屏隐藏） */}
      <Box
        sx={{
          position: 'absolute',
          right: s(28),
          top: s(16),
          zIndex: 11,
          transform: `rotate(-6deg)`,
          transformOrigin: 'right top',
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Typography
          sx={{
            fontSize: s(26),
            color: '#FFFFFF',
            fontFamily: '"Brush Script MT", "Comic Sans MS", cursive',
            fontStyle: 'italic',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            borderBottom: '2px solid rgba(0, 170, 255, 0.8)',
            paddingBottom: s(3),
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
          }}
        >
          让每一次连接都更自由
        </Typography>
      </Box>
    </Box>
  )
})

HeroBanner.displayName = 'HeroBanner'

export default HeroBanner
