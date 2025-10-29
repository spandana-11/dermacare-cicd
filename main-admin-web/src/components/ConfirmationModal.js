import React from 'react'
import { CModal, CModalBody, CModalFooter, CButton, CModalHeader, CModalTitle } from '@coreui/react'

const ConfirmationModal = ({
  isVisible,
  message,
  onConfirm,
  onCancel,
  title = 'Confirmation',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'danger',
  cancelColor = 'secondary',
}) => {
  return (
    <CModal visible={isVisible} onClose={onCancel} alignment="center" backdrop="static" className='custom-modal'>
      {/* Header */}
      <CModalHeader>
        <CModalTitle style={{ color: 'var(--color-black)' }}>⚠ {title}</CModalTitle>
      </CModalHeader>

      {/* Body */}
      <CModalBody style={{ color: 'var(--color-black)', textAlign: 'center' }}>
        {message}
      </CModalBody>

      {/* Footer */}
      <CModalFooter style={{ color: 'var(--color-bgcolor)', justifyContent: 'center' }}>
        <CButton color={cancelColor} onClick={onCancel} style={{ minWidth: '100px' }}>
          {cancelText}
        </CButton>
        <CButton
          onClick={onConfirm}
          style={{
            minWidth: '100px',
            color: 'red',
            backgroundColor: 'var(--color-black)',
          }}
        >
          {confirmText}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ConfirmationModal