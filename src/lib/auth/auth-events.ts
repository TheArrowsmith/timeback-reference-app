// Event emitter for auth state changes
class AuthEventEmitter extends EventTarget {
  emitLogout() {
    this.dispatchEvent(new Event('logout'));
  }
  
  emitLogin() {
    this.dispatchEvent(new Event('login'));
  }
  
  onLogout(callback: () => void) {
    this.addEventListener('logout', callback);
    return () => this.removeEventListener('logout', callback);
  }
  
  onLogin(callback: () => void) {
    this.addEventListener('login', callback);
    return () => this.removeEventListener('login', callback);
  }
}

export const authEvents = new AuthEventEmitter();