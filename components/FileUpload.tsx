import React, { useState } from "react";
import { Upload } from "lucide-react";
import { TeamData } from "../utils/teamUtils";
import { parseCSVData, parseExcelData, updateMemberFromRow } from "../utils/fileUtils";

interface FileUploadProps {
  teams: TeamData;
  onDataUpdate: (newTeams: TeamData) => void;
  onStatusUpdate: (message: string, type: "success" | "error") => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ teams, onDataUpdate, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      let updatedTeams: TeamData = { ...teams };

      if (file.name.endsWith(".csv")) {
        updatedTeams = await parseCSVData(file, updatedTeams);
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        updatedTeams = await parseExcelData(file, updatedTeams);
      } else {
        throw new Error("Unsupported file format. Please upload a CSV or Excel file.");
      }

      onDataUpdate(updatedTeams);
      onStatusUpdate("✅ Data uploaded and processed successfully!", "success");
    } catch (error: any) {
      console.error("File processing error:", error);
      onStatusUpdate(`❌ Error processing file: ${error.message}`, "error");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* File input */}
      <div className="flex flex-col items-center">
        <label
          htmlFor="file-upload"
          className="cursor-pointer bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center space-x-2"
        >
          <Upload size={20} />
          <span>{loading ? "Processing..." : "Upload CSV / Excel File"}</span>
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".csv, .xlsx, .xls"
          className="hidden"
          onChange={handleFileUpload}
          disabled={loading}
        />
      </div>

      {/* Supported formats */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">📋 Supported File Formats</h3>
        <ul className="text-gray-700 space-y-1 list-disc list-inside">
          <li><strong>CSV</strong>: Comma-separated values with headers</li>
          <li><strong>Excel</strong>: .xlsx and .xls files (first sheet will be processed)</li>
          <li><strong>Required columns</strong>: Member Name / Participant Name</li>
          <li><strong>Recognized data</strong>:  
            <ul className="list-disc list-inside ml-6">
              <li>P / Present</li>
              <li>A / Absent</li>
              <li>L / Late</li>
              <li>RGI / RGO</li>
              <li>Visitors</li>
              <li>1-2-1 Meetings</li>
              <li>TYFCB (Thank You for Closed Business)</li>
              <li>Other PALMS metrics</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;
