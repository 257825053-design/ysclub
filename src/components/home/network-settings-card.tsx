import { Box, Switch, Typography, alpha, SvgIcon } from '@mui/material'
import { CheckCircleOutlineOutlined, LaptopOutlined, LanOutlined, SettingsOutlined } from '@mui/icons-material'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLockFn } from 'ahooks'

import { useSystemData, useAppRefreshers } from '@/providers/app-data-context'
import { useVerge } from '@/hooks/use-verge'
import { showNotice } from '@/services/notice-service'
import iconDark from '@/assets/image/icon_dark.svg?react'

/**
 * NetworkSettingsCard - 网络设置卡片
 *
 * 设计规格：
 * - 标题 "网络设置" + "NETWORK"
 * - 两个并排按钮：系统代理、虚拟网卡（单选切换，二选一）
 * - 状态行：绿色勾选 + 代理状态 + 开关（永久锁定开启，不可关闭）
 *
 * 交互逻辑：
 * - 模式切换仅改变代理转发方式，不控制代理启停
 * - 下方开关永久锁定为开启状态，灰色不可点击
 */
const NetworkSettingsCard = memo(() => {
  const { t } = useTranslation()
  const { sysproxy, runningMode } = useSystemData()
  const { verge, patchVerge } = useVerge()
  const { refreshSysproxy } = useAppRefreshers()

  const isSystemProxy = sysproxy?.enable
  const isTunMode = runningMode === 'Service'

  // 单选模式切换：系统代理 / 虚拟网卡模式（二选一）
  const [selectedMode, setSelectedMode] = useState<'system' | 'tun'>(
    verge?.enable_tun_mode ? 'tun' : 'system',
  )

  const handleModeSelect = useLockFn(async (mode: 'system' | 'tun') => {
    if (mode === selectedMode) return
    setSelectedMode(mode)
    try {
      if (mode === 'tun') {
        await patchVerge({ enable_tun_mode: true, enable_system_proxy: false })
      } else {
        await patchVerge({ enable_tun_mode: false, enable_system_proxy: true })
      }
      await refreshSysproxy()
    } catch (error) {
      // 回退选择
      setSelectedMode(mode === 'tun' ? 'system' : 'tun')
      showNotice.error(error)
    }
  })

  return (
    <Box
      sx={{
        height: '100%',
        minWidth: 0,
        p: 0.75,
        borderRadius: 2,
        background: '#131A2B',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.25,
        overflow: 'hidden',
      }}
    >
      {/* 标题 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
        <SvgIcon
          component={iconDark}
          sx={{ width: 16, height: 16, flexShrink: 0, opacity: 0.9 }}
          inheritViewBox
        />
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
            网络设置
          </Typography>
          <Typography sx={{ fontSize: 8, color: '#8A98B5', letterSpacing: '1px', fontWeight: 500 }}>
            NETWORK
          </Typography>
        </Box>
      </Box>

      {/* 两个模式按钮 - 单选切换 */}
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flex: 1, alignContent: 'center' }}>
        {/* 系统代理 */}
        <Box
          onClick={() => handleModeSelect('system')}
          sx={{
            flex: 1,
            py: 0.25,
            px: 0.5,
            borderRadius: 1.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.25,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            bgcolor: selectedMode === 'system' ? alpha('#2378F5', 0.12) : 'rgba(255, 255, 255, 0.02)',
            border: selectedMode === 'system'
              ? '1px solid rgba(35, 120, 245, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.05)',
            '&:hover': {
              bgcolor: selectedMode === 'system' ? alpha('#2378F5', 0.15) : 'rgba(255, 255, 255, 0.04)',
            },
          }}
        >
          <LaptopOutlined
            sx={{
              fontSize: 18,
              color: selectedMode === 'system' ? '#2378F5' : '#64748B',
            }}
          />
          <Typography sx={{ fontSize: 10, fontWeight: 600, color: selectedMode === 'system' ? '#2378F5' : '#8A98B5' }}>
            系统代理
          </Typography>
        </Box>

        {/* 虚拟网卡 */}
        <Box
          onClick={() => handleModeSelect('tun')}
          sx={{
            flex: 1,
            py: 0.25,
            px: 0.5,
            borderRadius: 1.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.25,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            bgcolor: selectedMode === 'tun' ? alpha('#2378F5', 0.12) : 'rgba(255, 255, 255, 0.02)',
            border: selectedMode === 'tun'
              ? '1px solid rgba(35, 120, 245, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.05)',
            '&:hover': {
              bgcolor: selectedMode === 'tun' ? alpha('#2378F5', 0.15) : 'rgba(255, 255, 255, 0.04)',
            },
          }}
        >
          <LanOutlined
            sx={{
              fontSize: 18,
              color: selectedMode === 'tun' ? '#2378F5' : '#64748B',
            }}
          />
          <Typography sx={{ fontSize: 10, fontWeight: 600, color: selectedMode === 'tun' ? '#2378F5' : '#8A98B5' }}>
            虚拟网卡模式
          </Typography>
        </Box>
      </Box>

      {/* 状态行 - 开关永久锁定开启，不可关闭 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pt: 0.5,
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CheckCircleOutlineOutlined sx={{ fontSize: 14, color: '#36D399' }} />
          <Typography sx={{ fontSize: 11, color: '#D0D8E8', fontWeight: 500 }}>
            {selectedMode === 'system' ? '系统代理' : '虚拟网卡'}
          </Typography>
          <SettingsOutlined sx={{ fontSize: 13, color: '#64748B', cursor: 'pointer' }} />
        </Box>
        {/* 永久锁定开启的开关 - 禁用点击 */}
        <Switch
          checked={true}
          disabled={true}
          size="small"
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#2378F5',
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: '#2378F5',
            },
            '& .MuiSwitch-switchBase.Mui-disabled': {
              color: '#2378F5',
            },
            '& .MuiSwitch-switchBase.Mui-disabled + .MuiSwitch-track': {
              backgroundColor: 'rgba(35, 120, 245, 0.5)',
            },
          }}
        />
      </Box>
    </Box>
  )
})

NetworkSettingsCard.displayName = 'NetworkSettingsCard'

export default NetworkSettingsCard
