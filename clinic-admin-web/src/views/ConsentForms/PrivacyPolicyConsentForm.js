import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../baseUrl";

const PrivacyPolicyManager = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [policyCache, setPolicyCache] = useState({}); // cache data URLs
  const [previewPolicy, setPreviewPolicy] = useState(null); // currently previewed policy
  const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

  // fetch policies from backend
  const fetchPolicies = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/getAllPolicies`);
      if (res.data?.data) setPolicies(res.data.data);
      else if (Array.isArray(res.data)) setPolicies(res.data);
    } catch (err) {
      console.error("Error fetching policies:", err);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  // file select
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_SIZE) {
      alert("File is too large! Maximum allowed size is 20 MB.");
      return;
    }
    setSelectedFile(file);
  };

  // upload file to backend
  const handleSubmit = () => {
    if (!selectedFile) return alert("Please select a file first.");

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);

    reader.onload = async () => {
      // get base64 string only
      const base64File = reader.result.split(",")[1];
      try {
        await axios.post(
          `${BASE_URL}/createPolicy`,
          {
            fileName: selectedFile.name,
            privacyPolicy: base64File,
          },
          { headers: { "Content-Type": "application/json" } }
        );
        alert("File uploaded successfully!");
        setSelectedFile(null);
        fetchPolicies();
      } catch (err) {
        console.error("Upload error:", err.response || err);
        alert("File upload failed. Check console for details.");
      }
    };
  };

  // view file preview
  const handleView = async (policy) => {
    try {
      if (!policyCache[policy.id]) {
        const res = await axios.get(`${BASE_URL}/getPolicyById/${policy.id}`);
        const base64File = res.data?.data?.privacyPolicy;
        if (!base64File) return alert("No file data available.");

        const extension = policy.fileName.split(".").pop().toLowerCase();
        let mimeType = "application/octet-stream";
        if (extension === "pdf") mimeType = "application/pdf";
        else if (["jpg", "jpeg"].includes(extension)) mimeType = "image/jpeg";
        else if (extension === "png") mimeType = "image/png";

        // build data URI
        const dataUrl = `data:${mimeType};base64,${base64File}`;

        // cache
        setPolicyCache((prev) => ({
          ...prev,
          [policy.id]: { dataUrl, mimeType },
        }));

        // set preview
        setPreviewPolicy({
          id: policy.id,
          fileName: policy.fileName,
          dataUrl,
          mimeType,
        });
      } else {
        const cached = policyCache[policy.id];
        setPreviewPolicy({
          id: policy.id,
          fileName: policy.fileName,
          dataUrl: cached.dataUrl,
          mimeType: cached.mimeType,
        });
      }
    } catch (err) {
      console.error("View error:", err.response || err);
      alert("Unable to fetch file.");
    }
  };

  const closePreview = () => setPreviewPolicy(null);

  const handleEdit = async (policy) => {
    const newName = prompt("Enter new file name", policy.fileName || "");
    if (!newName || newName === policy.fileName) return;

    try {
      await axios.put(
        `${BASE_URL}/updatePolicy/${policy.id}`,
        { fileName: newName },
        { headers: { "Content-Type": "application/json" } }
      );
      alert("Policy updated successfully!");
      fetchPolicies();
    } catch (err) {
      console.error("Update error:", err.response || err);
      alert("Update failed. Check console for details.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this policy?")) return;
    try {
      await axios.delete(`${BASE_URL}/deletePolicyById/${id}`);
      alert("Policy deleted successfully!");
      fetchPolicies();
    } catch (err) {
      console.error("Delete error:", err.response || err);
      alert("Delete failed. Check console for details.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px" }}>
      <h3>Privacy Policy Manager</h3>

      <input
        type="file"
        accept="*/*"
        onChange={handleFileChange}
        style={{ display: "block", marginBottom: "10px" }}
      />
      {selectedFile && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <span>{selectedFile.name}</span>
          <button onClick={handleSubmit}>Upload</button>
        </div>
      )}

      <hr style={{ margin: "20px 0" }} />

      <h4>Existing Policies</h4>
      {policies.length === 0 && <p>No policies found.</p>}

      {policies.map((policy) => (
        <div
          key={policy.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px",
            borderBottom: "1px solid #ccc",
            alignItems: "center",
          }}
        >
          <span>{policy.fileName}</span>
          <div>
            <button
              style={{ marginRight: "5px" }}
              onClick={() => handleView(policy)}
            >
              View
            </button>
            <button
              style={{ marginRight: "5px" }}
              onClick={() => handleEdit(policy)}
            >
              Edit
            </button>
            <button onClick={() => handleDelete(policy.id)}>Delete</button>
          </div>
        </div>
      ))}

      {previewPolicy && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={closePreview}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              maxWidth: "80%",
              maxHeight: "80%",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4>{previewPolicy.fileName}</h4>
            {previewPolicy.mimeType === "application/pdf" ? (
              <iframe
                src={previewPolicy.dataUrl}
                title={previewPolicy.fileName}
                width="100%"
                height="500px"
              />
            ) : (
              <img
                src={previewPolicy.dataUrl}
                alt={previewPolicy.fileName}
                style={{ maxWidth: "100%", maxHeight: "500px" }}
              />
            )}
            <button onClick={closePreview} style={{ marginTop: "10px" }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyPolicyManager;
