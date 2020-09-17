import got, { Got, ExtendOptions } from "got";

export class Jira {

  private readonly api: Got;
  
  constructor({
    baseURL,
    authToken
  }: {
      readonly baseURL: string,
    readonly authToken?: string
    }) {
      const gotExtendOptions: ExtendOptions = {
        prefixUrl: baseURL,
        responseType: "json",
      };
  
      if (authToken !== undefined) {
        gotExtendOptions.headers = {
          Authorization: authToken,
        };
      }
  
      this.api = got.extend(gotExtendOptions);
  }

  getAllBoards(): Promise<{
    readonly values: [{
      readonly id: string,
      readonly name: string,
      readonly self: string, 
      readonly type: string
    }],
    readonly [key: string]: any;
  }>{
    return this.api
      .get('rest/agile/1.0/board')
      .json()
  }

  getActiveSprintForGivenBoard({
    boardID
  }: {
    readonly boardID:string
    }): Promise<{
    readonly values :[{
    readonly id: string,
    readonly name: string,
    readonly startDate: string, 
    readonly endDate: string,
    readonly goal: string
      }],
    readonly [key: string]: any;
  }>{
    return this.api
      .get(`rest/agile/1.0/board/${boardID}/sprint?state=active`)
      .json();
  }

  getAllIssuesForGivenSprint({
    boardID, 
    sprintID
  }: {
      readonly boardID: string,
      readonly sprintID: string
    }): Promise<{
      readonly issues: [{
        readonly id: string,
        readonly key: string,
        readonly fields: {
          readonly priority: {
            readonly name: string,
          },
          readonly assignee: { 
            readonly accountId: string
          },
          readonly status: {
            readonly name: string
          },
          readonly summary: string,
          readonly timetracking: {
            readonly originalEstimate: string,
            readonly remainingEstimate: string
          }
        }
    }]
  }>{
    return this.api
      .get(`/rest/agile/1.0/board/${boardID}/sprint/${sprintID}/issue`)
      .json();
  }

}