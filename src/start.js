
import { invoke } from './navigations/invoke'

let started = false

export function start() {
    if (started) {
        return
    }
    started = true
    return invoke()
}

export function isStarted() {
    return started
}