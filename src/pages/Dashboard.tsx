import React from 'react';
import { Header } from '../components/dashboard/Header';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Stats } from '../components/dashboard/Stats';
import { RecentContracts } from '../components/dashboard/RecentContracts';

export const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="md:pl-64 flex flex-col flex-1">
        <Header />
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Stats />
              <RecentContracts />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};