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
  CFormTextarea
} from '@coreui/react';
import {
  fetchAllBranches,
  
  fetchBranchById,
  createNewBranch,
  updateBranchData,
  deleteBranchById,
  fetchBranchByBranchId
} from './AddBranchAPI'; // Import the API function
import DataTable from 'react-data-table-component';0
const AddBranchForm = ({ clinicId }) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
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
  const validateForm=()=>{
    const errors={};

    if(!formData.branchName || formData.branchName.trim().length < 3){
      errors.branchName = "Branch name must be atleast 3 characters.";
    }
    if(!formData.address || formData.address.trim().length<5){
      errors.address="Address must be at least 5 characters";
    }
    if(!formData.city){
      errors.city="City is required";
    }
    if(!formData.contactNumber ||  !/^[0-9]{10}$/.test(formData.contactNumber)){
      errors.contactNumber="Contact Number must be 10 digits.";
    }
 if (!formData.email) {
  errors.email = "Email is required.";
} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
  errors.email = "Invalid email format.";
}

if (!formData.latitude) {
  errors.latitude = "Latitude is required.";
} else if (isNaN(formData.latitude)) {
  errors.latitude = "Latitude must be a valid Number.";
}

if (!formData.longitude) {
  errors.longitude = "Longitude is required.";
} else if (isNaN(formData.longitude)) {
  errors.longitude = "Longitude must be a valid Number.";
}

  setValidationErrors(errors);
  return Object.keys(errors).length===0;
  }
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
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>S.No</CTableHeaderCell>
                  <CTableHeaderCell>Branch Name</CTableHeaderCell>
                  <CTableHeaderCell>Address</CTableHeaderCell>
                  <CTableHeaderCell>City</CTableHeaderCell>
                  <CTableHeaderCell>Contact</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
            <CTableBody>
  {paginatedBranches.length > 0 ? (
    paginatedBranches.map((branch, index) => (
      <CTableRow key={branch.branchId}>
        <CTableDataCell>{startIndex + index + 1}</CTableDataCell>
        <CTableDataCell>{branch.branchName}</CTableDataCell>
        <CTableDataCell>{branch.address}</CTableDataCell>
        <CTableDataCell><CBadge color="secondary">{branch.city}</CBadge></CTableDataCell>
        <CTableDataCell>{branch.contactNumber}</CTableDataCell>
        <CTableDataCell>
          <CButton color="info" size="sm" className="me-2" onClick={() => handleView(branch.branchId)}>View</CButton>
          <CButton color="warning" size="sm" className="me-2" onClick={() => handleEdit(branch)}>Edit</CButton>
          <CButton color="danger" size="sm" onClick={() => { setDeletingBranch(branch); setDeleteModalVisible(true); }}>Delete</CButton>
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
           <CFormTextarea
  label="Virtual Clinic Tour"
  name="virtualClinicTour"
  value={formData.virtualClinicTour}
  onChange={handleChange}
  className="mb-3"
  rows={3}
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

      {/* View Branch Details Modal */}
      <CModal visible={viewModalVisible} onClose={() => setViewModalVisible(false)} size="lg">
        <CModalHeader closeButton>
          <CModalTitle>Branch Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {viewingBranch ? (
            <CRow>
              <CCol md={6}>
                <p><strong>Branch Name:</strong> {viewingBranch.branchName}</p>
                <p><strong>Clinic ID:</strong> {formData.clinicId}</p>
                <p><strong>Address:</strong> {viewingBranch.address}</p>
                <p><strong>City:</strong> {viewingBranch.city}</p>
              </CCol>
              <CCol md={6}>
                <p><strong>Contact Number:</strong> {viewingBranch.contactNumber}</p>
                <p><strong>Email:</strong> {viewingBranch.email}</p>
                <p><strong>Coordinates:</strong> {viewingBranch.latitude}, {viewingBranch.longitude}</p>
                <p><strong>Virtual Tour:</strong> {viewingBranch.virtualClinicTour || 'N/A'}</p>
              </CCol>
            </CRow>
          ) : (
            <CSpinner />
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setViewModalVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default AddBranchForm;