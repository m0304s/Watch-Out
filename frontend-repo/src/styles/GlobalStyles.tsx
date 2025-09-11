import { Global, css } from '@emotion/react'

const GlobalStyles = () => (
  <Global
    styles={css`
      @font-face {
        font-family: 'PretendardBold';
        src: url('/fonts/Pretendard-Bold.woff') format('woff');
        font-weight: 700;
        font-style: normal;
      }
      @font-face {
        font-family: 'PretendardSemiBold';
        src: url('/fonts/Pretendard-SemiBold.woff') format('woff');
        font-weight: 600;
        font-style: normal;
      }
      @font-face {
        font-family: 'PretendardRegular';
        src: url('/fonts/Pretendard-Regular.woff') format('woff');
        font-weight: 400;
        font-style: normal;
      }
      @font-face {
        font-family: 'PretendardLight';
        src: url('/fonts/Pretendard-Light.woff') format('woff');
        font-weight: 300;
        font-style: normal;
      }

      :root {
        /* Primary */
        --color-primary: #1a73e8;
        --color-primary-light: #eaf1fe;

        /* Gray */
        --color-gray-50: #fafafa;
        --color-gray-100: #f5f5f5;
        --color-gray-200: #efefef;
        --color-gray-300: #e2e2e2;
        --color-gray-400: #bfbfbf;
        --color-gray-500: #a0a0a0;
        --color-gray-600: #777777;
        --color-gray-700: #636363;
        --color-gray-800: #444444;
        --color-gray-900: #232527;

        /* Semantic */
        --color-red: #ff1818;
        --color-green: #57ad5a;
        --color-yellow: #f1c40f;

        /* Background */
        --color-bg-white: #ffffffff;

        /* Base */
        --color-background: #fff;
        --color-text: #333;
        --color-text-white: #fff;
        --color-text-black: #000;
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'PretendardRegular', sans-serif;
      
        color: var(--color-text);
        line-height: 1.6;
      }

      /* 기본 제목 스타일 */
      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        font-family: 'PretendardBold', sans-serif;
        color: var(--color-gray-900);
        line-height: 1.2;
        margin: 0;
      }

      /* 기본 문단 스타일 */
      p {
        margin: 0;
        line-height: 1.6;
      }

      /* 기본 버튼 스타일 */
      button {
        font-family: inherit;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      /* 기본 입력 필드 스타일 */
      input,
      textarea {
        font-family: inherit;
        border: none;
        outline: none;
      }

      /* 모바일 전용 미디어 쿼리 */
      @media (max-width: 768px) {
        body {
          font-size: 14px;
        }
      }
    `}
  />
)

export default GlobalStyles

