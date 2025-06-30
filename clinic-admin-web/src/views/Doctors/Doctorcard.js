import React from 'react'
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilStar } from '@coreui/icons'

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate()

  if (!doctor) return null

  return (
    <div className="doctor-card">
      <div className="doctor-avatar">
        <img
          src={doctor.doctorPicture}
          alt={`Photo of Dr. ${doctor.doctorName || 'Doctor'}`}
          onError={(e) => {
            e.target.src = '/default-avatar.png'
          }}
        />
      </div>
      <div className="doctor-info">
        <h2>
          {doctor.doctorName} ,{doctor.qualification}
        </h2>

        <p className="speciality">{doctor.specialization}</p>
        <p>{doctor.experience} Years of experience</p>
        {/* <p>
          <CIcon icon={cilStar} size="sm" style={{ color: '#f5c518' }} /> {doctor.ratings.overall}
        </p> */}
      </div>
      <div className="doctor-action d-flex flex-column align-items-center gap-2 p-2 border rounded shadow-sm">
        <button
          className="btn btn-primary w-100"
          onClick={() => navigate(`/doctor/${doctor.doctorId}`, { state: { doctor } })}
          aria-label={`View details of Dr. ${doctor.doctorName}`}
        >
          View Details
        </button>
        <p className="mb-0 text-muted">
          <strong>ID:</strong> {doctor.doctorId}
        </p>
      </div>

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
        }

        .doctor-avatar img {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
           outline: 2px solid grey;
           padding:5px;
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

        .speciality, .description, .location {
          margin: 6px 0;
          color: #555;
        }

        .doctor-action {
          display: flex;
          align-items: center;
        }

        .doctor-action button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .doctor-action button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  )
}

export default DoctorCard
