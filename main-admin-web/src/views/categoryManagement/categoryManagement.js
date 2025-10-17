import React, { useEffect, useState,useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CButton,
  CModal,
  CModalHeader,
  CFormText,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CCol,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CPagination,
  CPaginationItem,
  CFormSelect,
  CCard,
  CCardHeader,
  CCardBody,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch,cilTrash  } from '@coreui/icons'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Edit2, Eye, Trash2 } from 'lucide-react'

import {
  CategoryData,
  postCategoryData,
  updateCategoryData,
  deleteCategoryData,
} from './CategoryAPI'
import { ConfirmationModal } from '../../Utils/ConfirmationDelete'

const CategoryManagement = () => {
    const fileInputRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [viewCategory, setViewCategory] = useState(null)
  const [editCategoryMode, setEditCategoryMode] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState(null)
  const [fileKey, setFileKey] = useState(Date.now()) // used to reset file input
  
  const [errors, setErrors] = useState({
    categoryName: '',
    categoryImage: '',
  })

  const [newCategory, setNewCategory] = useState({
    categoryName: '',
    categoryImage: null,
  })

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [categoryIdToDelete, setCategoryIdToDelete] = useState(null)
  const [updatedCategory, setUpdatedCategory] = useState({
    categoryId: '',
    categoryName: '',
    categoryImage: null,
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const fetchData = async () => {
    setLoading(true)
    setError(null)  
    try {
       console.log('CategoryData calling')
      const data = await CategoryData()
      console.log('API success:', data.data)
      setCategory(data.data)
      setFilteredData(data.data) // Initialize filteredData with all data
    } catch (error) {
      console.error('Fetch error:', error)
      setError('Failed to fetch category data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('useEffect triggered')
    fetchData()
  }, [])

  useEffect(() => {
    const handleSearch = () => {
      const trimmedQuery = searchQuery.toLowerCase().trim()

      if (!trimmedQuery) {
        setFilteredData(category) // If no search query, show all data
        return
      }

      const filtered = category.filter((category) => {
        const categoryMatch = category.categoryName?.toLowerCase().includes(trimmedQuery)
        return categoryMatch
      })

      setFilteredData(filtered)
      setCurrentPage(1) // Reset to first page when searching
    }

    handleSearch()
  }, [searchQuery, category])

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  // Handle Enter key submission
  useEffect(() => {
    const handleEnterKey = (e) => {
      if (e.key === 'Enter' && modalVisible) {
        e.preventDefault()
        handleAddCategory()
      } else if (e.key === 'Enter' && editCategoryMode) {
        e.preventDefault()
        handleUpdateCategory()
      }
    }

    window.addEventListener('keydown', handleEnterKey)
    
    return () => {
      window.removeEventListener('keydown', handleEnterKey)
    }
  }, [modalVisible, editCategoryMode, newCategory, updatedCategory])

  const validateField = (name, value) => {
    let error = ""

  if (name === "categoryName") {
        const trimmedValue = value.trim()
  if (!trimmedValue) {
      error = "Category name is required."
    } 
 
   else if (!/^[A-Za-z0-9\s]+$/.test(trimmedValue)) {
      error = "Category name must only contain letters, numbers, and spaces."
    } 
    // Disallow only numbers
    else if (/^\d+$/.test(trimmedValue)) {
      error = "Category name cannot contain only numbers."
    }
}

    if (name === "categoryImage") {
      if (!value) error = "Category image is required."
    }

    setErrors((prev) => ({ ...prev, [name]: error }))
    return error === ""
  }

  const handleCategoryChange = (e) => {
    const { name, value } = e.target
    const capitalizedValue =
      name === "categoryName"
        ? value.charAt(0).toUpperCase() + value.slice(1)
        : value

    setNewCategory((prev) => ({ ...prev, [name]: capitalizedValue }))
    validateField(name, capitalizedValue)
  }
const handleDeleteCategoryImage = () => {
  setUpdatedCategory((prev) => ({
    ...prev,
    categoryImage: null,
  }))
  if(fileInputRef.current){
    fileInputRef.current.value=null;
  }
}
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if(!file) return
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, categoryImage: "Only image files are allowed." }))
            setNewCategory((prev) => ({ ...prev, categoryImage: null }));

        return
      }
      // if (file.size > 100 * 1024) {
      //   setErrors((prev) => ({ ...prev, categoryImage: "File size must be less than 100kb." }))
      //   return
      // }

      const reader = new FileReader()
      reader.onloadend = () => {
        let base64String = reader.result?.split(",")[1]
        setNewCategory((prev) => ({ ...prev, categoryImage: base64String }))
        validateField("categoryImage", base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const fields = ["categoryName", "categoryImage"]
    const results = fields.map((field) => validateField(field, newCategory[field]))
    return results.every((res) => res)
  }

const handleAddCategory = async () => {
  const trimmedName = newCategory.categoryName.trim();
  let isValid = true;

  // 🔹 Category Name validation
  if (!trimmedName) {
    setErrors(prev => ({ ...prev, categoryName: "Category Name is required" }));
    isValid = false;
  } else if (trimmedName.length < 3) {
    setErrors(prev => ({ ...prev, categoryName: "Category Name must be at least 3 characters long" }));
    isValid = false;
  } else if (!/^[A-Za-z0-9\s]+$/.test(trimmedName)) {
    setErrors(prev => ({ ...prev, categoryName: "Category Name must only contain letters, numbers, and spaces" }));
    isValid = false;
  } else if (/^\d+$/.test(trimmedName)) {
    setErrors(prev => ({ ...prev, categoryName: "Category Name cannot be only numbers" }));
    isValid = false;
  } else {
    setErrors(prev => ({ ...prev, categoryName: "" }));
  }

  // 🔹 Image validation
  if (!newCategory.categoryImage) {
    setErrors(prev => ({ ...prev, categoryImage: "Category Image is required" }));
    isValid = false;
  } else {
    setErrors(prev => ({ ...prev, categoryImage: "" }));
  }

  if (!isValid) return;

  try {
    const payload = {
      categoryName: trimmedName,
      categoryImage: newCategory.categoryImage,
    };

    const response = await postCategoryData(payload);
    toast.success("Category added successfully!");
    fetchData();
    setModalVisible(false);
    setNewCategory({ categoryName: "", categoryImage: null });
  } catch (error) {
    const errorMessage = error.response?.data?.message || "";
    if (errorMessage.toLowerCase().includes("exists")) {
      setErrors(prev => ({ ...prev, categoryName: "Category Name already exists." }));
    } else {
      toast.error("Failed to add category");
    }
  }
};



  const handleCategoryEdit = (category) => {
    console.log('Category to edit:', category)
    setCategoryToEdit(category)
    setUpdatedCategory({
      categoryId: category.categoryId || '',
      categoryName: category.categoryName || '',
      categoryImage: category.categoryImage || null,
    })
    setEditCategoryMode(true)
  }

const handleUpdateCategory = async () => {
  let isValid = true;
  const trimmedName = updatedCategory.categoryName.trim();

  // 🔹 Category Name validation
  if (!trimmedName) {
    setErrors(prev => ({ ...prev, categoryName: "Category Name is required" }));
    isValid = false;
  } else if (trimmedName.length < 3) {
    setErrors(prev => ({ ...prev, categoryName: "Category Name must be at least 3 characters long" }));
    isValid = false;
  } else if (!/^[A-Za-z0-9\s]+$/.test(trimmedName)) {
    setErrors(prev => ({ ...prev, categoryName: "Category Name must only contain letters, numbers, and spaces" }));
    isValid = false;
  } else if (/^\d+$/.test(trimmedName)) {
    setErrors(prev => ({ ...prev, categoryName: "Category Name cannot be only numbers" }));
    isValid = false;
  } else {
    setErrors(prev => ({ ...prev, categoryName: "" }));
  }

  // 🔹 Image validation
  if (!updatedCategory.categoryImage) {
    setErrors(prev => ({ ...prev, categoryImage: "Category Image is required" }));
    isValid = false;
  } else {
    setErrors(prev => ({ ...prev, categoryImage: "" }));
  }

  if (!isValid) return;

  try {
    const updateData = {
      categoryName: trimmedName,
      categoryImage: updatedCategory.categoryImage,
    };

    const response = await updateCategoryData(updateData, updatedCategory.categoryId);
    if (response) {
      toast.success("Category updated successfully!");
      setEditCategoryMode(false);
      fetchData();
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || "";
    if (errorMessage.toLowerCase().includes("exists")) {
      setErrors(prev => ({ ...prev, categoryName: "Category Name already exists." }));
    } else {
      toast.error("Failed to update category");
    }
  }
};



  const handleCancel = () => {
    setUpdatedCategory({
      categoryId: '',
      categoryName: '',
      categoryImage: null,
    })
    setErrors({ categoryName: '', categoryImage: '' })
    setEditCategoryMode(false)
  }

  const handleEditFileChange = (e) => {
    const file = e.target.files[0]

    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, categoryImage: "Only image files are allowed." }))
        return
      }

      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, categoryImage: "File size must be less than 2MB." }))
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result?.split(",")[1]
        setUpdatedCategory((prev) => ({
          ...prev,
          categoryImage: base64String,
        }))
        setErrors((prev) => ({ ...prev, categoryImage: "" }))
      }
      reader.readAsDataURL(file)
    } else {
      setErrors((prev) => ({ ...prev, categoryImage: "Category image is required." }))
    }
  }
  const handleClearImage = () => {
    setNewCategory((prev) => ({ ...prev, categoryImage: null }))
    setErrors((prev) => ({ ...prev, categoryImage: "" }))
    setFileKey(Date.now()) // reset input
  }

  const handleCategoryDelete = (categoryId) => {
    setCategoryIdToDelete(categoryId)
    setIsModalVisible(true)
  }

  const handleConfirmDelete = async () => {
    console.log(categoryIdToDelete)
    try {
      const data = await deleteCategoryData(categoryIdToDelete)
      setIsModalVisible(false)
      toast.success(`${data.data}`, { position: 'top-right' })
      fetchData()
    } catch (error) {
      alert('Failed to delete category.')
    }
  }

  const handleCancelAdd = () => {
    setNewCategory({
      categoryName: '',
      categoryImage: null,
    })
    setErrors({ categoryName: '', categoryImage: '' })
    setModalVisible(false)
  }

  const handleCancelDelete = () => {
    setIsModalVisible(false)
  }

  return (
       <CCard className="mt-4">
      <ToastContainer />
        <CCardHeader>
      <div className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Categories</h5>
        <CButton color="primary" onClick={() => setModalVisible(true)}>
          Add Category
        </CButton>
      </div>
      </CCardHeader>

      <CCardBody>
        <CForm className="d-flex justify-content-between align-items-center mb-4">
                    <div className="col-4 mx-2">

          <CInputGroup style={{ width: '300px' }}>
            <CFormInput
              type="text"
              placeholder="Search by Category Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
           
            <CInputGroupText>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
          </CInputGroup>
           </div>
        </CForm>

        <CTable striped hover responsive>
          <CTableHead className='pink-table'>
            <CTableRow>
              <CTableHeaderCell>S.No</CTableHeaderCell>
              <CTableHeaderCell>Category Name</CTableHeaderCell>
              <CTableHeaderCell className="text-end">
                Actions
              </CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody className='pink-table'> 
            {currentItems.length > 0 ? (
              currentItems.map((category, index) => (
                <CTableRow key={category.categoryId}>
                  <CTableDataCell>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </CTableDataCell>
                  <CTableDataCell>{category.categoryName}</CTableDataCell>
                  <CTableDataCell className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                    {/* {can('category', 'read')&&( */}
                      <button
                        className="actionBtn"
                        onClick={()=>setViewCategory(category)}
                        title="View"
                        >
                          <Eye size={18} />
                        </button>
                    {/* )} */}
                    {/* {can('Treatments', 'update') &&( */}
                      <button
                        className="actionBtn"
                        onClick={()=>handleCategoryEdit(category)}
                        title="Edit"
                        >
                        <Edit2 size={18} />
                        </button>
                    {/* )} */}
                    {/* {can('Treatments', 'delete')&&( */}
                      <button
                        className="actionBtn"
                        onClick={()=>handleCategoryDelete(category.categoryId)}
                        title="Delete"
                        >
                          <Trash2 size={18} />
                          </button>
                    {/* )} */}
                    </div>
                  </CTableDataCell>
                  {/* <CTableDataCell className="text-center">
                    <CButton
    color="primary"
    size="sm"
    onClick={() => setViewCategory(row)}
  >
    View
  </CButton>
  <CButton
    color="warning"
    className="ms-2"
    size="sm"
    onClick={() => handleCategoryEdit(row)}
  >
    Edit
  </CButton>
  <CButton
    color="danger"
    className="ms-2"
    size="sm"
    onClick={() => handleCategoryDelete(row.categoryId)}
  >
    Delete
  </CButton>
                  </CTableDataCell> */}
                </CTableRow>
              ))
            ) : (
              <CTableRow>
                <CTableDataCell colSpan={3} className="text-center text-muted">
                  {searchQuery
                    ? 'No matching categories found.'
                    : 'No categories available.'}
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>

        {/* Pagination */}
        {filteredData.length > itemsPerPage && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              <span className="me-2">Rows per page:</span>
              <CFormSelect
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                style={{ width: '80px', display: 'inline-block' }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </CFormSelect>
            </div>
            <div>
              <span className="me-3">
                Showing {indexOfFirstItem + 1} to{' '}
                {Math.min(indexOfLastItem, filteredData.length)} of{' '}
                {filteredData.length} entries
              </span>
              <CPagination>
                <CPaginationItem
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </CPaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <CPaginationItem
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </CPaginationItem>
                ))}
                <CPaginationItem
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </CPaginationItem>
              </CPagination>
            </div>
          </div>
        )}
      </CCardBody>

      {/* View Category Modal */}
      {viewCategory && (
        <CModal
          visible={!!viewCategory}
          onClose={() => setViewCategory(null)}
          size="md"
        >
          <CModalHeader>
            <CModalTitle>Category Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CRow className="mb-3">
              <CCol sm={4}>
                <strong>Category ID :</strong>
              </CCol>
              <CCol sm={8}>{viewCategory.categoryId}</CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={4}>
                <strong>Category Name :</strong>
              </CCol>
              <CCol sm={8}>{viewCategory.categoryName}</CCol>
            </CRow>
            <CRow>
              <CCol sm={4}>
                <strong>Category Image :</strong>
              </CCol>
              <CCol sm={8}>
                {viewCategory.categoryImage ? (
                  <img
                    src={`data:image/png;base64,${viewCategory.categoryImage}`}
                    alt="Category"
                    style={{ width: '200px', height: 'auto' }}
                  />
                ) : (
                  <span>No image available</span>
                )}
              </CCol>
            </CRow>
          </CModalBody>
        </CModal>
      )}
      

      <CModal visible={modalVisible} onClose={handleCancelAdd} backdrop="static">
        <CModalHeader>
          <CModalTitle>Add New Category</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm
            onSubmit={(e) => {
              e.preventDefault()
              handleAddCategory()
            }}
            id="addCategoryForm"
          >
