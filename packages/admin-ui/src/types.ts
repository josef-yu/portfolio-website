export interface Entry {
  id: string;
  title: string;
}

export interface CollectionMeta {
  id: string;
  label: string;
  urlBase: string;
  template: string;
}

export interface WritingMetaState {
  title: string;
  description: string;
  draft: boolean;
  tags: string[];
  readMinAuto: boolean;
  readMin: number;
  pubDateOverride: boolean;
  pubDate: string;
}

export type ToastState = { msg: string; type: 'ok' | 'err' | '' } | null;
export type Pane = 'empty' | 'new' | 'editor';
