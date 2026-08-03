let removed = false

/**
 * 更新加载层的进度条和状态文字
 *
 * @param percent 进度百分比 (0-100)
 * @param statusText 当前步骤的状态文字
 */
export const updateOverlayProgress = (percent: number, statusText: string) => {
  if (removed) return

  const bar = document.getElementById('startup-progress-bar')
  const text = document.getElementById('startup-status-text')

  if (bar) {
    bar.style.width = `${Math.max(0, Math.min(100, percent))}%`
  }
  if (text) {
    text.textContent = statusText
  }
}

/**
 * 隐藏初始加载层
 *
 * @returns setTimeout 的 timer id（用于清理），如果不需要则返回 undefined
 */
export const hideInitialOverlay = (): number | undefined => {
  if (removed) return undefined

  const overlay = document.getElementById('initial-loading-overlay')
  if (!overlay) {
    removed = true
    return undefined
  }

  removed = true

  // 先将进度条填满，给用户一个完成感
  const bar = document.getElementById('startup-progress-bar')
  if (bar) {
    bar.style.width = '100%'
  }
  const text = document.getElementById('startup-status-text')
  if (text) {
    text.textContent = '准备就绪'
  }

  // 短暂延迟后开始淡出
  const timer = window.setTimeout(() => {
    overlay.dataset.hidden = 'true'
    window.setTimeout(() => overlay.remove(), 400)
  }, 150)

  return timer
}
