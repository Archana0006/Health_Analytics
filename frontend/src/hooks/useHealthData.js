import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import apiClient from '../api/apiClient';

/**
 * Health Records Hooks
 */
export const usePatientRecords = (patientId) => {
    return useQuery({
        queryKey: ['records', patientId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/records/patient/${patientId}`);
            return data;
        },
        enabled: !!patientId,
    });
};

export const usePatientInfo = (patientId) => {
    return useQuery({
        queryKey: ['patient', patientId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/patients/${patientId}`);
            return data;
        },
        enabled: !!patientId,
    });
};

export const useAddRecord = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (recordData) => {
            const { data } = await apiClient.post('/records', recordData);
            return data;
        },
        onSuccess: (data, variables) => {
            const patientId = variables instanceof FormData ? variables.get('patientId') : variables.patientId;
            queryClient.invalidateQueries({ queryKey: ['records', patientId] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
};

export const useUpdateRecord = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, recordData }) => {
            const { data } = await apiClient.put(`/records/${id}`, recordData);
            return data;
        },
        onSuccess: (data) => {
            // Invalidate specific patient's records if we have the patientId
            if (data.patientId) {
                queryClient.invalidateQueries({ queryKey: ['records', data.patientId] });
            } else {
                queryClient.invalidateQueries({ queryKey: ['records'] });
            }
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
};

export const useDeleteRecord = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await apiClient.delete(`/records/${id}`);
            return data;
        },
        onSuccess: () => {
            // Since we don't always have the patientId on delete response easily,
            // we invalidate all records queries to be safe.
            queryClient.invalidateQueries({ queryKey: ['records'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
};

export const useRecordHistory = (patientId) => {
    return useQuery({
        queryKey: ['records', 'history', patientId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/records/history/${patientId}`);
            return data;
        },
        enabled: !!patientId,
    });
};

/**
 * Appointments Hooks
 */
export const useAppointments = (role, userId, patientId = null) => {
    const id = patientId || userId;
    return useQuery({
        queryKey: ['appointments', role, id],
        queryFn: async () => {
            let endpoint;
            if (patientId) {
                endpoint = `/appointments/patient/${patientId}`;
            } else {
                endpoint = role === 'patient'
                    ? `/appointments/patient/${userId}`
                    : `/appointments/doctor/${userId}`;
            }
            const { data } = await apiClient.get(endpoint);
            return data;
        },
        enabled: !!id,
    });
};

export const useBookAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (appointmentData) => {
            const { data } = await apiClient.post('/appointments', appointmentData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
};

export const useUpdateAppointmentStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }) => {
            const { data } = await apiClient.put(`/appointments/status/${id}`, { status });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
};

export const useDoctorsList = () => {
    return useQuery({
        queryKey: ['doctors'],
        queryFn: async () => {
            const { data } = await apiClient.get('/doctor/list');
            return data;
        },
    });
};

/**
 * Dashboard & Stats Hooks
 */
export const useDashboardStats = (role) => {
    return useQuery({
        queryKey: ['stats', role],
        queryFn: async () => {
            const endpoint = role === 'doctor' ? '/doctor/stats' : '/admin/stats';
            const { data } = await apiClient.get(endpoint);
            return data;
        },
        enabled: role === 'doctor' || role === 'admin',
    });
};

export const useCriticalPatients = () => {
    return useQuery({
        queryKey: ['critical-patients'],
        queryFn: async () => {
            const { data } = await apiClient.get('/doctor/critical-patients');
            return data;
        },
    });
};

export const useMLScore = (patientId) => {
    return useQuery({
        queryKey: ['ml-score', patientId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/records/ml-score/${patientId}`);
            return data;
        },
        enabled: !!patientId,
        retry: false,
    });
};

/**
 * Notifications & Reminders
 */
export const useNotifications = () => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const { data } = await apiClient.get('/notifications');
            return data;
        },
    });
};

export const useReminders = () => {
    return useQuery({
        queryKey: ['reminders'],
        queryFn: async () => {
            const { data } = await apiClient.get('/reminders');
            return data;
        },
    });
};

