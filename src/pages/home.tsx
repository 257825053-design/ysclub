import { Box } from '@mui/material'

import HeroBanner from '@/components/home/hero-banner'
import SubscriptionInfoCard from '@/components/home/subscription-info-card'
import QuickConnectCard from '@/components/home/quick-connect-card'
import NetworkSettingsCard from '@/components/home/network-settings-card'
import ProxyModeCard from '@/components/home/proxy-mode-card'
import TrafficCard from '@/components/home/traffic-card'
import QuickToolsCard from '@/components/home/quick-tools-card'

// ==================== 预加载 ====================

export const preloadHomePageCards = () => Promise.resolve()

// ==================== 主页面 ====================

/**
 * HomePage - 首页（CSS Grid 布局，所有行 auto 自然高度）
 *
 * 核心策略：所有行使用 auto 高度，卡片取自然高度不拉伸
 * 整体居中对齐，内容溢出时允许滚动
 *
 * 布局架构:
 * ┌──────────────────────────────────────┐
 * │  Hero Banner          auto           │
 * ├──────────────────────────────────────┤
 * │  订阅信息    │    快速连接   auto     │
 * ├──────────────────────────────────────┤
 * │  网络设置  │  代理模式  │  实时流量    │ auto
 * ├──────────────────────────────────────┤
 * │  快捷工具             auto            │
 * └──────────────────────────────────────┘
 */
const HomePage = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        bgcolor: '#0B101C',
        boxSizing: 'border-box',
        display: 'grid',
        // 所有行 auto：卡片取自然高度，不拉伸不变形
        gridTemplateRows: 'auto auto auto auto',
        // 垂直方向从顶部开始排列
        alignContent: 'start',
        gap: '8px',
        p: '10px',
        // 美化滚动条
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: 'rgba(255, 255, 255, 0.2)',
        },
      }}
    >
      {/* ===== Row 1: Banner ===== */}
      <Box sx={{ gridColumn: '1 / -1' }}>
        <HeroBanner />
      </Box>

      {/* ===== Row 2: 订阅信息 + 快速连接 ===== */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: '8px',
          // align-items 默认 stretch，配合 height:100% 让同行卡片等高
          alignItems: 'stretch',
        }}
      >
        <Box sx={{ minWidth: 0, height: '100%' }}>
          <SubscriptionInfoCard />
        </Box>
        <Box sx={{ minWidth: 0, height: '100%' }}>
          <QuickConnectCard />
        </Box>
      </Box>

      {/* ===== Row 3: 网络设置 + 代理模式 + 实时流量 ===== */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)',
          gap: '8px',
          alignItems: 'stretch',
        }}
      >
        <Box sx={{ minWidth: 0, height: '100%' }}>
          <NetworkSettingsCard />
        </Box>
        <Box sx={{ minWidth: 0, height: '100%' }}>
          <ProxyModeCard />
        </Box>
        <Box sx={{ minWidth: 0, height: '100%' }}>
          <TrafficCard />
        </Box>
      </Box>

      {/* ===== Row 4: 快捷工具 ===== */}
      <Box sx={{ gridColumn: '1 / -1' }}>
        <QuickToolsCard />
      </Box>
    </Box>
  )
}

export default HomePage