<h6>
  Category Name <span style={{ color: 'red' }}>*</span>
</h6>

<CFormInput
  type="text"
  placeholder="Category Name"
  value={newCategory.categoryName || ''}
  name="categoryName"
  onChange={(e) => {
    let value = e.target.value;

    // Replace multiple spaces with a single space
    value = value.replace(/\s+/g, ' ');

    // Capitalize each word
    const capitalizedValue = value
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    // Update category state
    setNewCategory(prev => ({ ...prev, categoryName: capitalizedValue }));

    // Validation
   const trimmedValue = value.trim();

if (!trimmedValue) {
  setErrors(prev => ({ ...prev, categoryName: 'Category Name is required.' }));
} 
// ❌ Only letters, numbers, spaces allowed
else if (!/^[A-Za-z0-9\s]+$/.test(trimmedValue)) {
  setErrors(prev => ({ ...prev, categoryName: 'Category Name must only contain letters, numbers, and spaces.' }));
} 
// ❌ Only numbers are not allowed
else if (/^\d+$/.test(trimmedValue)) {
  setErrors(prev => ({ ...prev, categoryName: 'Category Name cannot be only numbers.' }));
} 
// ✅ Minimum length check
else if (trimmedValue.length < 3) {
  setErrors(prev => ({ ...prev, categoryName: 'Category Name must be at least 3 characters long.' }));
} 
else {
  setErrors(prev => ({ ...prev, categoryName: '' }));
}

  }}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCategory();
    }
  }}
