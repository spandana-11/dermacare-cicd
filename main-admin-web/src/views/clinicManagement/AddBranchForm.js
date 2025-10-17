import React, { useState, useEffect } from 'react';
import {
  CRow,
  CCol,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CCard,
  CCardHeader,
  CCardBody,
  CCardFooter,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CSpinner,
  CAlert,
  CInputGroup,
  CFormSelect,
  CInputGroupText,
  CFormTextarea,
} from '@coreui/react';
import { useNavigate, useParams } from 'react-router-dom'

import {
  fetchAllBranches,
  
  fetchBranchById,
  createNewBranch,
  updateBranchData,
  deleteBranchById,
  fetchBranchByBranchId
} from './AddBranchAPI'; // Import the API function
import DataTable from 'react-data-table-component';
import { Edit2, Eye, Trash2 } from 'lucide-react'
const AddBranchForm = ({ clinicId }) => {
  const navigate = useNavigate()

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [deletingBranch, setDeletingBranch] = useState(null);
  const [viewingBranch, setViewingBranch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [rowsPerPage, setRowsPerPage]=useState(5);
  const [validationErrors, setValidationErrors]=useState({});
  const [formData, setFormData] = useState({
    clinicId: clinicId || '',
    branchName: '',
    address: '',
    city: '',
    contactNumber: '',
    email: '',
    latitude: '',
    longitude: '',
    virtualClinicTour: '',
  });
const [itemsPerPage, setItemsPerPage] = useState(5)
const [currentPage, setCurrentPage] = useState(1)
  // Load branches on component mount
  useEffect(() => {
    loadBranches();
  }, []);
React.useEffect(() => {
  if (clinicId) {
    setFormData(prev => ({ ...prev, clinicId }));
  }
}, [clinicId]);
const loadBranches = async () => {
  try {
    setLoading(true);
    const response = await fetchBranchById(clinicId);

    // Extract the array from API response
    const branchArray = Array.isArray(response.data) ? response.data : [];
    setBranches(branchArray);

    setError('');
  } catch (err) {
    setError('Failed to load branches. Please try again.');
    console.error('Error loading branches:', err);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, filterCity]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prevErrors)=>{
      if(!prevErrors[name]) return prevErrors;
      const { [name]:removedError, ...rest} = prevErrors;
      return rest;
    })
  };

  const handleSubmit = async () => {
    if(!validateForm()){
      return;
    }
    try {
      setLoading(true);
      if (editingBranch) {
        await updateBranchData(editingBranch.branchId, formData);
        setSuccess('Branch updated successfully!');
      } else {
        await createNewBranch(formData);
        setSuccess('Branch created successfully!');
      }
          setTimeout(() => setSuccess(''), 3000);

      setModalVisible(false);
      resetForm();
      loadBranches();
    } catch (error) {
      setError(`Error ${editingBranch ? 'updating' : 'creating'} branch: ${error.message}`);
      console.error(`Error ${editingBranch ? 'updating' : 'creating'} branch:`, error);
          setTimeout(() => setError(''), 3000);

    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteBranchById(deletingBranch.branchId);
                setTimeout(() => setSuccess(''), 3000);

      setSuccess('Branch deleted successfully!');
      setDeleteModalVisible(false);
      loadBranches();
    } catch (error) {
      setError(`Error deleting branch: ${error.message}`);
      console.error('Error deleting branch:', error);
      setTimeout(() => setError(''), 3000);

    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (branch) => {
    console.log('Editing branch:', branch)
    setEditingBranch(branch);
    setFormData({
      clinicId: formData.clinicId || '',
      branchName: branch.branchName || '',
      address: branch.address || '',
      city: branch.city || '',
      contactNumber: branch.contactNumber || '',
      email: branch.email || '',
      latitude: branch.latitude || '',
      longitude: branch.longitude || '',
      virtualClinicTour: branch.virtualClinicTour || '',
    });
    setModalVisible(true);
  };

  const handleView = async (branchId) => {
    try {
      setLoading(true);
      const branch = await fetchBranchByBranchId(branchId);
      setViewingBranch(branch.data);
      setViewModalVisible(true);
    } catch (error) {
      setError('Error fetching branch details');
      console.error('Error fetching branch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingBranch(null);
    resetForm();
    setModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      clinicId: clinicId || '',
      branchName: '',
      address: '',
      city: '',
      contactNumber: '',
      email: '',
      latitude: '',
      longitude: '',
      virtualClinicTour: '',
    });
  };  
const validateForm = () => {
  const errors = {};

  // Branch Name: only letters, spaces, min 3, max 50
  if (!formData.branchName || !/^[A-Za-z\s]{3,50}$/.test(formData.branchName.trim())) {
    errors.branchName = "Branch Name must be 3-50 letters and spaces only.";
  }

  // Clinic ID: numbers only, min 1, max 10 digits (adjust as needed)
  if (!formData.clinicId || !/^\d{1,10}$/.test(formData.clinicId.trim())) {
    errors.clinicId = "Clinic ID must be 1-10 digits.";
  }

  // Address: letters, numbers, spaces, comma, dot, min 5, max 100
  if (!formData.address || !/^[A-Za-z0-9\s,.-]{5,100}$/.test(formData.address.trim())) {
    errors.address = "Address must be 5-100 characters (letters, numbers, spaces, comma, dot, hyphen).";
  }

  // City: letters and spaces only, min 2, max 50
  if (!formData.city || !/^[A-Za-z\s]{2,50}$/.test(formData.city.trim())) {
    errors.city = "City must be 2-50 letters and spaces only.";
  }

  // Contact Number: exactly 10 digits, cannot start with 0
  if (!formData.contactNumber || !/^[1-9][0-9]{9}$/.test(formData.contactNumber.trim())) {
    errors.contactNumber = "Contact Number must be exactly 10 digits and cannot start with 0.";
  }

  // Email: standard email format
  if (!formData.email) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
    errors.email = "Invalid email format.";
  }

  // Latitude: number between -90 and 90
  const lat = parseFloat(formData.latitude);
  if (!formData.latitude) {
    errors.latitude = "Latitude is required.";
  } else if (isNaN(lat) || lat < -90 || lat > 90) {
    errors.latitude = "Latitude must be a number between -90 and 90.";
  }

  // Longitude: number between -180 and 180
  const lng = parseFloat(formData.longitude);
  if (!formData.longitude) {
    errors.longitude = "Longitude is required.";
  } else if (isNaN(lng) || lng < -180 || lng > 180) {
    errors.longitude = "Longitude must be a number between -180 and 180.";
  }

  // Virtual Tour (URL): optional, but if present must be valid URL
  if (formData.virtualTour) {
    try {
      new URL(formData.virtualTour.trim());
    } catch (_) {
      errors.virtualTour = "Virtual Tour must be a valid URL.";
    }
  }

  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};



  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingBranch(null);
    resetForm();
  };

  // Filter branches based on search term and city filter
  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.branchName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branch.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branch.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = filterCity ? branch.city === filterCity : true;
    return matchesSearch && matchesCity;
  });


    const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const paginatedBranches = filteredBranches.slice(indexOfFirstItem, indexOfLastItem)
