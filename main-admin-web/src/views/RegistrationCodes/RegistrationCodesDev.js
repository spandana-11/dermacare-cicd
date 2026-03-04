import React, { useEffect, useState } from "react";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CPagination,
  CPaginationItem,
  CFormSelect,
  CFormInput,
  CTooltip,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton, CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
} from "@coreui/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAllRegistrationCodes_Dev } from "./RegistrationCodesApi";
import CIcon from "@coreui/icons-react";
import { cilCopy } from "@coreui/icons";

const RegistrationCodeManagementDev = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("all"); // <- add this
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCode, setSelectedCode] = useState("");
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [customLink, setCustomLink] = useState(
    "https://glowkartclinic.ashokfruit.shop/NGK-Registration-Form"
  );
  useEffect(() => {
    fetchCodes();
  }, []);

  // Scroll page to top whenever page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const response = await getAllRegistrationCodes_Dev();
      setCodes(response);
    } catch (err) {
      toast.error("Failed to load registration codes");
    }
    setLoading(false);
  };

  const filteredCodes = codes
    .filter((item) => {
      const search = searchText.toLowerCase();

      return (
        item.code.toLowerCase().includes(search) ||
        String(item.rank ?? "").includes(search)
      );
    })
    .filter((item) => {
      if (filterType === "used") return item.used;
      if (filterType === "unused") return !item.used;
      return true;
    });

  const usedCount = codes.filter((code) => code.used).length;
  const unusedCount = codes.filter((code) => !code.used).length;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredCodes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCodes.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const openSendModal = (code) => {
    setSelectedCode(code);
    setName("");
    setMobileNumber("");
    setCustomLink(
      "https://glowkartclinic.ashokfruit.shop/NGK-Registration-Form"
    );
    setModalVisible(true);
  };

  const sendWhatsApp = () => {
    if (!name || !mobileNumber || !customLink) {
      toast.error("Please fill all fields");
      return;
    }

    if (mobileNumber.length !== 10) {
      toast.error("Mobile number must be 10 digits");
      return;
    }

    const fullNumber = `91${mobileNumber}`;

    const message = `Hi ${name},

We are excited to welcome you to *Neeha’s GlowKart Family*.

Here is your *Registration Code:*  
${selectedCode}

To join and claim your welcome gifts, complete your registration here:
${customLink}

If you need help, feel free to message anytime.

Warm regards,  
*Neeha’s GlowKart Team*`;

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${fullNumber}?text=${encoded}`;
    window.open(url, "_blank");

    setModalVisible(false);
  };
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        toast.success("Registration code copied");
      })
      .catch(() => {
        toast.error("Failed to copy code");
      });
  };

  return (
    <>
      <ToastContainer />
      <CCard className="mt-1">
        <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h4 className="mb-0">Registration Codes</h4>
            <div style={{ fontSize: "0.9rem", marginTop: "5px" }}>
              <span
                style={{
                  color: "#198754",
                  fontWeight: 500,
                  marginRight: "15px",
                  cursor: "pointer",
                  textDecoration: filterType === "unused" ? "underline" : "none",
                }}
                onClick={() => {
                  setFilterType("unused");
                  setCurrentPage(1);
                }}
              >
                Unused: {unusedCount}
              </span>
              <span
                style={{
                  color: "#dc3545",
                  fontWeight: 500,
                  cursor: "pointer",
                  textDecoration: filterType === "used" ? "underline" : "none",
                }}
                onClick={() => {
                  setFilterType("used");
                  setCurrentPage(1);
                }}
              >
                Used: {usedCount}
              </span>
            </div>
          </div>
          <CFormInput
            placeholder="Search by code or rank..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setCurrentPage(1);
            }}
            style={{ maxWidth: "250px", marginTop: "5px", color: "#aaa", border: '1px solid var(--color-black)', }}
          />

        </CCardHeader>
        <CCardBody style={{ flex: 1, position: "relative" }}>
          {loading ? (
            <p className="text-center">Loading codes...</p>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    currentItems.length > 0
                      ? "repeat(auto-fit, minmax(160px, 1fr))"
                      : "1fr",
                  gap: "15px",
                  paddingBottom: "120px",
                }}
              >
                {currentItems.length > 0 ? (
                  currentItems.map((item, i) => {
                    const isUsed = item.used;
                    return (
                      <CTooltip
                        key={i}
                        content={
                          isUsed
                            ? "This code has already been used"
                            : "This code is unused"
                        }
                        placement="top"
                      >
                        <div
                          style={{
                            background: "#fff",
                            border: "1px solid #dee2e6",
                            borderRadius: "10px",
                            padding: "12px",
                            height: "110px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between", // <-- ensures code at top, button at bottom
                            alignItems: "center",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                            cursor: isUsed ? "not-allowed" : "pointer",
                            opacity: isUsed ? 0.45 : 1,
                          }}
                        >
                          <h6
                            className="mb-2"
                            style={{
                              color: isUsed ? "#6c757d" : "var(--color-black)",
                              fontSize: "1rem",
                              textAlign: "center",
                            }}
                          >
                            {item.code}
                          </h6>

                          {/* BUTTONS FOR UNUSED CODES → SEND + RANK */}
                          {!isUsed && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <button
                                style={{
                                  background: "#adb5bd",
                                  color: "#000",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "4px 10px",
                                  fontSize: "0.7rem",
                                  fontWeight: 500,
                                  cursor: "not-allowed",
                                  opacity: 0.7,
                                  whiteSpace: "nowrap",
                                }}
                                disabled
                              >
                                Rank ({item.rank ?? 0})
                              </button>

                              <button
                                onClick={() => openSendModal(item.code)}
                                style={{
                                  background: "var(--color-bgcolor)",
                                  color: "var(--color-black)",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "4px 12px",
                                  fontSize: "0.75rem",
                                  fontWeight: 500,
                                  cursor: "pointer",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Send
                              </button>

                              <CTooltip content="Copy code">
                                <CIcon
                                  icon={cilCopy}
                                  size="sm"
                                  onClick={() => handleCopyCode(item.code)}
                                  style={{
                                    cursor: "pointer",
                                    color: "#000",
                                    width: "16px",
                                    height: "16px",
                                  }}
                                />
                              </CTooltip>
                            </div>
                          )}


                          {/* BUTTONS FOR USED CODES → USED + RANK */}
                          {isUsed && (
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                style={{
                                  background: "#adb5bd",   // gray background
                                  color: "#000",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "4px 12px",
                                  fontSize: "0.75rem",
                                  fontWeight: 500,
                                  cursor: "not-allowed",
                                  opacity: 0.7,
                                }}
                                disabled
                              >
                                Rank ({item.rank ?? 0})
                              </button>
                              <button
                                style={{
                                  background: "#ffe6e6",
                                  color: "#cc0000",
                                  border: "1px solid #cc0000",
                                  borderRadius: "6px",
                                  padding: "4px 12px",
                                  fontSize: "0.75rem",
                                  fontWeight: 500,
                                  cursor: "not-allowed",
                                }}
                                disabled
                              >
                                Used
                              </button>
                            </div>
                          )}
                        </div>
                      </CTooltip>
                    );
                  })
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#6c757d",
                      fontSize: "1.1rem",
                    }}
                  >
                    No registration codes found.
                  </div>
                )}
              </div>

              {filteredCodes.length > 0 && (
                <div
                  className="d-flex justify-content-between px-3 pb-3 mt-3"
                >
                  <div >
                    <label className="me-2">Rows per page:</label>
                    <CFormSelect
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      style={{ width: "80px", display: 'inline-block' }}
                    >
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                      <option value={300}>300</option>
                      <option value={500}>500</option>
                    </CFormSelect>
                  </div>

                  <div >
                    <div >
                      Showing {indexOfFirst + 1} to{" "}
                      {Math.min(indexOfLast, filteredCodes.length)} of{" "}
                      {filteredCodes.length} entries
                    </div>
                    <CPagination align="end" className="mt-2 themed-pagination">
                      <CPaginationItem
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        Previous
                      </CPaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          if (totalPages <= 5) return true;
                          if (currentPage <= 3) return page <= 5;
                          if (currentPage >= totalPages - 2)
                            return page >= totalPages - 4;
                          return page >= currentPage - 2 && page <= currentPage + 2;
                        })
                        .map((page) => (
                          <CPaginationItem
                            key={page}
                            active={page === currentPage}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </CPaginationItem>
                        ))}

                      <CPaginationItem
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        Next
                      </CPaginationItem>
                    </CPagination>
                  </div>
                </div>
              )}
            </>
          )}
        </CCardBody>
      </CCard>

      {/* SEND CODE MODAL */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Send Registration Code</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CFormInput
            label="Name"
            placeholder="Enter recipient's name"
            value={name}
            onChange={(e) => {
              // Allow only alphabets and spaces
              const onlyAlphabets = e.target.value.replace(/[^a-zA-Z ]/g, "");
              setName(onlyAlphabets);
            }}
            className="mb-3"
          />


          <div className="mb-3">
            <label className="form-label" style={{ fontWeight: 500 }}>
              Mobile Number
            </label>

            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  background: "#e9ecef",
                  padding: "8px 12px",
                  border: "1px solid #ced4da",
                  borderRight: "none",
                  borderRadius: "6px 0 0 6px",
                  fontWeight: 600,
                }}
              >
                +91
              </span>

              <input
                type="text"
                maxLength={10}
                placeholder="Enter 10-digit number"
                value={mobileNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setMobileNumber(val);
                }}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  border: "1px solid #ced4da",
                  borderRadius: "0 6px 6px 0",
                }}
              />
            </div>
          </div>

          <CFormInput
            label="Link"
            placeholder="Enter link"
            value={customLink}
            onChange={(e) => setCustomLink(e.target.value)}
          />
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancel
          </CButton>
          <CButton
            style={{ color: "#fff", backgroundColor: "var(--color-black)" }}
            onClick={sendWhatsApp}
          >
            Send
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default RegistrationCodeManagementDev;
