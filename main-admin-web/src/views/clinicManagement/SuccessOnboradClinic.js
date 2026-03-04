import React from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { useLocation, useNavigate } from "react-router-dom";
export default function ClinicOnboardingSuccess({ onClose }) {
    const { state } = useLocation();
    const navigate = useNavigate();

    const clinicName = state?.clinicName;  // ← get clinic name here

    return (
        <div style={{
            minHeight: "100vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(135deg, #e0f7fa, #f8e5ff)",
            padding: "20px",
            overflow: "hidden" // prevents page scroll
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                    background: "#fff",
                    width: "100%",
                    maxWidth: "1200px",
                    maxHeight: "90vh", // limits height to viewport
                    padding: "20px",
                    borderRadius: "25px",
                    textAlign: "center",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                    border: "1px solid #eee",
                    overflowY: "auto" // enables internal scrolling
                }}
            >
                {/* HEADER */}
                <h1 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "10px", color: "#333" }}>
                    🎉 Clinic Onboarding Successful!
                </h1>

                {/* CLINIC NAME */}
                <h2 style={{ fontSize: "28px", fontWeight: "600", marginBottom: "20px", color: "#444" }}>
                    Welcome, <span style={{ color: "#1e40af" }}>{clinicName}</span>
                </h2>

                {/* MESSAGE */}
                <p style={{ fontSize: "18px", color: "#555", maxWidth: "900px", margin: "0 auto 30px" }}>
                    Thank you for completing the onboarding process. Our verification team
                    will review your details, and your login credentials will be shared
                    soon. Meanwhile, feel free to explore our platform.
                </p>

                {/* BUTTONS */}
                <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap", marginTop: "30px" }}>
                    <button
                        onClick={() => window.open("https://chiselontechnologies.com/ccms", "_blank")}
                        style={{
                            background: "#1e40af",
                            color: "white",
                            padding: "14px 32px",
                            borderRadius: "12px",
                            fontSize: "18px",
                            border: "none",
                            cursor: "pointer",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                        }}
                    >
                        🌐 Explore Website
                    </button>
                </div>

                {/* COMPANY DETAILS SECTION */}
                <div style={{ marginTop: "20px", padding: "15px", background: "#f7f7f7", borderRadius: "20px", border: "1px solid #e0e0e0" }}>
                    {/* Two-column layout */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", alignContent: "center" }}>
                        {/* Left Column: Contact Details */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "150px 1fr", // first column fixed width, second column fills remaining space
                            rowGap: "12px",
                            marginTop: "20px",
                            fontSize: "20px",
                            textAlign: "left"
                        }}>
                            <strong>Company:</strong>
                            <span>DermaCare Clinics Network</span>

                            <strong>Email:</strong>
                            <span>support@dermacare.com</span>

                            <strong>Phone:</strong>
                            <span>+91 98765 43210</span>

                            <strong>Website:</strong>
                            <span>www.dermacareclinics.com</span>
                        </div>


                        {/* Right Column: QR Code */}
                        <div style={{ textAlign: "center" }}>
                            <QRCodeSVG
                                value="Company: DermaCare Clinics Network | Email: support@dermacare.com | Phone: +91 98765 43210 | Website: www.dermacareclinics.com"
                                size={150}
                                bgColor="#ffffff"
                                fgColor="#1e40af"
                                level="H"
                                includeMargin={true}
                            />
                            <p style={{ marginTop: "10px", fontSize: "14px", color: "#555" }}>
                                Scan to save contact details
                            </p>
                        </div>
                    </div>
                </div>


                {/* FOOTER */}
                <div style={{ marginTop: "30px", fontSize: "14px", color: "#777" }}>
                    © {new Date().getFullYear()} DermaCare Clinics Network. All rights reserved.
                </div>
            </motion.div>
        </div>
    );
}