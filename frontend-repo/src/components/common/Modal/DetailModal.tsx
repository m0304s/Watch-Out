import { type ReactNode } from 'react'
import { BaseModal } from './BaseModal'
import { ModalHeader } from './ModalHeader'
import { ModalContent } from './ModalContent'
import { ModalLoading } from './ModalLoading'
import { ModalError } from './ModalError'

interface DetailModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  variant?: 'default' | 'mobile'
  size?: 'small' | 'medium' | 'large'
}

export const DetailModal = ({
  isOpen,
  onClose,
  title,
  children,
  loading = false,
  error = null,
  onRetry,
  variant = 'default',
  size = 'medium',
}: DetailModalProps) => {
  const renderContent = () => {
    if (loading) {
      return <ModalLoading />
    }

    if (error) {
      return <ModalError message={error} onRetry={onRetry} />
    }

    return children
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size={size} variant={variant}>
      <ModalHeader title={title} onClose={onClose} variant={variant} />

      <ModalContent variant={variant}>{renderContent()}</ModalContent>
    </BaseModal>
  )
}
