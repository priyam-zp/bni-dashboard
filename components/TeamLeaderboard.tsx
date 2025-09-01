import React from 'react';
import { Trophy, Users, Target, Handshake, Eye } from 'lucide-react';
import { TeamData, getTeamLeaderboard } from '../utils/teamUtils';

interface TeamLeaderboardProps {
  teams: TeamData;
}

const TeamLeaderboard: React.FC<TeamLeaderboardProps> = ({ teams }) => {
  const leaderboard = getTeamLeaderboard(teams);

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'ring-4 ring-yellow-400 ring-opacity-50 shadow-2xl transform scale-105';
      case 2: return 'ring-4 ring-gray-400 ring-opacity-50 shadow-xl';
      case 3: return 'ring-4 ring-yellow-600 ring-opacity-50 shadow-xl';
      default: return 'shadow-lg';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
          <Trophy className="mr-3 text-red-600" />
          Team Competition Standings
        </h2>
        <p className="text-gray-600">Current team rankings and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leaderboard.map((team, index) => (
          <div
            key={team.teamKey}
            className={`relative rounded-xl p-6 text-white transition-all duration-300 hover:transform hover:-translate-y-2 ${getRankStyle(index + 1)}`}
            style={{ background: team.color }}
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
            
            {/* Content */}
            <div className="relative z-10">
              {/* Rank and Score */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl font-bold">
                  {getRankEmoji(index + 1)} #{index + 1}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{team.totalScore}</div>
                  <div className="text-sm opacity-90">points</div>
                </div>
              </div>

              {/* Team Info */}
              <div className="mb-4">
                <h3 className="text-2xl font-bold mb-1">{team.name}</h3>
                <p className="text-sm opacity-90">Captain: {team.captain}</p>
              </div>

              {/* Score Breakdown */}
              <div className="mb-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Individual Points:</span>
                  <span className="font-semibold">{team.individualPoints}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bonus Points:</span>
                  <span className="font-semibold">{team.bonusPoints}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-4 h-4 mr-1" />
                  </div>
                  <div className="text-lg font-bold">{team.stats.totalPresent}</div>
                  <div className="text-xs opacity-90">Present</div>
                </div>

                <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
                  <div className="flex items-center justify-center mb-1">
                    <Target className="w-4 h-4 mr-1" />
                  </div>
                  <div className="text-lg font-bold">{team.stats.totalReferralsGiven}</div>
                  <div className="text-xs opacity-90">Referrals</div>
                </div>

                <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
                  <div className="flex items-center justify-center mb-1">
                    <Eye className="w-4 h-4 mr-1" />
                  </div>
                  <div className="text-lg font-bold">{team.stats.totalVisitors}</div>
                  <div className="text-xs opacity-90">Visitors</div>
                </div>

                <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
                  <div className="flex items-center justify-center mb-1">
                    <Handshake className="w-4 h-4 mr-1" />
                  </div>
                  <div className="text-lg font-bold">{team.stats.totalOneToOnes}</div>
                  <div className="text-xs opacity-90">1-2-1s</div>
                </div>
              </div>

              {/* TYFCB Special Metric */}
              <div className="mt-4 text-center">
                <div className="bg-white/20 rounded-lg p-2 backdrop-blur-sm">
                  <div className="text-sm font-semibold">{team.stats.totalTyfcb} TYFCB</div>
                  <div className="text-xs opacity-90">Thank You For Closed Business</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bonus Information */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-800 mb-4 text-center">Team Bonus System</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <div className="font-bold text-blue-600">+100 pts</div>
            <div className="text-gray-700">50+ One-to-Ones</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <div className="font-bold text-blue-600">+100 pts</div>
            <div className="text-gray-700">50+ Referrals</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <div className="font-bold text-blue-600">+100 pts</div>
            <div className="text-gray-700">20+ Visitors</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <div className="font-bold text-blue-600">+150 pts</div>
            <div className="text-gray-700">10+ TYFCB</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamLeaderboard;
