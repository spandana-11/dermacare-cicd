import React from 'react'

const FilePreview = ({ label, type, data }) => {
  if (!data) {
    return <p className="text-muted">{label} not provided</p>
  }

  const isImage = type?.startsWith('image/')
  const isPDF = type === 'application/pdf'
  const isWord =
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    type === 'application/msword'

  const fileUrl = data.startsWith('data:') ? data : `data:${type};base64,${data}`
  const cleanBase64 = (base64String) => {
    if (!base64String) return ''
    // Remove any "data:*;base64," prefix
    if (base64String.includes(',')) {
      return base64String.split(',')[1].replace(/\s/g, '') // also remove spaces
    }
    return base64String.replace(/\s/g, '') // remove spaces if any
  }

  const handlePreview = (base64String) => {
    const clean = cleanBase64(base64String)
    if (!clean) return alert('Invalid file data')
    const mimeType = getMimeTypeFromBase64(clean)
    const blob = base64toBlob(clean, mimeType)
    if (blob) {
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    }
  }

  const getMimeTypeFromBase64 = (base64String) => {
    if (base64String.startsWith('JVBERi0')) return 'application/pdf'
    if (base64String.startsWith('/9j/')) return 'image/jpeg'
    if (base64String.startsWith('iVBORw0')) return 'image/png'
    if (base64String.startsWith('R0lGOD')) return 'image/gif'
    return 'application/octet-stream'
  }

  const base64toBlob = (base64, mimeType) => {
    try {
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      return new Blob([byteArray], { type: mimeType })
    } catch (e) {
      console.error('Base64 decoding failed:', e)
      alert('Failed to decode file data.')
      return null
    }
  }

  const handleDownload = (base64String, fileName) => {
    const clean = cleanBase64(base64String)
    if (!clean) return alert('Invalid file data')
    const mimeType = getMimeTypeFromBase64(clean)
    const blob = base64toBlob(clean, mimeType)
    if (blob) {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="bg-white p-3 rounded-md shadow-sm my-2">
      <strong>{label}</strong>
      <div className="mt-2 d-flex align-items-center gap-2">
        {isImage ? (
          <img
            src={fileUrl}
            alt={label}
            className="w-32 h-32 object-cover rounded-md border cursor-pointer"
            onClick={() => handlePreview(fileUrl)} // ✅ Pass function
          />
        ) : (
          <button
            type="button"
            className="btn px-3 py-1"
            style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
            onClick={() => handlePreview(fileUrl)} // ✅ Pass function
          >
            Preview
          </button>
        )}
        <button
          type="button"
          className="btn px-3 py-1"
          style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
          onClick={() => handleDownload(fileUrl, label.replace(/\s+/g, '_'))} // ✅ Pass function
        >
          Download
        </button>
      </div>
    </div>
  )
}

export default FilePreview
