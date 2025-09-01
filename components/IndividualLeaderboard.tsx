import React, { useState } from 'react';
import { Medal, Calendar, Target, Users, Handshake, DollarSign } from 'lucide-react';
import { TeamData, getIndividualLeaderboard } from '../utils/teamUtils';

interface IndividualLeaderboardProps {
  teams: TeamData;
}

type CategoryType = 'total' | 'attendance' | 'referrals' | 'visitors' | 'oneToOnes' | 'tyfcb';

const IndividualLeaderboard: React.FC<IndividualLeaderboardProps> = ({ teams }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('total');

  const categories = [
    { key: 'total', name: 'Overall', icon: Medal, description: 'Total Points' },
    { key: 'attendance', name: 'Attendance', icon: Calendar, description: 'Attendance Points' },
    { key: 'referrals', name: 'Referrals', icon: Target, description: 'Referral Points' },
    { key: 'visitors', name: 'Visitors', icon: Users, description: 'Visitor Points' },
    { key: 'oneToOnes', name: '1-2-1s', icon: Handshake, description: 'One-to-One Points' },
    { key: 'tyfcb', name: 'TYFCB', icon: DollarSign, description: 'TYFCB Points' }
  ];

  const leaderboard = getIndividualLeaderboard(teams, activeCategory);
  const activeTab = categories.find(cat => cat.key === activeCategory);

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-400';
      case 3: return 'text-yellow-600';
      default: return 'text-gray-500';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';  
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
          <Medal className="mr-3 text-red-600" />
          Individual Category Leaders
        </h2>
        <p className="text-gray-600">Top performers in each category</p>
      </div>

      {/* Category Tabs */}
      <div className="bg-gray-100 rounded-xl p-2 mb-8 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key as CategoryType)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeCategory === category.key
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <IconComponent size={18} />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Category Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          {activeTab?.description} Leaderboard
        </h3>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="px-6 py-4 text-left font-semibold">Rank</th>
              <th className="px-6 py-4 text-left font-semibold">Member</th>
              <th className="px-6 py-4 text-left font-semibold">Team</th>
              <th className="px-6 py-4 text-center font-semibold">Points</th>
              <th className="px-6 py-4 text-center font-semibold">Count</th>
              <th className="px-6 py-4 text-center font-semibold">Total Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((member, index) => (
              <tr
                key={`${member.member}-${member.team}`}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
              >
                {/* Rank */}
                <td className="px-6 py-4">
                  <div className={`text-xl font-bold text-center ${getRankStyle(index + 1)}`}>
                    {getRankIcon(index + 1)}
                  </div>
                </td>

                {/* Member Name */}
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-800 text-lg">
                    {member.member}
                  </div>
                </td>

                {/* Team */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className="text-gray-700 mr-2">{member.team}</span>
                    <span
                      className="inline-block px-3 py-1 text-xs font-semibold text-white rounded-full"
                      style={{ backgroundColor: member.teamColor }}
                    >
                      {member.team}
                    </span>
                  </div>
                </td>

                {/* Category Points */}
                <td className="px-6 py-4 text-center">
                  <div className="text-xl font-bold text-green-600">
                    {member.points}
                  </div>
                </td>

                {/* Count */}
                <td className="px-6 py-4 text-center">
                  <div className="text-lg text-gray-600">
                    {member.count}
                  </div>
                </td>

                {/* Total Points */}
                <td className="px-6 py-4 text-center">
                  <div className="text-lg font-semibold text-gray-700">
                    {member.totalPoints}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {leaderboard.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Medal size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No data available for this category</p>
            <p className="text-sm">Upload a PALMS report to see the leaderboard</p>
          </div>
        )}
      </div>

      {/* Scoring Information */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-800 mb-4 text-center">Scoring System</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-700">Attendance</h4>
            <div className="space-y-1 text-blue-600">
              <div>Present: +10 pts</div>
              <div>Substitute: +5 pts</div>
              <div>Absent/Late: -5 pts</div>
              <div>Medical: 0 pts</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-700">Referrals & Networking</h4>
            <div className="space-y-1 text-blue-600">
              <div>Referral Given (Inside): +5 pts</div>
              <div>Referral Given (Outside): +10 pts</div>
              <div>Visitor: +15 pts</div>
              <div>One-to-One: +10 pts</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-700">Business & Education</h4>
            <div className="space-y-1 text-blue-600">
              <div>TYFCB: +10 pts</div>
              <div>CEU: +5 pts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualLeaderboard;
