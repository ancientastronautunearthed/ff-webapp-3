import React, { useEffect } from 'react';
import DoctorDashboard from '@/pages/DoctorDashboard';

export default function DoctorDemo() {
  useEffect(() => {
    // Set demo doctor role only if not already set
    if (localStorage.getItem('demoDoctor') !== 'true') {
      localStorage.setItem('userRole', 'doctor');
      localStorage.setItem('demoDoctor', 'true');
    }
  }, []);

  return <DoctorDashboard />;
}