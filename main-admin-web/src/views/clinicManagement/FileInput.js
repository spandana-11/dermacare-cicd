import React from "react";
import { CCol, CFormLabel, CFormInput, CButton, CTooltip } from "@coreui/react";

const FileInput = ({
  label,
  name,
  accept,
  tooltip,
  formData,
  setFormData,
  errors,
  setErrors,
  inputRef,
  maxSize = 100 * 1024, // default 100 KB
  required = true,       // <-- new prop
}) => {
  const handleClearFile = () => {
    if (inputRef?.current) inputRef.current.value = "";
    setFormData((prev) => ({ ...prev, [name]: null, [`${name}FileName`]: null }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleChange = async (e) => {
    const files = e.target.files;
    if (!files || !files[0]) {
      setFormData((prev) => ({ ...prev, [name]: null, [`${name}FileName`]: null }));
      if (required) setErrors((prev) => ({ ...prev, [name]: "Please upload a file" }));
      else setErrors((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    const file = files[0];
    setFormData((prev) => ({ ...prev, [`${name}FileName`]: file.name }));

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/zip",
    ];
    const allowedExtensions = ["pdf", "doc", "docx", "jpeg", "jpg", "png", "zip"];
    const ext = file.name.split(".").pop().toLowerCase();
    if(!file.type && ["jpg", "jpeg", "png"].includes(ext)){
      file.type=`image/${ext==="jpg"?"jpeg":ext}`;
    }
    const isTypeAllowed=
    (file.type && allowedTypes.includes(file.type)) || 
    allowedExtensions.includes(ext);
    if(!isTypeAllowed){
      setErrors((prev)=>({...prev, [name]:"Invalid file type"}));
      setFormData((prev)=>({...prev, [name]:null}));
      return;
    }
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
      setErrors((prev) => ({ ...prev, [name]: "Invalid file type" }));
      setFormData((prev) => ({ ...prev, [name]: null }));
      return;
    }

    if (file.size > maxSize) {
      setErrors((prev) => ({ ...prev, [name]: `File must be < ${maxSize / 1024} KB` }));
      setFormData((prev) => ({ ...prev, [name]: null }));
      return;
    }

    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = (err) => reject(err);
      });
      setFormData((prev) => ({ ...prev, [name]: base64 }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [name]: "Failed to read file" }));
      setFormData((prev) => ({ ...prev, [name]: null }));
    }
  };

  return (
    <CCol md={6} className="position-relative mb-3">
      {tooltip ? (
        <CTooltip content={tooltip}>
          <CFormLabel>
            {label} {required && <span className="text-danger">*</span>}
          </CFormLabel>
        </CTooltip>
      ) : (
        <CFormLabel>
          {label} {required && <span className="text-danger">*</span>}
        </CFormLabel>
      )}

      <div className="position-relative">
        <CFormInput
          type="file"
          name={name}
          accept={accept}
          ref={inputRef}
          onChange={handleChange}
        />
        {formData?.[`${name}FileName`] && (
          <CButton
            type="button"
            size="sm"
            color="danger"
            className="position-absolute end-0 top-50 translate-middle-y me-2"
            style={{ zIndex: 10 }}
            onClick={handleClearFile}
          >
            ✕
          </CButton>
        )}
      </div>

      {errors[name] && (
        <div className="text-danger mt-1" style={{ fontSize: "0.875rem" }}>
          {errors[name]}
        </div>
      )}
    </CCol>
  );
};

export default FileInput;
