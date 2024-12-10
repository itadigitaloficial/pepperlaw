import React from 'react';
import { DocumentTextIcon, UserGroupIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';

const stats = [
  { name: 'Contratos Totais', stat: '71', icon: DocumentTextIcon },
  { name: 'Clientes Ativos', stat: '42', icon: UserGroupIcon },
  { name: 'Valor Total', stat: 'R$ 405.091', icon: CurrencyDollarIcon },
  { name: 'Tempo Médio', stat: '3.2 dias', icon: ClockIcon },
];

export const Stats: React.FC = () => {
  return (
    <div>
      <h3 className="text-lg leading-6 font-medium text-gray-900">
        Últimos 30 dias
      </h3>
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 rounded-lg overflow-hidden shadow"
          >
            <dt>
              <div className="absolute bg-indigo-500 rounded-md p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};