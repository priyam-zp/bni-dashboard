// utils/fileUtils.ts
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { TeamData, MemberData, createMember, findMemberInTeams } from "./teamUtils";

/**
 * Map a CSV/Excel row into a member’s data object
 */
export function updateMemberFromRow(
  member: MemberData,
  row: any,
  headers: string[]
) {
  member.present += Number(row["P"] || 0);
  member.absent += Number(row["A"] || 0);
  member.late += Number(row["L"] || 0);
  member.missed += Number(row["M"] || 0);
  member.substitutions += Number(row["S"] || 0);

  member.rgi += Number(row["RGI"] || 0);
  member.rgo += Number(row["RGO"] || 0);
  member.rri += Number(row["RRI"] || 0);
  member.rro += Number(row["RRO"] || 0);

  member.visitors += Number(row["V"] || 0);
  member.oneToOne += Number(row["1-2-1"] || 0);

  member.tyfcb += Number(row["TYFCB"] || 0);
  member.ceu += Number(row["CEU"] || 0);

  member.total += Number(row["T"] || 0);

  return member;
}

/**
 * Parse CSV data into teams
 */
export function parseCSVData(csvText: string, teams: TeamData): TeamData {
  const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  if (!result.data || !Array.isArray(result.data)) return teams;

  const updatedTeams = { ...teams };

  result.data.forEach((row: any) => {
    const firstName = row["First"]?.trim();
    const lastName = row["Last"]?.trim();
    if (!firstName || !lastName) return;

    const memberName = `${firstName} ${lastName}`;
    let found = findMemberInTeams(updatedTeams, memberName);

    if (!found) {
      // Default → put into Team A if not found
      updatedTeams.teamA.data[memberName] = createMember(firstName, lastName);
      found = { team: "teamA", member: memberName };
    }

    if (found) {
      const { team, member } = found;
      updateMemberFromRow(updatedTeams[team].data[member], row, result.meta.fields || []);
    }
  });

  return updatedTeams;
}

/**
 * Parse Excel data into teams
 */
export function parseExcelData(file: ArrayBuffer, teams: TeamData): TeamData {
  const workbook = XLSX.read(file, {
    type: "array",
    cellDates: true,
    cellNF: false,
    cellText: false,
  });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: 0 });

  const updatedTeams = { ...teams };

  jsonData.forEach((row: any) => {
    const firstName = row["First"]?.trim();
    const lastName = row["Last"]?.trim();
    if (!firstName || !lastName) return;

    const memberName = `${firstName} ${lastName}`;
    let found = findMemberInTeams(updatedTeams, memberName);

    if (!found) {
      updatedTeams.teamA.data[memberName] = createMember(firstName, lastName);
      found = { team: "teamA", member: memberName };
    }

    if (found) {
      const { team, member } = found;
      updateMemberFromRow(updatedTeams[team].data[member], row, Object.keys(row));
    }
  });

  return updatedTeams;
}
