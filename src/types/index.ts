export interface Task {
  rowIndex: number;
  client: string;
  subClient: string;
  videoTitle: string;
  rawVideoLink: string;
  directions: string;
  changes: string;
  editorName: string;
  startDate: string;
  endDate: string;
  status: string;
  videoLink: string;
  revisions: string | number;
  complexity: string;
  price: string | number;
}

export interface AddTaskInput extends Omit<Task, 'rowIndex'> {}
