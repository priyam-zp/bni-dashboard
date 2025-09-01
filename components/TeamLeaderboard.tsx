// components/TeamLeaderboard.tsx
import React from "react";
import { Trophy } from "lucide-react";
import { TeamData, Team } from "../utils/teamUtils";

interface TeamLeaderboardProps {
  teams: TeamData;
}

export default function TeamLeaderboard({ teams }: TeamLeaderboardProps) {
  // Convert team object → array & sort by total points
  const sortedTeams = Object.entries(teams).sort(
    (a, b) => b[1].totalPoints - a[1].totalPoints
  );

  // Check bonus achievements for display
  const getTeamBonuses = (team: Team) => {
    const totals = {
      oneToOnes: team.members.reduce((s, m) => s + (m.stats?.["1-2-1"] || 0), 0),
      referralsInside: team.members.reduce((s, m) => s + (m.stats?.["RGI"] || 0), 0),
      referralsOutside: team.members.reduce((s, m) => s + (m.stats?.["RGO"] || 0), 0),
      visitors: team.members.reduce(
        (s, m) => s + (m.stats?.["RRI"] || 0) + (m.stats?.["RRO"] || 0),
        0
      ),
      inductions: team.members.reduce((s, m) => s + (m.stats?.["I"] || 0), 0),
    };

    const bonuses: string[] = [];
    if (totals.oneToOnes >= 50) bonuses.push("✅ 50 One-to-Ones (+50 pts)");
    if (totals.referralsOutside >= 30 && totals.referralsInside >= 20)
      bonuses.push("✅ 50 Referrals (30 Outside + 20 Inside) (+50 pts)");
    if (totals.visitors >= 10) bonuses.push("✅ 10 Visitors (+50 pts)");
    if (totals.inductions >= 3) bonuses.push("✅ 3 Inductions (+50 pts)");

    return bonuses;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-3xl font-bold text-red-600 flex items-center mb-6">
        <Trophy className="mr-2" /> Team Leaderboard
      </h2>

      <div className="space-y-8">
        {sortedTeams.map(([teamKey, team], index) => {
          const bonuses = getTeamBonuses(team);

          return (
            <div
              key={teamKey}
              className="border rounded-xl p-6 bg-gray-50 shadow-md"
            >
              {/* Team Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800">
                  {index + 1}. {team.name}
                </h3>
                <p className="text-lg text-gray-600">
                  Captain:{" "}
                  <span className="font-semibold text-gray-900">
                    {team.captain}
                  </span>
                </p>
              </div>

              {/* Team Points */}
              <div className="text-xl font-bold text-indigo-700 mb-4">
                Total Points: {team.totalPoints}
              </div>

              {/* Bonus Achievements */}
              {bonuses.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-green-700">
                    Bonus Achievements
                  </h4>
                  <ul className="list-disc list-inside text-green-600">
                    {bonuses.map((bonus, i) => (
                      <li key={i}>{bonus}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Members */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">
                  Members:
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {team.members.map((m, i) => (
                    <li
                      key={i}
                      className="bg-white rounded-lg p-3 shadow-sm flex justify-between"
                    >
                      <span>{m.name}</span>
                      <span className="font-semibold text-indigo-600">
                        {m.points} pts
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
