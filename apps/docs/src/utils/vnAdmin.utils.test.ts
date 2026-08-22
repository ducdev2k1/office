import { describe, expect, it } from 'vitest';
import { checkVnAdminCompliance, STANDARD_VN_ADMIN_PAGE_SETUP } from '@/utils/vnAdmin.utils';

describe('vnAdmin.utils', () => {
  it('should validate standard VN administrative page setup as compliant', () => {
    const report = checkVnAdminCompliance(STANDARD_VN_ADMIN_PAGE_SETUP);
    expect(report.isPaperSizeCompliant).toBe(true);
    expect(report.isAllMarginsCompliant).toBe(true);
    expect(report.isCompliant).toBe(true);
  });

  it('should detect non-compliant page size and margins', () => {
    const nonCompliantSetup = {
      paperSize: 'letter' as const,
      orientation: 'landscape' as const,
      margins: { top: 10, right: 10, bottom: 10, left: 10 },
    };

    const report = checkVnAdminCompliance(nonCompliantSetup);
    expect(report.isPaperSizeCompliant).toBe(false);
    expect(report.isAllMarginsCompliant).toBe(false);
    expect(report.isCompliant).toBe(false);
  });
});