/>

{errors.categoryName && (
  <CFormText className="text-danger">{errors.categoryName}</CFormText>
)}


<h6>
        Category Image <span style={{ color: "red" }}>*</span>
      </h6>
      <CFormInput
        key={fileKey} // changing key resets the input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            handleAddCategory()
          }
        }}
      />

      {/* Image Preview */}
      {newCategory?.categoryImage && (
        <div className="position-relative d-inline-block mt-2">
          <img
            src={`data:image/png;base64,${newCategory.categoryImage}`}
            alt="Category"
            style={{
              width: "150px",
              height: "150px",
              objectFit: "cover",
              display: "block",
              borderRadius: "8px",
            }}
          />
          {/* Clear Icon */}
          <CIcon
            icon={cilTrash}
            size="xl"
            className="position-absolute bg-white rounded-circle p-1 shadow text-danger"
            style={{ top: "-8px", right: "-8px", cursor: "pointer", border: "1px solid #ddd" }}
            onClick={handleClearImage}
          />
        </div>
      )}

      {/* Validation Error */}
      {errors.categoryImage && <CFormText className="text-danger">{errors.categoryImage}</CFormText>}

          </CForm>
        </CModalBody>

        <CModalFooter>
          <CButton 
            type="submit" 
            color="primary" 
            form="addCategoryForm"
          >
            Add
          </CButton>
          <CButton color="secondary" onClick={handleCancelAdd}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal
        visible={editCategoryMode}
        onClose={() => {
          setErrors({ categoryName: '', categoryImage: '' })
          setEditCategoryMode(false)
        }}
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>Edit Category</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm
            onSubmit={(e) => {
              e.preventDefault()
              handleUpdateCategory()
            }}
            id="editCategoryForm"
          >
     <h6>
  Category Name <span style={{ color: 'red' }}>*</span>
