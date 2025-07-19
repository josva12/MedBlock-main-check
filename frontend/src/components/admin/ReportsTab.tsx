import React, { useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchReports } from '../../features/admin/adminSlice';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Calendar,
  MapPin,
  Activity,
  Download
} from 'lucide-react';

const ReportsTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const { reports, loading } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  const handleExportReport = (type: string) => {
    // Implementation for exporting reports
    console.log(`Exporting ${type} report`);
  };

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const renderMedicalRecordTrends = () => {
    if (!reports?.medicalRecordTrends?.length) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No medical record trends data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {reports.medicalRecordTrends.map((trend: any, index: number) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{trend._id.type}</p>
              <p className="text-sm text-gray-500">
                {getMonthName(trend._id.month)} {trend._id.year}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-blue-600">{trend.count}</p>
              <p className="text-xs text-gray-500">records</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAppointmentUtilization = () => {
    if (!reports?.appointmentUtilization?.length) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No appointment utilization data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {reports.appointmentUtilization.map((appointment: any, index: number) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{appointment._id.status}</p>
              <p className="text-sm text-gray-500">
                {getMonthName(appointment._id.month)} {appointment._id.year}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-green-600">{appointment.count}</p>
              <p className="text-xs text-gray-500">appointments</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPatientDemographics = () => {
    if (!reports?.patientDemographics) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No patient demographics data available</p>
        </div>
      );
    }

    const { gender, ageGroups, county } = reports.patientDemographics;

    return (
      <div className="space-y-6">
        {/* Gender Distribution */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-3">Gender Distribution</h4>
          <div className="grid grid-cols-2 gap-4">
            {gender.map((item: any, index: number) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{item.count}</p>
                <p className="text-sm text-gray-600 capitalize">{item._id || 'Unknown'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Age Groups */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-3">Age Distribution</h4>
          <div className="space-y-2">
            {ageGroups.map((group: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{group.group} years</span>
                <span className="text-lg font-semibold text-purple-600">{group.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* County Distribution */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-3">County Distribution</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {county.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-900">{item._id}</span>
                </div>
                <span className="text-lg font-semibold text-indigo-600">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Analytics & Reports</h2>
          <p className="text-sm text-gray-600">Comprehensive insights into system usage and patient data</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleExportReport('all')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading reports...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Medical Record Trends */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Medical Record Trends</h3>
              </div>
              <button
                onClick={() => handleExportReport('medical-records')}
                className="text-blue-600 hover:text-blue-800"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
            {renderMedicalRecordTrends()}
          </div>

          {/* Appointment Utilization */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Appointment Utilization</h3>
              </div>
              <button
                onClick={() => handleExportReport('appointments')}
                className="text-green-600 hover:text-green-800"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
            {renderAppointmentUtilization()}
          </div>

          {/* Patient Demographics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Patient Demographics</h3>
              </div>
              <button
                onClick={() => handleExportReport('demographics')}
                className="text-purple-600 hover:text-purple-800"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
            {renderPatientDemographics()}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Data Points</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports ? 
                  (reports.medicalRecordTrends?.length || 0) + 
                  (reports.appointmentUtilization?.length || 0) + 
                  (reports.patientDemographics ? 3 : 0)
                  : 0
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PieChart className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last Updated</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab; 