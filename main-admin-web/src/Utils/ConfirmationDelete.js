import { CButton, CModal, CModalBody, CModalFooter, CModalHeader } from "@coreui/react"

 export const ConfirmationModal = ({ isVisible, message, onConfirm, onCancel }) => {
    return (
      <CModal
        visible={isVisible}
        onClose={onCancel}
        // Keeps modal centered without outside click close
        alignment="top" // 👈 Places modal at the top
        backdrop={false}
      >
        <CModalHeader>
          <strong>Confirm Delete</strong>
        </CModalHeader>
        <CModalBody>
          <p style={{ margin: 0 }}>{message}</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onCancel}>
            Cancel
          </CButton>
          <CButton color="danger" style={{ color: 'white' }} onClick={onConfirm}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    )
  }