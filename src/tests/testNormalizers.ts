import {
    normalizeName,
    normalizeEmail,
    normalizeStatus,
    normalizeDepartmentCode,
    normalizeCourseNumber,
    normalizeCourseName,
  } from './normalizers';


function assertEqual(testValue: any, expectedValue: any, message: string) {
    if (testValue !== expectedValue) {
        throw new Error(`Test failed: ${message}. Expected ${expectedValue} but got ${testValue}`);
    } else {
        console.log(`Test passed: ${message}`);
    }
}

export function runNormalizerTests() { 
    assertEqual(normalizeName("  jAck  "), "Jack", "normalizeName");
    assertEqual(normalizeEmail("  TeST@Email.com  "), "test@email.com", "normalizeEmail");
    assertEqual(normalizeStatus(" available "), "AVAILABLE", "normalizeStatus");
    assertEqual(normalizeDepartmentCode(" csci "), "CSCI", "normalizeDepartmentCode");
    assertEqual(normalizeCourseNumber(" 101 "), "101", "normalizeCourseNumber");
    assertEqual(normalizeCourseNumber(202), "202", "normalizeCourseNumber (number input)");
    assertEqual(normalizeCourseName("  Intro to CS "), "Intro to CS", "normalizeCourseName");
}