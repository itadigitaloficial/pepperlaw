import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/dashboard/Header';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Stats } from '../components/dashboard/Stats';
import { RecentContracts } from '../components/dashboard/RecentContracts';

export const Dashboard: FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link
              to="/editor"
              className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Editor de Contratos
              </h2>
              <p className="text-gray-600">
                Crie e edite contratos usando nosso editor de texto rico
              </p>
            </Link>
            
            <Link
              to="/pdf-editor"
              className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Editor de PDF
              </h2>
              <p className="text-gray-600">
                Adicione campos, assinaturas e anotações em documentos PDF
              </p>
            </Link>
          </div>

          <Stats />
          <RecentContracts />
        </main>
      </div>
    </div>
  );
};