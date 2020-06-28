import { openDB, deleteDB } from 'idb';

const dbPromise = openDB('history-store', 1, {
  upgrade(db) {
    const store = db.createObjectStore('history', {
      keyPath: 'id',
      autoIncrement: true,
    });

    store.createIndex('createdAtIDX', 'createdAt');
  },
});

export default {
  namespaced: true,
  state: {
  },
  mutations: {
  },
  actions: {
    async get(context: any, key?: any) {
      if (key !== undefined) return (await dbPromise).get('history', key);
      else return (await dbPromise).getAll('history');
    },
    async set(context: any, data: any) {
      return (await dbPromise).put('history', data);
    },
    async delete(context: any, key: any) {
      return (await dbPromise).delete('history', key);
    },
    async clear(context: any) {
      return (await dbPromise).clear('history');
    },
    async keys(context: any) {
      return (await dbPromise).getAllKeys('history');
    },
  }
}