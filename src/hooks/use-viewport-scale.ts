import { useEffect, useState } from 'react'

/**
 * useViewportScale - 首页内容自适应缩放 Hook
 *
 * 根据窗口实际可用高度与设计基准高度的比值，计算 CSS zoom 缩放系数。
 * 配合 Rust 端的屏幕自适应窗口尺寸，确保在任何分辨率下首页内容完整显示。
 *
 * 工作原理：
 * 1. 监听 window resize 事件，获取视口高度
 * 2. 扣除固定 UI 元素高度（标题栏 36px + 页面头 48px + 内边距 24px）
 * 3. 与设计基准高度（650px）比较，计算缩放系数
 * 4. 系数范围 [0.72, 1.15]，避免过度缩小或放大
 * 5. 同时设置 CSS 变量 --ui-scale 供其他组件使用
 */
const TITLEBAR_HEIGHT = 36 // 自定义标题栏高度
const BASEPAGE_HEADER_HEIGHT = 48 // BasePage 页面头高度
const PADDING = 24 // 首页内容上下内边距合计 (12px * 2)
const DESIGN_BASELINE_HEIGHT = 650 // 设计基准高度：此高度下 scale=1.0，所有卡片完整显示
const MIN_SCALE = 0.72 // 最小缩放：极小屏幕下的下限
const MAX_SCALE = 1.15 // 最大缩放：大屏幕下的上限

export function useViewportScale(): number {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    let rafId: number | null = null

    const compute = () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const viewportHeight = window.innerHeight
        const availableHeight =
          viewportHeight - TITLEBAR_HEIGHT - BASEPAGE_HEADER_HEIGHT - PADDING
        const newScale = Math.max(
          MIN_SCALE,
          Math.min(MAX_SCALE, availableHeight / DESIGN_BASELINE_HEIGHT),
        )
        setScale(newScale)
        document.documentElement.style.setProperty(
          '--ui-scale',
          newScale.toFixed(4),
        )
      })
    }

    compute()
    window.addEventListener('resize', compute)

    // Tauri 窗口在多显示器间移动时 DPI 可能变化，额外监听
    let unlistenScaleChange: (() => void) | null = null
    import('@tauri-apps/api/window')
      .then(({ getCurrentWindow }) => {
        const win = getCurrentWindow()
        const promise = win.onScaleChanged(() => compute())
        promise.then((unlisten) => {
          unlistenScaleChange = unlisten
        })
      })
      .catch(() => {
        // 非 Tauri 环境忽略
      })

    return () => {
      window.removeEventListener('resize', compute)
      if (rafId !== null) cancelAnimationFrame(rafId)
      if (unlistenScaleChange) unlistenScaleChange()
    }
  }, [])

  return scale
}
