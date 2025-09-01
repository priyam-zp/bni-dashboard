import React, { useState } from "react";
import { Upload } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { TeamData } from "../utils/teamUtils";
import { updateMemberFromRow } from "../utils/fileUtils";

interface FileUploadProps {
  teams: TeamData;
  onDataUpdate: (newTeams: TeamData) => void;
  onStatusUpdate: (message: string, type: "success" | "error") => void;
}

export default function FileUpload({
  teams,
  onDataUpdate,
  onStatusUpdate,
}: FileUploadProps) {
  const [fileName, setFileName] = useState<string>("");

  // ✅ Parse CSV using PapaParse
  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        processRows(result.data as Record<string, string>[]);
      },
      error: () => {
        onStatusUpdate("❌ Failed to parse CSV file", "error");
      },
    });
  };

  // ✅ Parse Excel using xlsx
  const parseExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const binary = event.target?.result;
      if (!binary) return;

      const workbook = XLSX.read(binary, { type: "binary", cellDates: true });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<Record<string, string>>(firstSheet, {
        defval: "",
      });

      processRows(data);
    };
    reader.readAsBinaryString(file);
  };

  // ✅ Process rows and update team data
  const processRows = (rows: Record<string, string>[]) => {
    if (!rows.length) {
      onStatusUpdate("⚠️ No data found in file", "error");
      return;
    }

    const headers = Object.keys(rows[0]);
    const updatedTeams: TeamData = { ...teams };

    rows.forEach((row) => {
      const memberName =
        row["Member Name"] ||
        row["Participant Name"] ||
        row["Name"] ||
        row["member"] ||
        "";

      if (!memberName.trim()) return;

      // Loop through teams and update if member exists
      let found = false;
      Object.keys(updatedTeams).forEach((teamKey) => {
        if (updatedTeams[teamKey].data[memberName]) {
          updateMemberFromRow(updatedTeams[teamKey].data[memberName], row, headers);
          found = true;
        }
      });

      if (!found) {
        console.warn(`⚠️ Member not found in teams: ${memberName}`);
      }
    });

    onDataUpdate(updatedTeams);
    onStatusUpdate("✅ File processed successfully", "success");
  };

  // ✅ Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    if (file.type === "text/csv") {
      parseCSV(file);
    } else if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel" ||
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls")
    ) {
      parseExcel(file);
    } else {
      onStatusUpdate("❌ Unsupported file format", "error");
    }
  };

  return (
    <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl text-center">
      <label className="cursor-pointer flex flex-col items-center space-y-3">
        <Upload className="h-10 w-10 text-red-500" />
        <span className="text-lg font-semibold text-gray-700">
          Upload PALMS Report
        </span>
        <span className="text-sm text-gray-500">
          Supported: <strong>CSV, XLSX, XLS</strong>
        </span>
        <input
          type="file"
          accept=".csv, .xlsx, .xls"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>

      {fileName && (
        <p className="mt-3 text-sm text-gray-600">📂 {fileName} uploaded</p>
      )}

      {/* File format guide */}
      <div className="mt-6 text-left text-sm bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">
          📋 Supported File Formats
        </h3>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>CSV: Comma-separated values with headers</li>
          <li>Excel: .xlsx and .xls files (first sheet will be processed)</li>
          <li>
            Required columns: <strong>Member name / Participant name</strong>
          </li>
          <li>
            Recognized data:{" "}
            <strong>
              P / Present, A / Absent, L / Late, RGI / RGO, V / Visitors,
              1-2-1, TYFCB
            </strong>
          </li>
        </ul>
      </div>
    </div>
  );
}
