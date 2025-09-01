import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Upload, Trophy, User, Clock } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import TeamLeaderboard from '../components/TeamLeaderboard';
import IndividualLeaderboard from '../components/IndividualLeaderboard';
import LatecomersManagement from '../components/LatecomersManagement';
import { initializeTeams, TeamData } from '../utils/teamUtils';

type TabType = 'team' | 'individual' | 'latecomers';

export default function Home() {
  const [teams, setTeams] = useState<TeamData>(initializeTeams());
  const [activeTab, setActiveTab] = useState<TabType>('team');
  const [uploadStatus, setUploadStatus] = useState<{
    message: string;
    type: 'success' | 'error' | '';
  }>({ message: '', type: '' });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('bni_teams_data');
    if (savedData) {
      try {
        setTeams(JSON.parse(savedData));
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever teams change
  useEffect(() => {
    localStorage.setItem('bni_teams_data', JSON.stringify(teams));
  }, [teams]);

  const handleDataUpdate = (newTeams: TeamData) => {
    setTeams(newTeams);
  };

  const showUploadStatus = (message: string, type: 'success' | 'error') => {
    setUploadStatus({ message, type });
    setTimeout(() => {
      setUploadStatus({ message: '', type: '' });
    }, 5000);
  };

  const resetAllData = () => {
    if (window.confirm('⚠️ This will permanently delete ALL competition data!\n\nAre you absolutely sure?')) {
      const freshTeams = initializeTeams();
      setTeams(freshTeams);
      localStorage.removeItem('bni_teams_data');
      showUploadStatus('✅ All data has been reset', 'success');
    }
  };

  return (
    <>
      <Head>
        <title>BNI PALMS Dashboard</title>
        <meta name="description" content="Comprehensive Competition Tracking & Leaderboards" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-red-600 mb-4">
              🏆 BNI PALMS Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Comprehensive Competition Tracking & Leaderboards
            </p>
          </div>

          {/* File Upload Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Upload className="mr-3" />
              Upload PALMS Report
            </h2>
            <FileUpload 
              teams={teams} 
              onDataUpdate={handleDataUpdate}
              onStatusUpdate={showUploadStatus}
            />
            {uploadStatus.message && (
              <div className={`mt-4 p-4 rounded-lg font-semibold ${
                uploadStatus.type === 'success' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {uploadStatus.message}
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <button
                className={`flex-1 p-6 font-semibold text-lg transition-all duration-300 flex items-center justify-center border-b-4 ${
                  activeTab === 'team'
                    ? 'bg-white text-red-600 border-red-600'
                    : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('team')}
              >
                <Trophy className="mr-2" />
                Team Leaderboard
              </button>
              <button
                className={`flex-1 p-6 font-semibold text-lg transition-all duration-300 flex items-center justify-center border-b-4 ${
                  activeTab === 'individual'
                    ? 'bg-white text-red-600 border-red-600'
                    : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('individual')}
              >
                <User className="mr-2" />
                Individual Leaderboards
              </button>
              <button
                className={`flex-1 p-6 font-semibold text-lg transition-all duration-300 flex items-center justify-center border-b-4 ${
                  activeTab === 'latecomers'
                    ? 'bg-white text-red-600 border-red-600'
                    : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('latecomers')}
              >
                <Clock className="mr-2" />
                Latecomer Management
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'team' && (
            <TeamLeaderboard teams={teams} />
          )}
          
          {activeTab === 'individual' && (
            <IndividualLeaderboard teams={teams} />
          )}
          
          {activeTab === 'latecomers' && (
            <LatecomersManagement 
              teams={teams} 
              onDataUpdate={handleDataUpdate}
              onStatusUpdate={showUploadStatus}
            />
          )}

          {/* Reset Section */}
          <div className="text-center mt-8">
            <button
              onClick={resetAllData}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              🔄 Reset All Competition Data
            </button>
          </div>
        </div>

        {/* Zapform Banner */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-center py-4 font-semibold shadow-lg">
          
            href="https://zapform.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-yellow-200 transition-colors duration-300"
          >
            ⚡ Powered by Zapform - Advanced Form Solutions
          </a>
        </div>
      </div>
    </>
  );
}
