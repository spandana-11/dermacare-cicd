package com.dermacare.doctorservice.dermacaredoctorutils;



public class VisitTypeUtil {

    public static String getVisitTypeFromCount(int count) {
        switch (count) {
            case 1: return "FIRST_VISIT";
            case 2: return "SECOND_VISIT";
            case 3: return "THIRD_VISIT";
            case 4: return "FOURTH_VISIT";
            case 5: return "FIFTH_VISIT";
            default: return count + "_VISIT";
        }
    }
}