</h6>

<CFormInput
  type="text"
  placeholder="Category Name"
  value={updatedCategory.categoryName || ''}
  onChange={(e) => {
    let value = e.target.value;

    // Replace multiple spaces with a single space
    value = value.replace(/\s+/g, ' ');

    // Capitalize each word
    const capitalizedValue = value
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    // Update state
    setUpdatedCategory(prev => ({ ...prev, categoryName: capitalizedValue }));

    // Validation
    const trimmedValue = value.trim();

if (!trimmedValue) {
  setErrors(prev => ({ ...prev, categoryName: 'Category Name is required.' }));
} 
// ❌ Only letters, numbers, spaces allowed
else if (!/^[A-Za-z0-9\s]+$/.test(trimmedValue)) {
  setErrors(prev => ({ ...prev, categoryName: 'Category Name must only contain letters, numbers, and spaces.' }));
} 
// ❌ Only numbers are not allowed
else if (/^\d+$/.test(trimmedValue)) {
  setErrors(prev => ({ ...prev, categoryName: 'Category Name cannot be only numbers.' }));
} 
// ✅ Minimum length check
else if (trimmedValue.length < 3) {
  setErrors(prev => ({ ...prev, categoryName: 'Category Name must be at least 3 characters long.' }));
} 
else {
  setErrors(prev => ({ ...prev, categoryName: '' }));
}

  }}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUpdateCategory();
    }
  }}
