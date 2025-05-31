// API to create fragment

export default class JSMLFragment {
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
