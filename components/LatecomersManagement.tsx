import React, { useState } from "react";
import { Clock, UserMinus } from "lucide-react";
import { TeamData } from "../utils/teamUtils";

interface LatecomersManagementProps {
  teams: TeamData;
  onDataUpdate: (newTeams: TeamData) => void;
  onStatusUpdate: (message: string, type: "success" | "error") => void;
}

export default function LatecomersManagement({
  teams,
  onDataUpdate,
  onStatusUpdate,
}: LatecomersManagementProps) {
  const [latecomerName, setLatecomerName] = useState("");

  const handleAddLatecomer = () => {
    if (!latecomerName.trim()) {
      onStatusUpdate("❌ Please enter a member name", "error");
      return;
    }

    let found = false;
    const updatedTeams: TeamData = { ...teams };

    // ✅ Search for the member inside all teams
    Object.keys(updatedTeams).forEach((teamKey) => {
      const team = updatedTeams[teamKey];
      if (team.data[latecomerName]) {
        team.data[latecomerName].late =
          (team.data[latecomerName].late || 0) + 1;
        found = true;
      }
    });

    if (!found) {
      onStatusUpdate("⚠️ Member not found in any team", "error");
      return;
    }

    onDataUpdate(updatedTeams);
    setLatecomerName("");
    onStatusUpdate("✅ Latecomer updated successfully", "success");
  };

  // ✅ Collect all members who have late > 0
  const latecomers: { name: string; team: string; late: number }[] = [];
  Object.keys(teams).forEach((teamKey) => {
    const team = teams[teamKey];
    Object.keys(team.data).forEach((memberName) => {
      const member = team.data[memberName];
      if (member.late && member.late > 0) {
        latecomers.push({ name: memberName, team: teamKey, late: member.late });
      }
    });
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Clock className="mr-3 text-red-500" />
        Latecomers Management
      </h2>

      {/* Add Latecomer */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Enter member name"
          value={latecomerName}
          onChange={(e) => setLatecomerName(e.target.value)}
          className="flex-1 border px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
        />
        <button
          onClick={handleAddLatecomer}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition"
        >
          Mark Late
        </button>
      </div>

      {/* Latecomers List */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="px-4 py-2">Member</th>
              <th className="px-4 py-2">Team</th>
              <th className="px-4 py-2">Late Count</th>
            </tr>
          </thead>
          <tbody>
            {latecomers.length > 0 ? (
              latecomers.map((l, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2 flex items-center gap-2">
                    <UserMinus className="h-4 w-4 text-gray-500" />
                    {l.name}
                  </td>
                  <td className="px-4 py-2">{l.team}</td>
                  <td className="px-4 py-2">{l.late}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-4 text-center text-gray-500"
                >
                  🎉 No latecomers recorded yet!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
