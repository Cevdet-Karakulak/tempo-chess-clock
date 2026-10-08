/** Require two presses of the same control within 600 ms while running. */
export function createControlConfirmation() {
  /** @type {{id:string,at:number}|null} */
  let pending = null;
  return {
    reset() { pending = null; },
    /** @param {string} status @param {string} id @param {number} at */
    accept(status, id, at) {
      if (status !== 'running') { pending = null; return true; }
      if (pending?.id === id && at >= pending.at && at-pending.at <= 600) {
        pending = null;
        return true;
      }
      pending = {id,at};
      return false;
    },
  };
}
