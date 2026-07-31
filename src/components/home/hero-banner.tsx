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
 * HeroBanner - 首页顶部品牌横幅（分层悬浮文字版）
 *
 * 架构：背景图底层（z-index:1）+ 悬浮文字组件上层（z-index:10）
 * 背景：/images/hero-banner-bg.png，object-fit: cover, object-position: left center
 * 容器：min-height: 130px, max-height: 190px, overflow: hidden
 *
 * 5层悬浮元素（从上至下）：
 * 1. 品牌栏：YSCLUB图标 + YSCLUB文字 + 分隔符 + 标语
 * 2. 主标题：安全连接 畅行全球（蓝色外发光）
 * 3. 副标题：更快·更稳定·更安全的专业级全球网络代理服务
 * 4. 四大功能标签：银行级加密 / 高速稳定 / 全球覆盖 / 多端支持
 * 5. 右上角手写标语：让每一次连接都更自由
 *
 * 自适应：窗口缩小时文字锚点靠左，右侧背景被裁切，左侧核心文字始终可见。
 * 当容器高度压缩至130px时，所有文字按比例缩小。
 */
const HeroBanner = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateScale = () => {
      const height = container.clientHeight
      // 参考高度190px对应scale=1，130px对应scale≈0.68
      const newScale = Math.max(0.68, Math.min(1, height / 190))
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
    {
      icon: <ShieldOutlined sx={{ fontSize: s(18), color: '#FFFFFF' }} />,
      title: '银行级加密',
      subtitle: '全程守护您的网络安全',
    },
    {
      icon: <BoltOutlined sx={{ fontSize: s(18), color: '#FFFFFF' }} />,
      title: '高速稳定',
      subtitle: '全球优质专线节点',
    },
    {
      icon: <PublicOutlined sx={{ fontSize: s(18), color: '#FFFFFF' }} />,
      title: '全球覆盖',
      subtitle: '一键畅连200+国家/地区',
    },
    {
      icon: <DevicesOutlined sx={{ fontSize: s(18), color: '#FFFFFF' }} />,
      title: '多端支持',
      subtitle: 'Windows / Mac / 移动端',
    },
  ]

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: 130,
        maxHeight: 190,
        height: { xs: 130, sm: 145, md: 165, lg: 180, xl: 190 },
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

      {/* ========== 上层：悬浮文字内容 z-index:10 ========== */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          overflow: 'hidden',
        }}
      >
        {/* 第一层：左上角品牌栏 */}
        <Box
          sx={{
            position: 'absolute',
            left: s(48),
            top: s(32),
            display: 'flex',
            alignItems: 'center',
            gap: s(14),
          }}
        >
          {/* YSCLUB蓝色LOGO图标 */}
          <SvgIcon
            component={iconDark}
            sx={{
              width: s(24),
              height: s(24),
              flexShrink: 0,
              filter: 'drop-shadow(0 0 4px rgba(0, 170, 255, 0.6))',
            }}
            inheritViewBox
          />
          {/* YSCLUB文字 */}
          <Typography
            sx={{
              fontSize: s(24),
              fontWeight: 600,
              color: '#FFFFFF',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            YSCLUB
          </Typography>
          {/* 竖线分隔符 */}
          <Typography
            sx={{
              fontSize: s(24),
              color: '#FFFFFF',
              opacity: 0.4,
              lineHeight: 1,
            }}
          >
            |
          </Typography>
          {/* 标语 */}
          <Typography
            sx={{
              fontSize: s(20),
              color: '#FFFFFF',
              opacity: 0.9,
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
            position: 'absolute',
            left: s(48),
            top: s(92), // 32(品牌栏top) + 24(品牌栏高度) + 36(间距)
            fontSize: s(68),
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1,
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
            position: 'absolute',
            left: s(48),
            top: s(176), // 92(主标题top) + 68(主标题高度) + 16(间距)
            fontSize: s(28),
            color: '#FFFFFF',
            opacity: 0.82,
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          更快·更稳定·更安全的专业级全球网络代理服务
        </Typography>

        {/* 第四层：四大功能标签组 */}
        <Box
          sx={{
            position: 'absolute',
            left: s(48),
            top: s(246), // 176(副标题top) + 28(副标题高度) + 42(间距)
            display: 'flex',
            gap: s(24),
          }}
        >
          {featureTags.map((tag) => (
            <Box
              key={tag.title}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: s(8),
                px: s(22),
                py: s(14),
                borderRadius: s(16),
                bgcolor: 'rgba(15, 35, 75, 0.55)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(0, 170, 255, 0.15)',
              }}
            >
              {tag.icon}
              <Box>
                <Typography
                  sx={{
                    fontSize: s(14),
                    fontWeight: 600,
                    color: '#FFFFFF',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tag.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: s(11),
                    color: '#FFFFFF',
                    opacity: 0.75,
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tag.subtitle}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* 第五层：右上角手写标语 */}
        <Box
          sx={{
            position: 'absolute',
            right: s(48),
            top: s(64),
            transform: `rotate(-6deg) scale(${scale})`,
            transformOrigin: 'right top',
          }}
        >
          <Typography
            sx={{
              fontSize: s(36),
              color: '#FFFFFF',
              fontFamily: '"Brush Script MT", "Comic Sans MS", cursive',
              fontStyle: 'italic',
              lineHeight: 1,
              whiteSpace: 'nowrap',
              borderBottom: `2px solid rgba(0, 170, 255, 0.8)`,
              paddingBottom: s(4),
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
            }}
          >
            让每一次连接都更自由
          </Typography>
        </Box>
      </Box>
    </Box>
  )
})

HeroBanner.displayName = 'HeroBanner'

export default HeroBanner
