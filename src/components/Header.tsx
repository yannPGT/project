import React from 'react';
import { Calendar, Shield } from 'lucide-react';
import { MeetingDate } from '../types';

interface HeaderProps {
  meetingDates: MeetingDate[];
  isAdmin: boolean;
  onToggleAdmin: () => void;
}

const Header: React.FC<HeaderProps> = ({ meetingDates, isAdmin, onToggleAdmin }) => {
  const upcomingMeetings = meetingDates
    .filter(meeting => new Date(meeting.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <header className="bg-white shadow-sm">
      {/* Meeting Dates Banner */}
      {upcomingMeetings.length > 0 && (
        <div className="bg-red-600 text-white py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center space-x-8">
              <Calendar className="h-5 w-5 flex-shrink-0" />
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
                {upcomingMeetings.map((meeting, index) => (
                  <span key={index} className="whitespace-nowrap">
                    {meeting.type} {meeting.unit}: {new Date(meeting.date).toLocaleDateString('fr-FR')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-red-600 p-3 rounded-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">EchoGIS1</h1>
              <p className="text-gray-600">Foire aux questions - Personnel GIS 1</p>
            </div>
          </div>
          
          <button
            onClick={onToggleAdmin}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isAdmin
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isAdmin ? 'Mode Admin' : 'Mode Utilisateur'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;