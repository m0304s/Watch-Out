import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more-cicd-test
      </p>
      <p className="test-the-pr-agent">
        PR Agent 테스트용 코드입니다.
        잘못된 부분이 있으면 알려주세요.
        싫어요...

        아아아아아아ㅏㅇ 왜 안되는거야
        어 진짜 되나?이제???뭔가 희망이 보이는데
        아 안된다....
        우ㅡㅇ어어렁나ㅣ러이ㅏ렁나ㅣ러아니러ㅏㅣㄴㅇ
      </p>
    </>
  )
}

export default App
