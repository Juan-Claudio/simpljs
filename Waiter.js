import Arm from "./Arm.js";

/**
 * /!\ harbor must be a selector of unique element
 * /!\ getHarbor() return only one element
 */

export default class Waiter {
  static #waiters = {}; //key:harbor value:Waiter
  static #acts = {
    unarm: () => "unarm",
  };
  static #autoId = 0;
  static #noBubble = new Set([
    "load",
    "unload",
    "scroll",
    "focus",
    "blur",
    "mouseenter",
    "mouseleave",
    "resize",
    "abort",
    "error",
  ]);

  static getAct(id) {
    return Waiter.#acts[id];
  }
  static get(id) {
    return Waiter.#waiters[id];
  }
  /**
   * register event handler globaly
   * @param {string} name
   * @param {function} action
   * @returns string[] - action ids
   */
  static addAct(name, action) {
    //if various actions to register in once
    if (typeof name === "object") {
      for (const key in name) {
        Waiter.#acts[key] = name[key];
      }
      return Object.keys(name);
    }
    //else only one action to register
    Waiter.#acts[name] = action;
    return [action];
  }

  #harbor = {};
  #arms = {}; //array of arms regrouped by event type
  #armid = ["event", 0];
  #actions = {}; //object of event handlers
  #wrappers = {};

  constructor(harbor) {
    this.#harbor = harbor;
    Waiter.#waiters[harbor] = this;
  }

  getHarbor(type = "node") {
    if (type === "node") return document.querySelector(this.#harbor);
    else return this.#harbor;
  }
  getArm(event, idx) {
    if (Array.isArray(event)) {
      return this.#arms[event[0]][event[1]];
    }
    return this.#arms[event][idx];
  }
  getArms() {
    return this.#arms;
  }
  getArmId() {
    return this.#armid;
  }

  //getters to add option to createEventListener()
  get once() {
    this.#arms[this.#armid[0]][this.#armid[1]].once = true;
    return this;
  }
  get passive() {
    this.#arms[this.#armid[0]][this.#armid[1]].passive = true;
    return this;
  }

  get disabled() {
    this.#arms[this.#armid[0]][this.#armid[1]].enable = false;
  }

  get then() {
    return this;
  }

  enable(armid) {
    this.#arms[armid[0]][armid[1]].enable = true;
  }
  disable(armid) {
    this.#arms[armid[0]][armid[1]].enable = false;
  }

  /**
   * register the event name
   * @param {string} event - event name
   * @returns Waiter - this Waiter instance
   */
  on(event) {
    if (Waiter.#noBubble.has(event)) {
      throw new Error(
        `Not bubbling event "${event}". Or check the letter case.`
      );
    }
    if (this.#arms[event] === undefined) {
      this.#arms[event] = [new Arm(event)];
      this.#armid = [event, 0];
    } else {
      const idx = this.#arms[event].push(new Arm(event)) - 1;
      this.#armid = [event, idx];
    }
    return this;
  }

  /**
   * register the element target of the event, delegate its event to the harbor
   * @param {string} anchor - selector element on what the event will apply
   * @returns Waiter - this Waiter instance
   */
  at(anchor) {
    this.#arms[this.#armid[0]][this.#armid[1]].anchor = anchor;
    return this;
  }
  /**
   * register the event handler of the event listener
   *
   * @param {string|function} action - name of one of registered action or action to register
   * @returns Waiter - this Waiter instance
   */
  arm(action, toggle = false, swap = false, merge = true) {
    if (Array.isArray(action)) {
      action = action.map((act) => this.arm(act, toggle, swap, merge));
      return this;
    }

    if (typeof action === "function") {
      action = Waiter.addAct("action" + Waiter.#autoId++, toggle, swap, merge);
    }

    this.#arms[this.#armid[0]][this.#armid[1]].addAct(
      action,
      toggle,
      swap,
      merge
    );
    return this;
  }
  and(action) {
    return this.arm(action);
  }
  /**
   * alias of arm to add action in fragments
   *
   * @param {string|function} action
   * @returns Waiter - this Waiter instance
   */
  more(action) {
    return this.arm(action);
  }
  /**
   * register action as toggle action, when call the last action
   * the next action will be the first toggle action registered
   *
   * @param {string[]|function[]} actions
   * @returns Waiter - this Waiter instance
   */
  toggle(actions) {
    actions.forEach((action) => {
      this.arm(action, true, false, false);
    });
    return this;
  }
  /**
   * One listener attach to the harbor (various eventListener)
   * create action with all actions + options from the arm
   * add logic to arm it only on anchor
   */
  wait() {
    //constructs all actions from arms
    //sort arms by event and passive state (excluding the disabled ones)
    const sortedArms = {};
    for (let event in this.#arms) {
      const arms = this.#arms[event];
      arms.forEach((arm) => arm.load(Waiter.#acts));
      const activeOnes = arms.filter((arm) => !arm.passive && arm.enable);
      const passiveOnes = arms.filter((arm) => arm.passive && arm.enable);
      sortedArms[event] = [activeOnes, passiveOnes];
    }

    for (let ev in sortedArms) {
      //not passive event first
      this.createAndRegisterEventListener(sortedArms[ev][0]);
      //passive event then
      this.createAndRegisterEventListener(sortedArms[ev][1]);
    }
  }

  /**
   * Constructs action, override existing action or do nothing
   * Register the action and the wrapper once
   * Create the event listener once
   * @param {Arm} arms
   * @param {boolean} override
   * @returns void
   */
  createAndRegisterEventListener(arms, override = false) {
    if (arms.length === 0) return;

    const { event, passive } = arms[0];
    const key = `${+passive}-${event}`;

    if (this.#wrappers[key] && !override) return;

    const harbor = this.getHarbor("node");

    const action = (snap) => {
      for (let arm of arms) {
        const target = snap.target.closest(arm.anchor);
        if (!target) continue;
        if (!harbor.contains(target)) continue;
        arm.action.call(snap.currentTarget, snap);
      }
    };

    this.#actions[key] = action;

    if (this.#wrappers[key]) return;

    this.#wrappers[key] = (snap) => {
      action(snap);
    };
    harbor.addEventListener(event, this.#wrappers[key], { passive });
  }

  //remove the event listener
  bye(event, passive) {
    const key = `${+passive}-${event}`;
    if (!this.#wrappers[key]) return;
    this.getHarbor("node").removeEventListener(event, this.#wrappers[key], {
      passive,
    });
    delete this.#wrappers[key];
    delete this.#actions[key];
  }

  //remove all event listeners
  byebye() {
    Object.keys(this.#wrappers).forEach((key) => {
      const [passive, event] = key.split("-");
      this.bye(event, passive == 0 ? false : true);
    });
  }

  getArmAction(armid) {
    const [event, armIdx] = armid;
    const arm = this.#arms[event][armIdx];
    if (arm.action === false) arm.load(Waiter.#acts);
    return arm.action;
  }

  /**
   * replace the previous action
   *
   * @param {string|function} action
   */
  swap(action) {
    return this.arm(action, false, true);
  }

  isBubbleEvent(event) {
    return new Event(event).bubbles;
  }

  areOptions() {
    return (
      Object.keys(this.#arms[this.#armid[0]][this.#armid[1]].options).length !==
      0
    );
  }

  createCustomEvent(name) {
    //custom event which bubble
    return new CustomEvent(name, { bubbles: true });
  }
}