const totalPages = Math.ceil(filteredBranches.length / itemsPerPage)
const startIndex = indexOfFirstItem
const endIndex = Math.min(indexOfLastItem, filteredBranches.length)
  // Get unique cities for filter dropdown
  const cities = [...new Set(branches.map(branch => branch.city).filter(city => city))];

  return (
    <div>
      <CCard>
        <CCardHeader className='d-flex justify-content-between'>
          <h3>Branch Management</h3>
          <CButton color="primary" onClick={handleAddNew}>
            Add New Branch
          </CButton>
        </CCardHeader>
        <CCardBody>
          {error && (
            <CAlert color="danger" onDismiss={() => setError('')}>
              {error}
            </CAlert>
          )}
          {success && (
            <CAlert color="success" onDismiss={() => setSuccess('')}>
              {success}
            </CAlert>
          )}

          {/* Search and Filter Controls */}
          <CRow className="mb-3">
            <CCol md={6}>
              <CInputGroup>
                <CInputGroupText>Search</CInputGroupText>
                <CFormInput
                  placeholder="Search by name, address, or city"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CInputGroup>
            </CCol>
            <CCol md={6}>
              <CInputGroup>
                <CInputGroupText>Filter by City</CInputGroupText>
                <CFormSelect
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                >
                  <option value="">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </CFormSelect>
              </CInputGroup>
            </CCol>
          </CRow>

          {/* Branches Table */}
          {loading ? (
            <div className="text-center">
              <CSpinner />
            </div>
          ) : (
            <CTable striped hover responsive>
              <CTableHead className="pink-table">
                <CTableRow>
                  <CTableHeaderCell>S.No</CTableHeaderCell>
                  <CTableHeaderCell>Branch Name</CTableHeaderCell>
                  <CTableHeaderCell>Address</CTableHeaderCell>
                  <CTableHeaderCell>City</CTableHeaderCell>
                  <CTableHeaderCell>Contact</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
            <CTableBody className='pink-table'>
  {paginatedBranches.length > 0 ? (
    paginatedBranches.map((branch, index) => (
      <CTableRow key={branch.branchId}>
        <CTableDataCell>{startIndex + index + 1}</CTableDataCell>
        <CTableDataCell>{branch.branchName}</CTableDataCell>
        <CTableDataCell>{branch.address}</CTableDataCell>
        <CTableDataCell><CBadge color="secondary">{branch.city}</CBadge></CTableDataCell>
        <CTableDataCell>{branch.contactNumber}</CTableDataCell>
       <CTableDataCell className="text-end">
        <div className="d-flex justify-content-end gap-2">
  {/* View button always available */}
  <button
    className="actionBtn"
    onClick={() => navigate(`/branch-details/${branch.branchId}`)}
    title="View"
  >
    <Eye size={18} />
  </button>

  {/* Only show Edit/Delete if NOT the first branch */}
  {index !== 0 && (
    <>
      <button className="actionBtn" title="Edit" onClick={() => handleEdit(branch)}><Edit2 size={18} /></button>
      <button className="actionBtn" title="Delete" onClick={() => { setDeletingBranch(branch); setDeleteModalVisible(true); }}><Trash2 size={18} /></button>
    </>
  )}
  </div>
</CTableDataCell>

      </CTableRow>
    ))
  ) : (
    <CTableRow>
      <CTableDataCell colSpan="6" className="text-center">
        No branches found
      </CTableDataCell>
    </CTableRow>
  )}
</CTableBody>
            </CTable>
          )}
        </CCardBody>
    <CCardFooter className="d-flex justify-content-between align-items-center">
  <div className="text-muted">
    Showing {startIndex + 1}-{endIndex} of {filteredBranches.length} branches
  </div>

  {/* Rows Per Page Dropdown */}
  <div className="d-flex align-items-center">
    <span className="me-2">Rows per page:</span>
    <CFormSelect
      value={itemsPerPage}
      onChange={(e) => {
        setItemsPerPage(Number(e.target.value))
        setCurrentPage(1) // ✅ Reset to first page on change
      }}
      style={{ width: '80px' }}
    >
      {[5, 10, 20, 50].map((size) => (
        <option key={size} value={size}>
          {size}
        </option>
      ))}
    </CFormSelect>
  </div>

  {/* Pagination Buttons */}
  <div>
    <CButton
      color="secondary"
      size="sm"
      className="me-2"
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
    >
      Previous
    </CButton>

    {/* Page Numbers */}
    {[...Array(totalPages)].map((_, index) => (
      <CButton
        key={index}
        color={currentPage === index + 1 ? 'primary' : 'secondary'}
        size="sm"
        className="me-1"
        onClick={() => setCurrentPage(index + 1)}
      >
        {index + 1}
      </CButton>
    ))}

    <CButton
      color="secondary"
      size="sm"
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages || totalPages === 0}
    >
      Next
    </CButton>
  </div>
