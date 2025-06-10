class JSMLFragment {
  self = document.createDocumentFragment();
  opens = [];

  /**
   * Create a HTMLElement or a Text and append it to the last open parent
   * or to the root if no open parent.
   *
   * The keys in object must match the Dom attributes name
   * The data-* attribute must respect camelCase rule else it's ignored
   *
   * attributes prefixed with '_' will be interpreted (replace {{var}})
   * else will not even if the attribute use '{{}}' syntax
   *
   * @param {string} tag - existing html tag name
   * @param {Object} data - HTMLElement attributes as key
   * @param {boolean} selfClosing
   */
  _(tag, data = {}, selfClosing = false) {
    let el = {};

    // Element with attributes containing variable "{{var}}"?
    //const interpretableAttrs = [];

    // Text with variable {{var}}?
    //const isInterpretableText = tag === "_txt" ? true : false;
    //if (tag === "_txt") tag = tag.slice(1);

    if (tag !== "txt") {
      el = document.createElement(tag);
      Object.entries(data).forEach(([key, val]) => {
        // if is attribute to interpret add it to list
        //if (key[0] === "_") {
        //  key = key.slice(1);
        //  interpretableAttrs.push(key);
        //}
        // if is existing dom attribute name set it
        if (el[key] !== undefined) el[key] = val;
        // if is data-* type attribute set it
        else if (/^data[A-Z][a-zA-Z0-9]*$/.test(key)) {
          el.dataset[key.replace(/^data/, "")] = val;
        }
      });
      // if exist attributes to interpret add attribute data-jsml-interprets
      //if (interpretableAttrs.length > 0) {
      //  el.dataset.jsmlInterprets = interpretableAttrs.join(" ");
      //}
    } else {
      if (typeof data !== "string") {
        throw new Error(".txt() only allow string as parameter");
      }
      el = document.createTextNode(data);
    }
    this.append(el, selfClosing /*, isInterpretableText*/);
  }

  /**
   * Removes one or more parent elements from the stack so they can't receive
   * any more children.
   *
   *    .end(1) and .end() → close the last parent, the fastest
   *    .end(-1) → do the same but not the fastest pass by the second condition
   *
   * Positive values are converted to negative internally:
   *    .end(-3) and .end(3) → both close the last 3 parent elements.
   *
   * The string "all" is the only accepted string value:
   *    .end('all') → closes all parent elements.
   *
   * /!\ Warning /!\
   *    .end(0) has the same effect as .end('all')
   *
   * @param {number|'all'} nb - Number of parent elements to close, or 'all'
   * @returns {void}
   */
  end(nb = 1) {
    if (nb === 1) this.opens.pop();
    else if (nb === (nb | 0)) this.opens.splice(nb <= 0 ? nb : -nb);
    else if (nb === "all") this.opens = [];
  }

  /**
   * Append to the last open parent or to the root (fragment)
   *
   * @param {HTMLElement|Text} el - element to append to fragment
   * @param {boolean} selfClosing - if is a self closing element
   */
  append(el, selfClosing = false /*, interpretableText = false*/) {
    // append to last open parent
    const opensLen = this.opens.length - 1;
    if (opensLen === -1) {
      this.self.appendChild(el);
      //if (interpretableText) {
      //  console.error(
      //    "Text nodes not attached to a parent in a fragment will not be interpreted"
      //  );
      //}
    } else {
      this.opens[opensLen].appendChild(el);
      // if is a text with {{var}} add to parent the marker to be interpreted
      //if (interpretableText) {
      //  this.opens[opensLen].dataset.jsmlInterprets =
      //    (div.dataset.customAttr ?? "") + "textContent";
      //}
    }
    // Add to the parents list if it can receive children,
    // otherwise skip if it's a self-closing tag.
    !selfClosing && this.opens.push(el);
  }
}
class JSMLComponent {
  // static part
  static #components = {};
  // prettier-ignore
  static htmlTags = {
    selfClosing: [
      "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
      "source", "track", "wbr"
    ],
    nonSelfClosing: [
      "a", "abbr", "address", "article", "aside", "audio", "b", "bdi", "bdo", 
      "blockquote", "body", "button", "canvas", "caption", "cite", "code", 
      "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", 
      "div", "dl", "dt", "em", "fieldset", "figcaption", "figure", "footer", 
      "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", 
      "html", "i", "iframe", "ins", "kbd", "label", "legend", "li", "main", "map",
      "mark", "meter", "nav", "noscript", "object", "ol", "optgroup", "option", 
      "output", "p", "param", "picture", "pre", "progress", "q", "rp", "rt", 
      "ruby", "s", "samp", "script", "section", "select", "small", "span", 
      "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", 
      "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "u",
      "ul", "var", "video"
    ],
  };
  // prettier-ignore
  static svgTags = {
    selfClosing: [
      "circle", "ellipse", "image", "line", "meshpatch", "meshrow", "mpath", 
      "path", "polygon", "polyline", "rect", "set", "stop", "use",
    ],
    nonSelfClosing: [
      "svg", "animate", "animateMotion", "animateTransform", "clipPath", 
      "defs", "desc", "discard", "feBlend", "feColorMatrix", 
      "feComponentTransfer", "feComposite", "feConvolveMatrix", 
      "feDiffuseLighting", "feDisplacementMap", "feDistantLight", 
      "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", 
      "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", 
      "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", 
      "feTile", "feTurbulence", "filter", "foreignObject", "g", "hatch", 
      "hatchpath", "linearGradient", "marker", "mask", "mesh", "meshgradient", 
      "metadata", "pattern", "radialGradient", "script", "solidcolor", "style", 
      "switch", "symbol", "text", "textPath", "title", "tspan", "unknown", 
      "view",
    ],
  };
  // prettier-ignore
  static mathTags = {
    selfClosing: [
      "mglyph", "mspace"
    ],
    nonSelfClosing: [
      "math", "maction", "maligngroup", "malignmark", "menclose", "merror",
      "mfenced", "mfrac", "mi", "mlabeledtr", "mlongdiv", "mmultiscripts",
      "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms",
      "mscarries", "mscarry", "msgroup", "msline", "msqrt", "msrow", "mstack",
      "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr",
      "munder", "munderover", "semantics", "annotation", "annotation-xml"
    ]
  };

