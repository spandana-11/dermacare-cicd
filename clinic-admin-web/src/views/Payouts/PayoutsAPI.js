// import axios from 'axios'
// import { Customer_Url, Booking_sevice, getAllPayouts, addPayouts } from '../../baseUrl'

// export const Get_AllPayoutsData = async () => {
//   try {
//     const response = await axios.get(`${Customer_Url}/${getAllPayouts}`, {
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//     })
//     console.log(response)

//     return response
//   } catch (error) {
//     throw error
//   }
// }

// export const postServiceData = async (serviceData) => {
//   try {
//     const response = await axios.post(`${Customer_Url}/${addPayouts}`, serviceData, {
//       headers: { 'Content-Type': 'application/json' },
//     })
//     return response
//   } catch (error) {
//     console.error('Error creating payout:', error)
//     throw error
//   }
// }