</CCardFooter>
      </CCard>

      {/* Add/Edit Branch Modal */}
      <CModal visible={modalVisible} onClose={handleCloseModal} size="lg">
        <CModalHeader closeButton>
          <CModalTitle>{editingBranch ? 'Edit Branch' : 'Add New Branch'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow>
             <CCol md={6}>
  <CFormInput
    label="Clinic ID"
    name="clinicId"
    value={formData.clinicId}  // pre-filled from state
    onChange={handleChange}
    className="mb-3"
    disabled                   // makes it read-only
  />
</CCol>
              <CCol md={6}>
                <CFormInput
                  label={
                    <>
                    Branch Name <span className="text-danger">*</span>
                    </>
                  }
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleChange}
                  className="mb-3"
                  required
                  invalid={!!validationErrors.branchName}
                />
                {validationErrors.branchName &&(
                  <div className="text-danger small mb-2">{validationErrors.branchName}</div>
                )}
              </CCol>
            </CRow>
            <CRow>
              <CCol md={6}>
                <CFormInput
                  label={
                    <>
                       Address <span className="text-danger">*</span>
                    </>
                  }
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="mb-3"
                  required
                  invalid={!!validationErrors.address}
                />
                {validationErrors.address &&(
                  <div className="text-danger small mb-2">{validationErrors.address}</div>
                )
                }
              </CCol>
              <CCol md={6}>
                <CFormInput
                  // label="City"
                  label={
                    <>
                    City <span className="text-dander">*</span>
                    </>
                  }
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="mb-3"
                  required
                  invalid={!!validationErrors.city}
                />
                {validationErrors.city &&(
                  <div className="text-danger small mb-2">{validationErrors.city}</div>
                )}
              </CCol>
            </CRow>
            <CRow>
        <CCol md={6}>
