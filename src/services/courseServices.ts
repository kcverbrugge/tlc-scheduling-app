import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { IntegrationResponse } from "aws-cdk-lib/aws-apigateway";

const client = generateClient<Schema>();

export async function createCourse(departmentCode: string, courseNumber: number, courseName: string) {
    const trimmedDepartmentCode = departmentCode.trim();
    const cleanCourseNumber = courseNumber;
    const trimmedCourseName = courseName.trim();

    
}