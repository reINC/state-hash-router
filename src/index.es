// Private methods
function onStateChange() {
}

// StateHashRouter
export default class {
  constructor() {
    window.addEventListener('popstate', onStateChange.bind(this));
    window.addEventListener('hashchange', onStateChange.bind(this));
  }
}
