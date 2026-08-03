import { useEffect, useState } from 'react'

/**
 * useWindowMode - 窗口密度模式 Hook
 *
 * 根据窗口实际可用高度自动选择 UI 密度模式：
 *
 * 基准窗口 1100×960，可用高度 ≈ 876px → Large 模式
 *
 * - Compact（紧凑模式）：< 680px 可用高度
 *   卡片间距缩小，内边距缩小
 *
 * - Standard（标准模式）：680-820px 可用高度
 *   完整显示所有卡片，标准间距
 *
 * - Large（大屏模式）：> 820px 可用高度
 *   所有内容完整展示，间距更大，体验最佳
 */

export type WindowMode = 'compact' | 'standard' | 'large'

export interface WindowModeInfo {
  mode: WindowMode
  availableWidth: number
  availableHeight: number
  /** 卡片间距（px） */
  cardGap: number
  /** 内边距（px） */
  pagePadding: number
  /** 是否显示卡片副标题 */
  showSubtitle: boolean
  /** 是否显示辅助说明文字 */
  showHelperText: boolean
}

const TITLEBAR_HEIGHT = 36
const BASEPAGE_HEADER_HEIGHT = 48

function computeMode(): WindowModeInfo {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const availableHeight = viewportHeight - TITLEBAR_HEIGHT - BASEPAGE_HEADER_HEIGHT
  const availableWidth = viewportWidth

  let mode: WindowMode = 'standard'
  if (availableHeight < 680) {
    mode = 'compact'
  } else if (availableHeight > 820) {
    mode = 'large'
  }

  const cardGap = mode === 'compact' ? 6 : mode === 'large' ? 12 : 8
  const pagePadding = mode === 'compact' ? 8 : mode === 'large' ? 14 : 10
  const showSubtitle = mode !== 'compact'
  const showHelperText = mode !== 'compact'

  return {
    mode,
    availableWidth,
    availableHeight,
    cardGap,
    pagePadding,
    showSubtitle,
    showHelperText,
  }
}

export function useWindowMode(): WindowModeInfo {
  const [info, setInfo] = useState<WindowModeInfo>(() => computeMode())

  useEffect(() => {
    let rafId: number | null = null

    const update = () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        setInfo(computeMode())
      })
    }

    update()
    window.addEventListener('resize', update)

    // Tauri 窗口 DPI 变化
    let unlisten: (() => void) | null = null
    import('@tauri-apps/api/window')
      .then(({ getCurrentWindow }) => {
        const win = getCurrentWindow()
        win.onScaleChanged(() => update()).then((fn) => {
          unlisten = fn
        })
      })
      .catch(() => {})

    return () => {
      window.removeEventListener('resize', update)
      if (rafId !== null) cancelAnimationFrame(rafId)
      if (unlisten) unlisten()
    }
  }, [])

  return info
}
