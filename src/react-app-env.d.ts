/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_NOTION_KEY: string;
    REACT_APP_NOTION_DATABASE_ID: string;
  }
}
