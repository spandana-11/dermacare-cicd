import React, { useState } from 'react'
import { jsPDF } from 'jspdf'

const dummyAppointment = {
  id: 1,
  name: 'John Doe',
  mobileNumber: '9876543210',
  subServiceName: 'MRI Scan',
  serviceDate: '2025-08-10',
  dob: '1990-05-20',
}

const dummyDoctor = {
  doctorName: 'Dr. Smith',
}

const ConsentFormComponent = () => {
  const [form, setForm] = useState(dummyAppointment)
  const [doctor, setDoctor] = useState(dummyDoctor)
  const [isEditing, setIsEditing] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleDelete = () => {
    alert('Deleted! (Simulated)')
    // Replace with actual delete API call later
  }

  const handleUpdate = () => {
    alert('Updated! (Simulated)')
    setIsEditing(false)
    // Replace with actual update API call later
  }

  const handleGenerateConsentForm = () => {
    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text('Patient Consent Form for Medical Procedures', 20, 20)

    doc.setFontSize(12)
    doc.text(`Patient Name: ${form.name || ''}`, 20, 40)
    doc.text(`Date of Birth: ${form.dob || ''}`, 20, 50)
    doc.text(`Contact Number: ${form.mobileNumber || ''}`, 20, 60)
    doc.text(`Medical Record No: `, 20, 70)

    doc.text('Consent for Medical Procedure', 20, 90)
    doc.text(`Name of Procedure: ${form.subServiceName || ''}`, 20, 100)
    doc.text(`Date of Procedure: ${form.serviceDate || ''}`, 20, 110)
    doc.text(`Physician: ${doctor?.doctorName || ''}`, 20, 120)

    doc.text('Information Provided to Me:', 20, 140)
    doc.text('- Nature and purpose of the procedure', 25, 150)
    doc.text('- Risks, complications, side effects', 25, 160)
    doc.text('- Alternative methods of treatment', 25, 170)
    doc.text('- All questions answered satisfactorily', 25, 180)
    doc.text('- No guarantees on results', 25, 190)

    doc.text('Anesthesia (if applicable):', 20, 210)
    doc.text('- Consent to anesthesia', 25, 220)
    doc.text('- Understand risks involved', 25, 230)

    doc.text('Photographs/Recordings (Optional):', 20, 250)
    doc.text('- Consent for use in records', 25, 260)

    doc.text('Withdrawal of Consent:', 20, 280)
    doc.text('I understand I can withdraw anytime.', 25, 290)

    doc.text('Consent Declaration:', 20, 310)
    doc.text('I have read and understood...', 25, 320)
    doc.text('Patient Signature: ________________', 20, 340)
    doc.text('Witness Signature: ________________', 20, 350)
    doc.text('Physician Signature: ________________', 20, 360)

    doc.save(`Consent_Form_${form.name || 'patient'}.pdf`)
  }

  return (
    <div className="container mt-4">
      <h3>Consent Form Editor</h3>

      <div className="mb-3">
        <label>Patient Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="form-control"
          disabled={!isEditing}
        />
      </div>

      <div className="mb-3">
        <label>Date of Birth</label>
        <input
          type="date"
          name="dob"
          value={form.dob}
          onChange={handleChange}
          className="form-control"
          disabled={!isEditing}
        />
      </div>

      <div className="mb-3">
        <label>Contact Number</label>
        <input
          name="mobileNumber"
          value={form.mobileNumber}
          onChange={handleChange}
          className="form-control"
          disabled={!isEditing}
        />
      </div>

      <div className="mb-3">
        <label>Procedure</label>
        <input
          name="subServiceName"
          value={form.subServiceName}
          onChange={handleChange}
          className="form-control"
          disabled={!isEditing}
        />
      </div>

      <div className="mb-3">
        <label>Procedure Date</label>
        <input
          type="date"
          name="serviceDate"
          value={form.serviceDate}
          onChange={handleChange}
          className="form-control"
          disabled={!isEditing}
        />
      </div>

      <div className="mb-3">
        <label>Doctor Name</label>
        <input
          name="doctorName"
          value={doctor.doctorName}
          onChange={(e) => setDoctor({ doctorName: e.target.value })}
          className="form-control"
          disabled={!isEditing}
        />
      </div>

      <div className="d-flex gap-2">
        {!isEditing ? (
          <button className="btn btn-primary" onClick={handleEdit}>
            Edit
          </button>
        ) : (
          <>
            <button className="btn btn-success" onClick={handleUpdate}>
              Update
            </button>
            <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </>
        )}
        <button className="btn btn-danger" onClick={handleDelete}>
          Delete
        </button>
        <button className="btn btn-warning" onClick={handleGenerateConsentForm}>
          Generate PDF
        </button>
      </div>
    </div>
  )
}

export default ConsentFormComponent
