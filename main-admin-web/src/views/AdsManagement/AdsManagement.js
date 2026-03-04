import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  CNav,
  CNavItem,
  CNavLink,
  CCard,
  CCardBody,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormLabel,
  CImage,
} from "@coreui/react";
import { BASE_URL_API } from "../../baseUrl";
import { Edit2, Eye, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { COLORS } from "../../Constant/Themes";
/* 🔒 REQUIRED IMAGE SIZES */


const AdsManagement = () => {
  const [activeKey, setActiveKey] = useState(1);
  const [adsData, setAdsData] = useState({ dashboard: [], service: [], clinic: [] });

  // Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", data: "", type: "", fileName: "" });
  const [formErrors, setFormErrors] = useState({ title: "", data: "" });
  const addFileInputRef = useRef(null);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ _id: "", title: "", data: "", type: "", fileName: "" });
  const [editErrors, setEditErrors] = useState({ title: "", data: "" });
  const editFileInputRef = useRef(null);

  // View Modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [clinics, setClinics] = useState([])
  const [selectedClinic, setSelectedClinic] = useState({
    clinicId: "",
    clinicName: ""
  })
  // API Endpoints
  const API = {
    dashboard: {
      get: `${BASE_URL_API}/dashboard-ads`,
      post: `${BASE_URL_API}/dashboard-ads/upload-file-json`,
      update: (id) => `${BASE_URL_API}/dashboard-ads/${id}`,
      delete: (id) => `${BASE_URL_API}/dashboard-ads/${id}`,
    },
    service: {
      get: `${BASE_URL_API}/service-ads`,
      post: `${BASE_URL_API}/service-ads/upload-file-json`,
      update: (id) => `${BASE_URL_API}/service-ads/${id}`,
      delete: (id, clinicId) => `${BASE_URL_API}/service-ads/${id}/${clinicId}`,
    },
    clinic: {
      get: `${BASE_URL_API}/clinic-ads`,
      post: `${BASE_URL_API}/clinic-ads/upload-file-json`,
      update: (id) => `${BASE_URL_API}/clinic-ads/${id}`,
      delete: (id) => `${BASE_URL_API}/clinic-ads/${id}`,
    },
  };
  const fetchClinics = async () => {
    try {
      const res = await axios.get(`${BASE_URL_API}/clinics`)
      setClinics(res.data?.data || [])
    } catch (err) {
      console.error(err)
      toast.error("Failed to load clinics")
    }
  }
  const getCategory = () =>
    activeKey === 1 ? "dashboard" : activeKey === 2 ? "service" : "clinic";
  useEffect(() => {
    fetchAds()

    if (getCategory() === "service") {
      fetchClinics()
    }
  }, [activeKey])

  // Determine current category


  // Fetch Ads
  const fetchAds = async () => {
    const category = getCategory();
    try {
      const response = await axios.get(API[category].get);
      const adsArray = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.data)
          ? response.data.data
          : [];

      const mappedData = adsArray.map((ad) => ({
        _id: ad.id,
        data: ad.url,
        type: ad.type,
        title: ad.title || "Ad",
        fileName: ad.url.split("/").pop().split("?")[0],
        category: ad.category || category,
        ...(category === "service" && { clinicId: ad.clinicId || ad.clinic_id || "" }), // add clinicId here based on your API
      }));

      setAdsData((prev) => ({
        ...prev,
        [category]: mappedData,
      }));
    } catch (err) {
      console.log(err);
    }
  };



  // Open Add Modal
  const openAddModal = () => {
    setFormData({ title: "", data: "", type: "", fileName: "" })
    setFormErrors({ title: "", data: "" })
    setSelectedClinic({ clinicId: "", clinicName: "" })
    if (addFileInputRef.current) addFileInputRef.current.value = null
    setShowAddModal(true)
  }


  // File Upload Handler
  const [previewUrl, setPreviewUrl] = useState("");

  // When uploading file
  const handleFileUpload = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB 
    const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png"];
    const allowedVideoTypes = ["video/mp4", "audio/mp3"];
    if (![...allowedImageTypes, ...allowedVideoTypes].includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG images and MP3, MP4 videos are allowed!");
      e.target.value = null; return;
    } if (file.size > MAX_SIZE) {
      toast.error("File size must be less than 5 MB!"); e.target.value = null; return;
    } const fileType = file.type.startsWith("image") ? "image" : "video";
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Only = reader.result.split(",")[1]; // just the base64 
      const previewUrl = URL.createObjectURL(file); // blob URL for preview

      if (isEdit) {
        setEditData({
          ...editData,
          data: base64Only,
          fileName: file.name,
          previewUrl,
          fileObject: file, // this signals a new file is selected
        });
      }
      else {
        setFormData({ ...formData, data: base64Only, type: fileType, fileName: file.name, previewUrl, fileObject: file });
      }
    }; reader.readAsDataURL(file);
  };
  // Validate Add Form
  const validateAddForm = () => {
    let errors = { title: "", data: "" };
    let valid = true;
    if (!formData.title.trim()) {
      errors.title = "Title is required.";
      valid = false;
    }
    if (getCategory() === "service" && !selectedClinic.clinicId) {
      toast.error("Please select a clinic")
      valid = false
    }

    if (!formData.data) {
      errors.data = "Media file is required.";
      valid = false;
    }
    setFormErrors(errors);
    return valid;
  };

  // Validate Edit Form
  const validateEditForm = () => {
    let errors = { title: "", data: "" };
    let valid = true;



    if (getCategory() === "service" && !selectedClinic.clinicId) {
      toast.error("Please select a clinic");
      valid = false;
    }

    setEditErrors(errors);
    return valid;
  };



  // Save Ad
  const handleSaveAd = async () => {
    if (!validateAddForm()) return

    const category = getCategory()

    const payload = {
      title: formData.title,
      data: formData.data,
      type: formData.type,
      filename: formData.fileName,
      ...(category === "service" && {
        clinicId: selectedClinic.clinicId // only send ID to backend
      })
    }


    try {
      await axios.post(API[category].post, payload)
      toast.success("Advertisement added")
      setShowAddModal(false)
      fetchAds()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add advertisement")
    }
  }

  // Update Ad
  const handleUpdateAd = async () => {
    if (!validateEditForm()) return;

    const category = getCategory();

    const payload = {
      title: editData.title,
      type: editData.type,
      filename: editData.fileName,
      ...(category === "service" && { clinicId: selectedClinic.clinicId }),
    };

    // ✅ Only include data if a new file is uploaded (Base64)
    if (editData.fileObject) {
      payload.data = editData.data; // Base64 string
    }

    try {
      await axios.put(API[category].update(editData._id), payload);
      toast.success("Advertisement updated successfully");
      setShowEditModal(false);
      fetchAds();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update advertisement");
    }
  };

  // Delete Ad
  const confirmDelete = async () => {
    const category = getCategory();
    try {
      if (category === "service") {
        await axios.delete(API.service.delete(deleteId, selectedAd.clinicId));
      } else {
        await axios.delete(API[category].delete(deleteId));
      }
      toast.success("Advertisement deleted successfully!");
      fetchAds();
      setShowDeleteModal(false);
    } catch (err) {
      console.log(err);
      toast.error("Failed to delete advertisement!");
    }
  };

  // View & Edit Handlers
  const handleView = (ad) => {
    setSelectedAd(ad);
    setShowViewModal(true);
  };

  const handleEdit = (ad) => {
    const category = getCategory();
    setEditData({
      _id: ad._id,
      title: ad.title || "",
      type: ad.type || "",
      fileName: ad.fileName || "",
      previewUrl: ad.data || "", // preview
      fileObject: null,           // no new file yet
    });

    if (category === "service") {
      const clinic = clinics.find((c) => c.clinicId === ad.clinicId);
      setSelectedClinic({
        clinicId: ad.clinicId || "",
        clinicName: clinic?.name || "",
      });
    } else {
      setSelectedClinic({ clinicId: "", clinicName: "" });
    }

    setShowEditModal(true);
  };

  const getActiveAds = activeKey === 1 ? adsData.dashboard : activeKey === 2 ? adsData.service : adsData.clinic;

  return (
    <CCard className="mb-3" >
      <div
        className="text-white p-3 d-flex justify-content-between align-items-center rounded"
        style={{ background: "linear-gradient(135deg, var(--color-black), var(--color-bgcolor))" }
        }
      >
        <h5 className="mb-1" style={{ color: "white" }}> Advertisement Management </h5>
        < CButton color="secondary"
          style={{ backgroundColor: 'var(--color-black)', color: COLORS.white }} onClick={openAddModal} >
          + Add Ad
        </CButton>
      </div>

      <CCardBody>
        {/* Tabs */}
        <CNav variant="tabs" className="mt-3 themed-tabs" >
          <CNavItem>
            <CNavLink
              active={activeKey === 1}
              onClick={() => setActiveKey(1)}
              style={{ cursor: "pointer" }}
            >
              Mobile Login < span className="text-muted" > [888 × 1152 px] </span>
            </CNavLink>
          </CNavItem>

          < CNavItem >
            <CNavLink
              active={activeKey === 2}
              onClick={() => setActiveKey(2)}
              style={{ cursor: "pointer" }}
            >
              Mobile Dashboard < span className="text-muted" > [1400 × 390 px] </span>
            </CNavLink>
          </CNavItem>

          < CNavItem >
            <CNavLink
              active={activeKey === 3}
              onClick={() => setActiveKey(3)}
              style={{ cursor: "pointer" }}
            >
              Clinic Ads < span className="text-muted" > [1800 × 420 px] </span>
            </CNavLink>
          </CNavItem>
        </CNav>

        < br />
        {/* Cards */}
        < div className="d-flex flex-wrap gap-3" >
          {
            getActiveAds.length === 0 ? (
              <div className="text-center w-100" > No Ads Found</ div >
            ) : (
              getActiveAds.map((ad) => (
                <CCard
                  key={ad._id}
                  className="shadow-sm p-3 flex-grow-1"
                  style={{
                    flex: "1 1 calc(33% - 10px)",
                    minWidth: "250px",
                    maxWidth: "calc(33% - 10px)",
                  }}
                >
                  {/* Media Wrapper (SAME SIZE FOR ALL) */}
                  < div
                    style={{
                      width: "100%",
                      height: "180px",          // SAME height for all images
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      borderBottom: "1px solid #ddd",
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    {
                      ad.type === "image" ? (
                        <CImage
                          src={ad.data}
                          alt={ad.fileName}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain", // NO CUT, SAME SIZE
                          }}
                        />
                      ) : (
                        <video
                          src={ad.data}
                          controls
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",   // video fills card
                          }}
                        />
                      )}
                  </div>

                  {/* Actions */}
                  <CCardBody className="text-center" >
                    <div className="d-flex justify-content-center gap-2 flex-wrap" >
                      <button className="actionBtn view" onClick={() => handleView(ad)}>
                        <Eye size={18} />
                      </button>

                      < button className="actionBtn edit" onClick={() => handleEdit(ad)}>
                        <Edit2 size={18} />
                      </button>

                      < button
                        className="actionBtn delete"
                        onClick={() => {
                          setSelectedAd(ad)
                          setDeleteId(ad._id)
                          setShowDeleteModal(true)
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </CCardBody>
                </CCard>
              ))
            )}
        </div>
      </CCardBody>

      {/* Add Modal */}
      <CModal size="lg" className="custom-modal" visible={showAddModal} onClose={() => setShowAddModal(false)}>
        <CModalHeader>
          <CModalTitle>Add Advertisement </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {
            getCategory() === "service" && (
              <>
                <CFormLabel className="mt-3" >
                  Select Clinic < span style={{ color: "red" }
                  }>* </span>
                </CFormLabel>
                < select
                  className="form-select"
                  value={selectedClinic.clinicId}
                  onChange={(e) => {
                    const clinicId = e.target.value; // value is the clinicId string
                    const clinicName = clinics.find(c => c.clinicId === clinicId)?.name || "";
                    setSelectedClinic({ clinicId, clinicName });
                  }}
                >
                  <option value="" > --Select Clinic-- </option>
                  {
                    clinics.map((clinic) => (
                      <option key={clinic.clinicId} value={clinic.clinicId} >
                        {clinic.name}
                      </option>
                    ))
                  }
                </select>




              </>
            )}

          <CFormLabel>Title < span style={{ color: "red" }}>* </span></CFormLabel >
          <CFormInput
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              if (e.target.value.trim() !== "") setFormErrors({ ...formErrors, title: "" });
            }}
          />
          {formErrors.title && <div style={{ color: "red", fontSize: "0.85em" }}> {formErrors.title} </div>}

          <CFormLabel className="mt-3" > Upload Media(Image / Video) < span style={{ color: "red" }}>* </span></CFormLabel >
          <CFormInput
            ref={addFileInputRef}
            type="file"
            accept="image/*,video/mp4,audio/mp3"
            onChange={(e) => handleFileUpload(e)}
          />
          {formErrors.data && <div style={{ color: "red", fontSize: "0.85em" }}> {formErrors.data} </div>}

          {
            formData.data && (
              <>
                {
                  formData.type === "image" ? (
                    <img src={`data:image/*;base64,${formData.data}`} style={{ width: "100%", marginTop: "10px", borderRadius: "8px", border: "1px solid #ddd" }
                    } />
                  ) : (
                    <video src={`data:video/mp4;base64,${formData.data}`} style={{ width: "100%", marginTop: "10px", borderRadius: "8px", border: "1px solid #ddd" }} controls />
                  )}
                <CButton
                  color="danger"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setFormData({ ...formData, data: "", type: "", fileName: "" });
                    setFormErrors({ ...formErrors, data: "" });
                    if (addFileInputRef.current) addFileInputRef.current.value = null;
                  }}
                >
                  Clear Media
                </CButton>
              </>
            )}
        </CModalBody>
        < CModalFooter >
          <CButton
            className="theme-secondary-btn"
            onClick={() => setShowAddModal(false)}
          >
            Cancel
          </CButton>

          < CButton
            className="theme-primary-btn"
            onClick={handleSaveAd}
          >
            Save
          </CButton>

        </CModalFooter>
      </CModal>

      {/* Edit Modal */}
      <CModal size="lg" className="custom-modal" visible={showEditModal} onClose={() => setShowEditModal(false)}>
        <CModalHeader>
          <CModalTitle>Edit Advertisement </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {/* Clinic Dropdown (only for clinic ads) */}
          {getCategory() === "service" && (
            <>
              <CFormLabel className="mt-3">
                Select Clinic <span style={{ color: "red" }}>*</span>
              </CFormLabel>

              <select
                className="form-select"
                value={selectedClinic.clinicId}
                disabled   // 🔒 DISABLED IN EDIT
              >
                <option value="">-- Select Clinic --</option>
                {clinics.map((clinic) => (
                  <option key={clinic.clinicId} value={clinic.clinicId}>
                    {clinic.name}
                  </option>
                ))}
              </select>

              <small className="text-muted">
                Clinic cannot be changed once the ad is created.
              </small>
            </>
          )}

          {/* Title Input */}
          <CFormLabel className="mt-3">
            Title <span style={{ color: "red" }}>*</span>
          </CFormLabel>
          <CFormInput
            value={editData.title}
            onChange={(e) => {
              setEditData({ ...editData, title: e.target.value });
              if (e.target.value.trim() !== "") setEditErrors({ ...editErrors, title: "" });
            }}
          />
          {editErrors.title && <div style={{ color: "red", fontSize: "0.85em" }}>{editErrors.title}</div>}

          {/* File Upload */}
          <CFormLabel className="mt-3">
            Upload New Media (Image / Video)
          </CFormLabel>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <CFormInput
              type="text"
              placeholder="No file chosen"
              value={editData.fileName || ""}
              disabled
            />
            <input
              type="file"
              ref={editFileInputRef}
              accept="image/*,video/mp4,audio/mp3"
              style={{ display: "none" }}
              onChange={(e) => handleFileUpload(e, true)}
            />
            <CButton
              className="theme-primary-btn"
              onClick={() => editFileInputRef.current && editFileInputRef.current.click()}
            >
              Browse
            </CButton>
          </div>

          {/* Preview */}
          {(editData.data || editData.previewUrl) && (
            <>
              {editData.type === "image" ? (
                <img
                  src={editData.previewUrl ? editData.previewUrl : `data:image/*;base64,${editData.data}`}
                  alt={editData.fileName}
                  style={{ width: "100%", marginTop: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
                />
              ) : (
                <video
                  controls
                  src={editData.previewUrl ? editData.previewUrl : `data:video/mp4;base64,${editData.data}`}
                  style={{ width: "100%", marginTop: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
                />
              )}

              {/* Clear Media Button */}
              <CButton
                color="danger"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setEditData({ ...editData, data: "", type: "", fileName: "", previewUrl: "" });
                  setEditErrors({ ...editErrors, data: "" });
                  if (editFileInputRef.current) editFileInputRef.current.value = "";
                }}
              >
                Clear Media
              </CButton>
            </>
          )}
        </CModalBody>

        < CModalFooter >
          <CButton
            className="theme-secondary-btn"
            onClick={() => setShowEditModal(false)}
          >
            Cancel
          </CButton>

          < CButton
            className="theme-primary-btn"
            onClick={handleUpdateAd}
          >
            Update
          </CButton>

        </CModalFooter>
      </CModal>

      {/* View Modal */}
      <CModal size="lg" className="custom-modal" visible={showViewModal} onClose={() => setShowViewModal(false)}>
        <CModalHeader>
          <CModalTitle className="w-100" >
            <div className="d-flex justify-content-between w-100 " >
              <div>View Advertisement </div>
              < div style={{ paddingRight: "20px" }}>
                {selectedAd ? selectedAd.fileName : ""} </div>
            </div>
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {
            selectedAd && (
              <>
                {
                  selectedAd.type === "image" ? (
                    <CImage src={selectedAd.data} style={{ width: "100%", objectFit: "contain", maxHeight: "100%" }
                    } />
                  ) : (
                    <video src={selectedAd.data} controls style={{ width: "100%", objectFit: "contain", maxHeight: "100%" }} />
                  )}

              </>
            )}
        </CModalBody>
        < CModalFooter >
          <CButton color="secondary" onClick={() => setShowViewModal(false)}> Close </CButton>
        </CModalFooter>
      </CModal>

      {/* Delete Modal */}
      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <CModalHeader>
          <CModalTitle>Confirm Delete </CModalTitle>
        </CModalHeader>
        < CModalBody > Are you sure you want to delete this advertisement ? </CModalBody>
        < CModalFooter >
          <CButton color="secondary" onClick={() => setShowDeleteModal(false)}> Cancel </CButton>
          < CButton color="danger" onClick={confirmDelete} > Delete </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  );
};

export default AdsManagement;
