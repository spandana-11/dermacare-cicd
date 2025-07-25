import React, { useEffect, useState } from 'react'
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
  CHeader,
  CRow,
  CCol,
  CFormTextarea,
} from '@coreui/react'
import DataTable from 'react-data-table-component'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  CategoryData,
  postCategoryData,
  updateCategoryData,
  deleteCategoryData,
} from './CategoryAPI'
import { ConfirmationModal } from '../../Utils/ConfirmationDelete'

const CategoryManagement = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [viewCategory, setViewCategory] = useState(null)
  const [editCategoryMode, setEditCategoryMode] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState(null)

  const [imagePreview, setImagePreview] = useState(null)
  const [errors, setErrors] = useState({
    categoryName: '',
    categoryImage: '',
    // description: '',
  })

  const [newCategory, setNewCategory] = useState({
    categoryName: '',
    categoryImage: null,
    // description: '',
  })

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [categoryIdToDelete, setCategoryIdToDelete] = useState(null)
  const [updatedCategory, setUpdatedCategory] = useState({
    categoryId: '',
    categoryName: '',
    categoryImage: null,
    // description: '',
  })

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('CategoryData calling')

      const data = await CategoryData()
      console.log('API success:', data.data)
      setCategory(data.data)
    } catch (error) {
      console.error('Fetch error:', error) // 🪵 Log actual error
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
        setFilteredData([]) // If no search query, reset the filtered data
        return
      }

      const filtered = category.filter((category) => {
        const categoryMatch = category.categoryName?.toLowerCase().startsWith(trimmedQuery)
        return categoryMatch
      })

      setFilteredData(filtered) // Set the filtered data
    }

    handleSearch()
  }, [searchQuery, category])

  const columns = [
    {
      name: (
        <div
          style={{
            fontSize: '20px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          S.No
        </div>
      ),
      selector: (row, index) => index + 1,
      sortable: true,
      width: '10%',

      headerStyle: { textAlign: 'center' },
    },
    {
      name: (
        <div
          style={{
            fontSize: '20px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Category Name
        </div>
      ),
      selector: (row) => row.categoryName,
      sortable: true,
      width: '50%',
      cell: (row) => (
        <div style={{ textAlign: 'center', fontSize: '20px' }}>{row.categoryName}</div>
      ),
      headerStyle: { textAlign: 'center' },
    },

    {
      name: (
        <div
          style={{
            fontSize: '20px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Actions
        </div>
      ),
      cell: (row) => (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '230px',
          }}
        >
          <CButton
            //  color="link"
            className="text-primary p-0"
            onClick={() => setViewCategory(row)}
            style={{ marginRight: '10px', width: '80px' }}
          >
            View
          </CButton>

          <CButton
            color="link"
            className="text-success p-0"
            onClick={() => handleCategoryEdit(row)}
            style={{ marginRight: '10px', width: '80px' }}
          >
            Edit
          </CButton>

          <CButton
            color="link"
            className="text-danger p-0"
            onClick={() => handleCategoryDelete(row.categoryId)}
            style={{ width: '80px' }}
          >
            Delete
          </CButton>

          <ConfirmationModal
            isVisible={isModalVisible}
            message="Are you sure you want to delete this category?"
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        </div>
      ),
      width: '150px',
      headerStyle: { textAlign: 'center' },
    },
  ]

  const handleFileChange = (e) => {
    const file = e.target.files[0]

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        let base64String = reader.result
        if (base64String) {
          base64String = base64String.split(',')[1]
        }
        setNewCategory((prevCategory) => ({
          ...prevCategory,
          categoryImage: base64String,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCategoryChange = (e) => {
    const { name, value } = e.target
    setNewCategory({
      ...newCategory,
      [name]: value,
    })
    if (name === 'categoryName') {
      const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1)
      setNewCategory({
        ...newCategory,
        [name]: capitalizedValue,
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!newCategory.categoryName) {
      newErrors.categoryName = 'Category name is required.'
    } else if (!/^[A-Za-z\s]+$/.test(newCategory.categoryName)) {
      newErrors.categoryName = 'Category name must only contain alphabets and spaces.'
    }

    if (!newCategory.categoryImage) {
      newErrors.categoryImage = 'Category image is required.'
    }

    // if (!newCategory.description || !newCategory.description.trim()) {
    //   newErrors.description = 'Description is required.'
    // } else if (newCategory.description.length < 10) {
    //   newErrors.description = 'Description must be at least 10 characters long.'
    // }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

const handleAddCategory = async () => {
  if (!validateForm()) return;

  try {
    const payload = {
      categoryName: newCategory.categoryName,
      categoryImage: newCategory.categoryImage,
      // description: newCategory.description,
    };

    const response = await postCategoryData(payload);

    // Only show success toast if postCategoryData completes without throwing an error
    toast.success('Category added successfully!', { position: 'top-right' });
    fetchData(); // Assuming this refreshes your data
    setModalVisible(false); // Assuming this closes a modal

  } catch (error) {
    console.error('Error adding category:', error);

    // Check for specific error messages or status codes for duplicates
    const errorMessage = error.response?.data?.message || error.response?.statusText || 'An unexpected error occurred.';
    const statusCode = error.response?.status;

    if (statusCode === 409 || errorMessage.toLowerCase().includes('duplicate')) { // Example: 409 Conflict for duplicates
      toast.error(`Error: Duplicate category name - ${newCategory.categoryName} already exists!`, { position: 'top-right' });
    } else {
      // For any other error
      toast.error(`Error adding category: ${errorMessage}`, { position: 'top-right' });
    }
  }
};
  const handleCategoryEdit = (category) => {
    console.log('Category to edit:', category) // Debug log
    setCategoryToEdit(category)
    setUpdatedCategory({
      categoryId: category.categoryId || '',
      categoryName: category.categoryName || '',
      categoryImage: category.categoryImage || null,
      // _id: category._id // Make sure to capture the ID
    })
    setEditCategoryMode(true)
  }

  const handleUpdateCategory = async () => {
    if (!updatedCategory.categoryName.trim()) {
      toast.error('Category name is required')
      return
    }

    try {
      const updateData = {
        categoryName: updatedCategory.categoryName,
        categoryImage: updatedCategory.categoryImage,
      }

      const response = await updateCategoryData(updateData, updatedCategory.categoryId)
      if (response) {
        toast.success('Category updated successfully!')
        setEditCategoryMode(false)
        fetchData()
      }
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error('Failed to update category')
    }
  }

  const handleCancel = () => {
    setUpdatedCategory({
      categoryId: '',
      categoryName: '',
      categoryImage: null,
      // description: '',
    })
    setEditCategoryMode(false)
  }

  const handleEditFileChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64String = reader.result.split(',')[1]
          setUpdatedCategory((prev) => ({
            ...prev,
            categoryImage: base64String,
          }))
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error('Error reading file:', error)
        toast.error('Error processing image')
      }
    }
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
      // description: '',
    })
    setErrors({})
    setModalVisible(false)
  }

  const handleCancelDelete = () => {
    setIsModalVisible(false)
  }

  return (
    <div style={{ overflow: 'hidden' }}>
      <ToastContainer />
      <div>
        <CForm className="d-flex justify-content-between mb-3">
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginLeft: '40px' }}>
            <CInputGroup className="mb-3" style={{ width: '300px' }}>
              <CFormInput
                type="text"
                placeholder="Search by CategoryName"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: '40px' }}
              />
              <CInputGroupText style={{ height: '40px' }}>
                <CIcon icon={cilSearch} />
              </CInputGroupText>
            </CInputGroup>
          </div>

          <CButton
            color="primary"
            style={{ height: '40px', marginRight: '100px' }}
            onClick={() => setModalVisible(true)}
          >
            Add Category
          </CButton>
        </CForm>
      </div>

      {viewCategory && (
        <CModal visible={!!viewCategory} onClose={() => setViewCategory(null)} size="md">
          <CModalHeader>
            <CModalTitle>Category Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CRow className="mb-4">
              <CCol sm={4}>
                <strong>Category ID :</strong>
              </CCol>
              <CCol sm={8}>{viewCategory.categoryId}</CCol>
            </CRow>
            <CRow className="mb-4">
              <CCol sm={4}>
                <strong>Category Name :</strong>
              </CCol>
              <CCol sm={8}>{viewCategory.categoryName}</CCol>
            </CRow>

            <CRow className="mb-4">
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

            {/* <CRow className="mb-4">
              <CCol sm={4}>
                <strong>Description :</strong>
              </CCol>
              <CCol sm={8}>{viewCategory.description || 'No description available'}</CCol>
            </CRow> */}
          </CModalBody>
          <CModalFooter></CModalFooter>
        </CModal>
      )}

      <CModal visible={modalVisible} onClose={handleCancelAdd} backdrop="static">
        <CModalHeader>
          <CModalTitle>Add New Category</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <h6>
              Category Name <span style={{ color: 'red' }}>*</span>
            </h6>
            <CFormInput
              type="text"
              placeholder="Category Name"
              value={newCategory.categoryName || ''}
              name="categoryName"
              onChange={handleCategoryChange}
            />
            {errors.categoryName && (
              <CFormText className="text-danger">{errors.categoryName}</CFormText>
            )}
            <h6>
              Category Image <span style={{ color: 'red' }}>*</span>
            </h6>
            <CFormInput type="file" onChange={handleFileChange} />
            {errors.categoryImage && (
              <CFormText className="text-danger">{errors.categoryImage}</CFormText>
            )}
           
          </CForm>
        </CModalBody>

        <CModalFooter>
          <CButton color="primary" onClick={handleAddCategory}>
            Add
          </CButton>
          <CButton color="secondary" onClick={handleCancelAdd}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal
        visible={editCategoryMode}
        onClose={() => setEditCategoryMode(false)}
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>Edit Category</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <h6>
              Category Name <span style={{ color: 'red' }}>*</span>
            </h6>
            <CFormInput
              type="text"
              placeholder="Category Name"
              value={updatedCategory?.categoryName || ''}
              onChange={(e) => {
                const capitalizedValue =
                  e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1)

                setUpdatedCategory({
                  ...updatedCategory,
                  categoryName: capitalizedValue,
                })
              }}
            />

            <h6>
              Category Image <span style={{ color: 'red' }}>*</span>
            </h6>
            <CFormInput type="file" accept="image/*" onChange={handleEditFileChange} />

            {updatedCategory?.categoryImage ? (
              <img
                src={`data:image/png;base64,${updatedCategory.categoryImage}`}
                alt="Category"
                style={{ width: '200px', height: 'auto', marginTop: '10px' }}
              />
            ) : (
              <span style={{ display: 'block', marginTop: '10px' }}>No image available</span>
            )}

           
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleUpdateCategory}>
            Update
          </CButton>
          <CButton color="secondary" onClick={handleCancel}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

      {loading ? (
        <div
          style={{ display: 'flex', justifyContent: 'center', height: '300px', fontSize: '22px' }}
        >
          <span>Loading...</span>
        </div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <div>
          {filteredData.length > 0 ? (
            <DataTable columns={columns} data={filteredData} pagination />
          ) : searchQuery ? (
            <div style={{ textAlign: 'center', fontSize: '20px', color: 'gray' }}>
              No data found
            </div>
          ) : (
            <DataTable columns={columns} data={category} pagination />
          )}
        </div>
      )}
    </div>
  )
}

export default CategoryManagement
