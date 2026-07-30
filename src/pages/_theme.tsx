import getSystem from '@/utils/get-system'
const OS = getSystem()

// default theme setting
export const defaultTheme = {
  primary_color: '#007AFF',
  secondary_color: '#FC9B76',
  primary_text: '#000000',
  secondary_text: '#3C3C4399',
  info_color: '#007AFF',
  error_color: '#FF3B30',
  warning_color: '#FF9500',
  success_color: '#06943D',
  background_color: '#F5F5F5',
  font_family: `-apple-system, BlinkMacSystemFont,"Microsoft YaHei UI", "Microsoft YaHei", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji"${
    OS === 'windows' ? ', twemoji mozilla' : ''
  }`,
}

// dark mode - YSCLUB Tech Theme (Pixel-Perfect Design Spec)
export const defaultDarkTheme = {
  ...defaultTheme,
  primary_color: '#2378F5',
  secondary_color: '#4F46E5',
  primary_text: '#FFFFFF',
  background_color: '#0B101C',
  secondary_text: '#D0D8E8',
  info_color: '#2378F5',
  error_color: '#EF4444',
  warning_color: '#F59E0B',
  success_color: '#36D399',
}
