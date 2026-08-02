import { Box, Stack } from '@mui/material'

import { BasePage } from '@/components/base'
import HeroBanner from '@/components/home/hero-banner'
import SubscriptionInfoCard from '@/components/home/subscription-info-card'
import QuickConnectCard from '@/components/home/quick-connect-card'
import NetworkSettingsCard from '@/components/home/network-settings-card'
import ProxyModeCard from '@/components/home/proxy-mode-card'
import TrafficCard from '@/components/home/traffic-card'
import QuickToolsCard from '@/components/home/quick-tools-card'
import { useViewportScale } from '@/hooks/use-viewport-scale'

// ==================== 预加载 ====================

export const preloadHomePageCards = () => Promise.resolve()

// ==================== 主页面 ====================

/**
 * HomePage - 首页（像素级设计还原 + 分辨率自适应）
 *
 * 设计规格（来自设计文档）：
 * - 窗口底色 #0B101C，无边框深色窗口
 * - 顶部"首页"标题栏
 * - Banner 区域（纯图片展示）
 * - 第一行双列卡片：订阅信息白卡 | 快速连接深色卡
 * - 第二行三列卡片：网络设置 | 代理模式 | 实时流量
 * - 第三行通栏卡片：快捷工具
 * - 所有内容单页显示，无需滚动
 *
 * 自适应策略：
 * - Rust 端根据屏幕分辨率设置窗口尺寸（78% 屏幕高度）
 * - 前端通过 useViewportScale 计算缩放系数
 * - 使用 CSS zoom 对内容整体等比缩放，确保任何分辨率下完整显示
 */
const HomePage = () => {
  const scale = useViewportScale()

  return (
    <BasePage title="首页" full noScroll contentStyle={{ padding: 0 }}>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          p: { xs: 1, sm: 1.5 },
          boxSizing: 'border-box',
          bgcolor: '#0B101C',
        }}
        onWheel={(e) => e.preventDefault()}
      >
        {/* zoom 缩放层：根据视口高度等比缩放所有卡片内容 */}
        <div style={{ zoom: scale, width: '100%' }}>
          <Stack
            spacing={{ xs: 0.75, sm: 1 }}
            sx={{
              width: '100%',
              maxWidth: '100%',
              mx: 'auto',
            }}
          >
            {/* 第一区域：Banner 横幅 */}
            <Box sx={{ width: '100%' }}>
              <HeroBanner />
            </Box>

            {/* 第二区域：第一行卡片组 - 订阅信息 + 快速连接 */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
                gap: { xs: 0.75, sm: 1 },
                width: '100%',
                overflow: 'hidden',
                '& > *': { minWidth: 0, overflow: 'hidden' },
              }}
            >
              <SubscriptionInfoCard />
              <QuickConnectCard />
            </Box>

            {/* 第三区域：第二行三列等宽卡片 */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)' },
                gap: { xs: 0.75, sm: 1 },
                width: '100%',
                overflow: 'hidden',
                '& > *': { minWidth: 0, overflow: 'hidden' },
              }}
            >
              <NetworkSettingsCard />
              <ProxyModeCard />
              <TrafficCard />
            </Box>

            {/* 第四区域：快捷工具 - 通栏整宽卡片 */}
            <Box sx={{ width: '100%' }}>
              <QuickToolsCard />
            </Box>
          </Stack>
        </div>
      </Box>
    </BasePage>
  )
}

export default HomePage
