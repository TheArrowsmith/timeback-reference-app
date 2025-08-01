import { API_CONFIG } from '@/lib/config';

const ONEROSTER_BASE_URL = `${API_CONFIG.BASE_URL}${API_CONFIG.ONEROSTER_BASE_PATH}`;

// Base response interfaces
interface Organization {
  sourcedId: string;
  status?: string;
  dateLastModified?: string;
  name: string;
  type: string;
  identifier?: string;
}

interface AcademicSession {
  sourcedId: string;
  status: string;
  dateLastModified: string;
  title: string;
  startDate: string;
  endDate: string;
  type: string;
  schoolYear: string;
}

interface Course {
  sourcedId: string;
  status: string;
  dateLastModified: string;
  title: string;
  courseCode: string;
  grades: string[];
  subjects: string[];
  org: {
    href: string;
    sourcedId: string;
    type: string;
  };
}

interface User {
  sourcedId: string;
  status: string;
  dateLastModified: string;
  username: string;
  enabledUser: boolean;
  givenName: string;
  familyName: string;
  middleName?: string;
  role: string;
  identifier: string;
  email: string;
  grades?: string[];
  orgs: Array<{
    href: string;
    sourcedId: string;
    type: string;
  }>;
}

interface Class {
  sourcedId: string;
  status: string;
  dateLastModified: string;
  title: string;
  classCode: string;
  classType: string;
  grades: string[];
  subjects: string[];
  course: {
    href: string;
    sourcedId: string;
    type: string;
  };
  school: {
    href: string;
    sourcedId: string;
    type: string;
  };
  terms: Array<{
    href: string;
    sourcedId: string;
    type: string;
  }>;
}

interface Enrollment {
  sourcedId: string;
  status: string;
  dateLastModified: string;
  role: string;
  primary?: boolean;
  beginDate: string;
  endDate: string;
  user: {
    href: string;
    sourcedId: string;
    type: string;
  };
  class: {
    href: string;
    sourcedId: string;
    type: string;
  };
  school: {
    href: string;
    sourcedId: string;
    type: string;
  };
}

// Response wrapper interfaces
interface OrganizationsResponse {
  orgs: Organization[];
}

interface AcademicSessionsResponse {
  academicSessions: AcademicSession[];
}

interface CoursesResponse {
  courses: Course[];
}

interface UsersResponse {
  users: User[];
}

interface ClassesResponse {
  classes: Class[];
}

interface EnrollmentsResponse {
  enrollments: Enrollment[];
}

// Single resource response interfaces
interface OrganizationResponse {
  org: Organization;
}

interface UserResponse {
  user: User;
}

interface CourseResponse {
  course: Course;
}

interface ClassResponse {
  class: Class;
}

interface AcademicSessionResponse {
  academicSession: AcademicSession;
}

interface EnrollmentResponse {
  enrollment: Enrollment;
}

// Common fetch options
const getFetchOptions = (): RequestInit => ({
  headers: {
    'Authorization': `Bearer ${API_CONFIG.JWT_TOKEN}`,
    'Accept': 'application/json',
  },
});

// Error handling
class OneRosterError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'OneRosterError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new OneRosterError(
      `OneRoster API error: ${response.statusText}`,
      response.status
    );
  }
  return response.json();
}

// Collection endpoints
export async function fetchOrganizations(): Promise<OrganizationsResponse> {
  const response = await fetch(`${ONEROSTER_BASE_URL}/orgs`, getFetchOptions());
  return handleResponse<OrganizationsResponse>(response);
}

export async function fetchAcademicSessions(): Promise<AcademicSessionsResponse> {
  const response = await fetch(`${ONEROSTER_BASE_URL}/academicSessions`, getFetchOptions());
  return handleResponse<AcademicSessionsResponse>(response);
}

export async function fetchCourses(): Promise<CoursesResponse> {
  const response = await fetch(`${ONEROSTER_BASE_URL}/courses`, getFetchOptions());
  return handleResponse<CoursesResponse>(response);
}

export async function fetchUsers(filters?: { role?: string }): Promise<UsersResponse> {
  let url = `${ONEROSTER_BASE_URL}/users`;
  
  if (filters?.role) {
    const params = new URLSearchParams();
    params.append('filter', `role='${filters.role}'`);
    url += `?${params.toString()}`;
  }
  
  const response = await fetch(url, getFetchOptions());
  return handleResponse<UsersResponse>(response);
}

export async function fetchClasses(): Promise<ClassesResponse> {
  const response = await fetch(`${ONEROSTER_BASE_URL}/classes`, getFetchOptions());
  return handleResponse<ClassesResponse>(response);
}

export async function fetchEnrollments(): Promise<EnrollmentsResponse> {
  const response = await fetch(`${ONEROSTER_BASE_URL}/enrollments`, getFetchOptions());
  return handleResponse<EnrollmentsResponse>(response);
}

// Single resource endpoints
export async function fetchOrganization(id: string): Promise<OrganizationResponse> {
  const response = await fetch(`${ONEROSTER_BASE_URL}/orgs/${id}`, getFetchOptions());
  return handleResponse<OrganizationResponse>(response);
}

export async function fetchUser(id: string): Promise<UserResponse> {
  const response = await fetch(`${ONEROSTER_BASE_URL}/users/${id}`, getFetchOptions());
  return handleResponse<UserResponse>(response);
}

export async function fetchCourse(id: string): Promise<CourseResponse> {
  const response = await fetch(`${ONEROSTER_BASE_URL}/courses/${id}`, getFetchOptions());
  return handleResponse<CourseResponse>(response);
}

export async function fetchClass(id: string): Promise<ClassResponse> {
  const response = await fetch(`${ONEROSTER_BASE_URL}/classes/${id}`, getFetchOptions());
  return handleResponse<ClassResponse>(response);
}

export async function fetchAcademicSession(id: string): Promise<AcademicSessionResponse> {
  const response = await fetch(`${ONEROSTER_BASE_URL}/academicSessions/${id}`, getFetchOptions());
  return handleResponse<AcademicSessionResponse>(response);
}

// Relational endpoints
export async function fetchClassesForSchool(schoolId: string): Promise<ClassesResponse> {
  const response = await fetch(`${ONEROSTER_BASE_URL}/schools/${schoolId}/classes`, getFetchOptions());
  return handleResponse<ClassesResponse>(response);
}

export async function fetchStudentsForClass(classId: string): Promise<UsersResponse> {
  const response = await fetch(`${ONEROSTER_BASE_URL}/classes/${classId}/students`, getFetchOptions());
  return handleResponse<UsersResponse>(response);
}

export async function fetchTeachersForClass(classId: string): Promise<UsersResponse> {
  const response = await fetch(`${ONEROSTER_BASE_URL}/classes/${classId}/teachers`, getFetchOptions());
  return handleResponse<UsersResponse>(response);
}

export async function fetchClassesForUser(userId: string): Promise<ClassesResponse> {
  const response = await fetch(`${ONEROSTER_BASE_URL}/users/${userId}/classes`, getFetchOptions());
  return handleResponse<ClassesResponse>(response);
}

// Export types
export type {
  Organization,
  AcademicSession,
  Course,
  User,
  Class,
  Enrollment,
  OrganizationsResponse,
  AcademicSessionsResponse,
  CoursesResponse,
  UsersResponse,
  ClassesResponse,
  EnrollmentsResponse,
};