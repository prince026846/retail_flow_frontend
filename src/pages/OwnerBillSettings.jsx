import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import OwnerShopSettings from '../components/OwnerShopSettings';

const OwnerBillSettings = () => {
  return (
    <DashboardLayout role="owner" pageTitle="Bill Settings">
      <div className="max-w-3xl mx-auto">
        <OwnerShopSettings />
      </div>
    </DashboardLayout>
  );
};

export default OwnerBillSettings;
