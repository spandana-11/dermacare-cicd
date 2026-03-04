import React from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import { Eye, Edit2, Trash2 } from 'lucide-react'
import capitalizeWords from '../../Utils/capitalizeWords'

const PackageTableData = ({ data, onView, onEdit, onDelete }) => {
  return (
    <CTable striped hover responsive>
      <CTableHead className="pink-table w-auto">
        <CTableRow className="text-center">
          <CTableHeaderCell style={{ paddingLeft: '40px' }}>S.No</CTableHeaderCell>
          <CTableHeaderCell >Package Name</CTableHeaderCell>
          <CTableHeaderCell >Discount %</CTableHeaderCell>
          <CTableHeaderCell >Offer Start Date</CTableHeaderCell>
          <CTableHeaderCell >Offer End Date</CTableHeaderCell>
          <CTableHeaderCell >Price</CTableHeaderCell>
          <CTableHeaderCell >Actions</CTableHeaderCell>
        </CTableRow>
      </CTableHead>

      <CTableBody className="pink-table">
        {data && data.length > 0 ? (
          data.map((item, index) => (
            <CTableRow key={item.packageId || index} className="text-center align-middle">
              <CTableDataCell style={{ paddingLeft: '40px' }}>{index + 1}</CTableDataCell>

              <CTableDataCell>
                {capitalizeWords(item.packageName || 'N/A')}
              </CTableDataCell>

              <CTableDataCell>
                {item.discountPercentage ?? 'NA'}
              </CTableDataCell>

              <CTableDataCell>
                {item.offerStart
                  ? new Date(item.offerStart).toLocaleDateString('en-GB')
                  : 'NA'}
              </CTableDataCell>

              <CTableDataCell>
                {item.offerValidDate
                  ? new Date(item.offerValidDate).toLocaleDateString('en-GB')
                  : 'NA'}
              </CTableDataCell>

              <CTableDataCell>
                ₹{item.price || 'NA'}
              </CTableDataCell>

              <CTableDataCell>
                <div className="d-flex justify-content-center gap-2">
                  <button className="actionBtn" onClick={() => onView(item)} title="View">
                    <Eye size={18} />
                  </button>
                  <button className="actionBtn" onClick={() => onEdit(item)} title="Edit">
                    <Edit2 size={18} />
                  </button>
                  <button className="actionBtn" onClick={() => onDelete(item)} title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </CTableDataCell>
            </CTableRow>
          ))
        ) : (
          <CTableRow>
            <CTableDataCell colSpan={7} className="text-center text-muted">
              🔍 No packages found
            </CTableDataCell>
          </CTableRow>
        )}
      </CTableBody>
    </CTable>
  )
}

export default PackageTableData
