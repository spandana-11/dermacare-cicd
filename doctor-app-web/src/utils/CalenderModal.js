import React, { useEffect } from "react";
import { CModal, CModalHeader, CModalTitle, CModalBody } from "@coreui/react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { COLORS } from "../Themes"; // optional

// Generate time slots (returns display strings like "05:30 PM")
const generateTimeSlots = (start = "08:00", end = "21:00", interval = 30) => {
  const slots = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let cur = new Date(1970, 0, 1, sh, sm, 0);
  const endDate = new Date(1970, 0, 1, eh, em, 0);

  while (cur <= endDate) {
    const h = cur.getHours();
    const m = cur.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    const hh = h % 12 === 0 ? 12 : h % 12;
    slots.push(`${hh.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`);
    cur = new Date(cur.getTime() + interval * 60 * 1000);
  }
  return slots;
};

// Generate rolling Date objects for header (n days)
const generateDates = (days = 15) => {
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });
};

// format full (16 Sep 2025)
const formatFullDate = (date) =>
  date instanceof Date
    ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : date;

// robust: parse "05:45 PM" or "17:45" into minutes since midnight
const toMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return null;
  const s = timeStr.trim();
  const ampmMatch = s.match(/\b(AM|PM)\b/i);
  let timePart = s;
  let modifier = null;
  if (ampmMatch) {
    modifier = ampmMatch[0].toUpperCase();
    timePart = s.replace(/\s*(AM|PM)\s*/i, "").trim();
  }
  const parts = timePart.split(":").map((p) => p.trim());
  if (parts.length < 2) return null;
  let hh = parseInt(parts[0], 10);
  let mm = parseInt(parts[1], 10);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;

  if (modifier) {
    if (modifier === "PM" && hh !== 12) hh += 12;
    if (modifier === "AM" && hh === 12) hh = 0;
  }
  return hh * 60 + mm;
};

