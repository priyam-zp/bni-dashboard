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

  const updateMemberFro
