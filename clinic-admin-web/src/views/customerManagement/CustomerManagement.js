import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CForm, CFormInput, CInputGroup, CInputGroupText, CButton } from '@coreui/react'
import DataTable from 'react-data-table-component'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import { CustomerData } from './CustomerAPI'

const CustomerManagement = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [customerData, setCustomerData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetching customer data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await CustomerData()
        console.log(data)
        setCustomerData(data)
        setFilteredData(data)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to fetch customer data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Handling search functionality
  useEffect(() => {
    const handleSearch = () => {
      const trimmedQuery = searchQuery.toLowerCase().trim()
      if (!trimmedQuery) {
        setFilteredData(customerData)
        return
      }

      const filtered = customerData.filter((customer) => {
        const fullNameMatch = customer.fullName?.toLowerCase().includes(trimmedQuery)
        const mobileMatch = customer.mobileNumber?.toString().includes(trimmedQuery)
        const emailMatch = customer.emailId?.toLowerCase().includes(trimmedQuery)
        return fullNameMatch || mobileMatch || emailMatch
      })

      setFilteredData(filtered)
    }

    handleSearch()
  }, [searchQuery, customerData])

  // Column definitions for the DataTable
  const columns = [
    { name: 'Full Name', selector: (row) => row.fullName, sortable: true },
    { name: 'Mobile Number', selector: (row) => row.mobileNumber, sortable: true },
    { name: 'Email', selector: (row) => row.emailId, sortable: true },
    {
      name: 'Status',
      cell: (row) => (
        <span style={{ color: getStatusColor(row.status) }}>
          {row.status
            ? row.status.charAt(0).toUpperCase() + row.status.slice(1).toLowerCase()
            : 'Unknown'}
        </span>
      ),
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <CButton color="primary" onClick={() => handleCustomerViewDetails(row.mobileNumber)}>
          View
        </CButton>
      ),
    },
  ]

  // Function to determine the color based on customer status0
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'green'
      case 'inactive':
        return 'orange'
      case 'suspended':
        return 'red'
      default:
        return 'black'
    }
  }

  const handleCustomerViewDetails = (mobileNumber) => {
    navigate(`/customer-management/${mobileNumber}`)
  }

  const centeredMessageStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px',
    fontSize: '1.5rem',
    color: '#808080',
  }

  // Custom styles for DataTable
  const customStyles = {
    headCells: {
      style: {
        backgroundColor: '#F4F6F8',
        color: '#333333',
        fontSize: '16px',
        fontWeight: 'bold',
        borderBottom: 'thin solid #DADCE0',
      },
    },
    rows: {
      style: {
        fontSize: '14px',
        color: '#333333',
        '&:nth-of-type(even)': {
          backgroundColor: '#FFFFFF',
        },
        '&:nth-of-type(odd)': {
          backgroundColor: '#FAFAFA',
        },
        '&:hover': {
          backgroundColor: '#E9E9E9',
        },
      },
    },
    cells: {
      style: {
        borderBottom: 'thin solid #DADCE0',
      },
    },
  }

  return (
    <>
      <CForm className="d-flex justify-content-end">
        <CInputGroup className="mb-3 w-50">
          <CFormInput
            type="text"
            id="search-input"
            placeholder="Search by full name, mobile, or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <CInputGroupText>
            <CIcon icon={cilSearch} />
          </CInputGroupText>
        </CInputGroup>
      </CForm>

      {loading ? (
        <div style={centeredMessageStyle}>Loading...</div>
      ) : error ? (
        <div style={centeredMessageStyle}>{error}</div>
      ) : filteredData && filteredData.length === 0 ? (
        <div style={centeredMessageStyle}>There are no records to display</div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          keyField="mobileNumber"
          pagination
          striped
          customStyles={customStyles}
        />
      )}
    </>
  )
}

export default React.memo(CustomerManagement)
