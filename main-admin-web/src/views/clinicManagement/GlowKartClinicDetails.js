import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    CCard, CCardBody, CNav, CNavItem, CNavLink,
    CTabContent, CTabPane, CRow, CCol, CTable, CTableHead,
    CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
    CImage, CButton, CContainer
} from "@coreui/react";
import { Eye, Download, Edit } from "lucide-react";
import { updateClinic, deleteClinic, AllClinicData } from "../../baseUrl";
import "./ClinicDetails.css";
import { toast } from "react-toastify";
import { getClinicTimings } from "./GlowKartgetTimingsAPI";
import ConfirmationModal from "../../components/ConfirmationModal";
import capitalizeWords from "../../Utils/capitalizeWords";
import { COLORS } from "../../Constant/Themes";

/** ⭐ LABEL MAP FOR PRETTY UI */
const LABELS = {
    name: "Name",
    clinicType: "Clinic Type",
    primaryContactPerson: "Primary Contact Person",
    status: "Status",
    subscription: "Subscription",
    recommended: "Recommended",
    role: "Role",
    username: "Username",
    designation: "Designation",
    address: "Address",
    city: "City",
    branch: "Branch",
    contactNumber: "Contact Number",
    whatsappNumber: "WhatsApp Number",
    email: "Email",
    website: "Website",
    openingTime: "Opening Time",
    closingTime: "Closing Time",
    latitude: "Latitude",
    longitude: "Longitude",
    state: "State",
    bankAccountName: "Account Holder",
    bankAccountNumber: "Account Number",
    ifscCode: "IFSC Code",
    upiId: "UPI ID",
    facebookHandle: "Facebook",
    instagramHandle: "Instagram",
    twitterHandle: "Twitter",
    licenseNumber: "License Number",
    issuingAuthority: "Issuing Authority",
    hasPharmacist: "Pharmacist Present",
    medicinesSoldOnSite: "Medicines Sold On Site",
    panNumber: "PAN Number",
    nabhScore: "NABH Score",
    walkthrough: "Walkthrough",
    clinicSpecializationType: "Specialization Type",
    alternateContactNumber: "Alternate Contact Number",
    drugLicenseFormType: "Drug License Form Type",
    clinicSoftware: "Clinic Software Used?",
    contractorDocuments: "Contractor Documents",
    hospitalDocuments: "Hospital Approval Documents",
    clinicalEstablishmentCertificate: "Clinical Establishment Certificate",
    businessRegistrationCertificate: "Business Registration Certificate",
    biomedicalWasteManagementAuth: "Bio-Medical Waste Auth",
    professionalIndemnityInsurance: "Indemnity Insurance",
    tradeLicense: "Trade License",
    fireSafetyCertificate: "Fire Safety Certificate",
    gstRegistrationCertificate: "GST Certificate",
    pharmacistCertificate: "Pharmacist Certificate",
    drugLicenseCertificate: "Drug License Certificate",

};

/** ⭐ BUTTON GROUP */
const ActionButtons = ({ edit, loading, onEdit, onSave }) => (
    <div className="button-bottom-container">
        {!edit ? (
            <CButton type="edit"
                className="actionBtn edit" onClick={onEdit}>
                Edit
            </CButton>
        ) : (
            <>
                <CButton color="success" disabled={loading} onClick={onSave}>
                    {loading ? "Saving..." : " Save"}
                </CButton>

            </>
        )}
    </div>
);


