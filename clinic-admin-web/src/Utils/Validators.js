// validators.js
export const validateField = (field, value, formData = {}, technicians = []) => {
  let error = '';

  switch (field) {
    // 🔹 Basic Info
    case 'fullName':
      if (!value || value.trim() === '') error = 'Full Name is required.';
      else if (value.length < 3 || value.length > 50) error = 'Full Name must be between 3 and 50 characters.';
      break;

    case 'gender':
      if (!value) error = 'Gender is required.';
      break;

    case 'dateOfBirth':
      if (!value) error = 'Date of Birth is required.';
      else {
        const dob = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
          age--;
        }
        if (age < 18) error = 'Staff must be at least 18 years old.';
      }
      break;

    case 'contactNumber':
      if (!value || !/^[6-9]\d{9}$/.test(value)) error = 'Contact number must be 10 digits and start with 6-9.';
      else if (technicians?.some(t => t.contactNumber === value && t.id !== formData.id)) error = 'Contact number already exists.';
      break;

    case 'emailId':
      if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Valid Email is required.';
      else if (technicians?.some(t => t.emailId === value && t.id !== formData.id)) error = 'Email already exists.';
      break;

 case 'governmentId': {
  const trimmed = (value || '').trim();

  if (!trimmed) {
    error = 'Government ID (Aadhaar) is required.';
    break;
  }

  // ✅ Basic Aadhaar rule: 12 digits, starts with 2–9
  const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;
  if (!aadhaarRegex.test(trimmed)) {
    error = 'Government ID (Aadhaar) must be 12 digits and cannot start with 0 or 1.';
    break;
  }

  // ✅ Block repeated digits (e.g. 111111111111 or 999999999999)
  if (/^(\d)\1{11}$/.test(trimmed)) {
    error = 'Government ID (Aadhaar) cannot have all digits the same.';
    break;
  }

  // ✅ valid
  error = '';
  break;
}


    case 'dateOfJoining':
      if (!value) error = 'Date of Joining is required.';
      break;

    case 'department':
      if (!value || value.trim() === '') error = 'Department is required.';
      else if (value.length < 2 || value.length > 50) error = 'Department must be between 2 and 50 characters.';
      break;

    case 'role':
      if (!value || value.trim() === '') error = 'Role is required.';
      else if (value.length < 2 || value.length > 50) error = 'Role must be between 2 and 50 characters.';
      break;

    case 'clinicId':
      if (!value || value.trim() === '') error = 'Clinic ID is required.';
      break;

    case 'shiftTimingOrAvailability':
      if (!value || value.trim() === '') error = 'Shift Timing / Availability is required.';
      else if (value.length < 2 || value.length > 50) error = 'Shift Timing / Availability must be between 2 and 50 characters.';
      break;

    case 'emergencyContact':
      if (value && !/^\d{10}$/.test(value)) error = 'Emergency contact must be 10 digits.';
      break;

    // 🔹 Address
    case 'houseNo':
      if (!formData.address?.houseNo || formData.address.houseNo.trim() === '') error = 'Address: House No is required.';
      else if (formData.address.houseNo.length > 20) error = 'Address: House No cannot exceed 20 characters.';
      break;

    case 'street':
      if (!formData.address?.street || formData.address.street.trim() === '') error = 'Address: Street is required.';
      else if (formData.address.street.length < 2 || formData.address.street.length > 50) error = 'Address: Street must be between 2 and 50 characters.';
      break;

    case 'city':
      if (!formData.address?.city || formData.address.city.trim() === '') error = 'Address: City is required.';
      else if (formData.address.city.length < 2 || formData.address.city.length > 50) error = 'Address: City must be between 2 and 50 characters.';
      break;

   

    case 'country':
      if (!formData.address?.country || formData.address.country.trim() === '') error = 'Address: Country is required.';
      else if (formData.address.country.length < 2 || formData.address.country.length > 50) error = 'Address: Country must be between 2 and 50 characters.';
      break;

    // 🔹 Add more fields like bank, documents, previous employment, etc. here if needed
     case 'accountNumber':
      if (!value || value.trim() === '') error = 'Account Number is required.';
      else if (!/^\d{9,20}$/.test(value)) error = 'Account Number must be between 9 and 20 digits.';
      break;

    case 'accountHolderName':
      if (!value || value.trim() === '') error = 'Account Holder Name is required.';
      else if (value.length < 3 || value.length > 50) error = 'Account Holder Name must be between 3 and 50 characters.';
      break;

    case 'ifscCode':
      if (!value || value.trim() === '') error = 'IFSC Code is required.';
      else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) error = 'Invalid IFSC format (e.g., HDFC0001234).';
      break;


    case 'panCardNumber':
      if (!value || value.trim() === '') error = 'PAN Card Number is required.';
      else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value)) error = 'Invalid PAN format (e.g., ABCDE1234F).';
      break;
      
        case 'profilePicture':
      if (!value || value.trim() === '') error = 'Profile Image is required.';
      break;

    case 'medicalFitnessCertificate':
      if (!value || value.trim() === '') error = 'Medical Fitness Certificate is required.';
      break;
      case 'qualificationOrCertifications':
      // optional field → validate only if uploaded
      if (
        formData.qualificationOrCertifications &&
        formData.qualificationOrCertifications.trim() === ''
      ) {
        error = 'Invalid Training Guard License file.'
      }
      break

    case 'previousEmploymentHistory':
      if (!value || value.trim() === '') error = 'Previous Employment History is required.';
      else if (value.length < 10) error = 'Previous Employment History must be at least 10 characters.';
      break;


      case 'previousEmployeeHistory':
      if (!value || value.trim() === '') {
        error = 'Previous Employment History is required.'
      } else if (value.length < 5 || value.length > 500) {
        error = 'Previous Employment History must be between 5 and 500 characters.'
      }
      break

      case 'policeVerification':
  if (!value || value.trim() === '') error = 'Police Verification is required.';
  else if (value.length < 2 || value.length > 50) error = 'Police Verification must be between 2 and 50 characters.';
  break;
  }

  return error; // returns '' if valid, else error string
};

// Full form validation
export const validateFormData = (formData, technicians) => {
  const fields = [
    'fullName', 'gender', 'dateOfBirth', 'contactNumber', 'emailId', 'governmentId',
    'dateOfJoining', 'department', 'role', 'clinicId', 'shiftTimingOrAvailability',
    'emergencyContact', 'houseNo', 'street', 'city', 'state', 'postalCode', 'country'
    // add more fields as needed
  ];

  const errors = [];

  fields.forEach(field => {
    const error = validateField(field, formData[field], formData, technicians);
    if (error) errors.push(error);
  });

  return errors;
  
};

