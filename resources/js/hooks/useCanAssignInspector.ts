import { useCallback, useState } from 'react';
import { useApprovalStatus } from './useApprovalStatus';

interface CanAssignInspectorResult {
    canAssign: boolean;
    loading: boolean;
    error: string | null;
}

export function useCanAssignInspector() {
    const { fetchApprovalStatus } = useApprovalStatus();
    const [results, setResults] = useState<Record<string, CanAssignInspectorResult>>({});

    const checkCanAssignInspector = useCallback(
        async (inspection: Inspection): Promise<boolean> => {
            const application = inspection.customer_application;
            const inspectionKey = `${inspection.id}`;

            // Basic check first - must be 'for_inspection' status
            if (inspection.status !== 'for_inspection') {
                setResults((prev) => ({
                    ...prev,
                    [inspectionKey]: { canAssign: false, loading: false, error: null },
                }));
                return false;
            }

            // If no application, can't assign
            if (!application?.id) {
                setResults((prev) => ({
                    ...prev,
                    [inspectionKey]: { canAssign: false, loading: false, error: null },
                }));
                return false;
            }

            // Set loading state
            setResults((prev) => ({
                ...prev,
                [inspectionKey]: { canAssign: false, loading: true, error: null },
            }));

            try {
                const approvalData = await fetchApprovalStatus(application.id);

                let canAssign = false;

                if (approvalData?.has_approval_flow && approvalData?.approval_state?.flow?.module === 'customer_application') {
                    // If there's an approval flow for the Customer Application module
                    // Only allow assignment if the application is approved
                    canAssign = approvalData.approval_state.status === 'approved' && inspection.status === 'for_inspection';
                } else {
                    // If no approval flow exists, can assign directly if status is 'for_inspection'
                    canAssign = inspection.status === 'for_inspection';
                }

                setResults((prev) => ({
                    ...prev,
                    [inspectionKey]: { canAssign, loading: false, error: null },
                }));

                return canAssign;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                setResults((prev) => ({
                    ...prev,
                    [inspectionKey]: { canAssign: false, loading: false, error: errorMessage },
                }));
                return false;
            }
        },
        [fetchApprovalStatus],
    );

    const getResult = useCallback(
        (inspectionId: number): CanAssignInspectorResult => {
            return results[inspectionId] || { canAssign: false, loading: false, error: null };
        },
        [results],
    );

    return {
        checkCanAssignInspector,
        getResult,
    };
}
