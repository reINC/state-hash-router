// Private functions
function encodeBase64(str) {
  return btoa(str).replace(/=/g, '_').replace(/\+/g, '-');
}

function decodeBase64(str) {
  return atob(str.replace(/_/g, '=').replace(/-/g, '+'));
}

// Private methods
function onStateChange() {
  const state = this.parseHash(window.location.hash);

  if (JSON.stringify(state) !== JSON.stringify(this._currentState)) {
    this._currentState = state;

    for(let i in this._navigationListeners) {
      this._navigationListeners[i](state);
    }
  }
}

// StateHashRouter
export class StateHashRouter {
  constructor({
    serialize = JSON.stringify,
    compress = (str) => str,
    encode = encodeBase64,
    decode = decodeBase64,
    decompress = (str) => str,
    deserialize = JSON.parse,
  } = {
    serialize: JSON.stringify,
    compress: (str) => str,
    encode: encodeBase64,
    decode: decodeBase64,
    decompress: (str) => str,
    deserialize: JSON.parse,
  }) {
    this.options = {
      serialize,
      compress,
      encode,
      decode,
      decompress,
      deserialize,
    };

    this._currentState = {};
    this._attached = false;
    this._navigationListeners = [];
  }

  attach() {
    if (!this._attached) {
      this._attached = true;
      window.addEventListener('popstate', onStateChange.bind(this));
      window.addEventListener('hashchange', onStateChange.bind(this));

      onStateChange.call(this);
    }

    return this;
  }

  detach() {
    if (this._attached) {
      window.removeEventListener('popstate', onStateChange.bind(this));
      window.removeEventListener('hashchange', onStateChange.bind(this));
      this._attached = false;
    }
  }

  generateHash(state = {}) {
    if (JSON.stringify(state) === '{}') {
      return '#';
    } else {
      return '#' + this.options.encode(this.options.compress(this.options.serialize(state)));
    }
  }

  parseHash(hash = '#') {
    if (typeof hash !== 'string' || hash === '' || hash === '#') {
      return {};
    }

    const decodedHash = this.options.decode(/^#?(.*)$/.exec(hash)[1]);
    const decompressedHash = decodedHash.length > 0 ? this.options.decompress(decodedHash) : '';

    return this.options.deserialize(decompressedHash);
  }

  getCurrentState() {
    return this._currentState;
  }

  navigate(state) {
    window.location.hash = this.generateHash(state);
  }

  addNavigationListener(callback) {
    this._navigationListeners.push(callback);
    return this;
  }

  removeNavigationListener(callback) {
    const index = this._navigationListeners.indexOf(callback);

    if (index >= 0) {
      this._navigationListeners.splice(callback, 1);
    }
  }
}
