// src/components/ui/tabs.tsx
'use client';

import React, { useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  variant?: 'line' | 'pills';
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, variant = 'line' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className="w-full">
      <div className={`flex gap-1 ${variant === 'line' ? 'border-b border-gray-200' : ''}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all
              ${variant === 'line' 
                ? activeTab === tab.id
                  ? 'text-gray-900 border-b-2 border-gray-900 -mb-[1px]'
                  : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300 -mb-[1px]'
                : activeTab === tab.id
                  ? 'bg-gray-100 text-gray-900 rounded-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg'
              }`}
          >
            {tab.icon && tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-6">{activeContent}</div>
    </div>
  );
};