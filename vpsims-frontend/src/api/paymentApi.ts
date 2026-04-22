import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5164/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};

export interface BusinessPaymentDetail {
    id: number;
    bankName: string;
    accountName: string;
    accountNumber: string;
    branchCode?: string;
    referenceFormat?: string;
    qrCodeImageUrl?: string;
    instructions?: string;
    contactEmail?: string;
    contactPhone?: string;
    isActive: boolean;
    createdAt: string;
}

export interface PaymentSubmission {
    id: number;
    userId: number;
    userName: string;
    orderId: number;
    amountPaid: number;
    paymentMethod: string;
    referenceNumber?: string;
    paymentDate: string;
    proofImageUrl?: string;
    notes?: string;
    status: string;
    rejectionReason?: string;
    submittedAt: string;
}

export const paymentApi = {
    // --- Admin Payment Details ---
    getAllDetails: () => axios.get<BusinessPaymentDetail[]>(`${API_URL}/payment/details`, getAuthHeaders()),
    createDetail: (data: Partial<BusinessPaymentDetail>) => axios.post<BusinessPaymentDetail>(`${API_URL}/payment/details`, data, getAuthHeaders()),
    updateDetail: (id: number, data: Partial<BusinessPaymentDetail>) => axios.put<BusinessPaymentDetail>(`${API_URL}/payment/details/${id}`, data, getAuthHeaders()),
    deleteDetail: (id: number) => axios.delete(`${API_URL}/payment/details/${id}`, getAuthHeaders()),

    // --- Submissions ---
    getAllSubmissions: () => axios.get<PaymentSubmission[]>(`${API_URL}/payment/submissions`, getAuthHeaders()),
    getMySubmissions: () => axios.get<PaymentSubmission[]>(`${API_URL}/payment/submissions/my`, getAuthHeaders()),
    createSubmission: (data: Partial<PaymentSubmission>) => axios.post<PaymentSubmission>(`${API_URL}/payment/submissions`, data, getAuthHeaders()),
    updateSubmissionStatus: (id: number, data: { status: string; rejectionReason?: string }) => axios.patch<PaymentSubmission>(`${API_URL}/payment/submissions/${id}/status`, data, getAuthHeaders()),
    createStripeSession: (orderId: number) => axios.post<{ url: string }>(`${API_URL}/stripe/create-session`, { orderId }, getAuthHeaders()),
};