export const useAddReminder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (reminderData) => {
            const { data } = await apiClient.post('/reminders', reminderData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
        },
    });
};

export const useRecentDocuments = (patientId) => {
    return useQuery({
        queryKey: ['documents', 'recent', patientId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/documents/recent/${patientId}`);
            return data;
        },
        enabled: !!patientId,
    });
};

export const useAddDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (docData) => {
            const { data } = await apiClient.post('/documents/upload', docData);
            return data;
        },
        onSuccess: (data, variables) => {
            const patientId = variables instanceof FormData ? variables.get('patientId') : variables.patientId;
            queryClient.invalidateQueries({ queryKey: ['documents', 'recent', patientId] });
        },
    });
};

export const useDeleteDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await apiClient.delete(`/documents/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });
};

/**
 * User Hooks
 */
export const useUserProfileData = () => {
    return useQuery({
        queryKey: ['user', 'profile'],
        queryFn: async () => {
            const { data } = await apiClient.get('/user/profile');
            return data;
        },
    });
};

export const useUserProfile = (userId) => {
    return useQuery({
        queryKey: ['user', userId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/auth/user/${userId}`);
            return data;
        },
        enabled: !!userId,
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (profileData) => {
            const { data } = await apiClient.put('/user/profile', profileData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
        },
    });
};

export const useUpdatePassword = () => {
    return useMutation({
        mutationFn: async (passwordData) => {
            const { data } = await apiClient.put('/user/password', passwordData);
            return data;
        },
    });
};

/**
 * Staff & Patient Management (Admin)
 */
export const useAddDoctor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (doctorData) => {
            const { data } = await apiClient.post('/doctor/manage', doctorData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
};

export const useUpdateDoctor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, doctorData }) => {
            const { data } = await apiClient.put(`/doctor/manage/${id}`, doctorData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
        },
    });
};

export const useDeleteDoctor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await apiClient.delete(`/doctor/manage/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
};

export const useAllPatients = () => {
    return useQuery({
        queryKey: ['patients', 'all'],
        queryFn: async () => {
            const { data } = await apiClient.get('/patients');
            return data;
        },
    });
};

export const useAddPatient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (patientData) => {
            const { data } = await apiClient.post('/patients', patientData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients', 'all'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
};

export const useUpdatePatient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, patientData }) => {
            const { data } = await apiClient.put(`/patients/${id}`, patientData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients', 'all'] });
        },
    });
};

export const useDeletePatient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await apiClient.delete(`/patients/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients', 'all'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
};

/**
 * AI Prediction Hook
 */
export const usePrediction = () => {
    const ML_BASE_URL = 'http://localhost:5001';
    return useMutation({
        mutationFn: async ({ type, formData }) => {
            const { data } = await axios.post(`${ML_BASE_URL}/predict/${type}`, formData);
            return data;
        },
    });
};

/**
 * Authentication Mutations
 */
export const useRegister = () => {
    return useMutation({
        mutationFn: async (formData) => {
            const { data } = await apiClient.post('/auth/register', formData);
            return data;
        },
    });
};

export const useLogin = () => {
    return useMutation({
        mutationFn: async (credentials) => {
            const { data } = await apiClient.post('/auth/login', credentials);
            return data;
        },
    });
};

/**
 * Labs and Prescriptions Hooks
 */
export const usePatientLabs = (patientId) => {
    return useQuery({
        queryKey: ['labs', patientId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/labs/tests/patient/${patientId}`);
            return data;
        },
        enabled: !!patientId,
    });
};

export const useAllLabs = () => {
    return useQuery({
        queryKey: ['labs', 'all'],
        queryFn: async () => {
            const { data } = await apiClient.get('/labs/tests');
            return data;
        },
    });
};

export const useUploadLabResult = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (resultData) => {
            const { data } = await apiClient.post('/labs/results', resultData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['labs'] });
        },
    });
};

export const usePatientPrescriptions = (patientId) => {
    return useQuery({
        queryKey: ['prescriptions', patientId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/prescriptions/patient/${patientId}`);
            return data;
        },
        enabled: !!patientId,
    });
};

export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await apiClient.patch(`/notifications/${id}`, { read: true });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });
};
