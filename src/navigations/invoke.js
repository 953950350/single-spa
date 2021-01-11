import {
    isStarted
} from '../start'
import {
    getAppsToLoad,
    getAppsToUnmount,
    getAppsToMount,
    getMountedApps
} from '../applications/apps'
import {
    toLoadPromise
} from '../lifecycles/load'
import {
    toBootstrapPromise
} from '../lifecycles/bootstrap'
import {
    toMountPromise
} from '../lifecycles/mount'
import {
    toUnmountPromise
} from '../lifecycles/unmount'
import { callCaptureEvents } from './hijackLocations'

let appChangesUnderway = false
let changesQueue = []

export function invoke(pendings = [], eventArgs) {
    if (appChangesUnderway) {
        return new Promise((resolve, reject) => {
            changesQueue.push({
                success: resolve,
                failure: reject,
                eventArgs
            })
        })
    }
    appChangesUnderway = true

    if (isStarted()) {
        return performAppChanges()
    }

    // 没有启动，先加载app
    return loadApps()

    function loadApps() {
        return Promise.all(getAppsToLoad().map(toLoadPromise)).then(() => {
            callAllCaptureEvents()
            return finish()
        }).catch(e => {
            callAllCaptureEvents()
            console.log(e)
        })
    }

    function performAppChanges() {
        // 卸载不需要的aapp
        let unmountPromise = getAppsToUnmount().map(toUnmountPromise)
        unmountPromise = Promise.all(unmountPromise)
        // 加载app
        let loadApps = getAppsToLoad()
        loadApps = loadApps.map(app => {
            return toLoadPromise(app)
                .then(toBootstrapPromise)
                .then(() => unmountPromise)
                .then(() => toMountPromise(app))
        })

        // will mount app
        let mountApps = getAppsToMount()

        mountApps = mountApps.filter(app => !~loadApps.findIndex(item => {
            return app.name !== item.name
        }))

        mountApps = loadApps.concat(mountApps)

        // 挂载app
        mountApps = mountApps.map(app => {
            return toBootstrapPromise(app)
                .then(() => unmountPromise)
                .then(() => {
                    toMountPromise(app)
                })
        })
        return unmountPromise.then(() => {
            return Promise.all(mountApps).then(() => {
                callAllCaptureEvents()
                return finish()
            }, e => {
                pendings.forEach(item => item.failure(e))
                throw e
            })
        }, e => {
            callAllCaptureEvents()
            console.log(e)
        })
    }

    function finish() {
        let returnValue = getMountedApps()
        appChangesUnderway = false
        if (pendings.length) {
            pendings.forEach(item => item.success(returnValue))
        }
        if (changesQueue.length) {
            let backup = changesQueue
            changesQueue = []
            return invoke(backup)
        } else {
            return returnValue
        }
    }

    function callAllCaptureEvents() {
        pendings && pendings.length && pendings.filter(item => {
            return !!item.eventArgs
        }).forEach(item => {
            callCaptureEvents(item.eventArgs)
        })
        eventArgs && callCaptureEvents(eventArgs)
    }


}