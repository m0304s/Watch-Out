import { ReactNode } from 'react'
import { css } from '@emotion/react'

interface ModalContentProps {
  children: ReactNode
  variant?: 'default' | 'mobile'
  padding?: boolean
}

export const ModalContent = ({
  children,
  variant = 'default',
  padding = true,
}: ModalContentProps) => {
  return (
    <div
      css={[
        modalContentStyles.content,
        getVariantStyles(variant),
        padding && modalContentStyles.withPadding,
      ]}
    >
      {children}
    </div>
  )
}

const getVariantStyles = (variant: ModalContentProps['variant']) => {
  switch (variant) {
    case 'mobile':
      return modalContentStyles.mobile
    default:
      return modalContentStyles.default
  }
}

const modalContentStyles = {
  content: css`
    flex: 1;
    overflow-y: auto;
  `,
  default: css`
    padding: 0;
  `,
  mobile: css`
    padding: 0;
  `,
  withPadding: css`
    padding: 24px;
  `,
}
