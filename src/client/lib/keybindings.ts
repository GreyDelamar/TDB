import Mousetrap from 'mousetrap'
// import { openDB } from 'idb';
const defaultKeybindings = require('./defaultKeybindings')

// const dbPromise = openDB('keybindings-store', 1, {
//   upgrade(db) {
//     const store = db.createObjectStore('keybindings', { keyPath: 'id', autoIncrement: true });
//   }
// });

export type keybindings = Array<string> | string

export interface keybinding {
  id: string,
  label: string,
  contextMenuGroupId: string,
  keybindings: keybindings,
  source: string | undefined,
  event?: 'keypress' | 'keydown' | 'keyup'
  callback?: Function,
}

export class keybindingService {
  bindings: Array<keybinding> = []

  constructor () {
    this.loadBindings()
  }

  private async loadBindings () {
    // this.bindings = await (await dbPromise).getAll('keybindings')
    this.bindings = this.keybindingDefaults

    for (let idx = 0; idx < this.bindings.length; idx++) {
      const binding = this.bindings[idx];

      if (!binding.source || binding.source === 'default') this.addBinding(binding.keybindings);
    }
  }

  private get keybindingDefaults (): Array<keybinding> {
    return defaultKeybindings;
  }

  // public saveBindings () {

  // }

  public addBinding (keybindings: keybindings) {
    if (!Array.isArray(keybindings)) Mousetrap.bind(keybindings, function() { console.log('HIT HERE'); });
    else {
      for (let idx = 0; idx < keybindings.length; idx++) {
        const binding = keybindings[idx];
        Mousetrap.bind(binding, function() { console.log('HIT HERE ARRAY'); });
      }
    }
  }

  // public editBinding () {

  // }

  public bindingsBySource (source: string) {
    this.keysFromString()
    return this.bindings.filter(d => d.source === source)
  }

  keysFromString () {
    console.log(Mousetrap.prototype)
  }
}

export default {
  install (Vue: any, options: any) {
    Vue.prototype.$keybinding = new keybindingService()
  }
}