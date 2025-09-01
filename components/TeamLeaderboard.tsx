import React from 'react';
import { Trophy, Users, Target, UserCheck, Eye } from 'lucide-react';
import { TeamData, getTeamLeaderboard } from '../utils/teamUtils';

interface TeamLeaderboardProps {
  teams: TeamData;
}

const TeamLeaderboard: React.FC<TeamLeaderboardProps> = ({ teams }) => {
  const leaderboard = getTeamLeaderboard(teams);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Trophy className="w-7 h-7 mr-3 text-yellow-500" />
        Team Leaderboard
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Rank</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Team</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Captain</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((team, index) => (
              <tr
                key={team.teamKey}
                className={`border-b last:border-none ${
                  index < 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-sm font-bold text-gray-800">{index + 1}</td>
                <td className="px-4 py-3 text-sm font-medium flex items-center" style={{ color: team.color }}>
                  <Users className="w-5 h-5 mr-2" />
                  {team.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 flex items-center">
                  <UserCheck className="w-4 h-4 mr-2 text-green-600" />
                  {team.captain}
                </td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-800">
                  {team.totalScore}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamLeaderboard;
