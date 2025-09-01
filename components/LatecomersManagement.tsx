import React, { useState } from 'react';
import { Clock, Save, RotateCcw, Info, Plus, Minus } from 'lucide-react';
import { TeamData } from '../utils/teamUtils';

interface LatecomersManagementProps {
  teams: TeamData;
  onDataUpdate: (teams: TeamData) => void;
  onStatusUpdate: (message: string, type: 'success' | 'error') => void;
}

interface LatecomersData {
  [memberName: string]: {
    till729: number;
    after730: number;
    after800: number;
    team: string;
    teamColor: string;
  };
}

const LatecomersManagement: React.FC<LatecomersManagementProps> = ({
  teams,
  onDataUpdate,
  onStatusUpdate
}) => {
  const [latecomersData, setLatecomersData] = useState<LatecomersData>(() => {
    const data: LatecomersData = {};
    Object.keys(teams).forEach(teamKey => {
      const team = teams[teamKey];
      team.members.forEach(memberName => {
        const memberData = team.data[memberName];
        data[memberName] = {
          till729: memberData.lateArrivals.till729,
          after730: memberData.lateArrivals.after730,
          after800: memberData.lateArrivals.after800,
          team: team.name,
          teamColor: team.color
        };
      });
    });
    return data;
  });

  const handleInputChange = (memberName: string, category: 'till729' | 'after730' | 'after800', value: string) => {
    const numValue = Math.max(0, Math.min(99, parseInt(value) || 0));
    setLatecomersData(prev => ({
      ...prev,
      [memberName]: {
        ...prev[memberName],
        [category]: numValue
      }
    }));
  };

  const incrementValue = (memberName: string, category: 'till729' | 'after730' | 'after800') => {
    const currentValue = latecomersData[memberName][category];
    if (currentValue < 99) {
      handleInputChange(memberName, category, (currentValue + 1).toString());
    }
  };

  const decrementValue = (memberName: string, category: 'till729' | 'after730' | 'after800') => {
    const currentValue = latecomersData[memberName][category];
    if (currentValue > 0) {
      handleInputChange(memberName, category, (currentValue - 1).toString());
    }
  };

  const updateLatecomers = () => {
    const updatedTeams = { ...teams };
    let updatedCount = 0;

    Object.keys(latecomersData).forEach(memberName => {
      Object.keys(updatedTeams).forEach(teamKey => {
        const team = updatedTeams[teamKey];
        if (team.members.includes(memberName)) {
          const data = latecomersData[memberName];
          team.data[memberName].lateArrivals.till729 = data.till729;
          team.data[memberName].lateArrivals.after730 = data.after730;
          team.data[memberName].lateArrivals.after800 = data.after800;
          updatedCount++;
        }
      });
    });

    onDataUpdate(updatedTeams);
    onStatusUpdate(`Successfully updated ${updatedCount} member records`, 'success');
  };

  const clearAllLatecomers = () => {
    const clearedData: LatecomersData = {};
    Object.keys(latecomersData).forEach(memberName => {
      clearedData[memberName] = {
        ...latecomersData[memberName],
        till729: 0,
        after730: 0,
        after800: 0
      };
    });
    setLatecomersData(clearedData);
    onStatusUpdate('All latecomer data cleared', 'success');
  };

  const getTotalPoints = (member: LatecomersData[string]) => {
    return (member.till729 * 10) + (member.after730 * 5) + (member.after800 * -5);
  };

  const groupedMembers = Object.keys(latecomersData).reduce((acc, memberName) => {
    const member = latecomersData[memberName];
    if (!acc[member.team]) {
      acc[member.team] = [];
    }
    acc[member.team].push({ name: memberName, data: member });
    return acc;
  }, {} as { [team: string]: { name: string; data: LatecomersData[string] }[] });

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
          <Clock className="mr-3 text-red-600" />
          Manual Latecomer Scoring
        </h2>
        <p className="text-gray-600">Update late arrival counts for accurate scoring</p>
      </div>

      {/* Scoring Guide */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center justify-center">
          <Info className="mr-2" />
          Scoring System
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-100 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-2">+10</div>
            <div className="font-semibold text-green-800">Till 7:29 AM</div>
            <div className="text-sm text-green-700 mt-1">On time arrival</div>
          </div>
          <div className="text-center p-4 bg-yellow-100 rounded-lg border border-yellow-200">
            <div className="text-3xl font-bold text-yellow-600 mb-2">+5</div>
            <div className="font-semibold text-yellow-800">After 7:30 AM</div>
            <div className="text-sm text-yellow-700 mt-1">Slightly late</div>
          </div>
          <div className="text-center p-4 bg-red-100 rounded-lg border border-red-200">
            <div className="text-3xl font-bold text-red-600 mb-2">-5</div>
            <div className="font-semibold text-red-800">After 8:00 AM</div>
            <div className="text-sm text-red-700 mt-1">Significantly late</div>
          </div>
        </div>
      </div>

      {/* Team-wise Member Cards */}
      <div className="space-y-8">
        {Object.keys(groupedMembers).map(teamName => (
          <div key={teamName} className="border rounded-xl p-6 bg-gray-50">
            <h3 
              className="text-xl font-bold mb-4 text-center py-2 px-4 rounded-lg text-white"
              style={{ backgroundColor: groupedMembers[teamName][0]?.data.teamColor }}
            >
              {teamName}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {groupedMembers[teamName].map(({ name: memberName, data: member }) => (
                <div key={memberName} className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  {/* Member Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800 text-lg">{memberName}</h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${
                      getTotalPoints(member) > 0 ? 'bg-green-500' : 
                      getTotalPoints(member) < 0 ? 'bg-red-500' : 'bg-gray-500'
                    }`}>
                      {getTotalPoints(member) > 0 ? '+' : ''}{getTotalPoints(member)} pts
                    </div>
                  </div>

                  {/* Time Input Groups */}
                  <div className="space-y-3">
                    {/* Till 7:29 */}
                    <div className="flex items-center justify-between bg-green-50 rounded-lg p-3 border border-green-200">
                      <label className="text-sm font-medium text-green-800">
                        Till 7:29 AM
                        <div className="text-xs text-green-600">(+10 pts each)</div>
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => decrementValue(memberName, 'till729')}
                          className="w-8 h-8 flex items-center justify-center bg-green-200 hover:bg-green-300 text-green-800 rounded-full transition-colors"
                          disabled={member.till729 <= 0}
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={member.till729}
                          onChange={(e) => handleInputChange(memberName, 'till729', e.target.value)}
                          className="w-16 text-center border-2 border-green-300 rounded-lg py-1 font-semibold text-green-800 focus:border-green-500 focus:outline-none"
                        />
                        <button
                          onClick={() => incrementValue(memberName, 'till729')}
                          className="w-8 h-8 flex items-center justify-center bg-green-200 hover:bg-green-300 text-green-800 rounded-full transition-colors"
                          disabled={member.till729 >= 99}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* After 7:30 */}
                    <div className="flex items-center justify-between bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <label className="text-sm font-medium text-yellow-800">
                        After 7:30 AM
                        <div className="text-xs text-yellow-600">(+5 pts each)</div>
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => decrementValue(memberName, 'after730')}
                          className="w-8 h-8 flex items-center justify-center bg-yellow-200 hover:bg-yellow-300 text-yellow-800 rounded-full transition-colors"
                          disabled={member.after730 <= 0}
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={member.after730}
                          onChange={(e) => handleInputChange(memberName, 'after730', e.target.value)}
                          className="w-16 text-center border-2 border-yellow-300 rounded-lg py-1 font-semibold text-yellow-800 focus:border-yellow-500 focus:outline-none"
                        />
                        <button
                          onClick={() => incrementValue(memberName, 'after730')}
                          className="w-8 h-8 flex items-center justify-center bg-yellow-200 hover:bg-yellow-300 text-yellow-800 rounded-full transition-colors"
                          disabled={member.after730 >= 99}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* After 8:00 */}
                    <div className="flex items-center justify-between bg-red-50 rounded-lg p-3 border border-red-200">
                      <label className="text-sm font-medium text-red-800">
                        After 8:00 AM
                        <div className="text-xs text-red-600">(-5 pts each)</div>
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => decrementValue(memberName, 'after800')}
                          className="w-8 h-8 flex items-center justify-center bg-red-200 hover:bg-red-300 text-red-800 rounded-full transition-colors"
                          disabled={member.after800 <= 0}
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={member.after800}
                          onChange={(e) => handleInputChange(memberName, 'after800', e.target.value)}
                          className="w-16 text-center border-2 border-red-300 rounded-lg py-1 font-semibold text-red-800 focus:border-red-500 focus:outline-none"
                        />
                        <button
                          onClick={() => incrementValue(memberName, 'after800')}
                          className="w-8 h-8 flex items-center justify-center bg-red-200 hover:bg-red-300 text-red-800 rounded-full transition-colors"
                          disabled={member.after800 >= 99}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <button
          onClick={updateLatecomers}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center"
        >
          <Save className="mr-2" size={20} />
          Update Latecomer Scores
        </button>
        
        <button
          onClick={clearAllLatecomers}
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center"
        >
          <RotateCcw className="mr-2" size={20} />
          Clear All Data
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Summary Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {Object.values(latecomersData).reduce((sum, member) => sum + member.till729, 0)}
            </div>
            <div className="text-sm text-gray-600">Till 7:29 AM</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">
              {Object.values(latecomersData).reduce((sum, member) => sum + member.after730, 0)}
            </div>
            <div className="text-sm text-gray-600">After 7:30 AM</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-red-600">
              {Object.values(latecomersData).reduce((sum, member) => sum + member.after800, 0)}
            </div>
            <div className="text-sm text-gray-600">After 8:00 AM</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {Object.values(latecomersData).reduce((sum, member) => sum + getTotalPoints(member), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatecomersManagement;
