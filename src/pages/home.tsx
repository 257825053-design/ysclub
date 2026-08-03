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
 * HomePage - 首页（纯 CSS Grid 布局，禁止滚动）
 *
 * 核心策略：使用 CSS Grid + minmax(0, 1fr) 防止卡片内容撑开容器
 *
 * 布局架构:
 * ┌──────────────────────────────────────┐
 * │  Hero Banner          auto           │  固定高度
 * ├──────────────────────────────────────┤
 * │  订阅信息    │    快速连接             │
 * │             minmax(0, 1fr)           │  自适应，不可撑开
 * ├──────────────────────────────────────┤
 * │  网络设置  │  代理模式  │  实时流量    │
 * │             minmax(0, 1fr)           │  自适应，不可撑开
 * ├──────────────────────────────────────┤
 * │  快捷工具             auto            │  固定高度
 * └──────────────────────────────────────┘
 *
 * 关键点：
 * 1. minmax(0, 1fr) 而非 1fr — 防止内容撑开行高
 * 2. 每个卡片包裹层 overflow:hidden + min-width:0 + min-height:0
 * 3. 每个卡片自身 height:100% + overflow:hidden
 * 4. 整体 overflow:hidden 禁止滚动
 */
const HomePage = () => {
  return (
    <Box
      sx={{
        // ===== 根容器：填满父级 .the-content =====
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        bgcolor: '#0B101C',
        boxSizing: 'border-box',
        display: 'grid',
        // 4 行：Banner(auto) + 卡片行1(1fr) + 卡片行2(1fr) + 快捷工具(auto)
        gridTemplateRows: 'auto minmax(0, 1fr) minmax(0, 1fr) auto',
        // 间距
        gap: '8px',
        p: '10px',
      }}
    >
      {/* ===== Row 1: Banner ===== */}
      <Box
        sx={{
          gridColumn: '1 / -1',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        <HeroBanner />
      </Box>

      {/* ===== Row 2: 订阅信息 + 快速连接 ===== */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: '8px',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        <Box sx={{ overflow: 'hidden', minHeight: 0, minWidth: 0 }}>
          <SubscriptionInfoCard />
        </Box>
        <Box sx={{ overflow: 'hidden', minHeight: 0, minWidth: 0 }}>
          <QuickConnectCard />
        </Box>
      </Box>

      {/* ===== Row 3: 网络设置 + 代理模式 + 实时流量 ===== */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)',
          gap: '8px',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        <Box sx={{ overflow: 'hidden', minHeight: 0, minWidth: 0 }}>
          <NetworkSettingsCard />
        </Box>
        <Box sx={{ overflow: 'hidden', minHeight: 0, minWidth: 0 }}>
          <ProxyModeCard />
        </Box>
        <Box sx={{ overflow: 'hidden', minHeight: 0, minWidth: 0 }}>
          <TrafficCard />
        </Box>
      </Box>

      {/* ===== Row 4: 快捷工具 ===== */}
      <Box
        sx={{
          gridColumn: '1 / -1',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        <QuickToolsCard />
      </Box>
    </Box>
  )
}

export default HomePage
