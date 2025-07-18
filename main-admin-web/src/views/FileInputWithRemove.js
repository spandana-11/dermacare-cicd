import React from 'react'
import { CFormInput, CFormFeedback, CButton } from '@coreui/react'
import { FaTimes, FaFileAlt } from 'react-icons/fa'

export const FileInputWithRemove = ({
  name,
  file,
  error,
  onChange,
  onRemove,
  accept,
  multiple = false,
  invalid,
}) => {
  const renderFilePreview = () => {
    if (!file || (Array.isArray(file) && file.length === 0)) return null

    if (Array.isArray(file)) {
      return file.map((f, index) => (
        <div key={index} className="d-flex align-items-center mb-1">
          <FaFileAlt className="me-2" />
          <span className="me-2">{f.name}</span>
          <CButton
            color="danger"
            size="sm"
            onClick={() => onRemove(name, index)}
            className="px-2 py-0"
          >
            <FaTimes />
          </CButton>
        </div>
      ))
    } else {
      return (
        <div className="d-flex align-items-center mb-1">
          <FaFileAlt className="me-2" />
          <span className="me-2">{file.name}</span>
          <CButton
            color="danger"
            size="sm"
            onClick={() => onRemove(name)}
            className="px-2 py-0"
          >
            <FaTimes />
          </CButton>
        </div>
      )
    }
  }

  return (
    <>
      <CFormInput
        type="file"
        name={name}
        onChange={onChange}
        accept={accept}
        multiple={multiple}
        invalid={invalid}
      />
      {renderFilePreview()}
      {error && <CFormFeedback invalid>{error}</CFormFeedback>}
    </>
  )
}

export default FileInputWithRemove
