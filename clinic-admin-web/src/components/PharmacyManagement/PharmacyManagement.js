import React, { useState, useEffect } from 'react'
import {
  CTabs,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CCard,
  CCardBody,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CFormInput,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormSelect,
  CFormTextarea,
  CRow,
  CCol
} from '@coreui/react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './PharmacyManagement.css'
import CreatableSelect from 'react-select/creatable';
import { addMedicineType, getMedicineTypes, saveMedicineTemplate } from './PharmacyManagementAPI'

const PharmacyManagement = () => {
  const [activeKey, setActiveKey] = useState(0)
  const [medicines, setMedicines] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [medicineTypes, setMedicineTypes] = useState([]);
  const [search, setSearch] = useState('')

  const slotOptions = [
    { value: "morning", label: "Morning" },
    { value: "afternoon", label: "Afternoon" },
    { value: "evening", label: "Evening" },
    { value: "night", label: "Night" },
    { value: "NA", label: "NA" },
  ];

  const [formData, setFormData] = useState({
    id: null,
    serialNumber: '',
    medicineName: '',
    brandName: '',
    manufacturer: '',
    batchNumber: '',
    dateOfManufacturing: '',
    dateOfExpiry: '',
    licenseNumber: '',
    stock: '',
    dose: '',
    medicineType: '',
    duration: '',
    durationUnit: '',
    remindWhen: '',
    times: [],
    food: '',
    note: '',
  });

  useEffect(() => {
    const fetchTypes = async () => {
      const types = await getMedicineTypes();
      setMedicineTypes(types || []);
    };
    fetchTypes();
  }, []);
  // Ensure current medicineType is included in options
  useEffect(() => {
    if (formData.medicineType && !medicineTypes.includes(formData.medicineType)) {
      setMedicineTypes((prev) => [...prev, formData.medicineType]);
    }
  }, [formData.medicineType, medicineTypes]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  const handleSave = async () => {
    const requiredFields = [
      "medicineName", "dose", "medicineType",
      "duration", "durationUnit", "remindWhen", "food"
    ];

    for (let field of requiredFields) {
      if (!formData[field] || formData[field].length === 0) {
        toast.error(`Please fill the ${field} field`);
        return;
      }
    }

    try {
      const savedMedicine = await saveMedicineTemplate(formData);

      if (savedMedicine) {
        if (formData.id) {
          setMedicines(prev =>
            prev.map(med => (med.id === formData.id ? savedMedicine : med))
          );
          toast.success("Medicine updated!");
        } else {
          setMedicines(prev => [...prev, savedMedicine]);
          toast.success("Medicine added!");
        }

        setShowModal(false);
        setFormData({
          id: null,
          serialNumber: "",
          medicineName: "",
          brandName: "",
          manufacturer: "",
          batchNumber: "",
          dateOfManufacturing: "",
          dateOfExpiry: "",
          licenseNumber: "",
          stock: 0,
          dose: "",
          medicineType: "",
          duration: "",
          durationUnit: "",
          remindWhen: "",
          times: [],
          food: "",
          note: "",
        });
      } else {
        toast.error("Failed to save medicine!");
      }
    } catch (error) {
      toast.error("❌ Error while saving medicine!");
      console.error(error);
    }
  };


  const handleEdit = medicine => {
    setFormData(medicine)
    setShowModal(true)
  }

  const handleCreateMedicineType = async (inputValue) => {
    const newType = await addMedicineType(inputValue);
    setMedicineTypes(prev => [...prev, newType]);
    handleChange("medicineType", newType);
  };

  const handleDelete = id => {
    setMedicines(prev => prev.filter(med => med.id !== id))
    toast.info('Medicine deleted!')
  }

  const filteredMedicines = medicines.filter(med =>
    (med.medicineName?.toLowerCase() || '').includes(search.toLowerCase())
  );


  const slotCount = () => {
    switch (formData.remindWhen) {
      case "Once A Day": return 1;
      case "Twice A Day": return 2;
      case "Thrice A Day": return 3;
      default: return 3;
    }
  }

  return (
    <div className="pharmacy-management p-4">
      <h5 className="pm-title mb-4">Pharmacy Management</h5>

      <CTabs activeKey={activeKey}>
        <CNav variant="tabs" className="pm-tabs">
          <CNavItem>
            <CNavLink active={activeKey === 0} onClick={() => setActiveKey(0)}>Medicine Template</CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeKey === 1} onClick={() => setActiveKey(1)}>Inventory</CNavLink>
          </CNavItem>
        </CNav>

        <CTabContent className="mt-3">
          <CTabPane visible={activeKey === 0}>
            <CCard className="pm-card">
              <CCardBody>
                <div className="d-flex align-items-center mb-3">
                  <CFormInput
                    placeholder="Search by Generic or Brand Name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="me-2"
                    style={{ height: '40px' }}
                  />
                  <CButton
                
                    onClick={() => setShowModal(true)}
                    style={{ height: '40px', lineHeight: '1', padding: '0 12px', whiteSpace: 'nowrap',backgroundColor:'#a5c4d4ff', color: "#7e3a93"  }}
                  >
                    Add Medicine
                  </CButton>
                </div>

                <CTable striped hover responsive bordered className="shadow-sm">
                  <CTableHead color="light">
                    <CTableRow>
                      {/* <CTableHeaderCell>Serial</CTableHeaderCell>
                      <CTableHeaderCell>Brand Name</CTableHeaderCell> */}
                      <CTableHeaderCell>Medicine Name</CTableHeaderCell>
                      <CTableHeaderCell>Dosage</CTableHeaderCell>
                      <CTableHeaderCell>Medicine Type</CTableHeaderCell>
                      <CTableHeaderCell>Duration</CTableHeaderCell>
                      <CTableHeaderCell>Frequency</CTableHeaderCell>
                      <CTableHeaderCell>Time</CTableHeaderCell>
                      <CTableHeaderCell>Instructions</CTableHeaderCell>
                      <CTableHeaderCell>Notes</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredMedicines.length > 0 ? (
                      filteredMedicines.map(med => (
                        <CTableRow key={med.id}>
                          {/* <CTableDataCell>{med.serialNumber}</CTableDataCell>
                          <CTableDataCell>{med.brandName}</CTableDataCell> */}
                          <CTableDataCell>{med.medicineName}</CTableDataCell>
                          <CTableDataCell>{med.dose}</CTableDataCell>
                          <CTableDataCell>{med.medicineType}</CTableDataCell>
                          <CTableDataCell>{`${med.duration} ${med.durationUnit}`}</CTableDataCell>
                          <CTableDataCell>{med.remindWhen}</CTableDataCell>
                          <CTableDataCell>{med.times?.join(', ')}</CTableDataCell>
                          <CTableDataCell>{med.food}</CTableDataCell>
                          <CTableDataCell>{med.note}</CTableDataCell>
                          <CTableDataCell>
                            <CButton size="sm" color="info" className="me-1" onClick={() => handleEdit(med)}>Edit</CButton>
                            <CButton size="sm" color="danger" onClick={() => handleDelete(med.id)}>Delete</CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan={10} className="text-center">No data available</CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              </CCardBody>
            </CCard>
          </CTabPane>

          <CTabPane visible={activeKey === 1}>
            <CCard className="pm-card">
              <CCardBody>
                <h1>Inventory</h1>
                <p>In Progress...</p>
              </CCardBody>
            </CCard>
          </CTabPane>
        </CTabContent>
      </CTabs>

      {/* Modal for Add/Edit Medicine */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
        <CModalHeader className="bg-light border-bottom">
          <CModalTitle className="fw-bold">
            {formData.id ? '✏️ Edit Medicine' : '➕ Add Medicine'}
          </CModalTitle>
        </CModalHeader>

        <CModalBody>
          {/* Medicine Info Section */}
          <h6 className="text-primary fw-bold mb-3">Medicine Information</h6>
          <CRow className="g-3 mb-3">
            <CCol md={6}>
              <CFormInput
                label="Medicine Name"
                placeholder="Enter medicine name"
                value={formData.medicineName}
                onChange={(e) => handleChange("medicineName", e.target.value)}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Dosage"
                placeholder="100mg or Pea-sized"
                value={formData.dose}
                onChange={(e) => handleChange("dose", e.target.value)}
              />
            </CCol>
            <CCol md={6}>
              <label className="form-label">Medicine Type</label>
              <CreatableSelect
                isClearable
                options={medicineTypes.map((t) => ({ label: t, value: t }))}
                value={
                  formData.medicineType
                    ? { label: formData.medicineType, value: formData.medicineType }
                    : null
                }
                onChange={(selected) =>
                  handleChange("medicineType", selected ? selected.value : "")
                }
                onCreateOption={handleCreateMedicineType}
                placeholder="Choose or create type..."
              />
            </CCol>
          </CRow>

          {/* Prescription Section */}
          <h6 className="text-primary fw-bold mb-3">Prescription Details</h6>
          <CRow className="g-3 mb-3">
            <CCol md={4}>
              <CFormInput
                type="number"
                label="Duration"
                placeholder="e.g., 7"
                value={formData.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
              />
            </CCol>
            <CCol md={4}>
              <CFormSelect
                label="Unit"
                value={formData.durationUnit}
                onChange={(e) => handleChange("durationUnit", e.target.value)}
              >
                <option value="">Select Unit</option>
                <option value="Hour">Hour</option>
                <option value="Day">Day</option>
                <option value="Week">Week</option>
                <option value="Month">Month</option>
              </CFormSelect>
            </CCol>
            <CCol md={4}>
              <CFormSelect
                label="Frequency"
                value={formData.remindWhen}
                onChange={(e) => handleChange("remindWhen", e.target.value)}
              >
                <option value="">Select</option>
                <option value="Once A Day">Once A Day</option>
                <option value="Twice A Day">Twice A Day</option>
                <option value="Thrice A Day">Thrice A Day</option>
                <option value="SOS">SOS</option>
              </CFormSelect>
            </CCol>
          </CRow>

          {/* Time Slots */}
          <CRow className="g-3 mb-3">
            {[...Array(3)].map((_, i) => {
              const taken = new Set((formData.times || []).filter(Boolean));
              return (
                <CCol md={4} key={i}>
                  <CFormSelect
                    label={`Time Slot ${i + 1}`}
                    value={formData.times?.[i] || ""}
                    onChange={(e) => {
                      const updatedTimes = [...(formData.times || [])];
                      updatedTimes[i] = e.target.value;
                      handleChange("times", updatedTimes);
                    }}
                    disabled={i >= slotCount()}
                  >
                    <option value="">Select Time…</option>
                    {slotOptions.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        disabled={
                          (formData.times?.[i] !== opt.value && taken.has(opt.value)) ||
                          i >= slotCount()
                        }
                      >
                        {opt.label}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              );
            })}
          </CRow>

          {/* Instructions */}
          <CRow className="g-3 mb-3">
            <CCol md={6}>
              <CFormSelect
                label="Food Instructions"
                value={formData.food}
                onChange={(e) => handleChange("food", e.target.value)}
              >
                <option value="">Select</option>
                <option value="Before Food">Before Food</option>
                <option value="After Food">After Food</option>
                <option value="With Food">With Food</option>
                <option value="NA">NA</option>
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormTextarea
                label="Notes / Special Instructions"
                placeholder="Enter details..."
                rows={2}
                value={formData.note}
                onChange={(e) => handleChange("note", e.target.value)}
              />
            </CCol>
          </CRow>

          {/* Inventory Section */}
          <h6 className="text-primary fw-bold mb-3">Inventory Information</h6>
          <CRow className="g-3">
            <CCol md={4}>
              <CFormInput
                label="Serial Number"
                value={formData.serialNumber}
                onChange={(e) => handleChange("serialNumber", e.target.value)}
              />
            </CCol>
            <CCol md={4}>
              <CFormInput
                label="Brand Name"
                value={formData.brandName}
                onChange={(e) => handleChange("brandName", e.target.value)}
              />
            </CCol>
            <CCol md={4}>
              <CFormInput
                label="Manufacturer"
                value={formData.manufacturer}
                onChange={(e) => handleChange("manufacturer", e.target.value)}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                type="month"
                label="Manufacturing Date"
                value={formData.dateOfManufacturing}
                onChange={(e) => handleChange("dateOfManufacturing", e.target.value)}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                type="month"
                label="Expiry Date"
                value={formData.dateOfExpiry}
                onChange={(e) => handleChange("dateOfExpiry", e.target.value)}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="License Number"
                value={formData.licenseNumber}
                onChange={(e) => handleChange("licenseNumber", e.target.value)}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                type="number"
                label="Stock"
                min="0"
                value={formData.stock}
                onChange={(e) => handleChange("stock", e.target.value)}
              />
            </CCol>
          </CRow>
        </CModalBody>

        <CModalFooter className="d-flex justify-content-between">
          <CButton color="secondary" variant="outline" onClick={() => setShowModal(false)}>
            Cancel
          </CButton>
          <CButton  onClick={handleSave} style={{backgroundColor:'#a5c4d4ff', color: "#7e3a93" }}>
            Save Medicine
          </CButton>
        </CModalFooter>
      </CModal>

    </div>
  )
}

export default PharmacyManagement
