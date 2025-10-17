import axios from 'axios'
import { toast } from 'react-toastify'
import { BASE_URL } from '../baseUrl'
import { showCustomToast } from '../Utils/Toaster'

export const fetchDoctorSlots = async (doctorId, branchId, date, interval, start, end) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/generateDoctorSlots/${doctorId}/${branchId}/${date}/${interval}/${start}/${end}`,
    )
    return res.data.data // returns [{slot, slotbooked, available, reason}, ...]
  } catch (err) {
    console.error('Error fetching slots:', err)
    showCustomToast('Failed to generate slots', 'error')
    return []
  }
}