const CalendarModal = ({
  visible,
  onClose,
  todayAppointments = [],
  defaultBookedSlots = [],
  days = 15,
  start = "08:00",
  end = "22:00",
  interval = 30,
  handleClick = () => { },
  fetchAppointments, // <-- pass from parent
  intervalMs = 60000, // refresh every 60s
}) => {
  const timeSlots = generateTimeSlots(start, end, interval);
  const dates = generateDates(days);

  // Local date (yyyy-mm-dd) for comparison
  const getLocalDateStr = (d) => new Date(d).toLocaleDateString("en-CA");

  const getAppointments = (dateObj, slotStart, slotEnd) => {
    const dateStr = getLocalDateStr(dateObj);
    const startMin = toMinutes(slotStart);
    const endMin = slotEnd ? toMinutes(slotEnd) : startMin + interval;

    return (todayAppointments || []).filter((appt) => {
      if (!appt.serviceDate || !appt.servicetime) return false;
      const apptDateStr = getLocalDateStr(appt.serviceDate);
      if (apptDateStr !== dateStr) return false;
      const apptMin = toMinutes(appt.servicetime);
      return apptMin >= startMin && apptMin < endMin;
    });
  };

  const isDefaultBooked = (dateObj, slotStart, slotEnd) => {
    const dateStr = getLocalDateStr(dateObj);
    const startMin = toMinutes(slotStart);
    const endMin = slotEnd ? toMinutes(slotEnd) : startMin + interval;

    return (defaultBookedSlots || []).some((slot) => {
      if (!slot.date || !slot.time) return false;
      const sDateStr = getLocalDateStr(slot.date);
      if (sDateStr !== dateStr) return false;
      const sMin = toMinutes(slot.time);
      return sMin >= startMin && sMin < endMin;
    });
  };

  const generatePopover = (appointment) => (
    <Popover id={`popover-${appointment.bookingId}`} style={{ maxWidth: "260px" }}>
      <Popover.Header as="h6">Patient Info</Popover.Header>
      <Popover.Body>
        <div><strong>Name:</strong> {appointment.name}</div>
        <div>
          <strong>Age & Gender:</strong> {appointment.age}, {appointment.gender}
        </div>
        <div>
          <strong>Mobile:</strong> {appointment.patientMobileNumber || appointment.mobileNumber}
        </div>
        <div>
          <strong>Branch & Clinic:</strong> {appointment.branchname}, {appointment.clinicName}
        </div>
        <div><strong>Doctor:</strong> {appointment.doctorName}</div>
        <div>
          <strong>Service Date & Time:</strong> {formatFullDate(new Date(appointment.serviceDate))}, {appointment.servicetime}
        </div>
        <div><strong>Status:</strong> {appointment.status}</div>
      </Popover.Body>
    </Popover>
  );


  // Auto reload hook
  useEffect(() => {
    if (!visible || !fetchAppointments) return;
    fetchAppointments(); // fetch immediately when modal opens

    const id = setInterval(() => {
      fetchAppointments();
    }, intervalMs);

    return () => clearInterval(id);
  }, [visible, fetchAppointments, intervalMs]);

  return (
    <CModal visible={visible} onClose={onClose} size="xl">
      <CModalHeader closeButton>
        <CModalTitle className="w-100 text-center" style={{ color: COLORS.black }}>
          My Calendar
        </CModalTitle>
      </CModalHeader>

      <CModalBody style={{ padding: 0 }}>
        <div style={{ overflow: "auto", maxHeight: "80vh", border: "1px solid #ccc" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `120px repeat(${dates.length}, 1fr)`,
              fontFamily: "Arial, sans-serif",
              fontSize: "14px",
            }}
          >
            {/* empty top-left */}
            <div style={{ backgroundColor: COLORS?.bgcolor || "#e9eef6" }}></div>

            {/* header: dates */}
            {dates.map((d, idx) => (
              <div
                key={idx}
                style={{
                  padding: "10px 6px",
                  backgroundColor: COLORS?.bgcolor || "#b5d0e0",
                  color: COLORS?.black || "#4b0082",
                  fontWeight: 600,
                  fontSize: "14px",
                  textAlign: "center",
                  borderLeft: "1px solid #dbdada",
                  borderBottom: "1px solid #dbdada",
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  whiteSpace: "nowrap",
                }}
              >
                {d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit" })}
              </div>
            ))}

            {/* time rows */}
            {timeSlots.map((slot, i) => (
              <React.Fragment key={slot + i}>
                {/* time label column */}
                <div
                  style={{
                    padding: "8px",
                    fontWeight: "bold",
                    backgroundColor: COLORS?.bgcolor || "#e9eef6",
                    color: COLORS?.black,
                    textAlign: "center",
                    borderBottom: "1px solid #dbdada",
                    position: "sticky",
                    left: 0,
                    zIndex: 1,
                  }}
                >
                  {slot}
                </div>

                {/* cells for each date */}
                {dates.map((d, j) => {
                  const nextSlot = timeSlots[i + 1] || null;
                  const appointments = getAppointments(d, slot, nextSlot);
                  const defaultBooked = isDefaultBooked(d, slot, nextSlot);

                  return (
                    <div
                      key={`${i}-${j}`}
                      style={{
                        padding: "6px",
                        borderLeft: "1px solid #dbdada",
                        borderBottom: "1px solid #dbdada",
                        minHeight: "44px",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: "4px",
                      }}
                    >
                      {appointments.length > 0 ? (
                        appointments.map((appt) => (
                          <OverlayTrigger
                            key={appt.bookingId}
                            trigger={["hover", "focus"]}
                            placement="right"
                            overlay={generatePopover(appt)}
                          >
                            <div
                              onClick={() => handleClick(appt)}
                              style={{
                                fontSize: "12px",
                                borderRadius: "6px",
                                backgroundColor: "#7e3a93",
                                color: "#fff",
                                padding: "4px 6px",
                                cursor: "pointer",
                              }}
                            >
                              Booked
                            </div>
                          </OverlayTrigger>
                        ))
                      ) : defaultBooked ? (
                        <div
                          style={{
                            fontSize: "12px",
                            borderRadius: "6px",
                            backgroundColor: "#999",
                            color: "#fff",
                            padding: "4px 6px",
                          }}
                        >
                          Default Booked
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </CModalBody>
    </CModal>
  );
};

export default CalendarModal;
