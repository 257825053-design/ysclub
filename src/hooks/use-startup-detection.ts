import { useEffect, useRef } from 'react'

import { hideInitialOverlay, updateOverlayProgress } from '@/pages/_layout/utils/initial-loading-overlay'

/**
 * useStartupDetection - 启动加载流程 Hook
 *
 * 在应用启动时执行分步加载流程，逐步更新加载进度条：
 * 1. 等待主题就绪
 * 2. 按固定节奏推进各步骤进度
 * 3. 派发 resize 事件通知 React 重新计算布局
 * 4. 等待页面布局稳定后隐藏加载层
 */

interface DetectionStep {
  label: string
  weight: number
}

const STEPS: DetectionStep[] = [
  { label: '初始化云山俱乐部', weight: 15 },
  { label: '检测设备环境', weight: 30 },
  { label: '调整窗口尺寸', weight: 50 },
  { label: '优化显示方案', weight: 75 },
  { label: '加载网络模块', weight: 90 },
  { label: '进入YSCLUB', weight: 100 },
]

/** 计算分步进度 */
function stepProgress(stepIndex: number): number {
  return STEPS[Math.min(stepIndex, STEPS.length - 1)].weight
}

/** 延迟工具 */
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export function useStartupDetection(themeReady: boolean) {
  const doneRef = useRef(false)

  useEffect(() => {
    if (!themeReady || doneRef.current) return
    doneRef.current = true

    let cancelled = false

    const run = async () => {
      try {
        // ===== Step 0: 初始化云山俱乐部 =====
        updateOverlayProgress(0, STEPS[0].label)
        await delay(200)
        if (cancelled) return

        // ===== Step 1: 检测设备环境 =====
        updateOverlayProgress(stepProgress(0), STEPS[1].label)
        await delay(300)
        if (cancelled) return

        // ===== Step 2: 调整窗口尺寸 =====
        updateOverlayProgress(stepProgress(1), STEPS[2].label)
        await delay(200)
        if (cancelled) return

        // 派发 resize 事件，触发 React 重新计算布局
        window.dispatchEvent(new Event('resize'))

        // ===== Step 3: 优化显示方案 =====
        updateOverlayProgress(stepProgress(2), STEPS[3].label)
        await delay(300)
        if (cancelled) return

        // 等待两帧确保 React 完成重渲染
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        })

        // 再次派发 resize，确保最终布局稳定
        window.dispatchEvent(new Event('resize'))

        // 再等待两帧让二次渲染完成
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        })

        // ===== Step 4: 进入YSCLUB =====
        updateOverlayProgress(stepProgress(4), STEPS[5].label)
        await delay(200)
        if (cancelled) return

        // 隐藏加载层
        hideInitialOverlay()
      } catch {
        // 出错时也要隐藏加载层，避免卡死
        hideInitialOverlay()
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [themeReady])
}
