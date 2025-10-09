// toastUtil.js
import { toast } from 'react-toastify'
export const showToast = (msg, type = 'info') => {
  const options = { toastId: msg, position: 'top-right', autoClose: 4000 }
  if (type === 'success') toast.success(msg, options)
  else if (type === 'error') toast.error(msg, options)
  else if (type === 'warning') toast.warning(msg, options)
  else toast.info(msg, options)
}
