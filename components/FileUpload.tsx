import React, { useRef } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Upload } from "lucide-react";
import { TeamData } from "../utils/teamUtils";
import { updateMemberFromRow } from "../utils/fileUtils";

interface FileUploadProps {
  teams: TeamData;
  onDataUpdate: (teams: TeamData) => void;
  onStatusUpdate: (message: string, type: "success" | "error") => void;
}

export default function FileUpload({ teams, onDataUpdate, onStatusUpdate }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();

    try {
      if (fileName.endsWith(".csv")) {
        parseCSV(file);
      } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        parseExcel(file);
      } else {
        onStatusUpdate("❌ Unsupported file format. Please upload CSV or Excel.", "error");
      }
    } catch (err) {
      console.error(err);
      onStatusUpdate("❌ Error processing file", "error");
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<any>) => {
        processRows(results.data);
      },
      error: (err) => {
        console.error(err);
        onStatusUpdate("❌ Failed to parse CSV", "error");
      }
    });
  };

  const parseExcel = async (file: File) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    processRows(jsonData);
  };

  const processRows = (rows: any[]) => {
    const updatedTeams = { ...teams };

    rows.forEach((row) => {
      const first = row["First"]?.toString().trim();
      const last = row["Last"]?.toString().trim();
      const memberName = [first, last].filter(Boolean).join(" ").trim();

      if (!memberName) return; // skip empty rows

      // Find the member inside teams
      let foundTeamKey: string | null = null;
      let foundMember: string | null = null;

      Object.keys(updatedTeams).forEach((teamKey) => {
        if (updatedTeams[teamKey].members.includes(memberName)) {
          foundTeamKey = teamKey;
          foundMember = memberName;
        }
      });

      if (foundTeamKey && foundMember) {
        updateMemberFromRow(updatedTeams[foundTeamKey].data[foundMember], row, Object.keys(row));
      } else {
        console.warn(`⚠️ Member "${memberName}" not found in any team.`);
      }
    });

    onDataUpdate(updatedTeams);
    onStatusUpdate("✅ File uploaded and processed successfully", "success");
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileUpload}
        ref={fileInputRef}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 flex items-center"
      >
        <Upload className="mr-2" />
        Upload File
      </button>
    </div>
  );
}
