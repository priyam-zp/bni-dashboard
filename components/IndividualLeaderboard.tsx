import React, { useState } from "react";
import { Medal, Calendar, Target, Users, DollarSign } from "lucide-react";
import { TeamData, getIndividualLeaderboard } from "../utils/teamUtils";

interface IndividualLeaderboardProps {
  teams: TeamData;
}

const categories = [
  { key: "total", label: "Total Points", icon: Medal },
  { key: "attendance", label: "Attendance", icon: Calendar },
  { key: "late", label: "Late Count", icon: Target },
  { key: "visitors", label: "Visitors", icon: Users },
  { key: "121", label: "1-to-1s", icon: Target },
  { key: "tyfcb", label: "TYFCB", icon: DollarSign },
];

export default function IndividualLeaderboard({
  teams,
}: IndividualLeaderboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("total");

  // ✅ Call updated teamUtils with category
  const leaderboard = getIndividualLeaderboard(
    teams,
    selectedCategory
  ).slice(0, 10);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Medal className="mr-3 text-yellow-500" />
        Individual Leaderboard
      </h2>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        {categories.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedCategory === key
                ? "bg-red-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setSelectedCategory(key)}
          >
            <Icon className="mr-2 h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="px-4 py-2">Rank</th>
              <th className="px-4 py-2">Member</th>
              <th className="px-4 py-2">Team</th>
              <th className="px-4 py-2">
                {categories.find((c) => c.key === selectedCategory)?.label}
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row, index) => (
              <tr
                key={row.member}
                className={`border-t ${
                  index < 3 ? "bg-yellow-50 font-semibold" : ""
                }`}
              >
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{row.member}</td>
                <td className="px-4 py-2">{row.team}</td>
                <td className="px-4 py-2">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
  