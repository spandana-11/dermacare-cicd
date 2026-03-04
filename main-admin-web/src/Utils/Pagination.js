import React from 'react'
import { CFormSelect, CPagination, CPaginationItem } from '@coreui/react'

const Pagination = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  const startEntry = (currentPage - 1) * pageSize + 1
  const endEntry = Math.min(currentPage * pageSize, totalItems)

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage)
    }
  }

  return (
    <div className="d-flex justify-content-between align-items-center mt-3">

      {/* Rows per page */}
      <div className="d-flex align-items-center gap-2">
        <span>Rows per page:</span>
        <CFormSelect
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={{ width: '80px' }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
        </CFormSelect>
      </div>

      {/* Pagination info + buttons */}
      <div className="text-end">
        <span className="d-block mb-1">
          Showing {startEntry} to {endEntry} of {totalItems} entries
        </span>

        <CPagination align="end" className="themed-pagination">
          <CPaginationItem
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </CPaginationItem>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((page) => {
              if (totalPages <= 5) return true
              if (currentPage <= 3) return page <= 5
              if (currentPage >= totalPages - 2) return page >= totalPages - 4
              return page >= currentPage - 2 && page <= currentPage + 2
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
  )
}

export default Pagination
