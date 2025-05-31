import JSMLFragment from "./JSMLFragment.js";

/**
 * Create fragment from potential various fragments
 * Register this fragment or not
 * Transform this fragment in custom component (<my-*>) or not
 */
export default class JSMLComponent {
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
    return name in this.#components;
  }

  static createJsmlTags(tagsObject) {
    for (const tag of tagsObject.nonSelfClosing) {
      // Normal version
      JSMLComponent.prototype[tag] = function (attrs) {
        return this._(tag, attrs, false, false);
      };
    }

    for (const tag of tagsObject.selfClosing) {
      // Self closing version
      JSMLComponent.prototype[tag] = function (attrs) {
        return this._(tag, attrs, true, false);
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

//shortcuts
/*
  div(data) { return this._("div", data); }
  ul(data) {
    return this._("ul", data);
  }
  li(data) {
    return this._("li", data);
  }
  img(data) {
    return this._("img", data, true);
  }
  h1(data) {
    return this._("h1", data);
  }
  span(data) {
    return this._("span", data);
  }
  btn(data) {
    return this._("button", data);
  }
  nav(data) {
    return this._("nav", data);
  }
  pre(data) {
    return this._("pre", data);
  }
  p(data) {
    return this._("p", data);
  }
  main(data) {
    return this._("main", data);
  }
  footer(data) {
    return this._("footer", data);
  }
  b(data) {
    return this._("b", data);
  }
  */