/>

{errors.categoryName && (
  <CFormText className="text-danger">{errors.categoryName}</CFormText>
)}



<h6>
  Category Image <span style={{ color: 'red' }}>*</span>
</h6>
<CFormInput
  type="file"
  accept="image/*"
  ref={fileInputRef}
  onChange={handleEditFileChange}
/>

{updatedCategory?.categoryImage ? (
  <div style={{ position: 'relative', display: 'inline-block', marginTop: '10px' }}>
    <img
      src={`data:image/png;base64,${updatedCategory.categoryImage}`}
      alt="Category"
      style={{ width: '200px', height: 'auto', borderRadius: '5px' }}
    />
    <CIcon
      icon={cilTrash}
      size="lg"
      onClick={handleDeleteCategoryImage}
      style={{
        position: 'absolute',
        top: '5px',
        right: '5px',
        color: 'white',
        backgroundColor: 'red',
        borderRadius: '50%',
        padding: '4px',
        cursor: 'pointer',
      }}
    />
  </div>
) : (
  <span style={{ display: 'block', marginTop: '10px' }}>No image available</span>
)}

{errors.categoryImage && (
  <CFormText className="text-danger">{errors.categoryImage}</CFormText>
)}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton 
            type="submit" 
            color="primary" 
            form="editCategoryForm"
          >
            Update
          </CButton>
          <CButton color="secondary" onClick={handleCancel}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

      <ConfirmationModal
        isVisible={isModalVisible}
        message="Are you sure you want to delete this category?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </CCard>
  ) 
}

export default CategoryManagement