import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { fetchAppointments, addAppointment, updateAppointment, deleteAppointment } from "../../features/appointments/appointmentsSlice";
import type { Appointment } from "../../features/appointments/appointmentsSlice";

const initialForm = {
  patient: "",
  doctor: "",
  date: "",
  time: "",
  reason: "",
  status: "Pending",
};

type FormType = typeof initialForm;

const AppointmentsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { appointments, loading, error } = useSelector((state: RootState) => state.appointments);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormType>(initialForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.patient || !form.doctor || !form.date || !form.time || !form.reason) {
      setFormError("All fields are required");
      return;
    }
    await dispatch(addAppointment(form));
    setShowModal(false);
    setForm(initialForm);
    setEditId(null);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditId(appointment._id);
    setForm({
      patient: appointment.patient,
      doctor: appointment.doctor,
      date: appointment.date,
      time: appointment.time,
      reason: appointment.reason,
      status: appointment.status,
    });
    setShowModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.patient || !form.doctor || !form.date || !form.time || !form.reason) {
      setFormError("All fields are required");
      return;
    }
    if (editId) {
      await dispatch(updateAppointment({
        id: editId,
        data: form,
      }));
      setShowModal(false);
      setForm(initialForm);
      setEditId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Cancel this appointment?")) {
      await dispatch(deleteAppointment(id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Appointments</h2>
        <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition" onClick={() => { setShowModal(true); setForm(initialForm); setEditId(null); }}>Book Appointment</button>
      </div>
      {loading && <div className="text-blue-700 mb-4">Loading...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Patient</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Doctor</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Date</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Time</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Reason</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Status</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a: Appointment) => (
              <tr key={a._id}>
                <td className="px-4 py-2">{a.patient}</td>
                <td className="px-4 py-2">{a.doctor}</td>
                <td className="px-4 py-2">{a.date}</td>
                <td className="px-4 py-2">{a.time}</td>
                <td className="px-4 py-2">{a.reason}</td>
                <td className="px-4 py-2">
                  <span className={a.status === "Confirmed" ? "bg-green-100 text-green-800 px-2 py-1 rounded" : "bg-yellow-100 text-yellow-800 px-2 py-1 rounded"}>{a.status}</span>
                </td>
                <td className="px-4 py-2">
                  <button className="text-green-600 hover:underline mr-2" onClick={() => handleEdit(a)}>Edit</button>
                  <button className="text-red-600 hover:underline" onClick={() => handleDelete(a._id)}>Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <img src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80" alt="Kenyan healthcare" className="rounded-lg shadow mt-8 w-full max-w-xl mx-auto" />

      {/* Add/Edit Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600" onClick={() => { setShowModal(false); setEditId(null); }}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-blue-900">{editId ? "Edit Appointment" : "Book Appointment"}</h3>
            {formError && <div className="text-red-600 mb-2">{formError}</div>}
            <form onSubmit={editId ? handleUpdate : handleAdd} className="space-y-3">
              <input name="patient" value={form.patient} onChange={handleChange} placeholder="Patient" className="w-full px-3 py-2 border rounded" required />
              <input name="doctor" value={form.doctor} onChange={handleChange} placeholder="Doctor" className="w-full px-3 py-2 border rounded" required />
              <input name="date" value={form.date} onChange={handleChange} placeholder="Date" type="date" className="w-full px-3 py-2 border rounded" required />
              <input name="time" value={form.time} onChange={handleChange} placeholder="Time" type="time" className="w-full px-3 py-2 border rounded" required />
              <input name="reason" value={form.reason} onChange={handleChange} placeholder="Reason" className="w-full px-3 py-2 border rounded" required />
              <select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 border rounded">
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition">{editId ? "Update" : "Book"} Appointment</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