const ClinicDetails = () => {
    const { clinicId } = useParams();
    const { state } = useLocation(); // from navigation
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [editingIndex, setEditingIndex] = useState(null);
    const [editDoctor, setEditDoctor] = useState({ doctorName: "", registrationNumber: "", specialization: "" });
    const [doctorErrors, setDoctorErrors] = useState({});
    const [logoUploaded, setLogoUploaded] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formData, setFormData] = useState(null);  // ✨ FIXED (No default state)
    const [activeTab, setActiveTab] = useState(1);
    const [editMode, setEditMode] = useState({});
    const [loading, setLoading] = useState(false);
    const [timings, setTimings] = useState([]);
    const [loadingTimings, setLoadingTimings] = useState(false);
    const [showFileDeleteModal, setShowFileDeleteModal] = useState(false);
    const [fileKeyToDelete, setFileKeyToDelete] = useState(null);
    const [showDeleteDoctorModal, setShowDeleteDoctorModal] = useState(false);
    const [doctorIndexToDelete, setDoctorIndexToDelete] = useState(null);

    /** ⭐ LOAD DATA WHEN PAGE OPENS OR REFRESHES */
    useEffect(() => {
        fetchClinicDetails();
    }, [clinicId]);

    /** 📌 API CALL TO GET CLINIC DATA */
    const fetchClinicDetails = async () => {
        try {
            const res = await fetch(`${AllClinicData}/get/${clinicId}`);
            const result = await res.json();

            // ✅ SAFE FOR BOTH RESPONSE TYPES
            setFormData(result.data ?? result);

        } catch (error) {
            toast.error("Failed to load clinic data");
        }
    };

    /** 📥 FETCH TIMINGS */
    useEffect(() => {
        const fetchTimings = async () => {
            setLoadingTimings(true);
            const res = await getClinicTimings();
            if (res.success) setTimings(res.data);
            else toast.error("⚠ Unable to load timings");
            setLoadingTimings(false);
        };
        fetchTimings();
    }, []);

    /** ⭐ HANDLERS */
    const changeField = (key, value) => setFormData({ ...formData, [key]: value });

    const saveSection = async (section) => {
        setLoading(true);
        try {
            await updateClinic(clinicId, formData);
            await fetchClinicDetails();
            toast.success(` ${section} updated!`);
            setEditMode({});
        } catch {
            toast.error(`❌ Failed to update ${section}`);
        }
        setLoading(false);
    };

    const deleteSection = async (fields) => {
        if (!window.confirm("Are you sure?")) return;
        const updated = { ...formData };
        fields.forEach((f) => (updated[f] = null));
        try {
            await updateClinic(clinicId, updated);
            setFormData(updated);
            toast.success("🗑️ Section deleted!");
        } catch {
            toast.error("❌ Failed to delete section");
        }
    };

    const deleteFile = async () => {
        try {
            await updateClinic(clinicId, { [fileKeyToDelete]: null });
            setFormData({ ...formData, [fileKeyToDelete]: null });
            toast.success("File deleted!");
        } catch {
            toast.error("Delete failed!");
        } finally {
            setShowFileDeleteModal(false);
            setFileKeyToDelete(null);
        }
    };
    const [showAddDoctorRow, setShowAddDoctorRow] = useState(false);
    const [newDoctor, setNewDoctor] = useState({
        doctorName: "",
        registrationNumber: "",
        specialization: "",
    });
    const [newDoctorErrors, setNewDoctorErrors] = useState({});
    const validateNewDoctor = () => {
        const errors = {};

        // ⭐ Doctor Name Validation
        if (!newDoctor.doctorName.trim()) {
            errors.doctorName = "Doctor name is required";
        } else if (!/^[A-Za-z\s.'-]{2,50}$/.test(newDoctor.doctorName)) {
            errors.doctorName = "Invalid format. Only letters, spaces, . and ' allowed";
        }

        // ⭐ Registration Number Validation
        if (!newDoctor.registrationNumber.trim()) {
            errors.registrationNumber = "Registration number is required";
        } else if (!/^[A-Za-z0-9\/\-]{3,30}$/.test(newDoctor.registrationNumber)) {
            errors.registrationNumber = "Invalid format (only A-Z, 0-9, -, / allowed)";
        }

        // ⭐ Specialization Validation
        if (!newDoctor.specialization.trim()) {
            errors.specialization = "Specialization is required";
        } else if (!/^[A-Za-z\s.]{2,50}$/.test(newDoctor.specialization)) {
            errors.specialization = "Invalid format (letters only)";
        }

        setNewDoctorErrors(errors);
        return Object.keys(errors).length === 0; // Return true if NO errors
    };

    const replaceFile = (key, file) => {
        if (!file) return;

        // ⭐ Allowed types
        let allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png"
        ];

        // ⭐ Logo must be only images
        if (key === "hospitalLogo") {
            allowedTypes = ["image/jpeg", "image/png"];
        }

        if (!allowedTypes.includes(file.type)) {
            toast.error(
                key === "hospitalLogo"
                    ? "Only JPG or PNG images are allowed for logo"
                    : "Only PDF, JPG, JPEG, PNG files are allowed"
            );
            return;
        }

        // ⭐ File size validation
        const maxSize =
            key === "hospitalLogo"
                ? 2 * 1024 * 1024     // ✅ 2 MB for logo
                : 500 * 1024;        // ✅ 500 KB for other files

        if (file.size > maxSize) {
            toast.error(
                key === "hospitalLogo"
                    ? "Logo must be less than 2 MB"
                    : "File must be less than 500 KB"
            );
            return;
        }

        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const base64 = reader.result.split(",")[1];
                await updateClinic(clinicId, { [key]: base64 });
                await fetchClinicDetails();
                toast.success(
                    key === "hospitalLogo"
                        ? "Logo updated successfully"
                        : "Document updated successfully"
                );
            } catch {
                toast.error("Update failed");
            }
        };

        reader.readAsDataURL(file);
    };



    // ✅ Extract mime type safely from base64
    const getMimeFromBase64 = (base64) => {
        if (!base64) return null;
        const match = base64.match(/^data:(.*?);base64,/);
        return match ? match[1] : null;
    };
    const detectMimeType = (base64) => {
        if (base64.startsWith("/9j")) return "image/jpeg";        // JPG / JPEG
        if (base64.startsWith("iVBOR")) return "image/png";       // PNG
        if (base64.startsWith("JVBER")) return "application/pdf"; // PDF
        return "application/octet-stream";
    };

    // 👁 View PDF / Image
    const viewFile = (base64) => {
        const mimeType = detectMimeType(base64);

        const byteArray = Uint8Array.from(
            atob(base64),
            c => c.charCodeAt(0)
        );

        const blob = new Blob([byteArray], { type: mimeType });
        const url = URL.createObjectURL(blob);

        window.open(url, "_blank");

        setTimeout(() => URL.revokeObjectURL(url), 5000);
    };

    const getExtension = (mime) => {
        if (mime === "application/pdf") return "pdf";
        if (mime === "image/jpeg") return "jpg";
        if (mime === "image/png") return "png";
        return "file";
    };

    // ⬇ Download PDF / Image
    const downloadFile = (base64, fileName = "document") => {
        const mimeType = detectMimeType(base64);
        const extension = getExtension(mimeType);

        const byteArray = Uint8Array.from(
            atob(base64),
            c => c.charCodeAt(0)
        );

        const blob = new Blob([byteArray], { type: mimeType });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}.${extension}`;
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };


    const tabs = [
        "General Info", "Address & Contact", "Documents",
        "Bank Details", "Doctors", "Social Media", "Others"
    ];

    /** 🕑 WAIT FOR DATA BEFORE RENDER */
    if (!formData) return <div className="text-center p-5">⏳ Loading...</div>;
    const validateDoctorOnly = () => {
        const errors = {};

        if (!editDoctor.doctorName.trim()) {
            errors.doctorName = "Doctor name is required";
        } else if (!/^[A-Za-z\s.]{2,50}$/.test(editDoctor.doctorName)) {
            errors.doctorName = "Only letters & spaces allowed";
        }
        if (!editDoctor.registrationNumber.trim()) {
            errors.registrationNumber = "Registration number is required";
        } else if (!/^[A-Za-z0-9 .\/-]{3,30}$/.test(editDoctor.registrationNumber)) {
            errors.registrationNumber = "Invalid registration number format";
        }


        if (!editDoctor.specialization.trim()) {
            errors.specialization = "Specialization is required";
        }

        setDoctorErrors(errors);
        return Object.keys(errors).length === 0;
    };


    return (
        <CContainer fluid className="py-3">
            <CCard className="shadow-lg">

                {/* ⭐ HEADER */}
                <div className="text-white p-3 d-flex justify-content-between align-items-center rounded" style={{ background: 'linear-gradient(135deg, var(--color-black), var(--color-bgcolor))' }}>
                    <h5 className="mb-1" style={{ color: 'white' }}>
                        {formData?.name} — Clinic Details
                    </h5>

                    <div className="d-flex gap-2">
                        <CButton color="secondary"
                            style={{ backgroundColor: 'var(--color-black)', color: COLORS.white }} onClick={() => setShowDeleteModal(true)}>
                            Delete Clinic
                        </CButton>

                        <CButton
                            size="sm"
                            style={{
                                background: '#fff',
                                color: 'var(--color-black)',
                                border: '1px solid var(--color-black)',
                                fontWeight: 600,
                                borderRadius: 8,
                                padding: '6px 14px',
                            }}
                            onClick={() => navigate(-1)}
                        >
                            Back
                        </CButton>
                    </div>
                </div>
                <ConfirmationModal
                    isVisible={showDeleteModal}
                    title="Delete Clinic"
                    message="Are you sure you want to permanently delete this clinic? This action cannot be undone."
                    confirmText="Yes, Delete"
                    cancelText="No, Cancel"
                    confirmColor="danger"
                    cancelColor="secondary"
                    onConfirm={async () => {
                        await deleteClinic(clinicId);
                        toast.success("Clinic deleted successfully!");
                        setShowDeleteModal(false);
                        navigate(-1); // go back
                    }}
                    onCancel={() => setShowDeleteModal(false)}
                />

                <CCardBody>

                    {/* ⭐ NAVIGATION TABS */}
                    <CNav variant="tabs" className="mt-3 themed-tabs">
                        {tabs.map((t, i) => (
                            <CNavItem key={i}>
                                <CNavLink
                                    active={activeTab === i + 1}
                                    onClick={() => setActiveTab(i + 1)}
                                >
                                    {t}
                                </CNavLink>
                            </CNavItem>
                        ))}
                    </CNav>


                    <CTabContent>

                        {/* ⭐ TAB 1 - GENERAL */}
                        <CTabPane visible={activeTab === 1}>
                            <div className="section-card">

                                <CRow>
                                    {[
                                        "name", "clinicType", "primaryContactPerson", "status", "subscription",
                                        "role", "username", "designation"
                                    ].map((key) => (
                                        <CCol md={6} key={key}>
                                            <div className="clinic-field">
                                                <span className="clinic-label">{LABELS[key]}:</span>

                                                {editMode.general ? (
                                                    ["status", "username", "role"].includes(key) ? (
                                                        <input className="form-control" value={formData[key] || ""} disabled />

                                                    ) : key === "clinicType" ? (
                                                        <select
                                                            className={`form-select ${errors[key] ? "is-invalid" : ""}`}
                                                            value={formData.clinicType || ""}
                                                            onChange={(e) => changeField(key, e.target.value)}
                                                        >
                                                            <option value="">Select Clinic Type</option>
                                                            <option value="Proprietorship">Proprietorship</option>
                                                            <option value="Partnership">Partnership</option>
                                                            <option value="LLP">LLP</option>
                                                            <option value="Private Limited">Private Limited</option>
                                                        </select>

                                                    ) : key === "subscription" ? (
                                                        <select
                                                            className={`form-select ${errors[key] ? "is-invalid" : ""}`}
                                                            value={formData.subscription || ""}
                                                            onChange={(e) => changeField(key, e.target.value)}
                                                        >
                                                            <option value="">Select Subscription</option>
                                                            <option value="Free">Free</option>
                                                            <option value="Basic">Basic</option>
                                                            <option value="Standard">Standard</option>
                                                            <option value="Premium">Premium</option>
                                                        </select>

                                                    ) : (
                                                        <input
                                                            className={`form-control ${errors[key] ? "is-invalid" : ""}`}
                                                            value={formData[key] || ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value;

                                                                // ⭐ Typing Restrictions
                                                                if (key === "name" && !/^[a-zA-Z\s.&'-]*$/.test(value)) return;
                                                                if (key === "primaryContactPerson" && !/^[A-Za-z\s.]*$/.test(value)) return;
                                                                if (key === "designation" && !/^[A-Za-z\s.]*$/.test(value)) return;

                                                                changeField(key, value);
                                                            }}
                                                        />
                                                    )
                                                ) : (
                                                    <span className="clinic-value">
                                                        {formData[key] || "—"}
                                                    </span>
                                                )}

                                                {/* ⭐ Inline Error Display */}
                                                {errors[key] && <small className="text-danger">{errors[key]}</small>}

                                            </div>
                                        </CCol>
                                    ))}
                                </CRow>

                                <ActionButtons
                                    edit={editMode.general}
                                    loading={loading}
                                    onEdit={() => setEditMode({ general: true })}
                                    onSave={() => saveSection("General")}
                                    onCancel={() => setEditMode({})}
                                    onDelete={() =>
                                        deleteSection([
                                            "name", "clinicType", "primaryContactPerson", "status",
                                            "subscription", "role", "username", "designation"
                                        ])
                                    }
                                />
                            </div>
                        </CTabPane>

                        {/* ⭐ TAB 2 - ADDRESS & CONTACT */}
                        <CTabPane visible={activeTab === 2}>
                            <div className="section-card">
                                <CRow>
                                    {[
                                        "address", "city", "branch", "contactNumber", "whatsappNumber", "email", "website",
                                        "openingTime", "closingTime", "latitude", "longitude", "state"
                                    ].map((key) => (
                                        <CCol md={6} key={key}>
                                            <div className="clinic-field">
                                                <span className="clinic-label">{LABELS[key]}:</span>

                                                {editMode.addr ? (

                                                    // ⭐ Opening Time Dropdown
                                                    key === "openingTime" ? (
                                                        <select
                                                            className={`form-select ${errors[key] ? "is-invalid" : ""}`}
                                                            disabled={loadingTimings}
                                                            value={formData[key] || ""}
                                                            onChange={(e) => changeField(key, e.target.value)}
                                                        >
                                                            <option value="">Select Opening Time</option>
                                                            {timings.map((slot, idx) => (
                                                                <option key={idx} value={slot.openingTime}>{slot.openingTime}</option>
                                                            ))}
                                                        </select>

                                                        // ⭐ Closing Time Dropdown
                                                    ) : key === "closingTime" ? (
                                                        <select
                                                            className={`form-select ${errors[key] ? "is-invalid" : ""}`}
                                                            disabled={loadingTimings}
                                                            value={formData[key] || ""}
                                                            onChange={(e) => changeField(key, e.target.value)}
                                                        >
                                                            <option value="">Select Closing Time</option>
                                                            {timings.map((slot, idx) => (
                                                                <option key={idx} value={slot.closingTime}>{slot.closingTime}</option>
                                                            ))}
                                                        </select>

                                                        // ⭐ Email Disabled (Requested)
                                                    ) : key === "email" ? (
                                                        <input
                                                            className="form-control"
                                                            value={formData.email || ""}
                                                            disabled
                                                            title="Email cannot be edited"
                                                        />

                                                    ) : key === "state" ? (
                                                        <input
                                                            className="form-control"
                                                            value={formData.state || ""}
                                                            disabled
                                                            title="State cannot be edited"
                                                        />
                                                    ) : (
                                                        <input
                                                            className={`form-control ${errors[key] ? "is-invalid" : ""}`}
                                                            value={formData[key] || ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value;

                                                                // Typing validation rules
                                                                if ((key === "city" || key === "branch") && !/^[A-Za-z\s.]*$/.test(value)) return;
                                                                if ((key === "contactNumber" || key === "whatsappNumber") && !/^[0-9]*$/.test(value)) return;
                                                                if ((key === "latitude" || key === "longitude") && !/^-?[0-9.]*$/.test(value)) return;

                                                                changeField(key, value);
                                                            }}
                                                        />
                                                    )

                                                ) : (
                                                    // ⭐ VIEW MODE
                                                    <span className="clinic-value">{formData[key] || "—"}</span>
                                                )}

                                                {/* ⭐ Show Validation Errors */}
                                                {errors[key] && <small className="text-danger">{errors[key]}</small>}
                                            </div>
                                        </CCol>
                                    ))}
                                </CRow>

                                {/* ⭐ BOTTOM BUTTONS */}
                                <ActionButtons
                                    edit={editMode.addr}
                                    loading={loading}
                                    onEdit={() => setEditMode({ addr: true })}
                                    onSave={() => saveSection("Address & Contact")}
                                    onCancel={() => setEditMode({})}
                                    onDelete={() =>
                                        deleteSection([
                                            "address", "city", "branch", "contactNumber", "whatsappNumber", "email",
                                            "website", "openingTime", "closingTime", "latitude", "longitude", "state"
                                        ])
                                    }
                                />
                            </div>
                        </CTabPane>

                        {/* ⭐ TAB 3 - DOCUMENTS */}
                        <CTabPane visible={activeTab === 3}>
                            <div className="section-card">
                                <CTable striped hover responsive>
                                    <CTableHead className="pink-table">
                                        <CTableRow className="text-center">
                                            <CTableHeaderCell >#</CTableHeaderCell>
                                            <CTableHeaderCell >Document</CTableHeaderCell>
                                            <CTableHeaderCell>Actions</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>

                                    <CTableBody className="pink-table">
                                        {Object.entries(formData)
                                            .filter(([k, v]) =>
                                                typeof v === "string" &&
                                                v?.length > 100 &&
                                                !k.toLowerCase().includes("logo")
                                            )
                                            .map(([key, val], i) => (
                                                <CTableRow key={key} className="text-center align-middle">
                                                    <CTableDataCell>{i + 1}</CTableDataCell>
                                                    <CTableDataCell>{LABELS[key]}</CTableDataCell>
                                                    <CTableDataCell>

                                                        {/* 👁 VIEW */}
                                                        <CButton
                                                            color="success"
                                                            size="sm"
                                                            onClick={() => viewFile(val)}
                                                        >
                                                            <Eye size={15} /> View
                                                        </CButton>

                                                        {/* ⬇ DOWNLOAD */}
                                                        <CButton
                                                            size="sm"
                                                            onClick={() => downloadFile(val, key)}
                                                        >
                                                            <Download size={15} /> Download
                                                        </CButton>

                                                        {/* 🔁 REPLACE */}
                                                        <label className="btn btn-warning btn-sm">
                                                            <Edit size={15} /> Replace
                                                            <input
                                                                type="file"
                                                                hidden
                                                                accept=".pdf,.jpg,.jpeg,.png"
                                                                onChange={(e) => replaceFile(key, e.target.files[0])}
                                                            />
                                                        </label>

                                                    </CTableDataCell>

                                                </CTableRow>
                                            ))}
                                    </CTableBody>
                                </CTable>
                            </div>
                        </CTabPane>

                        {/* ⭐ TAB 4 - BANK */}
                        <CTabPane visible={activeTab === 4}>
                            <div className="section-card">
                                <CRow>
                                    {["bankAccountName", "bankAccountNumber", "ifscCode", "upiId"].map((key) => (
                                        <CCol md={6} key={key}>
                                            <div className="clinic-field">
                                                <span className="clinic-label">{LABELS[key]}:</span>

                                                {editMode.bank ? (
                                                    <input
                                                        className={`form-control ${errors[key] ? "is-invalid" : ""}`}
                                                        value={formData[key] || ""}
                                                        onChange={(e) => {
                                                            let value = e.target.value;

                                                            // ⭐ Typing Restrictions
                                                            if (key === "bankAccountName" && !/^[A-Za-z\s.]*$/.test(value)) return;
                                                            if (key === "bankAccountNumber" && !/^[0-9]*$/.test(value)) return;
                                                            if (key === "ifscCode" && !/^[A-Za-z0-9]*$/.test(value)) return;

                                                            changeField(key, value);
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="clinic-value">{formData[key] || "—"}</span>
                                                )}

                                                {/* ⭐ Error Show */}
                                                {errors[key] && <small className="text-danger">{errors[key]}</small>}
                                            </div>
                                        </CCol>
                                    ))}
                                </CRow>

                                <ActionButtons
                                    edit={editMode.bank}
                                    loading={loading}
                                    onEdit={() => setEditMode({ bank: true })}
                                    onSave={() => saveSection("Bank Details")}
                                    onCancel={() => setEditMode({})}
                                    onDelete={() =>
                                        deleteSection(["bankAccountName", "bankAccountNumber", "ifscCode", "upiId"])
                                    }
                                />
                            </div>
                        </CTabPane>

                        {/* ⭐ TAB 5 - DOCTORS */}
                        <CTabPane visible={activeTab === 5}>
                            {/* ➕ ADD BUTTON - ONLY IN THIS TAB */}
                            <div className="section-card">
                                <div className="text-end">
                                    <CButton style={{ backgroundColor: 'var(--color-black)', color: 'white', }} onClick={() => setShowAddDoctorRow(true)}>
                                        Add Doctor
                                    </CButton>
                                </div><br />
                                <CTable striped hover responsive>
                                    <CTableHead className="pink-table">
                                        <CTableRow className="text-center">
                                            <CTableHeaderCell>#</CTableHeaderCell>
                                            <CTableHeaderCell>Name</CTableHeaderCell>
                                            <CTableHeaderCell>Reg No</CTableHeaderCell>
                                            <CTableHeaderCell>Specialization</CTableHeaderCell>
                                            <CTableHeaderCell >Action</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>

                                    <CTableBody className="pink-table">

                                        {/* 🔁 EXISTING DOCTORS LIST */}
                                        {(formData.doctorsList || []).map((doctor, i) => (
                                            <CTableRow key={i} className="text-center align-middle">
                                                <CTableDataCell>{i + 1}</CTableDataCell>

                                                {editingIndex === i ? (
                                                    <>
                                                        <CTableDataCell>
                                                            <input
                                                                className={`form-control ${doctorErrors.doctorName ? "is-invalid" : ""}`}
                                                                value={editDoctor.doctorName}
                                                                onChange={(e) => setEditDoctor({ ...editDoctor, doctorName: e.target.value })}
                                                            />
                                                            {doctorErrors.doctorName && <small className="text-danger">{doctorErrors.doctorName}</small>}
                                                        </CTableDataCell>

                                                        <CTableDataCell>
                                                            <input
                                                                className={`form-control ${doctorErrors.registrationNumber ? "is-invalid" : ""}`}
                                                                value={editDoctor.registrationNumber}
                                                                onChange={(e) => setEditDoctor({ ...editDoctor, registrationNumber: e.target.value })}
                                                            />
                                                            {doctorErrors.registrationNumber && (
                                                                <small className="text-danger">{doctorErrors.registrationNumber}</small>
                                                            )}
                                                        </CTableDataCell>

                                                        <CTableDataCell>
                                                            <input
                                                                className={`form-control ${doctorErrors.specialization ? "is-invalid" : ""}`}
                                                                value={editDoctor.specialization}
                                                                onChange={(e) => setEditDoctor({ ...editDoctor, specialization: e.target.value })}
                                                            />
                                                            {doctorErrors.specialization && (
                                                                <small className="text-danger">{doctorErrors.specialization}</small>
                                                            )}
                                                        </CTableDataCell>

                                                        <CTableDataCell>
                                                            <CButton
                                                                size="sm"
                                                                color="success"
                                                                onClick={async () => {
                                                                    if (!validateDoctorOnly()) return;
                                                                    const updated = [...formData.doctorsList];
                                                                    updated[i] = editDoctor;
                                                                    await updateClinic(clinicId, { doctorsList: updated });
                                                                    setFormData({ ...formData, doctorsList: updated });
                                                                    setEditingIndex(null);
                                                                    toast.success(" Doctor updated");
                                                                }}
                                                            >
                                                                Save
                                                            </CButton>
                                                            <CButton
                                                                size="sm"
                                                                color="secondary"
                                                                className="ms-2"
                                                                onClick={() => setEditingIndex(null)}
                                                            >
                                                                Cancel
                                                            </CButton>
                                                        </CTableDataCell>
                                                    </>
                                                ) : (
                                                    <>
                                                        <CTableDataCell>{capitalizeWords(doctor.doctorName)}</CTableDataCell>
                                                        <CTableDataCell>{doctor.registrationNumber}</CTableDataCell>
                                                        <CTableDataCell>{capitalizeWords(doctor.specialization)}</CTableDataCell>
                                                        <CTableDataCell className="text-center">
                                                            <div className="d-flex justify-content-center gap-2">
                                                                <button
                                                                    className="actionBtn edit"
                                                                    onClick={() => {
                                                                        setEditingIndex(i);
                                                                        setEditDoctor(doctor);
                                                                    }}
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    className="actionBtn delete"
                                                                    onClick={() => {
                                                                        setDoctorIndexToDelete(i);
                                                                        setShowDeleteDoctorModal(true);
                                                                    }}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </CTableDataCell>

                                                    </>
                                                )}
                                            </CTableRow>
                                        ))}

                                        {/* ⭐➕ NEW DOCTOR ADD ROW — INSIDE THIS TAB ONLY */}
                                        {showAddDoctorRow && (
                                            <CTableRow className="bg-light">
                                                <CTableDataCell>New</CTableDataCell>

                                                <CTableDataCell>
                                                    <input
                                                        className={`form-control ${newDoctorErrors.doctorName ? "is-invalid" : ""}`}
                                                        placeholder="Doctor Name"
                                                        value={newDoctor.doctorName}
                                                        onChange={(e) => setNewDoctor({ ...newDoctor, doctorName: e.target.value })}
                                                    />
                                                    {newDoctorErrors.doctorName && <small className="text-danger">{newDoctorErrors.doctorName}</small>}
                                                </CTableDataCell>

                                                <CTableDataCell>
                                                    <input
                                                        className={`form-control ${newDoctorErrors.registrationNumber ? "is-invalid" : ""}`}
                                                        placeholder="Registration No"
                                                        value={newDoctor.registrationNumber}
                                                        onChange={(e) => setNewDoctor({ ...newDoctor, registrationNumber: e.target.value })}
                                                    />
                                                    {newDoctorErrors.registrationNumber && (
                                                        <small className="text-danger">{newDoctorErrors.registrationNumber}</small>
                                                    )}
                                                </CTableDataCell>

                                                <CTableDataCell>
                                                    <input
                                                        className={`form-control ${newDoctorErrors.specialization ? "is-invalid" : ""}`}
                                                        placeholder="Specialization"
                                                        value={newDoctor.specialization}
                                                        onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                                                    />
                                                    {newDoctorErrors.specialization && (
                                                        <small className="text-danger">{newDoctorErrors.specialization}</small>
                                                    )}
                                                </CTableDataCell>

                                                <CTableDataCell className="d-flex gap-1">
                                                    <CButton
                                                        size="sm"
                                                        color="success"
                                                        onClick={async () => {
                                                            if (!validateNewDoctor()) return;
                                                            const updated = [...(formData.doctorsList || []), newDoctor];
                                                            await updateClinic(clinicId, { doctorsList: updated });
                                                            setFormData({ ...formData, doctorsList: updated });
                                                            toast.success("➕ Doctor Added Successfully!");
                                                            setShowAddDoctorRow(false);
                                                            setNewDoctor({ doctorName: "", registrationNumber: "", specialization: "" });
                                                        }}
                                                    >
                                                        Save
                                                    </CButton>

                                                    <CButton size="sm" color="secondary" onClick={() => setShowAddDoctorRow(false)}>
                                                        Cancel
                                                    </CButton>
                                                </CTableDataCell>
                                            </CTableRow>
                                        )}

                                    </CTableBody>
                                </CTable>
                                <ConfirmationModal
                                    isVisible={showDeleteDoctorModal}
                                    title="Delete Doctor"
                                    message="Are you sure you want to delete this doctor? This action cannot be undone."
                                    confirmText="Yes, Delete"
                                    cancelText="Cancel"
                                    confirmColor="danger"
                                    cancelColor="secondary"
                                    onConfirm={async () => {
                                        const updated = [...formData.doctorsList];
                                        updated.splice(doctorIndexToDelete, 1);

                                        await updateClinic(clinicId, { doctorsList: updated });
                                        setFormData({ ...formData, doctorsList: updated });

                                        toast.success("🗑 Doctor removed successfully!");
                                        setShowDeleteDoctorModal(false);
                                        setDoctorIndexToDelete(null);
                                    }}
                                    onCancel={() => {
                                        setShowDeleteDoctorModal(false);
                                        setDoctorIndexToDelete(null);
                                    }}
                                />
                            </div>
                        </CTabPane>


                        {/* ⭐ TAB 6 - SOCIAL */}
                        <CTabPane visible={activeTab === 6}>
                            <div className="section-card">
                                <CRow>
                                    {["facebookHandle", "instagramHandle", "twitterHandle"].map((key) => (
                                        <CCol md={6} key={key}>
                                            <div className="clinic-field">
                                                <span className="clinic-label">{LABELS[key]}:</span>
                                                {editMode.social ? (
                                                    <input className="form-control"
                                                        value={formData[key] || ""}
                                                        onChange={(e) => changeField(key, e.target.value)}
                                                    />
                                                ) : (
                                                    <span className="clinic-value">{formData[key] || "—"}</span>
                                                )}
                                            </div>
                                        </CCol>
                                    ))}
                                </CRow>

                                <ActionButtons
                                    edit={editMode.social}
                                    loading={loading}
                                    onEdit={() => setEditMode({ social: true })}
                                    onSave={() => saveSection("Social Media")}
                                    onCancel={() => setEditMode({})}
                                    onDelete={() =>
                                        deleteSection(["facebookHandle", "instagramHandle", "twitterHandle"])
                                    }
                                />
                            </div>
                        </CTabPane>

                        {/* ⭐ TAB 7 - OTHERS */}
                        <CTabPane visible={activeTab === 7}>
                            <div className="section-card">
                                <CRow>
                                    {[
                                        "licenseNumber", "issuingAuthority",
                                        "panNumber", "walkthrough"
                                    ].map((key) => (
                                        <CCol md={6} key={key}>
                                            <div className="clinic-field">
                                                <span className="clinic-label">{LABELS[key]}:</span>

                                                {editMode.other ? (
                                                    <input
                                                        className={`form-control ${errors[key] ? "is-invalid" : ""}`}
                                                        value={formData[key] || ""}
                                                        onChange={(e) => {
                                                            const value = e.target.value;

                                                            if (key === "licenseNumber" && !/^[A-Za-z0-9/.\-]*$/.test(value)) return;
                                                            if (key === "issuingAuthority" && !/^[A-Za-z\s.]*$/.test(value)) return;
                                                            if ((key === "hasPharmacist" || key === "medicinesSoldOnSite") && !/^(Yes|No)?$/i.test(value)) return;
                                                            if (key === "panNumber" && !/^[A-Za-z0-9]*$/.test(value)) return;
                                                            if (key === "nabhScore" && !/^[0-9]*$/.test(value)) return;

                                                            changeField(key, value);
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="clinic-value">{formData[key] || "—"}</span>
                                                )}

                                                {errors[key] && <small className="text-danger">{errors[key]}</small>}
                                            </div>
                                        </CCol>
                                    ))}

                                    {/* ⭐ HOSPITAL LOGO SECTION */}
                                    <CCol md={6}>
                                        <div className="clinic-field">
                                            <span className="clinic-label">Hospital Logo</span>

                                            {formData.hospitalLogo && (
                                                <div className="d-flex flex-column align-items-start">
                                                    <CImage
                                                        width={120}
                                                        className="rounded border mb-2"
                                                        src={
                                                            formData.hospitalLogo.startsWith("data:image")
                                                                ? formData.hospitalLogo
                                                                : `data:image/png;base64,${formData.hospitalLogo}`
                                                        }
                                                    />

                                                    {editMode.other && (
                                                        <div className="d-flex gap-2 mt-2">
                                                            <label className={`btn ${logoUploaded ? "btn-success" : "btn-warning"} btn-sm flex-fill`}>
                                                                {logoUploaded ? "✔ Uploaded" : "📤 Upload"}
                                                                <input
                                                                    type="file"
                                                                    hidden
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        if (e.target.files[0]) replaceFile("hospitalLogo", e.target.files[0]);
                                                                    }}
                                                                />
                                                            </label>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {!formData.hospitalLogo && editMode.other && (
                                                <div className="d-flex gap-2 mt-2">
                                                    <label className={`btn ${logoUploaded ? "btn-success" : "btn-warning"} btn-sm flex-fill`}>
                                                        {logoUploaded ? "✔ Uploaded" : "📤 Upload"}
                                                        <input
                                                            type="file"
                                                            hidden
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                if (e.target.files[0]) replaceFile("hospitalLogo", e.target.files[0]);
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    </CCol>
                                </CRow>

                                <ActionButtons
                                    edit={editMode.other}
                                    loading={loading}
                                    onEdit={() => setEditMode({ other: true })}
                                    onSave={() => saveSection("Others")}
                                    onCancel={() => setEditMode({})}
                                    onDelete={() =>
                                        deleteSection([
                                            "licenseNumber", "issuingAuthority", "hasPharmacist", "medicinesSoldOnSite",
                                            "panNumber", "nabhScore", "walkthrough", "hospitalLogo"
                                        ])
                                    }
                                />
                            </div>
                        </CTabPane>

                        <ConfirmationModal
                            isVisible={showFileDeleteModal}
                            title="Delete File"
                            message="Are you sure you want to delete this file?"
                            confirmText="Delete"
                            cancelText="Cancel"
                            confirmColor="danger"
                            onConfirm={deleteFile}
                            onCancel={() => {
                                setShowFileDeleteModal(false);
                                setFileKeyToDelete(null);
                            }}
                        />
                    </CTabContent>
                </CCardBody>
            </CCard>
        </CContainer>
    );
};

export default ClinicDetails;