# Simpljs

[![npm version](https://img.shields.io/npm/v/simpljs.svg)](https://www.npmjs.com/package/simpljs)
[![npm downloads](https://img.shields.io/npm/dm/simpljs.svg)](https://www.npmjs.com/package/simpljs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/github/actions/workflow/status/yourusername/simpljs/ci.yml?branch=main)](https://github.com/yourusername/simpljs/actions)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

# Index

- [Description](#description)
- [Features](#features)
- [Installation](#installation)
- [Recommended Project Structure](#recommended-project-structure)
- [Uses](#uses)
  - [Waiter](#waiter)
  - [JSMLComponent](#jsmlcomponent)
  - [Simpljs in Window](#simpljs-in-window)
    - [Dollard](#dollard)
    - [Double dolard](#double-dollard)
    - [Simple or double low dash](#simple-or-double-low-dash)

## Description

**Pronounced** “simplis” — _a lightweight JavaScript library for simple event
handling and simple html components creation in component-structured projects._

## Features

- Minimalist and lightweight
- Simple integration with component-based architectures
- Custom event system with intuitive API
- Custom html component syntax using only javascript vanilla

## Installation

```bash
npm install simpljs
```

- ⚠️ This will install simpljs in Window: Window.$ and Window.\_ ⚠️
- ⚠️ Incompatibility with JQuery or Lowdash for example. ⚠️
- Give acces to 2 classes Waiter(events) and JSMLComponent(component)

## Recommended Project Structure

- Common resources
  `src/events/common.acts.js`
  `src/styles/common.[s]css`
  `src/styles/variables.[s]css`
  `src/styles/helpers.[s]css`
- Component-specific files
  `src/components/myComponents/myComponent1.acts.js`
  `src/components/myComponents/myComponent1.events.js`
  `src/components/myComponents/myComponent1.[html.js|mljs]`
  `src/components/myComponents/myComponent1.[s]css`

## Vocabulary

- **act** - _simple function that can be combined with another acts to create action._
- **action** - _event handler or function composed by various acts._
- **anchor** - _element delegated, where the event is virtually attached._
- **arm** - _single event attached to an anchor. Various arms in a waiter._
- **event** - _event type: 'click', 'dbclick'..._
- **harbor** - _element where the event listeners will be attached. Delegation._
- **snap** - _event object._
- **waiter** - _class which handle all events attached to the harbor._

## Uses

### Waiter

1. register acts globally - _simple functions to compose complex one_

```js
Waiter.addAct({
  act1(snap) {},
  act2(snap) {},
  act3(snap) {},
  act4(snap) {},
  act5(snap) {},
});
```

2. register arms in a waiter - _simple events to delegate to a waiter_

```js
const harborWaiter = new Waiter(harbor);
const triggered_once_arm = harborWaiter.once //do all acts it contains once
  .on("event") //on click, on dbclick, ...
  .at(".anchor") //selector: clicking, dbclicking... on this element querySelector(anchor)
  .arm(["act1", "act2"]) //merge 2 acts => called the first time the event triggered
  .then.arm(act3) //call this act the second time the event triggered
  //third trigger => the arm is disabled cause of the 'once' option
  .getArmId(); //get the composed id to get it from the Waiter class

const toggle_arm = harborWaiter
  .on("click")
  .at("#anchor1")
  .toggle(["act1", "act2", "act3"]) //each next event call the next act and start again
  //toggle() disable option 'once'
  .getArmId();

const swap_arm = harborWaiter
  .on("dbclick")
  .at("#anchor1")
  .arm("act1") // 1st trigger => do act1
  .then.arm(["act2", "act3"]) //2nd trigger => do act2+act3
  .arm("act4") // 3rd and all the next trigger => do act4
  .getArmId();

const passive_arm = harborWaiter.passive //disable preventDefault()
  .on("touchstart")
  .at('[data-custom="anchor3"]')
  .arm("act5")
  .getArmId();

//with option 'disable' this arm will not be attached to the waiter
//when will wait
//later it's possible to harborWaiter.enable(disabled_arm)
//and then harborWaiter.wait() to reload events
//it's possible to harborWaiter.disable(triggered_once_arm) too
//and reload to active this arm again
const disabled_arm = harborWaiter.disabled
  .on("touchstart")
  .at("#anchor4")
  .arm(["act5", "act1"])
  .getArmId();
```

3. activate the waiter

```js
//will prepare all arms and create all event listeners needed
harborWaiter.wait();
```

4. remove or add event in the listener

```js
harborWaiter.disable(myArmToDisable);
harborWaiter.enable(myArmToEnable);
harborWaiter.wait();
```

5. Stop waiting an event in particular

```js
harborWaiter.bye(eventName:string, isPassive:bool);
```

6. Stop waiting all events from the waiter

```js
harborWaiter.byebye();
```

### JSMLComponent

To create simple component without write html but only using javascript.
Not necessary to learn language like JSX or others.
The element behind the JSMLComponent is a DocumentFragment so you can clone it
or insert it for on shot usage of JSMLComponent.

#### File format

Files ending with .html.js.
Need a custom formatting style for clarity.
If you use Prettier, we recommend adding `**/*.html.js` to your .prettierignore.
Or use the comment `//prettier-ignore`.

Alternatively, if you'd like automatic formatting support, a solution is planned
for future versions to propose custom highlight.

#### Statements

- tags

Uses the Dom attributes name in object in parameter: `class` must be replaced
by `className` for example.

```js
//prettier-ignore
jsmlcomponent
  .div({ className: "example" })
    .p({ textContent: "Example text" }).end()
    .img({ src: "example.png", alt: "example", title: "example" })
  .end();
```

- add custom component

```js
//prettier-ignore
jsmlcomponent
  .div({ className: "example" })
    .p({ textContent: "Example text" }).end()
    .my('pictureBox', {width:100, border:'rounded'})
  .end();
```

### Simpljs in Window

#### dollard

- document.querySelector(selector) shorthand
- Or create/get custom component

```js
// Get element: querySelector() shorthand
$(selector);

// Create and register a JSMLComponent
// prettier-ignore
$("<my-component>", function (data) {
  return this.div({className:"my-custom-component", id:`my-${data.id}`}).end();
});

// Get the JSMLComponent, build it with data, copy it in `parent`
$("<my-component>").data({ id: 0 }).build.in($("#parent"));

// Get the JSMLComponent, rebuild it with new data and replace the previous
$("<my-component>").swap($("#my-0"), { id: 1 });
```

#### double dollard

```js
// document.querySelectorAll(selector) shorthand
$$(selector);
```

#### simple or double low dash

element.addEventListener() shorhand for not bubbling events or if you don't
want to use a Waiter.
You can add 'on' before and after event name to clarity or not.

```js
// Attache event to one element
_("set", doSomethihg, "on click on", ".selector");
_("once", doSomethihg, "on click on", "#selector");
_("remove", doSomethihg, "on click on", '[data-custom="selector"]');
// Attache event to various elements
__("set", doSomethihg, "on click on", ".selector");
__("once", doSomethihg, "on click on", "#selector");
__("remove", doSomethihg, "on click on", '[data-custom="selector"]');
```

## Author

Juan-Claudio <angeelric@gmail.com>
