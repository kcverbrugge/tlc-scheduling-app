import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { normalizeDepartmentCode, normalizeCourseNumber, normalizeCourseName } from "../utils/normalizers"
import { isDepartmentCode, isCourseNumber } from "../utils/validators"



const client = generateClient<Schema>();

export async function createCourse(departmentCode: string | null, courseNumber: number | null, courseName: string | null) {

    Pass
}

export async function setDepartmentCode(id: string, newDepartmentCode: string | null) {
    if (!newDepartmentCode || !normalizeDepartmentCode(newDepartmentCode)) {
        throw new Error("Please enter required fields.");
    }

    const cleanDepartmentCode = normalizeDepartmentCode(newDepartmentCode);

    if (!isDepartmentCode(cleanDepartmentCode)) {
        throw new Error("Invalid department code format.")
    }
}