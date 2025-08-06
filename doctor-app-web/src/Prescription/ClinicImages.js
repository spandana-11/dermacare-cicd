import React, { useEffect, useRef, useState } from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CRow,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCamera, cilColumns, cilFolderOpen, cilTrash } from '@coreui/icons'
import Button from '../components/CustomButton/CustomButton'
import { COLORS, compareSvg } from '../Themes'
import './ClinicImages.css'
export default function MultiImageUpload() {
  const [items, setItems] = useState([]) // { id, file, preview }
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [busy, setBusy] = useState(false)
  // Compare modal state
  const [showCompare, setShowCompare] = useState(false)
  const [savedGrid, setSavedGrid] = useState([]) // [{id, name, dataUrl, savedAt}]
  const [selectedSavedId, setSelectedSavedId] = useState(null)
  const [selectedCurrentId, setSelectedCurrentId] = useState(null)

  // drag & drop highlight
  const [isDragging, setIsDragging] = useState(false)

  // file inputs
  const galleryRef = useRef(null)
  const cameraRef = useRef(null)

  // true camera capture (getUserMedia)
  const [camOpen, setCamOpen] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(document.createElement('canvas'))

  const MAX_SIZE = 5 * 1024 * 1024 // 5MB per image

  const setInfo = (text) => setMsg({ type: 'info', text })
  const setWarn = (text) => setMsg({ type: 'warning', text })
  const setErr = (text) => setMsg({ type: 'danger', text })
  const clearMsg = () => setMsg({ type: '', text: '' })

  const readSavedFromLocalStorage = () => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    try {
      const arr = JSON.parse(raw)
      // Normalize and include savedAt (fallback to now if missing)
      return arr.map((s) => ({
        id: s.id || `${s.name}-${Math.random()}`,
        name: s.name || 'image.jpg',
        dataUrl: s.dataUrl,
        savedAt: s.savedAt || new Date().toISOString(),
      }))
    } catch {
      return []
    }
  }
  // Open compare modal (requires at least 1 uploaded image)
  const openCompare = () => {
    if (items.length === 0) {
      setWarn('Please upload at least one image to compare.')
      return
    }
    const saved = readSavedFromLocalStorage()
    if (saved.length === 0) {
      setWarn('No saved images found. Use "Save to Device" first.')
      return
    }
    setSavedGrid(saved)
    setSelectedCurrentId(items[0]?.id || null)
    setSelectedSavedId(saved[0]?.id || null)
    setShowCompare(true)
  }

  const addFiles = async (files) => {
    const next = files
      .filter((f) => {
        if (!f.type?.startsWith('image/')) {
          setErr('Only image files are allowed.')
          return false
        }
        if (f.size > MAX_SIZE) {
          setWarn('Some files were >5MB and skipped.')
          return false
        }
        return true
      })
      .map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      }))
    setItems((prev) => [...prev, ...next])
  }

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return
    clearMsg()
    setBusy(true)
    try {
      await addFiles(files)
    } finally {
      setBusy(false)
    }
  }

  // Gallery
  const onPickGallery = (e) => {
    handleFiles(e.target.files)
    e.target.value = ''
  }

  // Camera (file input with capture hint — may still show chooser)
  const onPickCamera = (e) => {
    handleFiles(e.target.files)
    e.target.value = ''
  }

  // Remove one / Clear all
  const removeOne = (id) => {
    setItems((prev) => {
      const gone = prev.find((x) => x.id === id)
      if (gone?.preview) URL.revokeObjectURL(gone.preview)
      return prev.filter((x) => x.id !== id)
    })
  }
  const clearAll = () => {
    items.forEach((x) => x.preview && URL.revokeObjectURL(x.preview))
    setItems([])
  }

  // ---- Drag & Drop ----
  const onDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const onDragLeave = () => setIsDragging(false)
  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  // ---- True camera (getUserMedia) ----
  const startCamera = async () => {
    clearMsg()
    try {
      // environment tries rear camera on mobile; not guaranteed on all devices
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCamOpen(true)
    } catch (err) {
      setErr('Unable to access camera. Use HTTPS and a real device, and allow camera permissions.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }

  const capturePhoto = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video) return
    const w = video.videoWidth
    const h = video.videoHeight
    if (!w || !h) return
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, w, h)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
    if (!blob) return
    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' })
    addFiles([file])
    setInfo('Captured a photo from camera.')
  }

  useEffect(() => {
    if (!camOpen) stopCamera()
    // cleanup on unmount
    return () => stopCamera()
  }, [camOpen])

  // --- LocalStorage helpers ---
  const STORAGE_KEY = 'multiImageUpload.items.v1'

  // File -> data URL
  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const fr = new FileReader()
      fr.onload = () => resolve(fr.result) // data URL
      fr.onerror = reject
      fr.readAsDataURL(file)
    })

  // data URL -> Blob
  const dataUrlToBlob = async (dataUrl) => {
    const res = await fetch(dataUrl)
    return await res.blob()
  }

  // Optional: reconstruct a File from data URL (keeps type, name-ish)
  const dataUrlToFile = async (dataUrl, name = `image-${Date.now()}.jpg`) => {
    const blob = await dataUrlToBlob(dataUrl)
    return new File([blob], name, { type: blob.type || 'image/jpeg', lastModified: Date.now() })
  }

  // Save current items to localStorage (as data URLs)
  const saveToLocalStorage = async () => {
    try {
      setBusy(true)
      clearMsg()

      // Convert each file to data URL (or keep preview if it’s already a data URL)
      const serialized = await Promise.all(
        items.map(async (it) => {
          const isDataUrl = typeof it.preview === 'string' && it.preview.startsWith('data:')
          const dataUrl = isDataUrl
            ? it.preview
            : it.file
              ? await fileToDataUrl(it.file)
              : it.preview // blob URL; may not persist across sessions

          return {
            id: it.id,
            name: it.file?.name || 'image.jpg',
            type: it.file?.type || (isDataUrl ? dataUrl.split(';')[0].replace('data:', '') : ''),
            size: it.file?.size || undefined,
            lastModified: it.file?.lastModified || undefined,
            dataUrl, // persisted image data
          }
        }),
      )

      const payload = JSON.stringify(serialized)
      // Rough size check
      const bytes = new TextEncoder().encode(payload).length
      const mb = (bytes / (1024 * 1024)).toFixed(2)
      if (bytes > 4.5 * 1024 * 1024) {
        setWarn(`Data is ~${mb} MB and may exceed localStorage limits.`)
      }

      localStorage.setItem(STORAGE_KEY, payload)
      setInfo(`Saved ${serialized.length} image(s) to device.`) + // 🔽 Clear current UI after successful save
        items.forEach((x) => {
          if (typeof x.preview === 'string' && x.preview.startsWith('blob:')) {
            URL.revokeObjectURL(x.preview)
          }
        })
      setItems([])
    } catch (err) {
      console.error(err)
      setErr('Failed to save images to device storage.')
    } finally {
      setBusy(false)
    }
  }

  // Load items from localStorage
  const loadFromLocalStorage = async () => {
    clearMsg()
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      setWarn('No saved images found.')
      return
    }
    try {
      setBusy(true)
      const saved = JSON.parse(raw) // [{id, name, type, dataUrl, ...}]

      // Rebuild previews. We can either use dataUrl directly as <img src>,
      // or reconstruct File objects if you need to upload later.
      const rebuilt = await Promise.all(
        saved.map(async (s) => {
          // If you need actual File for later upload, uncomment next line:
          // const file = await dataUrlToFile(s.dataUrl, s.name);
          const file = undefined // keep lightweight; use dataUrl for preview
          return {
            id: s.id || `${s.name}-${Math.random()}`,
            file, // optional
            preview: s.dataUrl, // safe to render directly
          }
        }),
      )

      // Revoke old blob previews to avoid leaks
      items.forEach((x) => x.preview?.startsWith('blob:') && URL.revokeObjectURL(x.preview))
      setItems(rebuilt)
      setInfo(`Loaded ${rebuilt.length} image(s) from device.`)
    } catch (err) {
      console.error(err)
      setErr('Failed to load saved images.')
    } finally {
      setBusy(false)
    }
  }

  // Clear saved data (does not clear current UI items)
  const clearSaved = () => {
    localStorage.removeItem(STORAGE_KEY)
    setInfo('Cleared saved images.')
  }

  return (
    <CContainer fluid className="p-0 pb-4">
      <CRow className="g-3">
        <CCol xs={12}>
          <CCard className="shadow-sm">
            <CCardHeader className="d-flex align-items-center justify-content-between py-2">
              <strong>Upload Images</strong>
              <div className="small text-body-secondary">
                Gallery (multiple), Camera (hint), or Live Capture
              </div>
            </CCardHeader>

            <CCardBody>
              {msg.text && (
                <CAlert color={msg.type || 'info'} className="mb-3">
                  {msg.text}
                </CAlert>
              )}

              {/* Hidden inputs */}
              <input
                ref={galleryRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={onPickGallery}
              />
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment" /* hint; browsers may still show chooser */
                style={{ display: 'none' }}
                onChange={onPickCamera}
              />

              {/* Controls */}
              <div className="d-flex justify-content-evenly flex-wrap gap-2 mb-3">
                <Button
                  size="small"
                  variant="outline"
                  onClick={() => galleryRef.current?.click()}
                  disabled={busy}
                >
                  <CIcon icon={cilFolderOpen} className="me-2" />
                  Choose from Gallery
                </Button>

                <Button
                  customColor={COLORS.teal}
                  size="small"
                  onClick={() => cameraRef.current?.click()}
                  disabled={busy}
                  title="Uses file input with capture hint; some devices still show gallery chooser."
                >
                  <CIcon icon={cilCamera} className="me-2" />
                  Camera (File Input)
                </Button>

                <Button
                  size="small"
                  customColor={COLORS.success}
                  onClick={startCamera}
                  disabled={busy || !navigator.mediaDevices?.getUserMedia}
                  title="Opens live camera stream to capture"
                >
                  <CIcon icon={cilCamera} className="me-2" />
                  Open Live Camera
                </Button>

                {items.length > 0 && (
                  <Button
                    customColor={COLORS.danger}
                    size="small"
                    variant="outline"
                    onClick={clearAll}
                    disabled={busy}
                  >
                    <CIcon icon={cilTrash} className="me-2" />
                    Clear All
                  </Button>
                )}

                <Button
                  customColor={COLORS.gray}
                  size="small"
                  variant="primary"
                  onClick={openCompare}
                  disabled={busy}
                >
                  <CIcon icon={cilColumns} className="me-2" />
                  Compare
                </Button>

                {busy && (
                  <span className="d-inline-flex align-items-center ms-1">
                    <CSpinner size="sm" className="me-2" /> Processing…
                  </span>
                )}
              </div>

              {/* Drag & Drop Area */}
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className="border rounded d-flex align-items-center justify-content-center mb-3"
                style={{
                  height: 140,
                  background: isDragging ? 'rgba(0,123,255,0.08)' : 'var(--cui-body-bg)',
                  borderStyle: isDragging ? 'dashed' : 'solid',
                }}
              >
                <div className="text-center">
                  <div className="fw-semibold">Drag & Drop images here</div>
                  <div className="text-body-secondary small">or use the buttons above</div>
                </div>
              </div>

              {/* Grid previews */}
              {items.length === 0 ? (
                <div className="text-body-secondary">No images selected yet.</div>
              ) : (
                <CRow className="g-3">
                  {items.map((it) => (
                    <CCol key={it.id} xs={12} sm={6} md={4} lg={3}>
                      <div className="border rounded position-relative bg-body-tertiary">
                        <img
                          src={it.preview}
                          alt="uploaded"
                          style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover' }}
                        />
                        <Button
                          color="danger"
                          size="sm"
                          variant="ghost"
                          className="position-absolute"
                          style={{ top: 6, right: 6 }}
                          onClick={() => removeOne(it.id)}
                          aria-label="Remove"
                          title="Remove"
                        >
                          <CIcon icon={cilTrash} />
                        </Button>
                      </div>
                    </CCol>
                  ))}
                </CRow>
              )}
            </CCardBody>
            <div className="d-flex flex-wrap gap-2 mb-3 ps-3">
              {/* existing buttons ... */}

              {/* Save to localStorage */}
              <Button
                size="small"
                variant="outline"
                onClick={saveToLocalStorage}
                disabled={busy || items.length === 0}
              >
                Save to Device
              </Button>

              {/* Load from localStorage */}
              <Button color="secondary" size="small" onClick={loadFromLocalStorage} disabled={busy}>
                Load Saved
              </Button>

              {/* Clear saved (localStorage only) */}
              <Button
                customColor={COLORS.danger}
                size="small"
                variant="outline"
                onClick={clearSaved}
                disabled={busy}
              >
                Clear Saved
              </Button>
            </div>
          </CCard>
        </CCol>
      </CRow>

      {/* Live Camera Modal */}
      <CModal visible={camOpen} onClose={() => setCamOpen(false)} size="lg" alignment="center">
        <CModalHeader>
          <CModalTitle>Live Camera</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="d-flex justify-content-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', maxWidth: 640, background: '#000', borderRadius: 6 }}
            />
          </div>
        </CModalBody>
        <CModalFooter className="d-flex justify-content-between">
          <CButton color="secondary" variant="outline" onClick={() => setCamOpen(false)}>
            Close
          </CButton>
          <CButton color="success" onClick={capturePhoto}>
            Capture Photo
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal
        visible={showCompare}
        onClose={() => setShowCompare(false)}
        size="xl"
        alignment="center"
      >
        <CModalHeader>
          <CModalTitle>Compare Images</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {/* Compare preview */}
          <div className="border rounded p-2 mb-3">
            <div className="d-flex flex-wrap gap-2 justify-content-between align-items-start">
              <div style={{ flex: 1, minWidth: 280 }}>
                <div className="fw-semibold mb-1">Saved</div>
                <div className="compare-pane">
                  {(() => {
                    const sel = savedGrid.find((s) => s.id === selectedSavedId)
                    return sel ? (
                      <img src={sel.dataUrl} alt="saved" className="compare-img" />
                    ) : (
                      <div className="text-body-secondary">No saved selected</div>
                    )
                  })()}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 280 }}>
                <div className="fw-semibold mb-1">Current Upload</div>
                <div className="compare-pane">
                  {(() => {
                    const sel = items.find((it) => it.id === selectedCurrentId)
                    return sel ? (
                      <img src={sel.preview} alt="current" className="compare-img" />
                    ) : (
                      <div className="text-body-secondary">No current selected</div>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Pickers: Saved grid (with date) + Current grid */}
          <div className="d-flex flex-wrap gap-3">
            {/* Saved grid */}
            <div style={{ flex: 1, minWidth: 280 }}>
              <div className="fw-semibold mb-2">Saved Images</div>
              {savedGrid.length === 0 ? (
                <div className="text-body-secondary small">No saved images.</div>
              ) : (
                <div className="compare-grid">
                  {savedGrid.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`cmp-card ${selectedSavedId === s.id ? 'active' : ''}`}
                      onClick={() => setSelectedSavedId(s.id)}
                      title={s.name}
                    >
                      <img src={s.dataUrl} alt={s.name} />
                      <div className="cmp-meta">
                        <div className="cmp-name">{s.name}</div>
                        <div className="cmp-date">{new Date(s.savedAt).toLocaleString()}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Current grid */}
            <div style={{ flex: 1, minWidth: 280 }}>
              <div className="fw-semibold mb-2">Current Uploads</div>
              {items.length === 0 ? (
                <div className="text-body-secondary small">No uploads.</div>
              ) : (
                <div className="compare-grid">
                  {items.map((it) => (
                    <button
                      key={it.id}
                      type="button"
                      className={`cmp-card ${selectedCurrentId === it.id ? 'active' : ''}`}
                      onClick={() => setSelectedCurrentId(it.id)}
                      title={it.file?.name || 'uploaded'}
                    >
                      <img src={it.preview} alt="uploaded" />
                      <div className="cmp-meta">
                        <div className="cmp-name">{it.file?.name || 'uploaded'}</div>
                        <div className="cmp-date">Now</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CModalBody>

        <CModalFooter className="d-flex justify-content-between">
          <CButton color="secondary" variant="outline" onClick={() => setShowCompare(false)}>
            Close
          </CButton>
          <div>
            <CButton
              color="primary"
              disabled={!selectedSavedId || !selectedCurrentId}
              onClick={() => {
                if (!selectedSavedId || !selectedCurrentId) return
                // Optional: do something on confirm compare (e.g., export a combined view)
                setInfo('Comparison ready.')
              }}
            >
              Confirm Compare
            </CButton>
          </div>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}
