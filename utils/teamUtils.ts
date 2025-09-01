export interface MemberData {
  present: number;
  absent: number;
  late: number;
  medical: number;
  substitute: number;
  referralsGivenInside: number;
  referralsGivenOutside: number;
  referralsReceivedInside: number;
  referralsReceivedOutside: number;
  visitors: number;
  oneToOnes: number;
  tyfcb: number;
  ceu: number;
  lateArrivals: {
    till729: number;
    after730: number;
    after800: number;
  };
}

export interface Team {
  name: string;
  captain: string;
  color: string;
  members: string[];
  data: { [memberName: string]: MemberData };
}

export interface TeamData {
  [teamKey: string]: Team;
}

export interface TeamScore {
  teamKey: string;
  name: string;
  captain: string;
  color: string;
  individualPoints: number;
  bonusPoints: number;
  totalScore: number;
  stats: {
    totalPresent: number;
    totalReferralsGiven: number;
    totalVisitors: number;
    totalOneToOnes: number;
    totalTyfcb: number;
  };
}

export interface IndividualScore {
  member: string;
  team: string;
  teamColor: string;
  points: number;
  count: number;
  totalPoints: number;
}

export interface MemberPoints {
  attendance: number;
  referrals: number;
  visitors: number;
  oneToOnes: number;
  tyfcb: number;
  ceu: number;
}

export function initializeTeams(): TeamData {
  const teams: TeamData = {
    team1: {
      name: "Team 1",
      captain: "Himanshu Sharma",
      color: "#d4202a",
      members: [
        "Prannav Khanna", "Paras Aneja", "Munish Seth", "Mannya Katyal",
        "Priyam Kapoor", "Rama Jain", "Himanshu Sharma", "Sajid Hasan"
      ],
      data: {}
    },
    team2: {
      name: "Team 2",
      captain: "Abhinav Gupta", 
      color: "#1f4e79",
      members: [
        "Vijay Gupta", "Kulpreet Ghai", "Himanshu Yadav", "Ritu Jain",
        "Sagar Kapoor", "Manish Jain", "Achal Gupta", "Abhinav Gupta"
      ],
      data: {}
    },
    team3: {
      name: "Team 3",
      captain: "Ayushi Negi",
      color: "#f4b942",
      members: [
        "Praveen Wadhwa", "Gagan Narang", "Rajeev Arya",
        "Akhilesh Pandey", "Rajeev Nayak", "Sumit Singh", "Ayushi Negi"
      ],
      data: {}
    }
  };

  // Initialize member data
  Object.keys(teams).forEach(teamKey => {
    teams[teamKey].members.forEach(member => {
      teams[teamKey].data[member] = {
        present: 0,
        absent: 0,
        late: 0,
        medical: 0,
        substitute: 0,
        referralsGivenInside: 0,
        referralsGivenOutside: 0,
        referralsReceivedInside: 0,
        referralsReceivedOutside: 0,
        visitors: 0,
        oneToOnes: 0,
        tyfcb: 0,
        ceu: 0,
        lateArrivals: {
          till729: 0,
          after730: 0,
          after800: 0
        }
      };
    });
  });

  return teams;
}

export function calculateMemberPoints(memberData: MemberData): MemberPoints {
  return {
    attendance: (memberData.present * 10) +
                (memberData.substitute * 5) +
                (memberData.absent * -5) +
                (memberData.late * -5) +
                (memberData.medical * 0) +
                (memberData.lateArrivals.till729 * 10) +
                (memberData.lateArrivals.after730 * 5) +
                (memberData.lateArrivals.after800 * -5),
    referrals: (memberData.referralsGivenInside * 5) +
               (memberData.referralsGivenOutside * 10),
    visitors: memberData.visitors * 15,
    oneToOnes: memberData.oneToOnes * 10,
    tyfcb: memberData.tyfcb * 10,
    ceu: memberData.ceu * 5
  };
}

export function calculateTotalMemberPoints(memberData: MemberData): number {
  const points = calculateMemberPoints(memberData);
  return Object.values(points).reduce((sum, val) => sum + val, 0);
}

export function calculateTeamScore(team: Team): TeamScore {
  let totalPoints = 0;
  let teamStats = {
    totalPresent: 0,
    totalReferralsGiven: 0,
    totalVisitors: 0,
    totalOneToOnes: 0,
    totalTyfcb: 0
  };

  team.members.forEach(memberName => {
    const memberData = team.data[memberName];
    totalPoints += calculateTotalMemberPoints(memberData);
    
    teamStats.totalPresent += memberData.present;
    teamStats.totalReferralsGiven += memberData.referralsGivenInside + memberData.referralsGivenOutside;
    teamStats.totalVisitors += memberData.visitors;
    teamStats.totalOneToOnes += memberData.oneToOnes;
    teamStats.totalTyfcb += memberData.tyfcb;
  });

  let bonusPoints = 0;
  if (teamStats.totalOneToOnes >= 50) bonusPoints += 100;
  if (teamStats.totalReferralsGiven >= 50) bonusPoints += 100;
  if (teamStats.totalVisitors >= 20) bonusPoints += 100;
  if (teamStats.totalTyfcb >= 10) bonusPoints += 150;

  return {
    teamKey: '',
    name: team.name,
    captain: team.captain,
    color: team.color,
    individualPoints: totalPoints,
    bonusPoints: bonusPoints,
    totalScore: totalPoints + bonusPoints,
    stats: teamStats
  };
}

export function getTeamLeaderboard(teams: TeamData): TeamScore[] {
  const leaderboard: TeamScore[] = [];
  
  Object.keys(teams).forEach(teamKey => {
    const teamScore = calculateTeamScore(teams[teamKey]);
    teamScore.teamKey = teamKey;
    leaderboard.push(teamScore);
  });
  
  return leaderboard.sort((a, b) => b.totalScore - a.totalScore);
}

export function getIndividualLeaderboard(teams: TeamData, category: string): IndividualScore[] {
  const leaderboard: IndividualScore[] = [];
  
  Object.keys(teams).forEach(teamKey => {
    const team = teams[teamKey];
    team.members.forEach(memberName => {
      const memberData = team.data[memberName];
      const points = calculateMemberPoints(memberData);
      
      let categoryValue = 0;
      let categoryCount = 0;
      
      switch (category) {
        case 'attendance':
          categoryValue = points.attendance;
          categoryCount = memberData.present + memberData.substitute;
          break;
        case 'referrals':
          categoryValue = points.referrals;
          categoryCount = memberData.referralsGivenInside + memberData.referralsGivenOutside;
          break;
        case 'visitors':
          categoryValue = points.visitors;
          categoryCount = memberData.visitors;
          break;
        case 'oneToOnes':
          categoryValue = points.oneToOnes;
          categoryCount = memberData.oneToOnes;
          break;
        case 'tyfcb':
          categoryValue = points.tyfcb;
          categoryCount = memberData.tyfcb;
          break;
        case 'total':
          categoryValue = calculateTotalMemberPoints(memberData);
          categoryCount = categoryValue;
          break;
      }
      
      leaderboard.push({
        member: memberName,
        team: team.name,
        teamColor: team.color,
        points: categoryValue,
