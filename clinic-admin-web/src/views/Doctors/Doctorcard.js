import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilStar } from '@coreui/icons'
import { CFormSwitch } from '@coreui/react' // <-- import this for the toggle switch
import { toast } from 'react-toastify'
import { updateDoctorAvailability } from './DoctorAPI' // Adjust path accordingly

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate()
  const [availability, setAvailability] = useState(doctor.doctorAvailabilityStatus || false)

  if (!doctor) return null

  const handleToggle = async (e) => {
    const value = e.target.checked
    setAvailability(value) // Optimistic update

    const success = await updateDoctorAvailability(doctor.doctorId, value)
    if (success) {
      toast.success(`Availability set to ${value ? 'Available' : 'Not Available'}`)
    } else {
      toast.error('Failed to update availability')
      setAvailability(!value) // revert change if failed
    }
  }

  return (
    <div className="doctor-card">
      {/* Left: Avatar */}
      <div className="doctor-avatar">
        <img
          src={doctor.doctorPicture}
          alt={`Photo of Dr. ${doctor.doctorName || 'Doctor'}`}
          onError={(e) => {
            if (e.target.src !== window.location.origin + '/default-avatar.png') {
              e.target.src = '/default-avatar.png'
            }
          }}
        />
      </div>

      {/* Middle: Doctor Info */}
      <div className="doctor-info">
        <h2>
          {doctor.doctorName}, {doctor.qualification}
        </h2>
        <p className="speciality">{doctor.specialization}</p>
        <p>{doctor.experience} Years of experience</p>

        {/* ✅ Availability toggle placed right under experience */}
        <div className="availability-toggle d-flex align-items-center gap-2 mt-2">
          <label
            htmlFor={`availability-${doctor.doctorId}`}
            className="fw-bold mb-0 text-info"
            style={{ whiteSpace: 'nowrap' }}
          >
            Doctor Availability
          </label>
          <CFormSwitch
            id={`availability-${doctor.doctorId}`}
            checked={availability}
            onChange={handleToggle}
            color="info"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="doctor-action d-flex flex-column align-items-center gap-2 p-2 border rounded shadow-sm">
        <button
          className="btn btn-info w-100"
          onClick={() => navigate(`/doctor/${doctor.doctorId}`, { state: { doctor } })}
          aria-label={`View details of Dr. ${doctor.doctorName}`}
        >
          View Details
        </button>
        <p className="mb-0 text-muted">
          <strong>ID:</strong> {doctor.doctorId}
        </p>
      </div>

      {/* Styles */}
      <style>{`
        .doctor-card {
          display: flex;
          align-items: flex-start;
          padding: 20px;
          border: 1px solid #eee;
          border-radius: 12px;
          margin-bottom: 20px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          background-color: #fff;
          gap: 20px;
        }

        .doctor-avatar img {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          outline: 2px solid grey;
          padding: 5px;
        }

        .doctor-info {
          flex-grow: 1;
          padding: 0 20px;
        }

        .doctor-info h2 {
          color: #007bff;
          font-size: 18px;
          margin: 0 0 4px;
        }

        .speciality {
          margin: 6px 0;
          color: #555;
        }

        .doctor-action {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 12px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          min-width: 180px;
          max-width: 220px;
          background-color: #f9f9f9;
        }

        .doctor-action button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          width: 100%;
        }

        .doctor-action button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  )
}


export default DoctorCard
