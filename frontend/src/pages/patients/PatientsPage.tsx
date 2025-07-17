import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { fetchPatients, addPatient, deletePatient } from "../../features/patients/patientsSlice";

const initialForm = {
  firstName: "",
  lastName: "",
  nationalId: "",
  phoneNumber: "",
  dateOfBirth: "",
  gender: "male",
};

const PatientsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { patients, loading, error } = useSelector((state: RootState) => state.patients);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.firstName || !form.lastName || !form.nationalId || !form.phoneNumber || !form.dateOfBirth) {
      setFormError("All fields are required");
      return;
    }
    await dispatch(addPatient(form));
    setShowModal(false);
    setForm(initialForm);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this patient?")) {
      await dispatch(deletePatient(id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Patients</h2>
        <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition" onClick={() => setShowModal(true)}>Add Patient</button>
      </div>
      {loading && <div className="text-blue-700 mb-4">Loading...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Name</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">National ID</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Phone</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">DOB</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Gender</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p._id}>
                <td className="px-4 py-2">{p.firstName} {p.lastName}</td>
                <td className="px-4 py-2">{p.nationalId}</td>
                <td className="px-4 py-2">{p.phoneNumber}</td>
                <td className="px-4 py-2">{p.dateOfBirth}</td>
                <td className="px-4 py-2">{p.gender}</td>
                <td className="px-4 py-2">
                  <button className="text-red-600 hover:underline" onClick={() => handleDelete(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <img src="https://images.unsplash.com/photo-1511174511562-5f97f4f4e0c8?auto=format&fit=crop&w=600&q=80" alt="Kenyan healthcare" className="rounded-lg shadow mt-8 w-full max-w-xl mx-auto" />

      {/* Add Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600" onClick={() => setShowModal(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-blue-900">Add Patient</h3>
            {formError && <div className="text-red-600 mb-2">{formError}</div>}
            <form onSubmit={handleAdd} className="space-y-3">
              <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" className="w-full px-3 py-2 border rounded" required />
              <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" className="w-full px-3 py-2 border rounded" required />
              <input name="nationalId" value={form.nationalId} onChange={handleChange} placeholder="National ID" className="w-full px-3 py-2 border rounded" required />
              <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="Phone Number" className="w-full px-3 py-2 border rounded" required />
              <input name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} placeholder="Date of Birth" type="date" className="w-full px-3 py-2 border rounded" required />
              <select name="gender" value={form.gender} onChange={handleChange} className="w-full px-3 py-2 border rounded">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition">Add Patient</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsPage; 