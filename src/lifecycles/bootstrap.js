import {
    NOT_MOUNTED,
    BOOTSTRAPPING,
    NOT_BOOTSTRAPED,
    SKIP_BECAUSE_BROKEN
} from '../applications/apps.helper'
import {
    resonableTime
} from '../applications/timeout'
import {
    getProps
} from './helper'


export function toBootstrapPromise(app) {
    if (app.status !== NOT_BOOTSTRAPED) {
        return Promise.resolve(app)
    }
    app.status = BOOTSTRAPPING

    return resonableTime(app.bootstrap(getProps(app)), `app: ${app.name} bootstrapping`, app.timeouts.bootstrap)
        .then(() => {
            app.status = NOT_MOUNTED
            return app
        })
        .catch((e) => {
            app.status = SKIP_BECAUSE_BROKEN
            console.log(e)
            return app
        })
}