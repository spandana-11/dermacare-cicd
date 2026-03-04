import React, { useEffect, useState } from "react";
import {
  CButton,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CFormInput,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CNav,
  CNavItem,
  CNavLink,
  CPagination,
  CPaginationItem
} from "@coreui/react";
import { useNavigate, useParams } from "react-router-dom";
import { getAppointmentsByBookingId, updateAppointmentStatus } from "./AppointmentsApis";
import { showCustomToast } from "../../Utils/Toaster";
import LoadingIndicator from "../../Utils/loader";
import "./AppointmentsTable.css";

const centeredMessageStyle = {
  textAlign: "center",
  padding: "40px 0",
  fontWeight: 600,
  color: "var(--cui-body-color)"
};

const AppointmentsTable = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    if (bookingId) fetchAppointments();
  }, [bookingId]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { success, message, data } = await getAppointmentsByBookingId(bookingId);
      if (!success) showCustomToast(message);
      setAppointments(success ? data : []);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (item, status) => {
    if (item.status === status) return;
    setSelectedItem(item);
    setSelectedStatus(status);
    setShowConfirmModal(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      setUpdatingId(selectedItem.id);
      const { success, message } = await updateAppointmentStatus(
        selectedItem.bookingId,
        selectedStatus
      );
      showCustomToast(message);
      if (success) fetchAppointments();
    } finally {
      setUpdatingId(null);
      setShowConfirmModal(false);
    }
  };

  const filteredData = appointments.filter((item) => {
    const q = search.toLowerCase();
    return (
      (filter === "ALL" || item.status === filter) &&
      (
        item.fullName?.toLowerCase().includes(q) ||
        item.serviceName?.toLowerCase().includes(q) ||
        item.serviceType?.toLowerCase().includes(q) ||
        item.status?.toLowerCase().includes(q)
      )
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, rowsPerPage]);

  return (
    <div>
      {/* Tabs & Search */}
      <CNav variant="tabs" className="themed-tabs mt-3">
        {["ALL", "CONFIRMED", "COMPLETED"].map((status) => (
          <CNavItem key={status}>
            <CNavLink
              active={filter === status}
              onClick={() => setFilter(status)}
              className="theme-tab"
            >
              {status}
            </CNavLink>
          </CNavItem>
        ))}
        <div className="ms-auto p-2">
          <CFormInput
            placeholder="Search..."
            className="theme-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </CNav>

      {/* Table */}
      {loading ? (
        <LoadingIndicator message="Loading appointments..." />
      ) : error ? (
        <div style={centeredMessageStyle}>{error}</div>
      ) : filteredData.length === 0 ? (
        <div style={centeredMessageStyle}>No data found</div>
      ) : (
        <>
          <CTable striped hover responsive>
            <CTableHead className="pink-table">
              <CTableRow className="text-center">
                <CTableHeaderCell>S.No</CTableHeaderCell>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Age</CTableHeaderCell>
                <CTableHeaderCell>Type</CTableHeaderCell>
                <CTableHeaderCell>Service</CTableHeaderCell>
                <CTableHeaderCell>Date</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody className='pink-table'>
              {currentRows.map((item, index) => (
                <CTableRow key={item.id} className="text-center align-middle">
                  <CTableDataCell>{indexOfFirstRow + index + 1}</CTableDataCell>
                  <CTableDataCell>{item.fullName}</CTableDataCell>
                  <CTableDataCell>{item.ageLabel}</CTableDataCell>
                  <CTableDataCell>{item.serviceType}</CTableDataCell>
                  <CTableDataCell>{item.serviceName}</CTableDataCell>
                  <CTableDataCell>{item.appointmentDate}</CTableDataCell>

                  <CTableDataCell>
                    {item.status === "COMPLETED" ? (
                      <span className="status-pill completed">COMPLETED</span>
                    ) : (
                      <select
                        value={item.status}
                        disabled={updatingId === item.id}
                        onChange={(e) => handleStatusChange(item, e.target.value)}
                        className={`status-select ${item.status.toLowerCase()}`}
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                    )}
                  </CTableDataCell>

                  <CTableDataCell className="text-center">
                    <button
                      className="actionBtn"
                      title="View"
                      onClick={() =>
                        navigate(`/appointment-details/${item.id}`, { state: item })
                      }
                    >
                      View
                    </button>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          {/* Pagination */}
          <div className="d-flex justify-content-between px-3 py-3">
            <div>
              Rows per page:
              <select
                className="form-select form-select-sm d-inline ms-2"
                style={{ width: "80px" }}
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(+e.target.value)}
              >
                {[5, 10, 25, 50].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>

            <CPagination className="themed-pagination">
              <CPaginationItem
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </CPaginationItem>

              {Array.from({ length: totalPages }, (_, i) => (
                <CPaginationItem
                  key={i}
                  active={i + 1 === currentPage}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </CPaginationItem>
              ))}

              <CPaginationItem
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </CPaginationItem>
            </CPagination>
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      <CModal visible={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
        <CModalHeader>
          <CModalTitle>Confirm Status</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Change status to <strong>{selectedStatus}</strong>?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleConfirmUpdate}>
            Confirm
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default AppointmentsTable;
