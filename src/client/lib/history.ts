import { openDB } from 'idb';
import Fuse from 'fuse.js';

const FuseOpts = {
  keys: [
    'server',
    'user',
    'query',
    'createdAtStr'
  ]
};

const dbPromise = openDB('history-store', 1, {
  upgrade(db) {
    const store = db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });

    store.createIndex('createdAtIDX', 'createdAt');
  }
});

export interface historyRow {
  createdAt: Date,
  createdAtStr: string,
  guiID: string,
  query: string,
  server: string,
  serverType: string,
  state: any, // this is the editor state
  user: string,
  username: string,
  value: string
}

let fuseSearch: Fuse<any[], Fuse.IFuseOptions<any>>

export default new class history {
  constructor () {
    this.initSearch()
  }

  private async initSearch () {
    if (!fuseSearch) {
      const data: Array<any> = await this.getAll();
      fuseSearch = new Fuse(data, FuseOpts)
    }
  }

  async search(searchStr: string) {
    return fuseSearch.search(searchStr);
  }

  async get(key: number): Promise<historyRow> {
    return (await dbPromise).get('history', key);
  }

  async getAll(): Promise<Array<historyRow> | Array<any>> {
    const db = await dbPromise;
    const results = await db.getAll('history') || [];
    const sortedResults = (results).sort((a, b) => b.createdAt - a.createdAt);

    return sortedResults
  }

  async set(data: any) {
    if (fuseSearch) fuseSearch.add(data);
    return (await dbPromise).put('history', data);
  }

  async delete(key: number) {
    const row = await this.get(key);
    if (fuseSearch) fuseSearch.remove((doc: any) => {
      return doc.createdAtStr === row.createdAtStr
    });

    return (await dbPromise).delete('history', key);
  }

  async clear() {
    fuseSearch = new Fuse(Array<any>(), FuseOpts);

    return (await dbPromise).clear('history');
  }

  async keys() {
    return (await dbPromise).getAllKeys('history');
  }
}