<CFormInput
  label={
    <>
      Contact Number <span className="text-danger">*</span>
    </>
  }
  type="text"
  name="contactNumber"
  value={formData.contactNumber}
  onChange={(e) => {
    let onlyNums = e.target.value.replace(/[^0-9]/g, ""); // only digits
    if (onlyNums.length > 10) {
      onlyNums = onlyNums.slice(0, 10); // restrict to 10 digits
    }
    setFormData((prev) => ({ ...prev, contactNumber: onlyNums }));

    // ✅ Clear error when typing
    setValidationErrors((prevErrors) => {
      if (!prevErrors.contactNumber) return prevErrors;
      const { contactNumber, ...rest } = prevErrors;
      return rest;
    });
  }}
  className="mb-3"
  required
  invalid={!!validationErrors.contactNumber}
/>
{validationErrors.contactNumber && (
  <div className="text-danger small mb-2">{validationErrors.contactNumber}</div>
)}
</CCol>

          <CCol md={6}>
  <CFormInput
    // label="Email"
    label={
      <>
      Email <span className="text-danger">*</span>
      </>
    }
    name="email"
    type="email"
    value={formData.email}
    onChange={handleChange}
    className="mb-3"
    invalid={!!validationErrors.email}   // ✅ bind error state
  />
  {validationErrors.email && (
    <div className="text-danger small mb-2">
      {validationErrors.email}
    </div>
  )}
</CCol>

            </CRow>
            <CRow>
            <CCol md={6}>
  <CFormInput
    // label="Latitude"
    label={
      <>
      Latitude <span className="text-danger">*</span>
      </>
    }
    name="latitude"
    value={formData.latitude}
    onChange={handleChange}
    className="mb-3"
    invalid={!!validationErrors.latitude}   // ✅ bind error state
    required
  />
  {validationErrors.latitude && (
    <div className="text-danger small mb-2">
      {validationErrors.latitude}
    </div>
  )}
</CCol>

              <CCol md={6}>
               <CFormInput
  // label="Longitude"
  label={
    <>
    Longitude <span className="text-danger"> *</span>
    </>
  }
  name="longitude"
  value={formData.longitude}
  onChange={handleChange}
  className="mb-3"
  type="number"                       // ✅ restrict to numeric input
  invalid={!!validationErrors.longitude}  // ✅ highlight error if present
  required
/>
{validationErrors.longitude && (
  <div className="text-danger small mb-2">
    {validationErrors.longitude}
  </div>
)}

              </CCol>
            </CRow>
           <CFormInput
  label="Virtual Clinic Tour"
  type="url"
  name="virtualClinicTour"
  value={formData.virtualClinicTour}
  onChange={handleChange}
  className="mb-3"
  // rows={3}
  invalid={!!validationErrors.virtualClinicTour}   // ✅ highlight error if present
/>
{validationErrors.virtualClinicTour && (
  <div className="text-danger small mb-2">
    {validationErrors.virtualClinicTour}
  </div>
)}

          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCloseModal}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : (editingBranch ? 'Update' : 'Submit')}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Delete Confirmation Modal */}
      <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
        <CModalHeader closeButton>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete the branch "{deletingBranch?.branchName}"? This action cannot be undone.
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default AddBranchForm;