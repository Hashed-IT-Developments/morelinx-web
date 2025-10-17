import axios from 'axios';
import { useCallback, useState } from 'react';

interface ApprovalStatusResponse {
    approval_state?: {
        id: number;
        status: 'pending' | 'approved' | 'rejected';
        current_order: number;
        flow: {
            id: number;
            module: string;
            name: string;
            steps?: ApprovalFlowStep[];
        };
    } | null;
    approvals?: ApprovalRecord[];
    has_approval_flow?: boolean;
    is_approval_complete?: boolean;
    is_approval_pending?: boolean;
    is_approval_rejected?: boolean;
}

interface ApprovalStatusCache {
    [applicationId: string]: {
        data: ApprovalStatusResponse;
        timestamp: number;
    };
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

let approvalStatusCache: ApprovalStatusCache = {};

export function useApprovalStatus() {
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<Record<string, string>>({});

    const fetchApprovalStatus = useCallback(async (applicationId: string): Promise<ApprovalStatusResponse | null> => {
        // Check cache first
        const cached = approvalStatusCache[applicationId];
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        }

        setLoading((prev) => ({ ...prev, [applicationId]: true }));
        setError((prev) => ({ ...prev, [applicationId]: '' }));

        try {
            const response = await axios.get(route('customer-applications.approval-status', { application: applicationId }));
            const data = response.data as ApprovalStatusResponse;

            // Cache the response
            approvalStatusCache[applicationId] = {
                data,
                timestamp: Date.now(),
            };

            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch approval status';
            setError((prev) => ({ ...prev, [applicationId]: errorMessage }));
            return null;
        } finally {
            setLoading((prev) => ({ ...prev, [applicationId]: false }));
        }
    }, []);

    const clearCache = useCallback((applicationId?: string) => {
        if (applicationId) {
            delete approvalStatusCache[applicationId];
        } else {
            approvalStatusCache = {};
        }
    }, []);

    return {
        fetchApprovalStatus,
        loading,
        error,
        clearCache,
    };
}
