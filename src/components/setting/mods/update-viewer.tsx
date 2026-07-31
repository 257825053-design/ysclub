import { Box, Typography } from '@mui/material'
import type { Ref } from 'react'
import { useImperativeHandle, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BaseDialog, DialogRef } from '@/components/base'

/**
 * UpdateViewer - 更新查看器
 *
 * 更新功能已彻底禁用。当用户手动点击「检查更新」时，
 * 仅显示文字提示：当前版本无内置升级渠道，请前往官网手动下载新版本。
 */
export function UpdateViewer({ ref }: { ref?: Ref<DialogRef> }) {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
  }))

  return (
    <BaseDialog
      open={open}
      title={t('settings.modals.update.title', { version: '' })}
      contentSx={{
        width: { xs: 'calc(100vw - 56px)', sm: 460 },
        maxWidth: 'calc(100vw - 56px)',
      }}
      okBtn={t('shared.actions.confirm')}
      cancelBtn={t('shared.actions.cancel')}
      onClose={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      onOk={() => setOpen(false)}
    >
      <Box
        sx={{
          py: 3,
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 600,
            color: 'text.primary',
            textAlign: 'center',
          }}
        >
          当前版本无内置升级渠道
        </Typography>
        <Typography
          sx={{
            fontSize: 14,
            color: 'text.secondary',
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          请前往官网手动下载新版本安装包进行升级。
        </Typography>
      </Box>
    </BaseDialog>
  )
}
