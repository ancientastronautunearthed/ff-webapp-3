import React, { useEffect } from 'react';
import DoctorDashboard from '@/pages/DoctorDashboard';

export default function DoctorDemo() {
  useEffect(() => {
    // Demo functionality removed - redirect to doctor login
    window.location.href = '/doctor-login';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Redirecting to doctor login...</h2>
        <p className="text-gray-600">Please register or sign in with your medical credentials.</p>
      </div>
    </div>
  );
}