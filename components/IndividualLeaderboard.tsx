import React, { useState } from 'react';
import { Medal, Calendar, Target, Users, UserCheck, DollarSign } from 'lucide-react';
import { TeamData, getIndividualLeaderboard } from '../utils/teamUtils';

interface IndividualLeaderboardProps {
  teams: TeamData;
}

const categories = [
  { key: 'attendance', label: 'Attendance', icon: Calendar },
  { key: 'referrals', label: 'Referrals', icon: Target },
  { key: 'visitors', label: 'Visitors', icon: Users },
  { key: 'oneToOnes', label: '1-2-1s', icon: UserCheck },
  { key: 'tyfcb', label: 'TYFCB', icon: DollarSign },
  { key: 'total', label: 'Total Points', icon: Medal }
];

const IndividualLeaderboard: React.FC<IndividualLeaderboardProps> = ({ teams }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('total');

  const leaderboard = getIndividualLeaderboard(teams, selectedCategory).slice(0, 10);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Medal className="w-7 h-7 mr-3 text-yellow-500" />
        Individual Leaderboard
      </h2>

      {/* Category Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
              selectedCategory === key
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon className="w-5 h-5 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Rank</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Member</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Team</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr
                key={index}
                className={`border-b last:border-none ${
                  index < 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-sm font-bold text-gray-800">{index + 1}</td>
                <td className="px-4 py-3 text-sm text-gray-800">{entry.member}</td>
                <td className="px-4 py-3 text-sm font-medium" style={{ color: entry.teamColor }}>
                  {entry.team}
                </td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-800">
                  {entry.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IndividualLeaderboard;
