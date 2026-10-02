export const ESS_EMPLOYEE = {
  code: 'WIT-0006',
  name: 'Hira Shah',
  email: 'hira.shah@worldinfotek.com',
  phone: '0300-4567890',
  department: 'Software Development',
  designation: 'Senior Software Engineer',
  manager: 'Usman Khan',
};

export type HrRequestKind = 'Experience letter' | 'Salary certificate' | 'General request';

export interface ProfileChange {
  id: string;
  field: string;
  value: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface HrRequest {
  id: string;
  kind: HrRequestKind;
  detail: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  date: string;
}
