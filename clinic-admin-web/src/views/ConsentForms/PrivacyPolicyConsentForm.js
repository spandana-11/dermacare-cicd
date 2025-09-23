import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CButton,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CModal,
  CModalHeader,
  CModalBody,
  CModalTitle,
  CModalFooter,
  CFormInput,
} from "@coreui/react";
import { FaEye, FaDownload } from "react-icons/fa";
import { BASE_URL } from "../../baseUrl";

const PrivacyPolicyManager = () => {
  const [policies, setPolicies] = useState([]);
  const [editingPolicyId, setEditingPolicyId] = useState(null);
  const [renameFile, setRenameFile] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState(null);
  const [isPreviewPdf, setIsPreviewPdf] = useState(false);
  const MAX_SIZE = 20 * 1024 * 1024; // 20MB

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/getAllPolicies`);
      if (res.data?.data) setPolicies(res.data.data);
      else if (Array.isArray(res.data)) setPolicies(res.data);
      else setPolicies([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_SIZE) return alert("Max size 20MB");
    setSelectedFile(file);
  };

  // Convert Base64 to Blob URL for preview
  const base64ToBlobUrl = (base64, fileName) => {
    let extension = fileName?.split(".").pop().toLowerCase();
    let mimeType =
      extension === "pdf"
        ? "application/pdf"
        : extension === "jpg" || extension === "jpeg"
        ? "image/jpeg"
        : extension === "png"
        ? "image/png"
        : "application/octet-stream";

    // If the base64 already has "data:...", remove it
    if (base64.startsWith("data:")) {
      base64 = base64.split(",")[1];
    }

    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return URL.createObjectURL(blob);
  };

 const handleView = (policy) => {
  if (!policy?.privacyPolicy) return alert("No file to preview");

  const extension = policy.fileName?.split(".").pop().toLowerCase();
  const mimeType =
    extension === "pdf"
      ? "application/pdf"
      : extension === "jpg" || extension === "jpeg"
      ? "image/jpeg"
      : extension === "png"
      ? "image/png"
      : "application/octet-stream";

  let base64Data = policy.privacyPolicy;

  // Clean the Base64 string
  base64Data = base64Data.replace(/\s+/g, "");

  // If it's already a Data URL, use it directly
  if (!base64Data.startsWith("data:")) {
    base64Data = `data:${mimeType};base64,${base64Data}`;
  }

  setPreviewFileUrl(base64Data);
  setIsPreviewPdf(mimeType === "application/pdf");
  setShowPreviewModal(true);
};





  const handleDownload = (policy) => {
    if (!policy?.privacyPolicy) return alert("No file to download");
    const url = base64ToBlobUrl(policy.privacyPolicy, policy.fileName);
    const a = document.createElement("a");
    a.href = url;
    a.download = policy.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleEdit = (policy) => {
    setEditingPolicyId(policy.id);
    setRenameFile(policy.fileName);
    setSelectedFile(null);
  };

  const handleUpdate = async (policyId) => {
    if (!renameFile && !selectedFile) return alert("Enter new name or select file");

    const payload = { fileName: renameFile };
    if (selectedFile) {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = async () => {
        payload.privacyPolicy = reader.result.split(",")[1];
        await axios.put(`${BASE_URL}/updatePolicy/${policyId}`, payload);
        alert("Updated!");
        setEditingPolicyId(null);
        setSelectedFile(null);
        fetchPolicies();
      };
    } else {
      await axios.put(`${BASE_URL}/updatePolicy/${policyId}`, payload);
      alert("Updated!");
      setEditingPolicyId(null);
      fetchPolicies();
    }
  };

  const handleDelete = async (policyId) => {
    if (!window.confirm("Are you sure?")) return;
    await axios.delete(`${BASE_URL}/deletePolicyById/${policyId}`);
    alert("Deleted!");
    fetchPolicies();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 className="mb-4">Privacy Policy Manager</h2>

      <CTable bordered responsive>
        <CTableHead color="light">
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>File Name</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {policies.length > 0 ? (
            policies.map((policy, index) => (
              <CTableRow key={policy.id}>
                <CTableDataCell>{index + 1}</CTableDataCell>
                <CTableDataCell>
                  {editingPolicyId === policy.id ? (
                    <CFormInput
                      value={renameFile}
                      onChange={(e) => setRenameFile(e.target.value)}
                    />
                  ) : (
                    policy.fileName
                  )}
                </CTableDataCell>
                <CTableDataCell>
                  {editingPolicyId === policy.id ? (
                    <>
                      <CFormInput type="file" onChange={handleFileChange} className="mb-1" />
                      <CButton color="primary" size="sm" onClick={() => handleUpdate(policy.id)}>
                        Save
                      </CButton>{" "}
                      <CButton
                        color="secondary"
                        size="sm"
                        onClick={() => setEditingPolicyId(null)}
                      >
                        Cancel
                      </CButton>
                    </>
                  ) : (
                    <>
                      <CButton color="info" size="sm" onClick={() => handleView(policy)}>
                        <FaEye />
                      </CButton>{" "}
                      <CButton color="success" size="sm" onClick={() => handleDownload(policy)}>
                        <FaDownload />
                      </CButton>{" "}
                      <CButton color="warning" size="sm" onClick={() => handleEdit(policy)}>
                        Edit
                      </CButton>{" "}
                      <CButton color="danger" size="sm" onClick={() => handleDelete(policy.id)}>
                        Delete
                      </CButton>
                    </>
                  )}
                </CTableDataCell>
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell colSpan="3" className="text-center">
                No Policies Found
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>

      {/* Preview Modal */}
      <CModal visible={showPreviewModal} onClose={() => setShowPreviewModal(false)} size="xl">
        <CModalHeader onClose={() => setShowPreviewModal(false)}>
          <CModalTitle>{isPreviewPdf ? "PDF Preview" : "Image Preview"}</CModalTitle>
        </CModalHeader>
        <CModalBody className="text-center">
          {isPreviewPdf ? (
            <iframe
              src={previewFileUrl}
              title="PDF Preview"
              style={{ width: "100%", height: "80vh", border: "none" }}
            ></iframe>
          ) : (
            <img
              src={previewFileUrl}
              alt="Preview"
              style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "8px" }}
            />
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowPreviewModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default PrivacyPolicyManager;