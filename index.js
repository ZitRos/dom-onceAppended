/**
 * Since browsers (JavaScript) does not provide any API to handle Element's append event, we have to
 * use a hacky-tricky solutions for this. There are two "clean" methods discovered for now of how
 * append event can be implemented. Of course, there is a lot more methods of solution, but these
 * ones are fully modular and does not have side effects.
 * Chose one that fits your needs at best.
 * @author ZitRo (https://github.com/ZitRos)
 * @see http://goo.gl/Ai2bkw (StackOverflow original question)
 * @see https://github.com/ZitRos/dom-onceAppended (Home repository)
 */

function useDeprecatedMethod (element, callback) {
    let listener;
    return element.addEventListener(`DOMNodeInserted`, listener = (ev) => {
        if (ev.path.length > 1 && ev.path[ev.length - 2] instanceof Document) {
            element.removeEventListener(`DOMNodeInserted`, listener);
            callback();
        }
    }, false);
}

function isAppended (element) {
    while (element.parentNode)
        element = element.parentNode;
    return element instanceof Document;
}

/**
 * Method 1. Asynchronous. Has a better performance but also has an one-frame delay after element is
 * appended (around 25ms delay) of callback triggering.
 * This method is based on CSS3 animations and animationstart event handling.
 * Fires callback once element is appended to the document.
 * @param {HTMLElement} element - Element to be appended
 * @param {function} callback - Append event handler
 */
export function onceAppended (element, callback) {

    if (isAppended(element)) {
        callback();
        return;
    }

    let sName = `animation`, pName = ``;

    if ( // since DOMNodeInserted event is deprecated, we will try to avoid using it
        typeof element.style[sName] === `undefined`
        && (sName = `webkitAnimation`) && (pName = "-webkit-")
            && typeof element.style[sName] === `undefined`
        && (sName = `mozAnimation`) && (pName = "-moz-")
            && typeof element.style[sName] === `undefined`
        && (sName = `oAnimation`) && (pName = "-o-")
            && typeof element.style[sName] === `undefined`
    ) {
        return useDeprecatedMethod(element, callback);
    }

    if (!document.__ONCE_APPENDED) {
        document.__ONCE_APPENDED = document.createElement('style');
        document.__ONCE_APPENDED.textContent = `@${ pName }keyframes ONCE_APPENDED{from{}to{}}`;
        document.head.appendChild(document.__ONCE_APPENDED);
    }

    let oldAnimation = element.style[sName];
    element.style[sName] = `ONCE_APPENDED`;
    element.addEventListener(`animationstart`, () => {
        element.style[sName] = oldAnimation;
        callback();
    }, true);

}

/**
 * Method 2. Synchronous. Has a lower performance for pages with a lot of elements being inserted,
 * but triggers callback immediately after element insert.
 * This method is based on MutationObserver.
 * Fires callback once element is appended to the document.
 * @param {HTMLElement} element - Element to be appended
 * @param {function} callback - Append event handler
 */
export function onceAppendedSync (element, callback) {

    if (isAppended(element)) {
        callback();
        return;
    }

    const MutationObserver =
        window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

    if (!MutationObserver)
        return useDeprecatedMethod(element, callback);

    const observer = new MutationObserver((mutations) => {
        if (mutations[0].addedNodes.length === 0)
            return;
        if (Array.prototype.indexOf.call(mutations[0].addedNodes, element) === -1)
            return;
        observer.disconnect();
        callback();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

}