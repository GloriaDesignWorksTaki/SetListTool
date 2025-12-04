import { Font } from '@react-pdf/renderer'

/**
 * PDF生成用の日本語フォントを登録
 */
export const registerFonts = () => {
  Font.register({
    family: 'Zen Kaku Gothic New',
    fonts: [
      {
        src: '/font/ZenKakuGothicNew-Regular.ttf',
        fontWeight: 'normal'
      },
      {
        src: '/font/ZenKakuGothicNew-Bold.ttf',
        fontWeight: 'bold'
      }
    ]
  })
}

