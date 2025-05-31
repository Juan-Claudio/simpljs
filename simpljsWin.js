import JSMLComponent from "./JSMLComponent.js";

export const installSimpljsInWindow = function () {
  // add mljs setter to create instance of JSMLComponent without registration
  Object.defineProperty(window, "jsml", {
    get() {
      return new JSMLComponent();
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
};
