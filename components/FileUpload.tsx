import React, { useState, useRef } from 'react';
import { Upload, File, CheckCircle, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { TeamData, findMemberInTeams } from '../utils/teamUtils';

interface FileUploadProps {
  teams: TeamData;
  onDataUpdate: (teams: TeamData) => void;
  onStatusUpdate: (message: string, type: 'success' | 'error') => void;
}

interface ProcessingResult {
  processed: number;
  matched: number;
  unmatched: string[];
  errors: string[];
}

const FileUpload: React.FC<FileUploadProps> = ({ teams, onDataUpdate, onStatusUpdate }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileExtension = file.name.toLowerCase().split('.').pop();
      if (!['csv', 'xls', 'xlsx'].includes(fileExtension || '')) {
        onStatusUpdate('❌ Please select a CSV or Excel file', 'error');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const fileExtension = file.name.toLowerCase().split('.').pop();
      if (!['csv', 'xls', 'xlsx'].includes(fileExtension || '')) {
        onStatusUpdate('❌ Please select a CSV or Excel file', 'error');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const findColumn = (headers: string[], variations: string[]): number => {
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i].toLowerCase().trim();
      for (const variation of variations) {
        if (header.includes(variation.toLowerCase())) {
          return i;
        }
      }
    }
    return -1;
  };

  const updateMemberFromRow = (memberData: any, row: string[], headers: string[]) => {
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i].toLowerCase().trim();
      const value = row[i] ? row[i].trim() : '';
      if (!value || value === '0') continue;
      const numValue = parseInt(value) || 0;

      if (header.includes('present') || header === 'p') {
        memberData.present += numValue;
      } else if (header.includes('absent') || header === 'a') {
        memberData.absent += numValue;
      } else if (header.includes('late') || header === 'l') {
        memberData.late += numValue;
      } else if (header.includes('medical') || header === 'm') {
        memberData.medical += numValue;
      } else if (header.includes('substitute') || header === 's') {
        memberData.substitute += numValue;
      } else if (header.includes('rgi') || header.includes('referrals given inside')) {
        memberData.referralsGivenInside += numValue;
      } else if (header.includes('rgo') || header.includes('referrals given outside')) {
        memberData.referralsGivenOutside += numValue;
      } else if (header.includes('rri') || header.includes('referrals received inside')) {
        memberData.referralsReceivedInside += numValue;
      } else if (header.includes('rro') || header.includes('referrals received outside')) {
        memberData.referralsReceivedOutside += numValue;
      } else if (header.includes('visitor') || header === 'v' || header.includes('guest')) {
        memberData.visitors += numValue;
      } else if (header.includes('1-2-1') || header.includes('121') || header.includes('one')) {
        memberData.oneToOnes += numValue;
      } else if (header.includes('tyfcb') || header.includes('thank you') || header.includes('closed business')) {
        memberData.tyfcb += numValue;
      } else if (header.includes('ceu') || header.includes('education') || header.includes('training')) {
        memberData.ceu += numValue;
      }
    }
  };

  const processCsvData = (csvData: string): ProcessingResult => {
    const lines = csvData.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('Invalid file format - no data rows found');

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const memberColumn = findColumn(headers, ['name', 'member', 'member name', 'participant']);
    if (memberColumn === -1) throw new Error('Member name column not found in file');

    const updatedTeams = { ...teams };
    const result: ProcessingResult = { processed: 0, matched: 0, unmatched: [], errors: [] };

    for (let i = 1; i < lines.length; i++) {
      try {
        const row = lines[i].split(',').map(cell => cell.replace(/"/g, '').trim());
        if (row.length <= memberColumn) continue;
        const memberName = row[memberColumn];
        if (!memberName) continue;

        const found = findMemberInTeams(updatedTeams, memberName);
        if (found) {
          const { team, member } = found;
          updateMemberFromRow(updatedTeams[team].data[member], row, headers);
          result.matched++;
        } else {
          result.unmatched.push(memberName);
        }
        result.processed++;
      } catch (rowError) {
        result.errors.push(`Row ${i + 1}: ${rowError}`);
      }
    }

    onDataUpdate(updatedTeams);
    return result;
  };

  const processExcelData = (file: File): Promise<ProcessingResult> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          if (!sheetName) {
            resolve({ processed: 0, matched: 0, unmatched: [], errors: ['Excel file has no sheets'] });
            return;
          }
          const worksheet = workbook.Sheets[sheetName];
          const csvData = XLSX.utils.sheet_to_csv(worksheet);
          const result = processCsvData(csvData);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read Excel file'));
      reader.readAsBinaryString(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      onStatusUpdate('Please select a file first', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      let result: ProcessingResult;
      if (selectedFile.name.toLowerCase().endsWith('.csv')) {
        const csvData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('Failed to read CSV file'));
          reader.readAsText(selectedFile);
        });
        result = processCsvData(csvData);
      } else {
        result = await processExcelData(selectedFile);
      }
      let message = `✅ Success! Processed ${result.processed} rows, matched ${result.matched} members`;
      if (result.unmatched.length > 0) {
        message += `\n⚠️ Unmatched members: ${result.unmatched.join(', ')}`;
      }
      if (result.errors.length > 0) {
        message += `\n❌ Errors: ${result.errors.slice(0, 3).join(', ')}${result.errors.length > 3 ? '...' : ''}`;
      }
      onStatusUpdate(message, result.matched > 0 ? 'success' : 'error');
    } catch (error) {
      console.error('File processing error:', error);
      onStatusUpdate(`❌ Error processing file: ${error}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          selectedFile 
            ? 'border-green-400 bg-green-50' 
            : 'border-gray-300 bg-gray-50 hover:border-red-400 hover:bg-red-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
        />
        {selectedFile ? (
          <div className="flex items-center justify-center space-x-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
            <div className="text-left">
              <p className="font-semibold text-gray-800">{selectedFile.name}</p>
              <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-16 h-16 text-gray-400 mx-auto" />
            <div>
              <p className="text-xl font-semibold text-gray-700 mb-2">Drop your PALMS file here</p>
              <p className="text-gray-500 mb-4">Supports CSV, XLSX, and XLS files</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300"
              >
                📁 Browse Files
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Button */}
      {selectedFile && (
        <div className="flex justify-center">
          <button
            onClick={handleUpload}
            disabled={isProcessing}
            className={`font-semibold px-8 py-4 rounded-lg transition-all duration-300 transform hover:-translate-y-1 ${
              isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>⏳ Processing...</span>
              </div>
            ) : (
              '⬆️ Upload & Process File'
            )}
          </button>
        </div>
      )}

      {/* File Format Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">📋 Supported File Formats</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• <strong>CSV:</strong> Comma-separated values with headers</p>
          <p>• <strong>Excel:</strong> .xlsx and .xls files (first sheet will be processed)</p>
          <p>• <strong>Required columns:</strong> Member name/participant name</p>
          <p>• <strong>Recognized data:</strong> P/Present, A/Absent, L/Late, RGI/RGO, V/Visitors, 1-2-1, TYFCB, etc.</p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
