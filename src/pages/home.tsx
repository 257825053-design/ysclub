import { Box } from '@mui/material'

import { BasePage } from '@/components/base'
import HeroBanner from '@/components/home/hero-banner'
import SubscriptionInfoCard from '@/components/home/subscription-info-card'
import QuickConnectCard from '@/components/home/quick-connect-card'
import NetworkSettingsCard from '@/components/home/network-settings-card'
import ProxyModeCard from '@/components/home/proxy-mode-card'
import TrafficCard from '@/components/home/traffic-card'
import QuickToolsCard from '@/components/home/quick-tools-card'
import { useWindowMode } from '@/hooks/use-window-mode'

// ==================== 预加载 ====================

export const preloadHomePageCards = () => Promise.resolve()

// ==================== 主页面 ====================

/**
 * HomePage - 首页（纯 Flex 布局，禁止滚动）
 *
 * 布局架构（Flex Column，严格高度分配）:
 * ```
 * ┌──────────────────────────────────┐
 * │  Hero Banner   flexShrink: 0     │  固定高度，不压缩
 * ├──────────────────────────────────┤
 * │  Row 1: 订阅信息 | 快速连接       │
 * │                  flex: 1         │  自适应填充，平均分配
 * ├──────────────────────────────────┤
 * │  Row 2: 网络 | 代理 | 流量        │
 * │                  flex: 1         │  自适应填充，平均分配
 * ├──────────────────────────────────┤
 * │  快捷工具      flexShrink: 0     │  固定高度，不压缩
 * └──────────────────────────────────┘
 *
 * 关键设计：
 * 1. 禁止滚动 (overflow: hidden)，所有内容必须在 viewport 内
 * 2. 使用 flex 而非 grid，确保子项正确拉伸填充
 * 3. 每行使用 flex: 1 + minHeight: 0 允许收缩
 * 4. 卡片使用 flex: 1 共享行宽度
 * 5. Banner 和 QuickTools 使用 flexShrink: 0 不被压缩
 */
const HomePage = () => {
  const { cardGap, pagePadding } = useWindowMode()

  return (
    <BasePage title="首页" full noScroll contentStyle={{ padding: 0 }}>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          p: `${pagePadding}px`,
          boxSizing: 'border-box',
          bgcolor: '#0B101C',
          gap: `${cardGap}px`,
          overflow: 'hidden',
        }}
      >
        {/* ========== 第一区域：Banner（固定高度，不压缩） ========== */}
        <Box sx={{ width: '100%', flexShrink: 0 }}>
          <HeroBanner />
        </Box>

        {/* ========== 第二区域：中间卡片行 1（flex:1 自适应） ========== */}
        <Box
          sx={{
            display: 'flex',
            gap: `${cardGap}px`,
            width: '100%',
            flex: 1,
            minHeight: 0,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0, height: '100%' }}>
            <SubscriptionInfoCard />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, height: '100%' }}>
            <QuickConnectCard />
          </Box>
        </Box>

        {/* ========== 第三区域：中间卡片行 2（flex:1 自适应） ========== */}
        <Box
          sx={{
            display: 'flex',
            gap: `${cardGap}px`,
            width: '100%',
            flex: 1,
            minHeight: 0,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0, height: '100%' }}>
            <NetworkSettingsCard />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, height: '100%' }}>
            <ProxyModeCard />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, height: '100%' }}>
            <TrafficCard />
          </Box>
        </Box>

        {/* ========== 第四区域：快捷工具（固定高度，不压缩） ========== */}
        <Box sx={{ width: '100%', flexShrink: 0 }}>
          <QuickToolsCard />
        </Box>
      </Box>
    </BasePage>
  )
}

export default HomePage
