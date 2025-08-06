// components/PrescriptionPDF.jsx
import React, { useEffect, useState } from 'react';
import {
    Document,
    Page,
    Text,
    View,
    Image,
    StyleSheet,
    Font
} from '@react-pdf/renderer';
import { useDoctorContext } from '../Context/DoctorContext';
import { getClinicDetails, getDoctorDetails } from '../Auth/Auth';
import { CCard, CCardBody, CCardHeader } from '@coreui/react';

// 👇 Sample assets (base64 or require/import)
// import logo from '../assets/ic_launcher.png';
// import signature from '../assets/signature.png';

// ✅ Styles
const styles = StyleSheet.create({
    page: {
        padding: 24,
        fontSize: 11,
        fontFamily: 'Helvetica'
    },
    header: {
        flexDirection: 'row',
        marginBottom: 10
    },
    logo: {
        width: 60,
        height: 60
    },
    hospitalInfo: {
        marginLeft: 12
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    bold: {
        fontWeight: 'bold'
    },
    section: {
        marginBottom: 12
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#e0e0e0',
        padding: 4
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1 solid #ccc',
        padding: 4
    },
    col: {
        flex: 1,
        paddingRight: 4
    },
    signatureBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 40
    },
    signatureImg: {
        width: 100,
        height: 50
    }
});

const PrescriptionPDF = ({ doctorData, clicniData, formData, patientData }) => {





    const date = new Date().toLocaleDateString();

    const tableHeaders = ['S.No', 'Medicine', 'Dose', 'Remind', 'Duration', 'Food', 'Note', 'Timings'];

    const tests = Array.isArray(formData?.tests?.selectedTests) ? formData.tests.selectedTests : []
    const testsReason = formData?.tests?.testReason ? formData.tests.testReason : ''
    const treatments = Array.isArray(formData?.treatments?.selectedTestTreatments)
        ? formData.treatments.selectedTestTreatments
        : []

    const treatmentReason = formData?.treatments?.treatmentReason
        ? formData.treatments.treatmentReason
        : ''
    const imgSrc = doctorData?.doctorPicture
        ? doctorData.doctorPicture.startsWith('data:image')
            ? doctorData.doctorPicture
            : `data:image/png;base64,${doctorData.doctorPicture}`
        : null;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    {imgSrc && <Image src={imgSrc} style={styles.logo} />}
                    <View style={styles.hospitalInfo}>
                        <Text style={styles.title}>{clicniData?.name ?? 'Clinic Name'}</Text>
                        <Text>{clicniData?.address ?? 'Clinic Address'}</Text>
                        <Text>Phone: {clicniData?.contactNumber ?? 'NA'}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text>Name: {patientData.name}</Text>
                    <Text>Age/Sex: {patientData.age} / {patientData.gender}</Text>
                    <Text>Mobile No: {patientData.mobileNumber}</Text>
                </View>

                <CCard style={styles.section}>
                    <CCardHeader style={styles.bold}>Symptoms</CCardHeader>
                    <CCardBody style={styles.section}>

                        <Text>Details: {patientData.problem ?? 'NA'}</Text>
                        <Text>Doctor Obs: {formData?.symptoms?.doctorObs ?? 'NA'}</Text>
                        <Text>Diagnosis: {formData?.symptoms?.diagnosis ?? 'NA'}</Text>
                        <Text>Duration: {patientData.symptomsDuration ?? 'NA'}</Text>
                    </CCardBody>

                </CCard>
                {tests.length > 0 && (
                    <CCard className="shadow-sm mb-3">
                        <CCardHeader className="py-2">
                            <strong>
                                Tests Recommended <span className="text-body-secondary">(with reasons)</span>
                            </strong>
                        </CCardHeader>
                        <CCardBody>
                            <ul className="mb-0">
                                {tests.map((t, i) => (
                                    <li key={`${t || 'test'}-${i}`}>
                                        <span className="fw-semibold">{t || '—'}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-2 mb-2">
                                <strong>Reasons</strong>
                                <p>{testsReason}</p>
                            </div>
                        </CCardBody>
                    </CCard>
                )}

                {/* Treatments */}
                {treatments.length > 0 && (
                    <CCard className="shadow-sm mb-3">
                        <CCardHeader className="py-2">
                            <strong>
                                Treatments <span className="text-body-secondary">(with reasons)</span>
                            </strong>
                        </CCardHeader>
                        <CCardBody>
                            <ul className="mb-0">
                                {treatments.map((t, i) => (
                                    <li key={`${t.name || 'tx'}-${i}`}>
                                        <span className="fw-semibold">{t || '—'}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-2 mb-2">
                                <strong>Reasons</strong>
                                <p>{treatmentReason}</p>
                            </div>
                        </CCardBody>
                    </CCard>
                )}

                <View style={styles.section}>
                    <Text style={{ ...styles.bold, fontSize: 16 }}>Prescription</Text>
                </View>

                {/* Table Header */}
                <View style={styles.tableHeader}>
                    {tableHeaders.map((header, idx) => (
                        <Text style={styles.col} key={idx}>{header}</Text>
                    ))}
                </View>

                {/* Table Rows */}
                {
                    formData.prescription.medicines > 0 && (
                        formData.prescription.medicines.map((med, index) => (
                            <View style={styles.tableRow} key={index}>
                                <Text style={styles.col}>{index + 1}</Text>
                                <Text style={styles.col}>{med.name}</Text>
                                <Text style={styles.col}>{med.dose}</Text>
                                <Text style={styles.col}>{med.remindWhen}</Text>
                                <Text style={styles.col}>{med.duration}</Text>
                                <Text style={styles.col}>{med.food}</Text>
                                <Text style={styles.col}>{med.note}</Text>
                                <Text style={styles.col}>{(med.times || []).join(', ')}</Text>
                            </View>
                        ))
                    )
                }


                {/* Signature and Footer */}
                <View style={styles.signatureBlock}>
                    <View>
                        <Text>{doctorData.doctorName}</Text>
                        <Text>{doctorData.qualification}{doctorData.specialization}</Text>
                        <Text>Licence: {doctorData.doctorLicence}</Text>
                        <Text>Date: {date}</Text>
                    </View>
                    <View>
                        {/* <Image src={signature} style={styles.signatureImg} /> */}
                        <Text>Doctor's Signature</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default PrescriptionPDF;
