import React, { useEffect, useState } from 'react'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import ClinicManagement from './ClinicManagement'
import { CategoryData } from '../categoryManagement/CategoryAPI'
import { BASE_URL, ClinicAllData, AddClinic, UpdateClinic, DeleteClinic } from '../../baseUrl'

const ClinicAPI = () => {
  const [categories, setCategories] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await CategoryData()
        if (response && response.data) {
          setCategories(response.data)
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setError('Failed to load categories')
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  console.log('Fetched categories data:', categories)

  const handleServiceClick = (service) => {
    console.log('Selected service:', service)
    setSelectedService(service)
  }

  if (selectedService) {
    return <ClinicManagement service={selectedService} onBack={() => setSelectedService(null)} />
  }

  if (loading) return <p className="text-center mt-5">Loading categories...</p>
  if (error) return <p className="text-center text-danger mt-5">{error}</p>

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Clinic Services</h2>

      <div className="row justify-content-center">
        {categories.map((service, index) => (
          <div className="col-md-3 mb-4" key={index}>
            <div
              className="card text-center shadow-sm"
              style={{ cursor: 'pointer' }}
              onClick={() => handleServiceClick(service)}
            >
              <div className="card-body">
                <img
                  src={`data:image/jpeg;base64,${service.categoryImage}`}
                  alt={service.categoryName}
                  className="img-fluid mb-2"
                  style={{ height: '150px', objectFit: 'cover' }}
                />
                {/* or service.serviceName if that's correct */}
                <h5 className="card-title">{service.categoryName}</h5>{' '}
                {/* or service.serviceName if that's correct */}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-muted mt-3">Click on a service to view related hospitals.</p>
    </div>
  )
}

export default ClinicAPI
