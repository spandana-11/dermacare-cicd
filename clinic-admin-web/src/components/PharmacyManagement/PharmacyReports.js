import React, { useState, useMemo } from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CFormSelect,
  CButton,
  CRow,
  CCol,
} from "@coreui/react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const PharmacyReport = () => {
  const [activeKey, setActiveKey] = useState(2);
  const [salesFilter, setSalesFilter] = useState("daily");
  const [purchaseFilter, setPurchaseFilter] = useState("daily");

  // ================== DUMMY DATA ==================

  const expiryData = [
    { name: "Clindamycin Gel", batch: "CLIN01", expiry: "2025-02-01", qty: 20 },
    { name: "Vitamin C Serum", batch: "VC02", expiry: "2026-03-01", qty: 15 },
  ];

  const salesData = [
    { billNo: "S-101", date: "2026-02-20", customername: "Nadhiya",fileno:"1",mobno:"9134378967", total: 500, paymentMode: "Cash" },
    { billNo: "S-102", date: "2026-02-19", customername: "Prashanth", fileno:"2",mobno:"9134378966" ,total: 1200, paymentMode: "UPI" },
    { billNo: "S-103", date: "2026-02-10", customername: "Anil",fileno:"3",mobno:"9134378968" , total: 800, paymentMode: "Card" },
  ];

  const purchaseData = [
    { billNo: "P-201", supplier: "DermaCare", date: "2026-02-18", total: 10000, paymentMode: "Credit" },
    { billNo: "P-202", supplier: "Medico", date: "2026-02-05", total: 15000, paymentMode: "Cash" },
  ];

  // ================== DATE FILTER FUNCTION ==================

  const filterByDate = (data, type) => {
    const today = new Date();
    return data.filter((item) => {
      const itemDate = new Date(item.date);

      if (type === "daily") {
        return itemDate.toDateString() === today.toDateString();
      }

      if (type === "weekly") {
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        return itemDate >= weekAgo;
      }

      if (type === "monthly") {
        return (
          itemDate.getMonth() === today.getMonth() &&
          itemDate.getFullYear() === today.getFullYear()
        );
      }

      return true;
    });
  };

  const filteredSales = useMemo(
    () => filterByDate(salesData, salesFilter),
    [salesFilter]
  );

  const filteredPurchase = useMemo(
    () => filterByDate(purchaseData, purchaseFilter),
    [purchaseFilter]
  );

  const totalSales = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalPurchase = filteredPurchase.reduce((sum, p) => sum + p.total, 0);

  // ================== EXPORT FUNCTION ==================

  const exportToExcel = (data, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${fileName}.xlsx`);
  };

  const calculateDaysLeft = (expiryDate) => {
    const today = new Date();
    const exp = new Date(expiryDate);
    const diff = exp - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-4">
      <CCard className="shadow-sm">
        <CCardHeader>
          <h4>Pharmacy Reports Dashboard</h4>
        </CCardHeader>

        <CCardBody>

          {/* Tabs */}
          <CNav variant="tabs">
            <CNavItem>
              <CNavLink active={activeKey === 2} onClick={() => setActiveKey(2)}>
                Expiry Report
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink active={activeKey === 3} onClick={() => setActiveKey(3)}>
                Sales Report
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink active={activeKey === 4} onClick={() => setActiveKey(4)}>
                Purchase Report
              </CNavLink>
            </CNavItem>
          </CNav>

          <CTabContent className="mt-4">

            {/* ================= EXPIRY REPORT ================= */}
            <CTabPane visible={activeKey === 2}>
              <CButton
                className="mb-3"
                color="success"
                onClick={() => exportToExcel(expiryData, "Expiry_Report")}
              >
                Export Excel
              </CButton>

              <CTable bordered hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Medicine</CTableHeaderCell>
                    <CTableHeaderCell>Batch</CTableHeaderCell>
                    <CTableHeaderCell>Expiry</CTableHeaderCell>
                    <CTableHeaderCell>Days Left</CTableHeaderCell>
                    <CTableHeaderCell>Qty</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {expiryData.map((item, i) => {
                    const daysLeft = calculateDaysLeft(item.expiry);
                    return (
                      <CTableRow key={i}>
                        <CTableDataCell>{item.name}</CTableDataCell>
                        <CTableDataCell>{item.batch}</CTableDataCell>
                        <CTableDataCell>{item.expiry}</CTableDataCell>
                        <CTableDataCell>
                          {daysLeft < 0 ? (
                            <CBadge color="danger">Expired</CBadge>
                          ) : (
                            `${daysLeft} days`
                          )}
                        </CTableDataCell>
                        <CTableDataCell>{item.qty}</CTableDataCell>
                      </CTableRow>
                    );
                  })}
                </CTableBody>
              </CTable>
            </CTabPane>

            {/* ================= SALES REPORT ================= */}
            <CTabPane visible={activeKey === 3}>
              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormSelect
                    value={salesFilter}
                    onChange={(e) => setSalesFilter(e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </CFormSelect>
                </CCol>

                <CCol md={4}>
                  <CButton
                    color="success"
                    onClick={() => exportToExcel(filteredSales, "Sales_Report")}
                  >
                    Export Excel
                  </CButton>
                </CCol>
              </CRow>

              <CTable bordered hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Bill No</CTableHeaderCell>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Customer Name</CTableHeaderCell>
                    <CTableHeaderCell>File No</CTableHeaderCell>
                    <CTableHeaderCell>Mobile No</CTableHeaderCell>
                    <CTableHeaderCell>Total</CTableHeaderCell>
                    <CTableHeaderCell>Payment</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredSales.map((item, i) => (
                    <CTableRow key={i}>
                      <CTableDataCell>{item.billNo}</CTableDataCell>
                      <CTableDataCell>{item.date}</CTableDataCell>
                      <CTableDataCell>{item.customername}</CTableDataCell>
                      <CTableDataCell>{item.fileno}</CTableDataCell>
                      <CTableDataCell>{item.mobno}</CTableDataCell>
                      <CTableDataCell>₹{item.total}</CTableDataCell>
                      <CTableDataCell>{item.paymentMode}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              <h5 className="mt-3 text-end">
                Total Sales: ₹ {totalSales}
              </h5>
            </CTabPane>

            {/* ================= PURCHASE REPORT ================= */}
            <CTabPane visible={activeKey === 4}>
              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormSelect
                    value={purchaseFilter}
                    onChange={(e) => setPurchaseFilter(e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </CFormSelect>
                </CCol>

                <CCol md={4}>
                  <CButton
                    color="success"
                    onClick={() => exportToExcel(filteredPurchase, "Purchase_Report")}
                  >
                    Export Excel
                  </CButton>
                </CCol>
              </CRow>

              <CTable bordered hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Bill No</CTableHeaderCell>
                    <CTableHeaderCell>Supplier</CTableHeaderCell>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Total</CTableHeaderCell>
                    <CTableHeaderCell>Payment</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredPurchase.map((item, i) => (
                    <CTableRow key={i}>
                      <CTableDataCell>{item.billNo}</CTableDataCell>
                      <CTableDataCell>{item.supplier}</CTableDataCell>
                      <CTableDataCell>{item.date}</CTableDataCell>
                      <CTableDataCell>₹{item.total}</CTableDataCell>
                      <CTableDataCell>{item.paymentMode}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              <h5 className="mt-3 text-end">
                Total Purchase: ₹ {totalPurchase}
              </h5>
            </CTabPane>

          </CTabContent>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default PharmacyReport;