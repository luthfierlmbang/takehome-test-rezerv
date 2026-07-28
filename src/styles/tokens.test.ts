import { colors, radius } from './tokens'

test('exposes Figma-sourced brand tokens', () => {
  expect(colors.primary).toBe('#083035')
  expect(colors.border).toBe('#E4E4E7')
  expect(colors.surfaceMuted).toBe('#FAFAFA')
  expect(colors.textMuted).toBe('#71717A')
  expect(radius.sm).toBe('8px')
  expect(radius.lg).toBe('16px')
})
