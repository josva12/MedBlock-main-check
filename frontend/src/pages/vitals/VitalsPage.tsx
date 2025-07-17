import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { fetchVitals, addVital, updateVital, deleteVital } from "../../features/vitals/vitalsSlice";
import type { Vital } from "../../features/vitals/vitalsSlice";

const initialForm = {
  patient: "",
  temperature: "",
  bloodPressure: "",
  heartRate: "",
  date: "",
};

type FormType = typeof initialForm;

const VitalsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { vitals, loading, error } = useSelector((state: RootState) => state.vitals);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormType>(initialForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    dispatch(fetchVitals());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.patient || !form.temperature || !form.bloodPressure || !form.heartRate || !form.date) {
      setFormError("All fields are required");
      return;
    }
    await dispatch(addVital({
      ...form,
      temperature: parseFloat(form.temperature),
      heartRate: parseInt(form.heartRate, 10),
    }));
    setShowModal(false);
    setForm(initialForm);
    setEditId(null);
  };

  const handleEdit = (vital: any) => {
    setEditId(vital._id);
    setForm({
      patient: vital.patient,
      temperature: vital.temperature.toString(),
      bloodPressure: vital.bloodPressure,
      heartRate: vital.heartRate.toString(),
      date: vital.date,
    });
    setShowModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.patient || !form.temperature || !form.bloodPressure || !form.heartRate || !form.date) {
      setFormError("All fields are required");
      return;
    }
    if (editId) {
      await dispatch(updateVital({
        id: editId,
        data: {
          ...form,
          temperature: parseFloat(form.temperature),
          heartRate: parseInt(form.heartRate, 10),
        },
      }));
      setShowModal(false);
      setForm(initialForm);
      setEditId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this vital sign record?")) {
      await dispatch(deleteVital(id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Vital Signs</h2>
        <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition" onClick={() => { setShowModal(true); setForm(initialForm); setEditId(null); }}>Add Vitals</button>
      </div>
      {loading && <div className="text-blue-700 mb-4">Loading...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Patient</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Temperature</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">BP</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Heart Rate</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Date</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vitals.map((v: Vital) => (
              <tr key={v._id}>
                <td className="px-4 py-2">{v.patient}</td>
                <td className="px-4 py-2">{v.temperature}°C</td>
                <td className="px-4 py-2">{v.bloodPressure}</td>
                <td className="px-4 py-2">{v.heartRate}</td>
                <td className="px-4 py-2">{v.date}</td>
                <td className="px-4 py-2">
                  <button className="text-green-600 hover:underline mr-2" onClick={() => handleEdit(v)}>Edit</button>
                  <button className="text-red-600 hover:underline" onClick={() => handleDelete(v._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <img src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80" alt="Kenyan healthcare" className="rounded-lg shadow mt-8 w-full max-w-xl mx-auto" />

      {/* Add/Edit Vitals Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600" onClick={() => { setShowModal(false); setEditId(null); }}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-blue-900">{editId ? "Edit Vitals" : "Add Vitals"}</h3>
            {formError && <div className="text-red-600 mb-2">{formError}</div>}
            <form onSubmit={editId ? handleUpdate : handleAdd} className="space-y-3">
              <input name="patient" value={form.patient} onChange={handleChange} placeholder="Patient" className="w-full px-3 py-2 border rounded" required />
              <input name="temperature" value={form.temperature} onChange={handleChange} placeholder="Temperature (°C)" type="number" step="0.1" className="w-full px-3 py-2 border rounded" required />
              <input name="bloodPressure" value={form.bloodPressure} onChange={handleChange} placeholder="Blood Pressure (e.g. 120/80)" className="w-full px-3 py-2 border rounded" required />
              <input name="heartRate" value={form.heartRate} onChange={handleChange} placeholder="Heart Rate" type="number" className="w-full px-3 py-2 border rounded" required />
              <input name="date" value={form.date} onChange={handleChange} placeholder="Date" type="date" className="w-full px-3 py-2 border rounded" required />
              <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition">{editId ? "Update" : "Add"} Vitals</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VitalsPage;
