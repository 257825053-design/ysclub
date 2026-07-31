import { Box, Stack } from '@mui/material'

import { BasePage } from '@/components/base'
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
 * HomePage - 首页（像素级设计还原）
 *
 * 设计规格（来自设计文档）：
 * - 窗口底色 #0B101C，无边框深色窗口
 * - 顶部"首页"标题栏
 * - Banner 区域（纯图片展示）
 * - 第一行双列卡片：订阅信息白卡 | 快速连接深色卡
 * - 第二行三列卡片：网络设置 | 代理模式 | 实时流量
 * - 第三行通栏卡片：快捷工具
 * - 所有内容单页显示，无需滚动
 */
const HomePage = () => {
  return (
    <BasePage title="首页" full contentStyle={{ padding: 0 }}>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          overflow: 'auto',
          p: { xs: 1, sm: 1.5 },
          boxSizing: 'border-box',
          bgcolor: '#0B101C',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack
          spacing={{ xs: 0.75, sm: 1 }}
          sx={{
            width: '100%',
            maxWidth: 1100,
            mx: 'auto',
            minHeight: 'min-content',
          }}
        >
          {/* 第一区域：Banner 横幅 */}
          <Box sx={{ flexShrink: 0, width: '100%' }}>
            <HeroBanner backgroundImage="url('/images/hero-banner.png')" />
          </Box>

          {/* 第二区域：第一行卡片组 - 订阅信息 + 快速连接 */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 0.75, sm: 1 },
              flexShrink: 0,
              width: '100%',
            }}
          >
            <SubscriptionInfoCard />
            <QuickConnectCard />
          </Box>

          {/* 第三区域：第二行三列等宽卡片 */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: { xs: 0.75, sm: 1 },
              flexShrink: 0,
              width: '100%',
            }}
          >
            <NetworkSettingsCard />
            <ProxyModeCard />
            <TrafficCard />
          </Box>

          {/* 第四区域：快捷工具 - 通栏整宽卡片 */}
          <Box sx={{ flexShrink: 0, width: '100%' }}>
            <QuickToolsCard />
          </Box>
        </Stack>
      </Box>
    </BasePage>
  )
}

export default HomePage
