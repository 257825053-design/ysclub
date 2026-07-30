import { Box, Typography, alpha } from '@mui/material'
import {
  NetworkPingOutlined,
  SpeedOutlined,
  DataUsageOutlined,
  DescriptionOutlined,
  RuleOutlined,
} from '@mui/icons-material'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

/**
 * QuickToolsCard - 快捷工具卡片
 *
 * 设计规格：
 * - 标题 "快捷工具" + "TOOLS"
 * - 5 个等距排布功能按钮（深色圆角矩形 + 白色图标 + 文字）
 * - 延迟测试、速度测试、流量统计、日志查询、规则编辑
 */
const QuickToolsCard = memo(() => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const tools = [
    {
      icon: <NetworkPingOutlined sx={{ fontSize: 20 }} />,
      label: '延迟测试',
      subtitle: '测试节点延迟',
      path: '/test',
      color: '#2378F5',
    },
    {
      icon: <SpeedOutlined sx={{ fontSize: 20 }} />,
      label: '速度测试',
      subtitle: '测试当前速度',
      path: '/test',
      color: '#36D399',
    },
    {
      icon: <DataUsageOutlined sx={{ fontSize: 20 }} />,
      label: '流量统计',
      subtitle: '查看使用情况',
      path: '/connections',
      color: '#F59E0B',
    },
    {
      icon: <DescriptionOutlined sx={{ fontSize: 20 }} />,
      label: '日志查询',
      subtitle: '分析连接日志',
      path: '/logs',
      color: '#EF4444',
    },
    {
      icon: <RuleOutlined sx={{ fontSize: 20 }} />,
      label: '规则编辑',
      subtitle: '自定义规则',
      path: '/rules',
      color: '#4F46E5',
    },
  ]

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2.5,
        background: '#131A2B',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* 标题 */}
      <Box sx={{ mb: 1 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.3 }}>
          快捷工具
        </Typography>
        <Typography sx={{ fontSize: 9, color: '#8A98B5', letterSpacing: '1px', fontWeight: 500 }}>
          TOOLS
        </Typography>
      </Box>

      {/* 工具按钮网格 */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 1,
        }}
      >
        {tools.map((tool) => (
          <Box
            key={tool.label}
            onClick={() => navigate(tool.path)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.3,
              py: 0.8,
              px: 0.5,
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              '&:hover': {
                bgcolor: alpha(tool.color, 0.08),
                borderColor: alpha(tool.color, 0.2),
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: 1.5,
                bgcolor: alpha(tool.color, 0.1),
                color: tool.color,
                transition: 'all 0.2s ease',
              }}
            >
              {tool.icon}
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#FFFFFF', lineHeight: 1.3 }}>
                {tool.label}
              </Typography>
              <Typography sx={{ fontSize: 9, color: '#8A98B5', lineHeight: 1.3 }}>
                {tool.subtitle}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
})

QuickToolsCard.displayName = 'QuickToolsCard'

export default QuickToolsCard