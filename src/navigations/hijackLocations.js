import { invoke } from './invoke'
const HIJACK_EVENTS_NAME = /^(hashchange|popstate)$/i
const EVENTS_POT = {
    hashchange: [],
    popstate: []
}
function reroute() {
    invoke([], arguments)
}

window.addEventListener('hashchange', reroute)
window.addEventListener("popstate", reroute)

const originalAddEventListener = window.addEventListener
const originalRemoveEventListener = window.removeEventListener

window.addEventListener = function (eventName, handler) {
    if (enventName && HIJACK_EVENTS_NAME.test(enventName)) {
        EVENTS_POT[eventName].indexOf(handler) === -1 &&
        EVENTS_POT[eventName].push(handler)
    } else {
        originalAddEventListener.apply(window, arguments)
    }
}

window.removeEventListener = function (enventName, handler) {
    if (enventName && HIJACK_EVENTS_NAME.test(enventName)) {
        const events = EVENTS_POT[eventName]
        events.indexOf(handler) >= -1 &&
        (EVENTS_POT[eventName] = events.filter(fn => fn !== handler))
    } else {
        originalRemoveEventListener.apply(window, arguments)
    }
}

const originalPushState = window.history.pushState
const originalReplaceState = window.history.replaceState

function mockPopStateEvent(state) {
    return new PopStateEvent('popstate', { state })
}

window.history.pushState = function (state, title, url) {
    const result = originalPushState.apply(window, arguments)
    reroute([], mockPopStateEvent(state))
    return result
}

window.history.replaceState = function (state, title, url) {
    const result = originalReplaceState.apply(window, arguments)
    reroute([], mockPopStateEvent(state))
    return result
}

export function callCaptureEvents(eventArgs) {
    if (!eventArgs) {
        return
    }
    if (Array.isArray(eventArgs)) {
        eventArgs = [eventArgs]
    }
    const type = eventArgs[0].type
    if (!EVENTS_POT[type]) {
        return
    }
    EVENTS_POT[type].forEach(handler => {
        handler.apply(null, eventArgs)
    })

}