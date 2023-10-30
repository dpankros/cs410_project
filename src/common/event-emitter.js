export class EventEmitter {
  constructor() {
    this._l = {};
  }

  listenerCount(eventName) {
    return this.listeners(eventName).length;
  }

  listeners(eventName) {
    const r = this._l[eventName];
    return r ? [...r] : [];
  }

  prependListener(eventName, listener) {
    const listeners = this.listeners(eventName);

    if (listeners.length < this.getMaxListeners()) {
      listeners.unshift(listener);
      this._l[eventName] = listeners;
    }

    return this;
  }

  prependOnceListener(eventName, listener) {
    const wrappedListener = (...args) => {
      this.off(eventName, wrappedListener);
      return listener(...args);
    };
    return this.prependListener(eventName, wrappedListener);
  }

  on(eventName, listener) {
    const listeners = this.listeners(eventName);

    if (listeners.length < this.getMaxListeners()) {
      this.emit('newListener', listener);
      listeners.push(listener);
      this._l[eventName] = listeners;
    }

    return this;
  }

  once(eventName, listener) {
    const wrappedListener = (...args) => {
      this.off(eventName, wrappedListener);
      return listener(...args);
    };
    return this.on(eventName, wrappedListener);
  }

  off(eventName, listener) {
    const listeners = this.listeners(eventName);
    this._l[eventName] = listeners.filter(l => l !== listener);
    this.emit('removeListener', listener);
    return this;
  }

  emit(eventName, ...args) {
    const listeners = this.listeners(eventName);
    listeners.forEach(l => l(...args));
    return this;
  }

  addListener(eventName, listener) {
    return this.on(eventName, listener);
  }

  removeListener(eventName, listener) {
    return this.off(eventName, listener);
  }

  removeAllListeners(eventName) {
    const eventNames = eventName ? [eventName] : this.eventNames();
    eventNames.forEach(evtName => delete this._l[evtName]);
    return this;
  }

  eventNames() {
    return Object.keys(this._l);
  }

  setMaxListeners(n) {
    this._maxListeners = n;
    return this;
  }

  getMaxListeners() {
    return this._maxListeners || this.constructor.defaultMaxListeners;
  }


}
EventEmitter.defaultMaxListeners = 10;
EventEmitter.errorMonitor = () => {};

export default EventEmitter;

//
// const e = new EventEmitter();
// e // ?
// e.getMaxListeners(); // ?
// e.setMaxListeners(4);
// e.getMaxListeners(); // ?
// const echo1 = (...args) => console.log('ECHO', args.join(','));
// e.on('echo', echo1);
// e.listenerCount('echo') // ?
// e.once('echo', (...args) => console.log('ECHO2', args.join('!')));
// e.once('echo', (...args) => console.log('ECHO3', args));
// e.once('echo', (...args) => console.log('one time only!', args));
// e.listenerCount('echo') // ?
//
// e.emit('echo', 'Hello there', 'world');
// e.listenerCount('echo') // ?
// e.off('echo', echo1);
// e.emit('echo', 'Hello again!!!!');
// e.listenerCount('echo') // ?
