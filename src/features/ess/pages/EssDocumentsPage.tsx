import { EmployeeDocumentsTab } from '@/features/documents/components/EmployeeDocumentsTab';
import { PageHeader } from '@/shared/components';
import { EmployeeViewGate } from '../components/EmployeeViewGate';
import { ESS_EMPLOYEE } from '../types';

export default function EssDocumentsPage() {
  return (
    <>
      <PageHeader title="My documents" subtitle={`${ESS_EMPLOYEE.name} only`} />
      <EmployeeViewGate>
        <EmployeeDocumentsTab employeeCode={ESS_EMPLOYEE.code} />
      </EmployeeViewGate>
    </>
  );
}
