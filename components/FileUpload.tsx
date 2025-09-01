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
      // Check file type
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
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

      // Map columns to member data fields
      if (header.includes('present') || header === 'p') {
        memberData.present += numValue;
      }
      else if (header.includes('absent') || header === 'a') {
        memberData.absent += numValue;
      }
      else if (header.includes('late') || header === 'l') {
        memberData.late += numValue;
      }
      else if (header.includes('medical') || header === 'm') {
        memberData.medical += numValue;
      }
      else if (header.includes('substitute') || header === 's') {
        memberData.substitute += numValue;
      }
      else if (header.includes('rgi') || header.includes('referrals given inside') || header.includes('ref given in')) {
        memberData.referralsGivenInside += numValue;
      }
      else if (header.includes('rgo') || header.includes('referrals given outside') || header.includes('ref given out')) {
        memberData.referralsGivenOutside += numValue;
      }
      else if (header.includes('rri') || header.includes('referrals received inside') || header.includes('ref rec in')) {
        memberData.referralsReceivedInside += numValue;
      }
      else if (header.includes('rro') || header.includes('referrals received outside') || header.includes('ref rec out')) {
        memberData.referralsReceivedOutside += numValue;
      }
      else if (header.includes('visitor') || header === 'v' || header.includes('guest')) {
        memberData.visitors += numValue;
      }
      else if (header.includes('1-2-1') || header.includes('121') || header.includes('one') || header.includes('meeting')) {
        memberData.oneToOnes += numValue;
      }
      else if (header.includes('tyfcb') || header.includes('thank you') || header.includes('closed business')) {
        memberData.tyfcb += numValue;
      }
      else if (header.includes('ceu') || header.includes('education') || header.includes('training')) {
        memberData.ceu += numValue;
      }
    }
  };

  const processCsvData = (csvData: string): ProcessingResult => {
    const lines = csvData.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('Invalid file format - no data rows found');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const memberColumn = findColumn(headers, ['name', 'member', 'member name', 'participant']);
    
    if (memberColumn === -1) {
      throw new Error('Member name column not found in file');
    }

    const updatedTeams = { ...teams };
    const result: ProcessingResult = {
      processed: 0,
      matched: 0,
      unmatched: [],
      errors: []
    };

    for (let i = 1; i < lines.length; i++) {
      try {
        const row = lines[i].split(',').map(cell => cell.replace(/"/g, '').trim());
        if (row.length <= memberColumn) continue;

        const memberName = row[memberColumn];
        if (!memberName) continue;

        const { team, member } = findMemberInTeams(updatedTeams, memberName);
        
        if (team && member) {
          updateMemberFromRow(updatedTeams[team].data[member], row, headers);
          result.matched++;
        } else {
          result.unmatched.push
