import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { fetchReports, addReport, deleteReport } from "../../features/reports/reportsSlice";

const initialForm = {
  patient: "",
  type: "",
  description: "",
  date: "",
};

const ReportsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { reports, loading, error } = useSelector((state: RootState) => state.reports);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.patient || !form.type || !form.description || !form.date) {
      setFormError("All fields are required");
      return;
    }
    await dispatch(addReport(form));
    setShowModal(false);
    setForm(initialForm);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this report?")) {
      await dispatch(deleteReport(id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Reports</h2>
        <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition" onClick={() => setShowModal(true)}>Upload Report</button>
      </div>
      {loading && <div className="text-blue-700 mb-4">Loading...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Patient</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Type</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Description</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Date</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r._id}>
                <td className="px-4 py-2">{r.patient}</td>
                <td className="px-4 py-2">{r.type}</td>
                <td className="px-4 py-2">{r.description}</td>
                <td className="px-4 py-2">{r.date}</td>
                <td className="px-4 py-2">
                  <button className="text-red-600 hover:underline" onClick={() => handleDelete(r._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <img src="https://images.unsplash.com/photo-1503457574465-494bba506e52?auto=format&fit=crop&w=600&q=80" alt="Kenyan healthcare" className="rounded-lg shadow mt-8 w-full max-w-xl mx-auto" />

      {/* Add Report Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600" onClick={() => setShowModal(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-blue-900">Upload Report</h3>
            {formError && <div className="text-red-600 mb-2">{formError}</div>}
            <form onSubmit={handleAdd} className="space-y-3">
              <input name="patient" value={form.patient} onChange={handleChange} placeholder="Patient" className="w-full px-3 py-2 border rounded" required />
              <input name="type" value={form.type} onChange={handleChange} placeholder="Type" className="w-full px-3 py-2 border rounded" required />
              <input name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full px-3 py-2 border rounded" required />
              <input name="date" value={form.date} onChange={handleChange} placeholder="Date" type="date" className="w-full px-3 py-2 border rounded" required />
              <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition">Upload Report</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
