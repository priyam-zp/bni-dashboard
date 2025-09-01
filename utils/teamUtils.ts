export interface MemberData {
  attendance: string[];
  lateCount: number;
  visitors: number;
  oneToOnes: number;
  tyfcb: number;
  [key: string]: any; // allow extra PALMS metrics
}

export interface Team {
  name: string;
  data: { [memberName: string]: MemberData };
}

export interface TeamData {
  [teamKey: string]: Team;
}

export const initializeTeams = (): TeamData => ({
  team1: { name: "Team 1", data: {} },
  team2: { name: "Team 2", data: {} },
  team3: { name: "Team 3", data: {} },
  team4: { name: "Team 4", data: {} },
});

export const findMemberInTeams = (
  teams: TeamData,
  memberName: string
): { team: string; member: string } | null => {
  for (const teamKey of Object.keys(teams)) {
    const team = teams[teamKey];
    if (Object.keys(team.data).includes(memberName)) {
      return { team: teamKey, member: memberName };
    }
  }
  return null;
};

export const getTeamLeaderboard = (teams: TeamData) => {
  return Object.keys(teams).map((teamKey) => {
    const team = teams[teamKey];
    const totalPoints = Object.values(team.data).reduce((sum, member) => {
      return (
        sum +
        member.attendance.length * 1 +
        member.lateCount * -0.5 +
        member.visitors * 5 +
        member.oneToOnes * 2 +
        member.tyfcb * 10
      );
    }, 0);

    return {
      team: team.name,
      points: totalPoints,
    };
  });
};

export const getIndividualLeaderboard = (teams: TeamData) => {
  const leaderboard: { member: string; team: string; points: number }[] = [];

  for (const teamKey of Object.keys(teams)) {
    const team = teams[teamKey];
    for (const [memberName, member] of Object.entries(team.data)) {
      const points =
        member.attendance.length * 1 +
        member.lateCount * -0.5 +
        member.visitors * 5 +
        member.oneToOnes * 2 +
        member.tyfcb * 10;

      leaderboard.push({
        member: memberName,
        team: team.name,
        points,
      });
    }
  }

  return leaderboard.sort((a, b) => b.points - a.points);
};