  static getComponent(name) {
    if (name in JSMLComponent.#components)
      return JSMLComponent.#components[name];
    return new JSMLComponent();
  }

  static isValidNodeName(name) {
    return typeof name === "string" && /^[a-z]+(?:[A-Z][a-z0-9]*)*$/.test(name);
  }

  static exists(name) {
    return name in JSMLComponent.#components;
  }

  static createJsmlTags(tagsObject) {
    for (const tag of tagsObject.nonSelfClosing) {
      JSMLComponent.prototype[tag] = function (attrs) {
        return JSMLComponent._(tag, attrs);
      };
    }

    // Self closing version
    for (const tag of tagsObject.selfClosing) {
      JSMLComponent.prototype[tag] = function (attrs) {
        return this._(tag, attrs, true);
      };
    }
  }
  // end static part

  #name;
  #fragment; //the principal fragment
  #data;
  #model;

  constructor(name = false, model = false, data = { jsmlNoData: true }) {
    // if valid name then register the JSMLComponent fragment
    if (JSMLComponent.isValidNodeName(name)) {
      this.#name = name;
      this.#data = data;
      this.#model = model;
      JSMLComponent.#components[name] = this;
    } else if (name instanceof Node) {
      this.#fragment = name;
    } else {
      this.#name = false;
      this.#model = false;
      this.#data = { jsmlNoData: true };
      this.#fragment = new JSMLFragment();
    }
  }

  //getters
  // return copy
  getData() {
    return structuredClone(this.#data);
  }
  get clone() {
    return this.#fragment.self.cloneNode(true);
  }
  get get() {
    return this.#fragment.self;
  }
  getName() {
    return this.#name;
  }
  get build() {
    if (this.#data.jsmlNoData) throw new Error("No data to build component");
    if (typeof this.#model !== "function") throw new Error("No model to build");
    this.#fragment = new JSMLFragment();
    this.#fragment.self = this.#model.call(new JSMLComponent(), this.#data).get;
    return this;
  }

  //setters
  data(obj) {
    this.#data = obj;
    console.info(obj);
    console.info(this.#data);
    return this;
  }
  setData(key, newVal) {
    this.#data[key] = newVal;
    return this;
  }
  delData(key) {
    delete this.#data[key];
    return this;
  }
  updateData(modifsObj) {
    this.#data = { ...this.#data, ...modifsObj };
    return this;
  }
  refresh(modifsObj) {
    return this.updateData(modifsObj).build;
  }

  //checkers

  //principal methods
  _(tag, data = {}, simpleTag = false) {
    this.#fragment._(tag, data, simpleTag);
    return this;
  }
  txt(data) {
    return this._("txt", data, true);
  }
  btn(data) {
    return this._("button", data);
  }
  end() {
    this.#fragment.end();
    return this;
  }
  // to insert another custom component or html code
  my(componentName, data = false) {
    const jsmlComponent = JSMLComponent.get(componentName);
    let el;
    // option 1 the fragment is ready to use
    if (data === false) el = jsmlComponent.clone;
    // option 2 the model must be apply with this data
    else if (data === true) el = jsmlComponent.build.clone;
    // option 3 the model must be apply with data already present
    else el = jsmlComponent.data(data).build.clone;
    this.#fragment.append(el, true);
  }

  in(el, type = "append", copy = true, ref = "beforeend") {
    if (!(el instanceof Node)) return;
    const it = copy ? this.clone : this.get;
    switch (type) {
      case "append":
      case "appendChild":
        el.append(it);
        return;
      case "prepend":
        el.prepend(it);
        return;
      case "insertBefore":
        if (!(ref instanceof Node)) return;
        el.insertBefore(it, ref);
        return;
      case "before":
        el.before(it);
        return;
      case "after":
        el.after(it);
        return;
      case "insertAdjacentElement":
        const pos = ["beforebegin", "afterbegin", "beforeend", "afterend"];
        if (!pos.includes(ref)) return;
        el.insertAdjacentElement(ref, it);
        return;
      case "replaceChild":
        if (!(ref instanceof Node)) return;
        el.replaceChild(it, ref);
        return;
      case "replaceWith":
        el.replaceWith(it);
        return;
      default:
        throw new Error("Unknown insertion type. Use this.help().");
    }
  }
  //replace element by this element
  swap(el, data = false, copy = true) {
    if (data) this.refresh(data);
    this.in(el, "replaceWith", copy);
  }

  help() {
    let helpMess =
      "Methods (names) supported by this.in(): \n" +
      "element.append(child)\n" +
      "element.prepend(child)\n" +
      "element.insertBefore(newNode, referenceNode)\n" +
      "element.appendChild(childNodeOnly)\n" +
      "element.before(newNode)\n" +
      "element.after(newNode)\n" +
      "parent.replaceChild(newChild, oldChild)\n" +
      "element.replaceWith(newNode)\n" +
      "element.insertAdjacentElement(position, newElement)\n" +
      "position = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend'\n\n" +
      "Not supported:\n" +
      "element.insertAdjacentHTML(position, newElement)\n" +
      "element.outerHTML = 'replaceThisElementByHTMLcode'\n" +
      "element.innerHTML = 'replaceAllChildrenByHTMLcode'";
    console.info(helpMess);
  }
}
// create the function .div(), a(), section()...
JSMLComponent.createJsmlTags(JSMLComponent.htmlTags);

class Arm {
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
class Waiter {
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

(function () {
  // add jsml setter to create instance of JSMLComponent without registration
  Object.defineProperty(window, "JSML", {
    get() {
      return JSMLComponent;
    },
    configurable: false,
  });

  // add Waiter to window
  Object.defineProperty(window, "Waiter", {
    get() {
      return Waiter;
    },
    configurable: false,
  });

  /*
   * According to the selector
   * if is a string css selector => returns document.querySelector(selector)
   * if is a HTMLElement => returns it
   * if is a string starting by < and ending by >
   *     if the node is registrated => return the JSMLComponent instance
   *     if the node does not exists => return new JSMLComponent and registrate it
   * else throw an error
   */
  window.$ = function (selector = "html", model = false, data = {}) {
    // Returns the first element associated to the selector
    if (typeof selector === "string") {
      // To register the custom with name between <>
      // Or get custom registered node
      if (/^<\s*[\w-]+\s*>$/.test(selector)) {
        const fsel = selector.replace(/[<>\s]/g, "");
        if (JSMLComponent.exists(fsel)) return JSMLComponent.getComponent(fsel);
        return new JSMLComponent(fsel, model, data);
      }
      return document.querySelector(selector);
    }
    // Returns JSMLComponent
    if (selector instanceof HTMLElement) return new JSMLComponent(selector);

    throw new Error("Invalid selector. Must be a string or element.");
  };

  // shorthand document.querySelectorAll
  window.$$ = function (selector) {
    return document.querySelectorAll(selector);
  };

  // /!\ use window.$ shorthand
  // shorthand addEventListener, addEventListener once, removeEventListener
  window._ = function (action = "set", fun, event, selector) {
    event = event
      .trim()
      .replace(/^on|on$/g, "")
      .replace(/\s+/g, "");
    const element = selector instanceof Element ? selector : $(selector);
    switch (action) {
      case "set":
        element.addEventListener(event, fun);
        return;
      case "once":
        element.addEventListener(event, fun, { once: true });
        return;
      case "remove":
        element.removeEventListener(event, fun);
        return;
      default:
        return;
    }
    /*
    options: 
        capture: true->event triggered during the capture phase,def:alse
        once: true -> removed after first time triggered, default:false,
        passive: true -> not allow preventDefault(), default:false,
        signal: AbortSignal ( new AbortController() ).signal
    */
  };

  // /!\ use window.$$ shorthand
  // to apply event listener to a set of elements
  window.__ = function (action = "set", fun, event, selector) {
    const isElement = selector instanceof Element;
    if (isElement) {
      console.warn(
        "Element passed to window__. NodeList or selector expected."
      );
      return _(action, fun, event, selector);
    }
    const notSelector = typeof selector !== "string";
    const notNodeList = !(selector instanceof NodeList);
    if (notSelector && notNodeList) return;

    const elements = notSelector ? selector : $$(selector);
    if (elements.length === 0) console.warn("No element found.");
    elements.forEach((element) => {
      _(action, fun, event, element);
    });
  };
})();
