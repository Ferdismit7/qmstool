"use client";

import React, { useState } from 'react';
import { FiUsers, FiCalendar, FiCheckCircle } from 'react-icons/fi';

// Mock data for demonstration
const businessAreas = [
  {
    name: 'Sales',
    trainings: [
      { title: 'ISO:9001 Introduction', date: '2024-01-15', completed: true },
      { title: 'ISO:9001 Documentation', date: '2024-02-10', completed: true },
      { title: 'ISO:9001 Internal Audit', date: '2024-03-05', completed: false },
    ],
  },
  {
    name: 'Operations',
    trainings: [
      { title: 'ISO:9001 Introduction', date: '2024-01-20', completed: true },
      { title: 'ISO:9001 Documentation', date: '2024-02-15', completed: false },
      { title: 'ISO:9001 Internal Audit', date: '2024-03-10', completed: false },
    ],
  },
  {
    name: 'HR',
    trainings: [
      { title: 'ISO:9001 Introduction', date: '2024-01-25', completed: true },
      { title: 'ISO:9001 Documentation', date: '2024-02-20', completed: true },
      { title: 'ISO:9001 Internal Audit', date: '2024-03-15', completed: true },
    ],
  },
];

const getProgress = (trainings: { completed: boolean }[]) => {
  if (!trainings.length) return 0;
  const completed = trainings.filter(t => t.completed).length;
  return Math.round((completed / trainings.length) * 100);
};

export default function BusinessAreaTrainingPage() {
  const [areas] = useState(businessAreas);

  return (
    <div className="w-full px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <FiUsers className="text-brand-primary" size={32} />
        <h1 className="text-3xl font-bold text-brand-white">Business Area Training</h1>
      </div>
      <p className="text-brand-gray2 mb-8">Track ISO:9001 training sessions and progress for each business area.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {areas.map(area => (
          <div key={area.name} className="bg-gray-800/40 backdrop-blur-sm p-6 rounded-lg border border-brand-dark/20 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <FiUsers className="text-brand-primary" size={24} />
              <h2 className="text-lg font-semibold text-brand-white">{area.name}</h2>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-xs text-brand-gray2 mb-1">
                <span>Training Progress</span>
                <span>{getProgress(area.trainings)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div
                  className="bg-brand-primary h-3 rounded-full transition-all"
                  style={{ width: `${getProgress(area.trainings)}%` }}
                ></div>
              </div>
            </div>
            <div className="mb-2">
              <div className="flex items-center gap-2 text-brand-gray2 text-xs mb-1">
                <FiCalendar />
                <span>Training Sessions</span>
              </div>
              <ul className="space-y-1">
                {area.trainings.map((training, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    {training.completed ? (
                      <FiCheckCircle className="text-green-400" />
                    ) : (
                      <span className="inline-block w-4 h-4 rounded-full border-2 border-gray-400"></span>
                    )}
                    <span className="text-brand-white text-sm">{training.title}</span>
                    <span className="text-brand-gray2 text-xs ml-auto">{training.date}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Calendar-based progress bar (simple representation) */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-brand-gray2 mb-1">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
              </div>
              <div className="flex gap-1">
                {['Jan', 'Feb', 'Mar'].map((month, idx) => {
                  const monthTrainings = area.trainings.filter(t => new Date(t.date).getMonth() === idx);
                  const monthCompleted = monthTrainings.every(t => t.completed) && monthTrainings.length > 0;
                  return (
                    <div
                      key={month}
                      className={`flex-1 h-3 rounded-full ${monthCompleted ? 'bg-brand-primary' : 'bg-gray-700'}`}
                    ></div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 