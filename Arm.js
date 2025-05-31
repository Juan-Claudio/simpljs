export default class Arm {
  event = "";
  anchor = "";
  acts = []; //only ids
  once = false;
  enable = true;
  passive = false;

  // to pass from acts to action
  idx = 0;
  toggle_1st_idx = -1;
  toggle_idx = 0;
  toggle_last_idx = -1;
  action = false;

  constructor(event) {
    this.event = event;
  }

  addAct(act, toggle = false, swap = false, merge = true) {
    if (typeof act === "string")
      this.acts.push({ id: act, uses: 0, toggle, swap, merge });
    else this.acts = [...this.acts, ...act];
  }

  //create the action from the acts
  //store the action in this.action
  //@returns void
  load(actionRegister) {
    let global_idx = -1;
    const actions = [];
    //if event listener have to be removed when finish once
    if (this.once) {
      this.acts.push({
        id: "unarm",
        uses: 0,
        toggle: false,
        swap: true,
        merge: false,
      });
    }
    // Merge actions and get idx of first toggle action if exists
    this.acts.forEach(({ id, uses, toggle, swap, merge }, idx, arr) => {
      // if action to merge and same action type, merge it
      if (
        merge &&
        actions[global_idx] !== undefined &&
        actions[global_idx].toggle === toggle &&
        actions[global_idx].swap === swap &&
        actions[global_idx].merge === merge
      ) {
        actions[global_idx].id.push(id);
      }
      // else put the action in next slot
      else {
        global_idx++;
        actions[global_idx] = { id: [id], uses, toggle, swap, merge };
      }

      // if is first toggle action get the index
      if (toggle && this.toggle_1st_idx === -1)
        this.toggle_1st_idx = global_idx;
      // if last toggle action get the index
      if (
        toggle &&
        this.toggle_last_idx === -1 &&
        idx !== 0 &&
        (arr[idx + 1] == undefined || !arr[idx + 1].toggle)
      ) {
        this.toggle_last_idx = global_idx;
      }
    });

    // remove all actions after last toggle action
    if (this.toggle_1st_idx !== -1) actions.splice(this.toggle_last_idx + 1);

    //register formatedActs
    this.acts = actions;

    this.action = (snap) => {
      if (!this.enable) return;

      //define the current act
      const curract = this.acts[this.idx];

      //check if is the next unarm act => disable the arm
      //the Waiter will remove it from the listener
      if (curract.id[0] === "unarm") return (this.enable = false);

      //execute the current act
      curract.id.forEach((id) => {
        actionRegister[id].call(snap.currentTarget, snap);
      });

      //check if is last toggle act => return to the first toggle act
      if (this.idx === this.toggle_last_idx) this.idx = this.toggle_1st_idx;
      //check if remain act to call after this => pass to the next act
      else if (this.idx + 1 !== this.acts.length) this.idx++;
      //else it's the last act which is the only one to call now
    };
  }
}
