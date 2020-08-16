
export interface ConfigData {
  username: string;
  password: string;
  path: string;
  alwaysSave: string;
  alwaysRestore: string;
  title?: string;
}

export interface ConfigState {
  clients: Array<ConfigData>;
  encrypted: string;
}
