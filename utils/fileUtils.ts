// utils/fileUtils.ts
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { TeamData } from "./teamUtils";

// Scoring constants
const SCORING = {
  oneToOne: 10,
  referralInside: 5,
  referralOutside: 10,
  visitorRegular: 10,
  visitorOpen: 20,
  induction: 20,
  attendancePresent: 10,
  attendanceSubstitute: 5,
  attendanceAbsent: -5,
  tyfcb2L: 5,
  tyfcb5L: 10,
  tyfcb10L: 20,
  tyfcb50LBonus: 50,
  bonusOneToOne: 50,
  bonusReferrals: 50,
  bonusVisitors: 50,
  bonusInductions: 50,
};

export function parseCSVData(csvText: string): any[] {
  const result = Papa.parse(csvText, { header: true });
  return result.data as any[];
}

export function parseExcelData(file: ArrayBuffer): any[] {
  const workbook = XLSX.read(file, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet);
}

export function updateMemberFromRow(
  teams: TeamData,
  row: any
): TeamData {
  let updatedTeams = { ...teams };
  let memberName = `${row["First"] || ""} ${row["Last"] || ""}`.trim();

  // find member
  let foundTeamKey: string | null = null;
  let foundIndex: number | null = null;

  Object.keys(updatedTeams).forEach((teamKey) => {
    updatedTeams[teamKey].members.forEach((m, idx) => {
      if (m.name.toLowerCase() === memberName.toLowerCase()) {
        foundTeamKey = teamKey;
        foundIndex = idx;
      }
    });
  });

  if (!foundTeamKey || foundIndex === null) return updatedTeams;

  let member = updatedTeams[foundTeamKey].members[foundIndex];
  let points = 0;

  // Attendance
  if (row["P"] > 0) points += SCORING.attendancePresent;
  if (row["A"] > 0) points += SCORING.attendanceAbsent;
  if (row["L"] > 0) points += SCORING.attendanceAbsent; // late = -5
  if (row["S"] > 0) points += SCORING.attendanceSubstitute;

  // One to Ones
  if (row["1-2-1"]) points += row["1-2-1"] * SCORING.oneToOne;

  // Referrals
  if (row["RGI"]) points += row["RGI"] * SCORING.referralInside;
  if (row["RGO"]) points += row["RGO"] * SCORING.referralOutside;

  // Visitors
  if (row["RRI"]) points += row["RRI"] * SCORING.visitorRegular;
  if (row["RRO"]) points += row["RRO"] * SCORING.visitorOpen;

  // Inductions
  if (row["I"]) points += row["I"] * SCORING.induction;

  // TYFCB
  if (row["TYFCB"]) {
    const amt = parseFloat(row["TYFCB"]);
    if (amt >= 5000000) {
      points += SCORING.tyfcb50LBonus; // team bonus
      updatedTeams[foundTeamKey].totalPoints += SCORING.tyfcb50LBonus;
    } else if (amt >= 1000000) points += SCORING.tyfcb10L;
    else if (amt >= 500000) points += SCORING.tyfcb5L;
    else if (amt >= 200000) points += SCORING.tyfcb2L;
  }

  // Save stats + points
  member.stats = row;
  member.points += points;
  updatedTeams[foundTeamKey].members[foundIndex] = member;
  updatedTeams[foundTeamKey].totalPoints += points;

  // === AUTO TEAM BONUSES ===
  const team = updatedTeams[foundTeamKey];
  const totals = {
    oneToOnes: team.members.reduce((s, m) => s + (m.stats["1-2-1"] || 0), 0),
    referralsInside: team.members.reduce((s, m) => s + (m.stats["RGI"] || 0), 0),
    referralsOutside: team.members.reduce((s, m) => s + (m.stats["RGO"] || 0), 0),
    visitors: team.members.reduce((s, m) => s + (m.stats["RRI"] || 0) + (m.stats["RRO"] || 0), 0),
    inductions: team.members.reduce((s, m) => s + (m.stats["I"] || 0), 0),
  };

  // 50 One-to-Ones
  if (totals.oneToOnes >= 50) {
    team.totalPoints += SCORING.bonusOneToOne;
  }

  // 50 Referrals (30 outside + 20 inside)
  if (totals.referralsOutside >= 30 && totals.referralsInside >= 20) {
    team.totalPoints += SCORING.bonusReferrals;
  }

  // 10 Visitors
  if (totals.visitors >= 10) {
    team.totalPoints += SCORING.bonusVisitors;
  }

  // 3 Inductions
  if (totals.inductions >= 3) {
    team.totalPoints += SCORING.bonusInductions;
  }

  updatedTeams[foundTeamKey] = team;

  return updatedTeams;
}
