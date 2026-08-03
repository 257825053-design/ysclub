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
 * HomePage - 首页（Flex 弹性布局 + 窗口密度自适应）
 *
 * 布局架构（Flex Column）:
 * ```
 * ┌─────────────────────────────┐
 * │  Hero Banner (flexShrink:0) │  固定高度区域
 * ├─────────────────────────────┤
 * │  订阅信息  │  快速连接       │
 * │  网络设置  │  代理模式 │ 流量 │  flex:1 自动填充
 * │                             │
 * ├─────────────────────────────┤
 * │  快捷工具 (flexShrink:0)     │  固定高度区域
 * └─────────────────────────────┘
 * ```
 *
 * 自适应策略：
 * 1. useWindowMode 根据可用高度选择 compact/standard/spacious 密度
 * 2. 中间卡片区域使用 flex:1 自动填充剩余空间
 * 3. Banner 和快捷工具使用 flexShrink:0 保证不被压缩
 * 4. 小屏幕（compact 模式）允许垂直滚动，避免内容被裁切
 * 5. 卡片内部使用 minHeight + height:auto，不再使用固定 px 高度
 */
const HomePage = () => {
  const { mode, cardGap, pagePadding } = useWindowMode()

  return (
    <BasePage title="首页" full contentStyle={{ padding: 0 }}>
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
          // compact 模式允许滚动，其他模式隐藏滚动
          overflowY: mode === 'compact' ? 'auto' : 'hidden',
          overflowX: 'hidden',
          // 美化滚动条
          '&::-webkit-scrollbar': {
            width: 4,
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(255, 255, 255, 0.2)',
          },
        }}
      >
        {/* ========== 第一区域：Banner（固定高度，不压缩） ========== */}
        <Box sx={{ width: '100%', flexShrink: 0 }}>
          <HeroBanner />
        </Box>

        {/* ========== 第二区域：中间卡片组（flex:1 自动填充） ========== */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: `${cardGap}px`,
            minHeight: 0, // 关键：允许 flex 子项收缩
            overflow: 'hidden',
          }}
        >
          {/* 第一行：订阅信息 + 快速连接 */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'minmax(0, 1fr) minmax(0, 1fr)',
              },
              gap: `${cardGap}px`,
              width: '100%',
              flex: 1,
              minHeight: 0,
              '& > *': { minWidth: 0, overflow: 'hidden' },
            }}
          >
            <SubscriptionInfoCard />
            <QuickConnectCard />
          </Box>

          {/* 第二行：网络设置 + 代理模式 + 实时流量 */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'minmax(0, 1fr) minmax(0, 1fr)',
                md: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)',
              },
              gap: `${cardGap}px`,
              width: '100%',
              flex: 1,
              minHeight: 0,
              '& > *': { minWidth: 0, overflow: 'hidden' },
            }}
          >
            <NetworkSettingsCard />
            <ProxyModeCard />
            <TrafficCard />
          </Box>
        </Box>

        {/* ========== 第三区域：快捷工具（固定高度，不压缩） ========== */}
        <Box sx={{ width: '100%', flexShrink: 0 }}>
          <QuickToolsCard />
        </Box>
      </Box>
    </BasePage>
  )
}

export default HomePage
