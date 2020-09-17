import { Jira } from './client';
import { DateTime } from 'luxon'

const JiraClient = new Jira({ baseURL: "https://selinarnd.atlassian.net/" });

async function findIssuesStuckInQA(boardName: string,days: number) {
  let issuesStuckInQA: any[];

  const allBoards = (await JiraClient.getAllBoards()).values;
  const selectedBoard = await findBoardByName(allBoards, boardName);
  const activeSprint = (await JiraClient.getActiveSprintForGivenBoard(selectedBoard.id)).values[0];
  const allIssuesForSprint = (await JiraClient.getAllIssuesForGivenSprint({ boardID: selectedBoard.id, sprintID: activeSprint.id })).issues;
  const remainingTimeInSprint = await checkIfRemainingTimeInTheSprint(activeSprint.startDate);
  for (let index = 0; index < allIssuesForSprint.length; index++) {
    const issue = allIssuesForSprint[index];
    const remainingTimeToCompleteTask = parseInt(issue.fields.timetracking.remainingEstimate);
    if (issue.fields.status.name === 'QA' && remainingTimeToCompleteTask > remainingTimeInSprint) {
      issuesStuckInQA.push(issue);
    }
  }
}

async function findBoardByName(allBoards, boardName:string){
  for (let index = 0; index < allBoards.length; index++) {
    const board = allBoards[index];
    if (board.name === boardName) {
      return board;
    }
  }
}

async function checkIfRemainingTimeInTheSprint(sprintStartDate: string) {
  var sprintStart = DateTime.fromISO(sprintStartDate);
  var ammountOfDaysFromWhenSprintStarted = sprintStart.diffNow("days");
  const ammountOfDaysLeft = ammountOfDaysFromWhenSprintStarted.as("days") - 4;
  return ammountOfDaysLeft;
}
