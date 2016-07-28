# Element append callback implementation

**JavaScript ES6** implementation of element's append event handling.

Since browsers (JavaScript) does not provide any API to handle element's
append event, we have to use a hacky-tricky solutions for this. There
are two "clean" methods discovered for now of how append event can be
implemented. Of course, there is a lot more methods of solution, but
these ones are fully modular and does not have side effects. Chose one
that fits your needs at best.

The first method (`onceAppended`) uses CSS animations to detect whether
element is appended and is based on `animationstart` event. The second
method uses MutationObserver events to detect element append
(`onceAppendedSync`). The second method has poor performance if there
are a lot of elements append to the page, while the first method has a
little delay of triggering `callback` (1 frame, around 25ms).

An Example of Usage 
-------------------

Let say we develop a JavaScript module, which knows nothing about the
environment it will be used in. Our module returns an element, which
needs to be initialized once appended.

To use the trigger, you need to install npm package `dom-once-appended`:
```bash
npm install --save-dev dom-once-appended
```

After installing the package, you have a choice of which method to use.
The example below demonstrates the usage of `onceAppended` function,
while `onceAppendedSync` function is available as well with the same
parameters.

```js
import { onceAppended } from "dom-once-appended";

function myModule () {
    let sampleElement = document.createElement("div");
    onceAppended(sampleElement, () => { // module initialization
        console.log(`Sample element is appended!`);
    });
    return sampleElement;
}

// somewhere else in the sources (example)
let element = myModule();
setTimeout(() => document.body.appendChild(element), 200);
```

Contributing
------------

If you have found a better methods of handling element's append event,
have some improvements on existing methods or want to add any
functionality, your contributions are welcome. Start by creating an
[issue](https://github.com/ZitRos/dom-onceAppended/issues/new) on GitHub
describing what you have discovered.