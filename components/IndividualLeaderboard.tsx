import React, { useState } from "react";
import { Medal, Calendar, Target, Users, DollarSign } from "lucide-react";
import { TeamData, getIndividualLeaderboard } from "../utils/teamUtils";

interface IndividualLeaderboardProps {
  teams: TeamData;
}

const categories = [
  { key: "total", label: "Total Score", icon: Medal },
  { key: "P", label: "Present", icon: Users },
  { key: "A", label: "Absent", icon: Calendar },
  { key: "L", label: "Late", icon: Calendar },
  { key: "RGI", label: "RGI", icon: Target },
  { key: "RGO", label: "RGO", icon: Target },
  { key: "V", label: "Visitors", icon: Users },
  { key: "121", label: "1-2-1", icon: Users },
  { key: "TYFCB", label: "TYFCB", icon: DollarSign },
];

export default function IndividualLeaderboard({
  teams,
}: IndividualLeaderboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("total");

  const leaderboard = getIndividualLeaderboard(
    teams,
    selectedCategory
  ).slice(0, 10);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <Medal className="mr-2 text-yellow-500" />
        Individual Leaderboard
      </h2>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`flex items-center px-4 py-2 rounded-lg border transition-all ${
              selectedCategory === key
                ? "bg-red-600 text-white border-red-600"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3">Rank</th>
              <th className="p-3">Name</th>
              <th className="p-3">Team</th>
              <th className="p-3">Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr
                key={index}
                className={`border-b ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="p-3 font-bold">#{index + 1}</td>
                <td className="p-3">{entry.name}</td>
                <td className="p-3">{entry.team}</td>
                <td className="p-3">{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
