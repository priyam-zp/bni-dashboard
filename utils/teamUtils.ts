// utils/teamUtils.ts

export interface MemberData {
  firstName: string;
  lastName: string;

  // Attendance
  present: number;
  absent: number;
  late: number;

  // Meetings
  missed: number;
  substitutions: number;

  // Referrals
  rgi: number; // Referrals Given Inside
  rgo: number; // Referrals Given Outside
  rri: number; // Referrals Received Inside
  rro: number; // Referrals Received Outside

  // Visitors & 1-2-1
  visitors: number;
  oneToOne: number;

  // Business closed
  tyfcb: number; // Thank You For Closed Business (₹)

  // Credits
  ceu: number; // Continuing Education Units

  // Aggregate
  total: number;
}

export interface Team {
  name: string;
  data: { [memberName: string]: MemberData };
}

export interface TeamData {
  [teamKey: string]: Team;
}

/**
 * Create a fresh member with all counters set to 0
 */
export function createMember(firstName: string, lastName: string): MemberData {
  return {
    firstName,
    lastName,
    present: 0,
    absent: 0,
    late: 0,
    missed: 0,
    substitutions: 0,
    rgi: 0,
    rgo: 0,
    rri: 0,
    rro: 0,
    visitors: 0,
    oneToOne: 0,
    tyfcb: 0,
    ceu: 0,
    total: 0,
  };
}

/**
 * Initialize team structure
 */
export function initializeTeams(): TeamData {
  return {
    teamA: { name: "Team A", data: {} },
    teamB: { name: "Team B", data: {} },
    teamC: { name: "Team C", data: {} },
  };
}

/**
 * Find a member inside teams by their name
 */
export function findMemberInTeams(
  teams: TeamData,
  memberName: string
): { team: string; member: string } | null {
  for (const teamKey of Object.keys(teams)) {
    for (const memberKey of Object.keys(teams[teamKey].data)) {
      if (memberKey.toLowerCase() === memberName.toLowerCase()) {
        return { team: teamKey, member: memberKey };
      }
    }
  }
  return null;
}

/**
 * Generate team leaderboard (aggregate totals per team)
 */
export function getTeamLeaderboard(teams: TeamData) {
  return Object.entries(teams).map(([teamKey, team]) => {
    const totalTyfcb = Object.values(team.data).reduce(
      (sum, member) => sum + member.tyfcb,
      0
    );
    const totalReferrals = Object.values(team.data).reduce(
      (sum, member) => sum + member.rgi + member.rgo + member.rri + member.rro,
      0
    );
    const totalVisitors = Object.values(team.data).reduce(
      (sum, member) => sum + member.visitors,
      0
    );

    return {
      team: team.name,
      tyfcb: totalTyfcb,
      referrals: totalReferrals,
      visitors: totalVisitors,
    };
  });
}

/**
 * Generate individual leaderboard
 */
export function getIndividualLeaderboard(teams: TeamData) {
  const leaderboard: {
    name: string;
    team: string;
    tyfcb: number;
    referrals: number;
    visitors: number;
  }[] = [];

  for (const [teamKey, team] of Object.entries(teams)) {
    for (const [memberKey, member] of Object.entries(team.data)) {
      leaderboard.push({
        name: `${member.firstName} ${member.lastName}`,
        team: team.name,
        tyfcb: member.tyfcb,
        referrals: member.rgi + member.rgo + member.rri + member.rro,
        visitors: member.visitors,
      });
    }
  }

  return leaderboard.sort((a, b) => b.tyfcb - a.tyfcb);
}
