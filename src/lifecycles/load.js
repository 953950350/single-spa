import {
    NOT_LOADED,
    LOAD_SOURCE_CODE,
    SKIP_BECAUSE_BROKEN,
    LOAD_ERROR,
    NOT_BOOTSTRAPED
} from '../applications/apps.helper'
import {
    smellLikePromise,
    flattenLifecyclesArray,
    getProps
} from './helper'
import {
    ensureTImeout
} from '../applications/timeout'

export function toLoadPromise(app) {
    if (app.status !== NOT_LOADED) {
        return Promise.resolve(app)
    }

    app.status = LOAD_SOURCE_CODE

    let loadPromise = app.loadFunction(getProps(app))

    if (!smellLikePromise(loadPromise)) {
        app.status = SKIP_BECAUSE_BROKEN
        return Promise.reject(new Error(''))
    }

    return loadPromise.then(appConfig => {
        if (typeof appConfig !== 'object') {
            throw new Error('')
        }
        let errors = []
        // 声明周期 bootstrap mount unmount
        ;
        ['bootstrap', 'mount', 'unmount'].forEach(lifecycle => {
            if (!appConfig[lifecycle]) {
                errors.push(`lifecycle: ${lifecycle} must be exists`)
            }

        })
        if (errors.length) {
            app.status = SKIP_BECAUSE_BROKEN
            console.log(errors)
            return app
        }

        app.status = NOT_BOOTSTRAPED
        app.bootstrap = flattenLifecyclesArray(appConfig.bootstrap, `${app.appName} bootstrapping`)
        app.mount = flattenLifecyclesArray(appConfig.mount, `${app.appName} mounting`)
        app.unmount = flattenLifecyclesArray(appConfig.unmount, `${app.appName} unmounting`)

        app.timeouts = ensureTImeout(appConfig.timeouts)
        return app
    }).catch(e => {
        app.status = LOAD_ERROR
        console.log(e)
    })
}