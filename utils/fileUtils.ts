/**
 * File processing utilities for BNI Dashboard
 * Handles CSV parsing, Excel conversion, and data validation
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface FileProcessingResult {
  success: boolean;
  data?: any[][];
  headers?: string[];
  error?: string;
  rowCount?: number;
  columnCount?: number;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileType: string;
  fileSize: number;
}

/**
 * Validate uploaded file
 */
export function validateFile(file: File): FileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push('File size exceeds 10MB limit');
  }
  
  // Check file type
  const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  const fileExtension = file.name.toLowerCase().split('.').pop();
  const validExtensions = ['csv', 'xls', 'xlsx'];
  
  if (!validExtensions.includes(fileExtension || '')) {
    errors.push('Invalid file type. Please upload CSV or Excel files only.');
  }
  
  // Check file name
  if (file.name.length > 255) {
    warnings.push('File name is very long and may cause issues');
  }
  
  // Check for special characters
  const specialChars = /[<>:"/\\|?*]/;
  if (specialChars.test(file.name)) {
    warnings.push('File name contains special characters that may cause issues');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fileType: fileExtension || 'unknown',
    fileSize: file.size
  };
}

/**
 * Parse CSV file
 */
export function parseCsvFile(file: File): Promise<FileProcessingResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      delimitersToGuess: [',', '\t', '|', ';'],
      complete: (results) => {
        if (results.errors.length > 0) {
          resolve({
            success: false,
            error: `CSV parsing error: ${results.errors[0].message}`
          });
          return;
        }
        
        const data = results.data as string[][];
        if (data.length === 0) {
          resolve({ success: false, error: 'CSV file is empty' });
          return;
        }
        
        const headers = data[0];
        const rows = data.slice(1);
        
        resolve({
          success: true,
          data: rows,
          headers,
          rowCount: rows.length,
          columnCount: headers.length
        });
      },
      error: (error) => {
        resolve({ success: false, error: `Failed to parse CSV: ${error.message}` });
      }
    });
  });
}

/**
 * Parse Excel file
 */
export function parseExcelFile(file: File): Promise<FileProcessingResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { 
          type: 'binary',
          cellStyles: true,
          cellFormula: true,
          cellDates: true
        });
        
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          resolve({ success: false, error: 'Excel file has no sheets' });
          return;
        }
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          raw: false,
          defval: ''
        }) as string[][];
        
        if (jsonData.length === 0) {
          resolve({ success: false, error: 'Excel sheet is empty' });
          return;
        }
        
        const headers = jsonData[0];
        const rows = jsonData.slice(1);
        
        resolve({
          success: true,
          data: rows,
          headers,
          rowCount: rows.length,
          columnCount: headers.length
        });
        
      } catch (error) {
        resolve({
          success: false,
          error: `Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    };
    
    reader.onerror = () => {
      resolve({ success: false, error: 'Failed to read Excel file' });
    };
    
    reader.readAsBinaryString(file);
  });
}

/**
 * Process uploaded file
 */
export async function processUploadedFile(file: File): Promise<FileProcessingResult> {
  const validation = validateFile(file);
  if (!validation.isValid) {
    return { success: false, error: validation.errors.join(', ') };
  }
  
  try {
    if (validation.fileType === 'csv') {
      return await parseCsvFile(file);
    } else if (['xls', 'xlsx'].includes(validation.fileType)) {
      return await parseExcelFile(file);
    } else {
      return { success: false, error: 'Unsupported file type' };
    }
  } catch (error) {
    return {
      success: false,
      error: `File processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate sample CSV
 */
export function generateSampleCsv(): string {
  const headers = ['Name', 'P', 'A', 'L', 'RGI', 'RGO', 'V', '1-2-1', 'TYFCB'];
  const sampleData = [
    ['Sajid Hasan', '4', '0', '1', '3', '2', '1', '2', '1'],
    ['Prannav Khanna', '5', '0', '0', '2', '1', '0', '1', '0'],
    ['Vijay Gupta', '3', '1', '1', '1', '3', '2', '1', '1'],
    ['Himanshu Sharma', '4', '0', '0', '4', '1', '1', '3', '2'],
    ['Abhinav Gupta', '5', '0', '0', '3', '2', '2', '2', '1']
  ];
  
  return [headers, ...sampleData].map(row => row.join(',')).join('\n');
}
