import axios from "axios"
// import { axios } from "../../Utils/Interceptors"
import { wifiUrl } from "../../baseUrl"

/* ======================================================
   GET: ALL PURCHASES
====================================================== */
export const PurchaseData = async () => {
  try {
    const response = await axios.get(`${wifiUrl}/api/pharmacy/purchase/all`)
    return response.data
  } catch (error) {
    console.error("Error fetching purchase data:", error)
    throw error
  }
}

/* ======================================================
   GET: BY ID
====================================================== */
export const getPurchaseById = async (id) => {
  try {
    const response = await axios.get(
      `${wifiUrl}/api/pharmacy/purchase/getById/${id}`
    )
    return response.data
  } catch (error) {
    console.error("Error fetching purchase by ID:", error)
    throw error
  }
}

/* ======================================================
   GET: BY BILL NO
====================================================== */
export const getPurchaseByBillNo = async (billNo) => {
  try {
    const response = await axios.get(
      `${wifiUrl}/api/pharmacy/purchase/getByBillNo/${billNo}`
    )
    return response.data
  } catch (error) {
    console.error("Error fetching purchase by Bill No:", error)
    throw error
  }
}

/* ======================================================
   POST: SAVE PURCHASE
====================================================== */
export const postPurchaseData = async (data) => {
  try {
    const mappedMedicineDetails = (data.medicineDetails || []).map((item) => ({
      productName: item.productName || "",
      batchNo: item.batchNo || "",
      expiryDate: item.expiryDate || "",
      hsnCode: item.hsnCode || "",
      quantity: Number(item.quantity || 0),
      freeQuantity: Number(item.freeQuantity || 0),
      mrp: Number(item.mrp || 0),
      costPrice: Number(item.costPrice || 0),
      discountPercent: Number(item.discountPercent || 0),
      gstPercent: Number(item.gstPercent || 0),
    }))

    const requestData = {
      purchaseBillNo: data.purchaseBillNo || "",
      invoiceNo: data.invoiceNo || "",
      supplierName: data.supplierName || "",
      invoiceDate: data.invoiceDate || "",
      receivingDate: data.receivingDate || "",
      taxType: data.taxType || "",
      paymentMode: data.paymentMode || "",
      billDueDate: data.billDueDate || "",
      creditDays: data.creditDays || "",
      duePaidBillNo: data.duePaidBillNo || "",
      department: data.department || "",
      financialYear: data.financialYear || "",
      paidAmount: Number(data.paidAmount || 0),
      previousAdjustment: Number(data.previousAdjustment || 0),
      postDiscount: Number(data.postDiscount || 0),
      medicineDetails: mappedMedicineDetails,
    }

    const response = await axios.post(
      `${wifiUrl}/api/pharmacy/purchase/save`,
      requestData
    )

    return response.data
  } catch (error) {
    console.error("Error adding purchase:", error.response?.data || error)
    throw error
  }
}

/* ======================================================
   PUT: UPDATE PURCHASE
====================================================== */
export const updatePurchaseData = async (id, updatedPurchase) => {
  try {
    const response = await axios.put(
      `${wifiUrl}/api/pharmacy/purchase/update/${id}`,
      updatedPurchase
    )
    return response.data
  } catch (error) {
    console.error("Error updating purchase:", error.response?.data || error)
    throw error
  }
}

/* ======================================================
   DELETE: DELETE PURCHASE
====================================================== */
export const deletePurchaseData = async (id) => {
  try {
    const response = await axios.delete(
      `${wifiUrl}/api/pharmacy/purchase/delete/${id}`
    )
    return response.data
  } catch (error) {
    console.error("Error deleting purchase:", error.response?.data || error)
    throw error
  }
}
