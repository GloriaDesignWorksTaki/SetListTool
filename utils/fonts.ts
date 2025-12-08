import { Font } from '@react-pdf/renderer'

// フォント登録済みフラグ
let fontsRegistered = false

/**
 * PDF生成用の日本語フォントを登録
 * 重複登録を防ぐため、一度だけ実行される
 */
export const registerFonts = () => {
  if (fontsRegistered) {
    return
  }

  try {
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
    fontsRegistered = true
  } catch (error) {
    fontsRegistered = true
  }
}

