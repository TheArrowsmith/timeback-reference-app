'use client';

import { useEffect, useState } from 'react';
import { fetchOrganizations } from '@/lib/api/oneroster-client';
import { fetchAssessmentTests } from '@/lib/api/qti-client';

export interface DataStatus {
  hasOneRosterData: boolean;
  hasQtiData: boolean;
  loading: boolean;
  error: string | null;
}

export function useDataStatus() {
  const [status, setStatus] = useState<DataStatus>({
    hasOneRosterData: false,
    hasQtiData: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    async function checkDataStatus() {
      try {
        // Check OneRoster data by fetching organizations
        const [orgsResponse, assessmentsResponse] = await Promise.all([
          fetchOrganizations().catch(() => ({ orgs: [] })),
          fetchAssessmentTests().catch(() => ({ tests: [] }))
        ]);

        setStatus({
          hasOneRosterData: orgsResponse.orgs.length > 0,
          hasQtiData: assessmentsResponse.tests.length > 0,
          loading: false,
          error: null
        });
      } catch (err) {
        setStatus({
          hasOneRosterData: false,
          hasQtiData: false,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to check data status'
        });
      }
    }

    checkDataStatus();
  }, []);

  return status;
}