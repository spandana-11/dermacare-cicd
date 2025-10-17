import React, { useRef } from 'react'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload, cilPencil, cilFile, cilX } from '@coreui/icons'

const DocumentField = ({
  label,
  base64Data,
  clinicName = 'Clinic',
  isEditing = false,
  onFileChange,
  openPdfPreview,
  uploadType = 'single', // 'single' or 'multiple'
}) => {
  const fileInputRef = useRef(null)

  // Normalize to array
  const normalizedData = Array.isArray(base64Data)
    ? base64Data
    : base64Data
    ? [base64Data]
    : []

  const getFileInfo = (data) => {
    if (!data || typeof data !== 'string') return { mime: '', ext: '', isPreviewable: false }
    const prefix = data.substring(0, 20)
    let mime = '', ext = '', isPreviewable = false

    if (prefix.includes('JVBERi0')) {
      mime = 'application/pdf'; ext = 'pdf'; isPreviewable = true
    } else if (prefix.includes('iVBORw0')) {
      mime = 'image/png'; ext = 'png'; isPreviewable = true
    } else if (prefix.includes('/9j/')) {
      mime = 'image/jpeg'; ext = 'jpg'; isPreviewable = true
    }
    return { mime, ext, isPreviewable }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
    ]

    const readers = files.map(file =>
      new Promise((resolve, reject) => {
        if (!allowedTypes.includes(file.type)) return reject('Invalid type')
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    )

    Promise.all(readers)
      .then((base64Files) => {
        if (uploadType === 'multiple') {
          const updated = [...normalizedData, ...base64Files]
          onFileChange(updated)
        } else {
          onFileChange(base64Files[0])
        }
        // clear native input so it doesn't keep previous file(s)
        if (fileInputRef.current) fileInputRef.current.value = ''
      })
      .catch((err) => console.error(err))
  }

  const handleRemove = (index) => {
    if (uploadType === 'multiple') {
      const updated = normalizedData.filter((_, i) => i !== index)
      onFileChange(updated)
    } else {
      onFileChange('')
    }
    // clear native input to avoid UI quirks
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDownload = (fileData, name) => {
    const a = document.createElement('a')
    a.href = fileData
    a.download = name
    a.click()
  }

  // show box only when there are files; otherwise render compact row (or nothing if not editing)
  const showBox = normalizedData.length > 0

  return (
    <div className="mb-3">
      {/* If there are files, show the boxed list */}
      {showBox ? (
        <div className="border rounded p-2 bg-light">
          {normalizedData.map((data, i) => {
            const info = getFileInfo(data)
            const fileName = `${clinicName}_${label}_${i + 1}.${info.ext}`
            const fileUrl = `data:${info.mime};base64,${data}`

            return (
              <div
                key={i}
                className="d-flex justify-content-between align-items-center border-bottom mb-1 pb-1"
              >
                <span className="text-muted text-truncate" style={{ maxWidth: '60%' }}>
                  {fileName}
                </span>

                <div className="d-flex align-items-center gap-2">
                  {info.isPreviewable && (
                    <span
                      className="text-info"
                      style={{ cursor: 'pointer' }}
                      title="Preview"
                      onClick={() => {
                        if (info.mime === 'application/pdf') {
                          openPdfPreview(data)
                        } else {
                          const imageUrl = `data:${info.mime};base64,${data}`
                          const newWindow = window.open()
                          newWindow.document.write(`
                            <html>
                              <head><title>Image Preview</title></head>
                              <body style="margin:0;display:flex;justify-content:center;align-items:center;background:#111;">
                                <img src="${imageUrl}" style="max-width:100%;height:auto;object-fit:contain;" />
                              </body>
                            </html>
                          `)
                        }
                      }}
                    >
                      <CIcon icon={cilFile} size="lg" />
                    </span>
                  )}

                  <span
                    className="text-primary"
                    style={{ cursor: 'pointer' }}
                    title="Download"
                    onClick={() => handleDownload(fileUrl, fileName)}
                  >
                    <CIcon icon={cilCloudDownload} size="lg" />
                  </span>

                  {isEditing && (
                    <span
                      className="text-danger"
                      style={{ cursor: 'pointer' }}
                      title="Remove"
                      onClick={() => handleRemove(i)}
                    >
                      <CIcon icon={cilX} size="lg" />
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        // when no files
        <>
          {!isEditing ? (
            <div className="text-muted">No {label} available.</div>
          ) : (
            // compact upload row (no gray box)
            <div className="d-flex align-items-center gap-2">
              <span
                className="text-warning"
                style={{ cursor: 'pointer' }}
                title="Upload"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <CIcon icon={cilPencil} size="lg" />
              </span>
              <span className="small text-muted">Upload {uploadType === 'multiple' ? 'one or more files' : 'a file'}</span>
            </div>
          )}
        </>
      )}

      {/* hidden file input (shared) */}
      {isEditing && (
        <input
          type="file"
          multiple={uploadType === 'multiple'}
          ref={fileInputRef}
  className="form-control" // ✅ standard input box styling
          onChange={handleFileSelect}
        />
      )}
    </div>
  )
}

export default DocumentField
