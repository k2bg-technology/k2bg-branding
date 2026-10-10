import { dashboardLogger } from '../../modules/dashboard/adapters/shared';
import type {
  DashboardDefinition,
  ResolvedControlOptionsById,
} from '../../modules/dashboard/domain';
import {
  type ControlOptionsOutcomes,
  MAXIMUM_CONTROL_OPTIONS,
  type ResolveControlOptionsInput,
} from '../../modules/dashboard/use-cases';

interface Input {
  dashboard: DashboardDefinition;
  resolveControlOptions: (
    input: ResolveControlOptionsInput
  ) => Promise<ControlOptionsOutcomes>;
}

export async function loadControlOptions({
  dashboard,
  resolveControlOptions,
}: Input): Promise<ResolvedControlOptionsById> {
  const distinctControls = (dashboard.controls ?? []).filter(
    (control) => control.options === 'distinct'
  );
  if (distinctControls.length === 0) {
    return {};
  }
  try {
    const outcomes = await resolveControlOptions({ dashboard });
    Object.entries(outcomes).forEach(([controlId, outcome]) => {
      if (outcome.status === 'unavailable') {
        dashboardLogger.error(
          { err: outcome.error, dashboardId: dashboard.id, controlId },
          'Failed to resolve control options'
        );
        return;
      }
      if (outcome.truncated) {
        dashboardLogger.warn(
          {
            dashboardId: dashboard.id,
            controlId,
            limit: MAXIMUM_CONTROL_OPTIONS,
          },
          'Control options were truncated'
        );
      }
    });
    return outcomes;
  } catch (error) {
    dashboardLogger.error(
      { err: error, dashboardId: dashboard.id },
      'Failed to resolve control options'
    );
    return Object.fromEntries(
      distinctControls.map((control) => [control.id, { status: 'unavailable' }])
    );
  }
}
