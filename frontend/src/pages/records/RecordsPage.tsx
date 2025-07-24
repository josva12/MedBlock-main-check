import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchMedicalRecords, createMedicalRecord, updateMedicalRecord, deleteMedicalRecord } from '../../features/medicalRecords/medicalRecordsSlice';
import { fetchPatients } from '../../features/patients/patientsSlice';
import { type RootState } from '../../store';
import { Plus, Edit, Trash2, Save, FileText, User, Calendar } from 'lucide-react';

const initialForm = {
  patientId: '',
  type: '',
  title: '',
  date: '',
  notes: '',
};

type FormType = typeof initialForm;

const RecordsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { records, isLoading, error } = useAppSelector((state: RootState) => state.medicalRecords);
  const { patients } = useAppSelector((state: RootState) => state.patients);
  const { user } = useAppSelector((state: RootState) => state.auth);
  // Defensive check for patients array
  const safePatients = Array.isArray(patients) ? patients : [];
  // Filter patients by nurse assignment if possible (e.g., patient.assignedNurseId === user._id)
  // If no such field, show all patients for now
  const nursePatients = user?.role === 'nurse' && user.department
    ? safePatients.filter(p => (p as any).assignedDepartment === user.department) // TODO: update Patient type
    : safePatients;
  // Only show records for nurse's patients
  const safeRecords = Array.isArray(records) ? records : [];
  const nursePatientIds = new Set(nursePatients.map(p => p._id));
  const nurseRecords = user?.role === 'nurse'
    ? safeRecords.filter(record => nursePatientIds.has(record.patientId))
    : safeRecords;
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormType>(initialForm);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    dispatch(fetchMedicalRecords());
    dispatch(fetchPatients());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.patientId || !form.type || !form.title || !form.date) {
      setFormError('All fields except notes are required');
      return;
    }
    const patient = patients.find((p: any) => p._id === form.patientId);
    const recordData = {
      ...form,
      patientName: patient ? patient.fullName : '',
      diagnosis: '',
      treatment: '',
      doctorId: user?._id || '',
      doctorName: user?.fullName || '',
    };
    try {
      if (editId) {
        await dispatch(updateMedicalRecord({ id: editId, data: recordData })).unwrap();
      } else {
        await dispatch(createMedicalRecord(recordData)).unwrap();
      }
      await dispatch(fetchMedicalRecords());
      setShowModal(false);
      setForm(initialForm);
      setEditId(null);
    } catch (error: any) {
      setFormError(error.message || 'Failed to save record');
    }
  };

  const handleEdit = (record: any) => {
    setEditId(record._id);
    setForm({
      patientId: record.patientId,
      type: record.type,
      title: record.title,
      date: record.date,
      notes: record.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      await dispatch(deleteMedicalRecord(id));
      await dispatch(fetchMedicalRecords());
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p: any) => p._id === patientId);
    return patient ? patient.fullName : 'Unknown Patient';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Medical Records</h2>
        <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition flex items-center gap-2" onClick={() => { setShowModal(true); setForm(initialForm); setEditId(null); }}>
          <Plus className="h-5 w-5" /> Add Record
        </button>
      </div>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">{error}</div>
      )}
      {user?.role === 'nurse' && !user.department && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded mb-4">
          You are not assigned to any department. Please contact your administrator.
        </div>
      )}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Patient</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Type</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Title</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Date</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(() => { return (
            isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2">Loading records...</p>
                </td>
              </tr>
            ) : nurseRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">No records found</td>
              </tr>
            ) : (
              nurseRecords.map((record: any) => (
                <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2">{getPatientName(record.patientId)}</td>
                  <td className="px-4 py-2">{record.type}</td>
                  <td className="px-4 py-2">{record.title}</td>
                  <td className="px-4 py-2">{record.date}</td>
              <td className="px-4 py-2">
                    <button className="text-blue-600 hover:underline mr-2" onClick={() => alert(JSON.stringify(record, null, 2))}>View</button>
                    <button className="text-green-600 hover:underline mr-2" onClick={() => handleEdit(record)}>Edit</button>
                    <button className="text-red-600 hover:underline" onClick={() => handleDelete(record._id)}>Delete</button>
              </td>
            </tr>
              ))
            )
          ); })()}
          {nursePatients.length === 0 && user?.role === 'nurse' && user.department && (
            <tr>
              <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">No patients found for your department.</td>
            </tr>
          )}
          </tbody>
        </table>
      </div>
      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editId ? 'Edit Record' : 'Add Record'}</h3>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onClick={() => { setShowModal(false); setEditId(null); }}>×</button>
            </div>
            {formError && (
              <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">{formError}</div>
            )}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label htmlFor="record-patientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Patient *</label>
                <select
                  id="record-patientId"
                  name="patientId"
                  value={form.patientId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Patient</option>
                  {nursePatients.map((patient: any) => (
                    <option key={patient._id} value={patient._id}>{patient.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="record-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type *</label>
                <input
                  id="record-type"
                  name="type"
                  type="text"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="record-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
                <input
                  id="record-title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="record-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date *</label>
                <input
                  id="record-date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="record-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                <textarea
                  id="record-notes"
                  name="notes"
                  rows={4}
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => { setShowModal(false); setEditId(null); }} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                  disabled={user?.role === 'nurse' && !user.isGovernmentVerified}
                  title={user?.role === 'nurse' && !user.isGovernmentVerified ? 'Only government-verified nurses can save records.' : ''}
                >
                  <Save className="h-4 w-4" />
                  {editId ? "Update" : "Save"} Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordsPage;
