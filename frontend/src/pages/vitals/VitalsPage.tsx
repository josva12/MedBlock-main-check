import React, { useEffect, useState } from "react";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useAppSelector } from "../../hooks/useAppSelector";
import { fetchVitals, createVital, updateVital, deleteVital } from "../../features/vitals/vitalsSlice";
import { fetchPatients } from "../../features/patients/patientsSlice";
import type { VitalSign } from "../../features/vitals/vitalsSlice";
import { type RootState } from "../../store";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Calendar,
  User,
  Thermometer,
  Heart,
  Activity
} from "lucide-react";

const initialForm = {
  patientId: "",
  temperature: "",
  bloodPressure: { systolic: "", diastolic: "" },
  heartRate: "",
  respiratoryRate: "",
  oxygenSaturation: "",
  weight: "",
  height: "",
  notes: "",
  recordedAt: new Date().toISOString().split('T')[0],
};

type FormType = typeof initialForm;

const VitalsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { vitals, isLoading, error } = useAppSelector((state: RootState) => state.vitals);
  const { patients } = useAppSelector((state: RootState) => state.patients);
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormType>(initialForm);
  const [formError, setFormError] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");

  useEffect(() => {
    dispatch(fetchVitals(undefined));
    dispatch(fetchPatients());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof FormType] as any,
          [child]: value
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.patientId) {
      setFormError("Patient is required");
      return;
    }

    const patient = patients.find(p => p._id === form.patientId);
    if (!patient) {
      setFormError("Selected patient not found");
      return;
    }

    const vitalData = {
      patientId: form.patientId,
      patientName: patient.fullName,
      temperature: form.temperature ? parseFloat(form.temperature) : 0,
      bloodPressure: {
        systolic: form.bloodPressure.systolic ? parseInt(form.bloodPressure.systolic) : 0,
        diastolic: form.bloodPressure.diastolic ? parseInt(form.bloodPressure.diastolic) : 0
      },
      heartRate: form.heartRate ? parseInt(form.heartRate) : 0,
      respiratoryRate: form.respiratoryRate ? parseInt(form.respiratoryRate) : 0,
      oxygenSaturation: form.oxygenSaturation ? parseFloat(form.oxygenSaturation) : 0,
      weight: form.weight ? parseFloat(form.weight) : undefined,
      height: form.height ? parseFloat(form.height) : undefined,
      notes: form.notes || undefined,
      recordedBy: user?._id || "",
      recordedAt: form.recordedAt,
    };

    try {
      if (editId) {
        await dispatch(updateVital({ id: editId, data: vitalData })).unwrap();
      } else {
        await dispatch(createVital(vitalData)).unwrap();
      }
      setShowModal(false);
      setForm(initialForm);
      setEditId(null);
    } catch (error: any) {
      setFormError(error.message || "Failed to save vital signs");
    }
  };
  
  const handleEdit = (vital: VitalSign) => {
    setEditId(vital._id);
    setForm({
      patientId: vital.patientId,
      temperature: vital.temperature?.toString() || "",
      bloodPressure: {
        systolic: vital.bloodPressure?.systolic?.toString() || "",
        diastolic: vital.bloodPressure?.diastolic?.toString() || ""
      },
      heartRate: vital.heartRate?.toString() || "",
      respiratoryRate: vital.respiratoryRate?.toString() || "",
      oxygenSaturation: vital.oxygenSaturation?.toString() || "",
      weight: vital.weight?.toString() || "",
      height: vital.height?.toString() || "",
      notes: vital.notes || "",
      recordedAt: new Date(vital.recordedAt).toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this vital sign record?")) {
      await dispatch(deleteVital(id));
    }
  };

  const filteredVitals = vitals.filter(vital => {
    const matchesPatient = !selectedPatient || vital.patientId === selectedPatient;
    return matchesPatient;
  });

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p._id === patientId);
    return patient ? patient.fullName : "Unknown Patient";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vital Signs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor and record patient vital signs</p>
        </div>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition flex items-center gap-2" 
          onClick={() => { setShowModal(true); setForm(initialForm); setEditId(null); }}
        >
          <Plus className="h-5 w-5" />
          Add Vitals
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Patient
            </label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Patients</option>
              {patients.map(patient => (
                <option key={patient._id} value={patient._id}>
                  {patient.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Vitals Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Temperature
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Blood Pressure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Heart Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2">Loading vital signs...</p>
                  </td>
                </tr>
              ) : filteredVitals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No vital signs found
                  </td>
                </tr>
              ) : (
                filteredVitals.map((vital) => (
                  <tr key={vital._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {getPatientName(vital.patientId)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {vital.temperature ? (
                        <div className="flex items-center">
                          <Thermometer className="h-4 w-4 mr-1" />
                          {vital.temperature}°C
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {vital.bloodPressure?.systolic && vital.bloodPressure?.diastolic ? (
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 mr-1" />
                          {vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {vital.heartRate ? (
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {vital.heartRate} bpm
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(vital.recordedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={() => handleEdit(vital)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        onClick={() => handleDelete(vital._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editId ? "Edit Vital Signs" : "Add Vital Signs"}
                </h3>
                <button 
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={() => { setShowModal(false); setEditId(null); }}
                >
                  ×
                </button>
              </div>
            </div>
            
            {formError && (
              <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                {formError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Patient Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Patient *
                </label>
                <select
                  name="patientId"
                  value={form.patientId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient._id} value={patient._id}>
                      {patient.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recorded Date
                </label>
                <input
                  name="recordedAt"
                  type="date"
                  value={form.recordedAt}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Vital Signs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Temperature */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Temperature (°C)
                  </label>
                  <input
                    name="temperature"
                    type="number"
                    step="0.1"
                    placeholder="36.5"
                    value={form.temperature}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Blood Pressure */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Blood Pressure (mmHg)
                  </label>
                  <div className="flex gap-2">
                    <input
                      name="bloodPressure.systolic"
                      type="number"
                      placeholder="120"
                      value={form.bloodPressure.systolic}
                      onChange={handleChange}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="px-2 py-2 text-gray-500">/</span>
                    <input
                      name="bloodPressure.diastolic"
                      type="number"
                      placeholder="80"
                      value={form.bloodPressure.diastolic}
                      onChange={handleChange}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Heart Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Heart Rate (bpm)
                  </label>
                  <input
                    name="heartRate"
                    type="number"
                    placeholder="72"
                    value={form.heartRate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Respiratory Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Respiratory Rate (rpm)
                  </label>
                  <input
                    name="respiratoryRate"
                    type="number"
                    placeholder="16"
                    value={form.respiratoryRate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Oxygen Saturation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Oxygen Saturation (%)
                  </label>
                  <input
                    name="oxygenSaturation"
                    type="number"
                    step="0.1"
                    placeholder="98"
                    value={form.oxygenSaturation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    name="weight"
                    type="number"
                    step="0.1"
                    placeholder="70"
                    value={form.weight}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Height */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Height (cm)
                  </label>
                  <input
                    name="height"
                    type="number"
                    step="0.1"
                    placeholder="170"
                    value={form.height}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Additional notes..."
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditId(null); }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {editId ? "Update" : "Save"} Vital Signs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VitalsPage;