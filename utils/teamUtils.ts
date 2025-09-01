// utils/teamUtils.ts

export interface MemberData {
  name: string;
  stats: { [key: string]: number };
  points: number;
}

export interface Team {
  name: string;
  captain: string;
  members: MemberData[];
  totalPoints: number;
}

export interface TeamData {
  [key: string]: Team;
}

export function initializeTeams(): TeamData {
  return {
    team1: {
      name: "Team 1",
      captain: "Himanshu Sharma",
      members: [
        { name: "Himanshu Sharma", stats: {}, points: 0 },
        { name: "Prannav Khanna", stats: {}, points: 0 },
        { name: "Paras Aneja", stats: {}, points: 0 },
        { name: "Munish Seth", stats: {}, points: 0 },
        { name: "Mannya Katyal", stats: {}, points: 0 },
        { name: "Priyam Kapoor", stats: {}, points: 0 },
        { name: "Rama Jain", stats: {}, points: 0 },
        { name: "Sajid Hasan", stats: {}, points: 0 },
      ],
      totalPoints: 0,
    },
    team2: {
      name: "Team 2",
      captain: "Abhinav Gupta",
      members: [
        { name: "Abhinav Gupta", stats: {}, points: 0 },
        { name: "Vijay Gupta", stats: {}, points: 0 },
        { name: "Kulpreet Ghai", stats: {}, points: 0 },
        { name: "Himanshu Yadav", stats: {}, points: 0 },
        { name: "Ritu Jain", stats: {}, points: 0 },
        { name: "Sagar Kapoor", stats: {}, points: 0 },
        { name: "Achal Gupta", stats: {}, points: 0 },
        { name: "Manish Jain", stats: {}, points: 0 },
      ],
      totalPoints: 0,
    },
    team3: {
      name: "Team 3",
      captain: "Dr. Ayushi Negi",
      members: [
        { name: "Dr. Ayushi Negi", stats: {}, points: 0 },
        { name: "Praveen Wadhwa", stats: {}, points: 0 },
        { name: "Gagan Narang", stats: {}, points: 0 },
        { name: "Rajeev Arya", stats: {}, points: 0 },
        { name: "Akhilesh Pandey", stats: {}, points: 0 },
        { name: "Rajeev Nayak", stats: {}, points: 0 },
        { name: "Sumit Singh", stats: {}, points: 0 },
        { name: "Ayushi Negi", stats: {}, points: 0 },
      ],
      totalPoints: 0,
    },
  };
}
