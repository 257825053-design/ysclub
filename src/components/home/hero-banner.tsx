import { Box, Typography, SvgIcon } from '@mui/material'
import {
  ShieldOutlined,
  BoltOutlined,
  PublicOutlined,
  DevicesOutlined,
} from '@mui/icons-material'
import { memo } from 'react'

import iconDark from '@/assets/image/icon_dark.svg?react'

/**
 * HeroBanner - 首页顶部品牌横幅（纯 CSS 响应式版）
 *
 * 架构：背景图底层（z-index:1）+ 渐变遮罩层（z-index:2）+ 悬浮文字内容层（z-index:10）
 *
 * 响应式策略：
 * 1. 容器高度通过 MUI 断点自适应（120-190px）
 * 2. 所有文字尺寸通过断点自适应，不依赖 JS 缩放
 * 3. 内容使用 flexbox 垂直居中
 * 4. 右侧手写标语在窄屏（<900px）时隐藏
 * 5. 底部功能标签在极窄屏（<600px）时隐藏
 */
const HeroBanner = memo(() => {
  // 功能标签数据
  const featureTags = [
    { Icon: ShieldOutlined, title: '银行级加密', subtitle: '全程守护' },
    { Icon: BoltOutlined, title: '高速稳定', subtitle: '优质专线' },
    { Icon: PublicOutlined, title: '全球覆盖', subtitle: '200+国家' },
    { Icon: DevicesOutlined, title: '多端支持', subtitle: 'Win/Mac' },
  ]

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: 110, sm: 130, md: 150, lg: 170, xl: 185 },
        minHeight: 100,
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
          pl: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
          pr: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
          overflow: 'hidden',
        }}
      >
        {/* 第一层：品牌栏 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.5, sm: 0.75, md: 1 },
            mb: { xs: 0.25, sm: 0.5, md: 0.5 },
          }}
        >
          <SvgIcon
            component={iconDark}
            sx={{
              width: { xs: 16, sm: 18, md: 20 },
              height: { xs: 16, sm: 18, md: 20 },
              flexShrink: 0,
              filter: 'drop-shadow(0 0 4px rgba(0, 170, 255, 0.6))',
            }}
            inheritViewBox
          />
          <Typography
            sx={{
              fontSize: { xs: 15, sm: 17, md: 19, lg: 20 },
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
              fontSize: { xs: 15, sm: 17, md: 19, lg: 20 },
              color: '#FFFFFF',
              opacity: 0.4,
              lineHeight: 1,
            }}
          >
            |
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: 11, sm: 13, md: 14, lg: 15 },
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
            fontSize: { xs: 22, sm: 28, md: 32, lg: 36, xl: 40 },
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
            fontSize: { xs: 10, sm: 12, md: 13, lg: 14, xl: 15 },
            color: '#FFFFFF',
            opacity: 0.8,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            mt: { xs: 0.25, sm: 0.5, md: 0.5 },
          }}
        >
          更快·更稳定·更安全的专业级全球网络代理服务
        </Typography>

        {/* 第四层：四大功能标签组（窄屏隐藏） */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            gap: { xs: 0.5, sm: 0.75, md: 1 },
            mt: { xs: 0.5, sm: 0.75, md: 1 },
          }}
        >
          {featureTags.map(({ Icon, title, subtitle }) => (
            <Box
              key={title}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: { xs: 0.75, sm: 1, md: 1.25 },
                py: { xs: 0.3, sm: 0.4, md: 0.5 },
                borderRadius: { xs: 0.75, sm: 1, md: 1.25 },
                bgcolor: 'rgba(15, 35, 75, 0.55)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(0, 170, 255, 0.15)',
              }}
            >
              <Icon sx={{ fontSize: { xs: 12, sm: 13, md: 14 }, color: '#FFFFFF' }} />
              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: 10, sm: 10.5, md: 11 },
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
                    fontSize: { xs: 8, sm: 8.5, md: 9 },
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
          right: { md: 2, lg: 2.5, xl: 3 },
          top: { md: 1, lg: 1.25, xl: 1.5 },
          zIndex: 11,
          transform: `rotate(-6deg)`,
          transformOrigin: 'right top',
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Typography
          sx={{
            fontSize: { md: 20, lg: 23, xl: 26 },
            color: '#FFFFFF',
            fontFamily: '"Brush Script MT", "Comic Sans MS", cursive',
            fontStyle: 'italic',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            borderBottom: '2px solid rgba(0, 170, 255, 0.8)',
            paddingBottom: 0.25,
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
