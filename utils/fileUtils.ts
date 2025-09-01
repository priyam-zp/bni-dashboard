import Papa from "papaparse";
import * as XLSX from "xlsx";
import { TeamData, findMemberInTeams } from "./teamUtils";

// ✅ Update a single member’s data from a row
export const updateMemberFromRow = (
  member: any,
  row: any,
  headers: string[]
) => {
  headers.forEach((header) => {
    const value = row[header]?.toString().trim().toLowerCase();
    if (!value) return;

    switch (header.toLowerCase()) {
      case "member name":
      case "participant name":
        break;
      case "p":
      case "present":
        if (value === "p" || value === "present") {
          member.attendance.push("P");
        }
        break;
      case "a":
      case "absent":
        if (value === "a" || value === "absent") {
          member.attendance.push("A");
        }
        break;
      case "l":
      case "late":
        if (value === "l" || value === "late") {
          member.attendance.push("L");
          member.lateCount += 1;
        }
        break;
      case "visitors":
        member.visitors += Number(value) || 0;
        break;
      case "1-2-1":
      case "one-to-one":
        member.oneToOnes += Number(value) || 0;
        break;
      case "tyfcb":
        member.tyfcb += Number(value) || 0;
        break;
      case "rgi":
      case "rgo":
        member.attendance.push(value.toUpperCase());
        break;
      default:
        member[header] = value;
        break;
    }
  });
};

// ✅ Parse CSV data
export const parseCSVData = (
  file: File,
  teams: TeamData
): Promise<TeamData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const headers = results.meta.fields || [];
          const updatedTeams = { ...teams };

          results.data.forEach((row: any) => {
            const memberName = row["Member Name"] || row["Participant Name"];
            if (!memberName) return;

            const found = findMemberInTeams(updatedTeams, memberName);
            if (found) {
              updateMemberFromRow(
                updatedTeams[found.team].data[found.member],
                row,
                headers
              );
            }
          });

          resolve(updatedTeams);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err),
    });
  });
};

// ✅ Parse Excel data
export const parseExcelData = async (
  file: File,
  teams: TeamData
): Promise<TeamData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, {
          type: "array",
          cellStyles: true,
          cellFormula: true, // ✅ FIXED
          cellDates: true,
        });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        const headers = Object.keys(jsonData[0] || {});
        const updatedTeams = { ...teams };

        jsonData.forEach((row: any) => {
          const memberName = row["Member Name"] || row["Participant Name"];
          if (!memberName) return;

          const found = findMemberInTeams(updatedTeams, memberName);
          if (found) {
            updateMemberFromRow(
              updatedTeams[found.team].data[found.member],
              row,
              headers
            );
          }
        });

        resolve(updatedTeams);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
