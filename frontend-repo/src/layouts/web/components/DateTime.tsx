import { css } from '@emotion/react'
import { useState, useEffect } from 'react'

const DateTime: React.FC = () => {
  const [time, setTime] = useState<Date>(new Date())

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div css={container}>
      <p>
        {time.toLocaleString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        })}
      </p>
      <p>{time.toLocaleString().substring(12)}</p>
    </div>
  )
}

export default DateTime

const container = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
`
