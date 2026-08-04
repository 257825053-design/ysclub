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
 * HomePage - 首页（Flexbox 列布局）
 *
 * 核心策略：使用 flex-direction: column + flexShrink: 0
 * 每一行取自然高度，绝对不会被压缩或重叠
 * 内容超出容器时通过 overflow: auto 滚动
 *
 * 布局架构:
 * ┌──────────────────────────────────────┐
 * │  Hero Banner         flexShrink:0    │
 * ├──────────────────────────────────────┤
 * │  订阅信息    │    快速连接            │
 * ├──────────────────────────────────────┤
 * │  网络设置  │  代理模式  │  实时流量    │
 * ├──────────────────────────────────────┤
 * │  快捷工具                             │
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
        display: 'flex',
        flexDirection: 'column',
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
      <Box sx={{ flexShrink: 0, width: '100%' }}>
        <HeroBanner />
      </Box>

      {/* ===== Row 2: 订阅信息 + 快速连接 ===== */}
      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          gap: '8px',
          width: '100%',
          alignItems: 'stretch',
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <SubscriptionInfoCard />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <QuickConnectCard />
        </Box>
      </Box>

      {/* ===== Row 3: 网络设置 + 代理模式 + 实时流量 ===== */}
      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          gap: '8px',
          width: '100%',
          alignItems: 'stretch',
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <NetworkSettingsCard />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <ProxyModeCard />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <TrafficCard />
        </Box>
      </Box>

      {/* ===== Row 4: 快捷工具 ===== */}
      <Box sx={{ flexShrink: 0, width: '100%' }}>
        <QuickToolsCard />
      </Box>
    </Box>
  )
}

export default HomePage
