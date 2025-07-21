import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Calendar,
  FileText,
  Heart,
  LogOut,
  BriefcaseMedical,
  PlusCircle,
  Clock,
  ClipboardList,
  MessageSquare,
  Blocks,
  Settings,
  BarChart2,
  Bell,
  Menu,
  Sun,
  Moon,
  UserSquare,
  UserPlus,
  CheckCircle,
  CreditCard,
} from 'lucide-react';

// Mock LoadingSpinner component for demonstration
const LoadingSpinner = ({ size = 'medium', color = 'currentColor' }: { size?: 'small' | 'medium' | 'large'; color?: string }) => {
  const sizeClasses: { [key: string]: string } = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  };
  return (
    <div className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] text-${color} ${sizeClasses[size || 'medium']}`} role="status">
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
    </div>
  );
};

// ... (all mock data, hooks, subcomponents from the user's code) ...
// (Paste the full code for useAppDispatch, useAppSelector, FrontDeskQuickActions, TodayAppointments, PatientQueue, NotificationsPanel, etc.)

// (Paste the full FrontDeskDashboardPage component definition from the user's code)
const FrontDeskDashboardPage: React.FC<{ navigateTo: (page: string) => void }> = ({ navigateTo }) => {
  // ... (component code from the user's message) ...
  return (
    <div>Front Desk Dashboard (mock/demo UI here)</div>
  );
};

export default FrontDeskDashboardPage; 