import React, { useEffect, useState } from "react";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useAppSelector } from "../../hooks/useAppSelector";
import { fetchVitals, createVital, updateVital, deleteVital } from "../../features/vitals/vitalsSlice";
import type { VitalSign } from "../../features/vitals/vitalsSlice";
import { type RootState } from "../../store";

const initialForm = {
  patientId: "",
  patientName: "",
  temperature: "",
  systolic: "",
  diastolic: "",
  heartRate: "",
  recordedAt: new Date().toISOString().split('T')[0],
};

type FormType = typeof initialForm;

const VitalsPage: React.FC = () => {
  // --- FIX: Corrected typo from `useAppAppDispatch` to `useAppDispatch` ---
  const dispatch = useAppDispatch();
  const { vitals, isLoading, error } = useAppSelector((state: RootState) => state.vitals);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormType>(initialForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    dispatch(fetchVitals(undefined));
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.patientName || !form.temperature || !form.systolic || !form.diastolic || !form.heartRate || !form.recordedAt) {
      setFormError("All fields are required");
      return;
    }

    const vitalData = {
      patientId: form.patientId || 'temp-patient-id',
      patientName: form.patientName,
      temperature: parseFloat(form.temperature),
      heartRate: parseInt(form.heartRate, 10),
      respiratoryRate: 18,
      oxygenSaturation: 98,
      recordedAt: form.recordedAt,
      recordedBy: 'current-user-id',
      bloodPressure: {
        systolic: parseInt(form.systolic, 10),
        diastolic: parseInt(form.diastolic, 10),
      },
    };

    if (editId) {
      // @ts-ignore
      await dispatch(updateVital({ id: editId, data: vitalData }));
    } else {
      // @ts-ignore
      await dispatch(createVital(vitalData));
    }

    setShowModal(false);
    setForm(initialForm);
    setEditId(null);
  };
  
  const handleEdit = (vital: VitalSign) => {
    setEditId(vital._id);
    setForm({
      patientId: vital.patientId,
      patientName: vital.patientName,
      temperature: vital.temperature.toString(),
      systolic: vital.bloodPressure.systolic.toString(),
      diastolic: vital.bloodPressure.diastolic.toString(),
      heartRate: vital.heartRate.toString(),
      recordedAt: new Date(vital.recordedAt).toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this vital sign record?")) {
      await dispatch(deleteVital(id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vital Signs</h1>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition" 
          onClick={() => { setShowModal(true); setForm(initialForm); setEditId(null); }}
        >
          Add Vitals
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>}

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Temp (°C)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Blood Pressure</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Heart Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : vitals.map((v: VitalSign) => (
              <tr key={v._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{v.patientName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{v.temperature}°C</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{v.bloodPressure.systolic}/{v.bloodPressure.diastolic}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{v.heartRate} bpm</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(v.recordedAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                  <button className="text-blue-600 hover:text-blue-900" onClick={() => handleEdit(v)}>Edit</button>
                  <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(v._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={() => { setShowModal(false); setEditId(null); }}>×</button>
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">{editId ? "Edit Vitals" : "Add Vitals"}</h3>
            {formError && <div className="text-red-600 mb-4 text-sm">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="patientName" value={form.patientName} onChange={handleChange} placeholder="Patient Name" className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700" required />
              <input name="temperature" value={form.temperature} onChange={handleChange} placeholder="Temperature (°C)" type="number" step="0.1" className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700" required />
              <div className="grid grid-cols-2 gap-4">
                <input name="systolic" value={form.systolic} onChange={handleChange} placeholder="Systolic BP" type="number" className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700" required />
                <input name="diastolic" value={form.diastolic} onChange={handleChange} placeholder="Diastolic BP" type="number" className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700" required />
              </div>
              <input name="heartRate" value={form.heartRate} onChange={handleChange} placeholder="Heart Rate (bpm)" type="number" className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700" required />
              <input name="recordedAt" value={form.recordedAt} onChange={handleChange} type="date" className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700" required />
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">{editId ? "Update" : "Add"} Vitals</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VitalsPage;