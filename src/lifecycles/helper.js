
export function smellLikePromise(promise) {
    if (promise instanceof Promise) {
        return true
    }
    return typeof promise === 'object' 
    && typeof promise.then === 'function'
    && typeof promise.catch === 'function'
}

export function flattenLifecyclesArray(lifecycle, description) {
    if (!Array.isArray(lifecycle)) {
        lifecycle = [lifecycle]
    }
    if (!lifecycle.length) {
        lifecycle = [() => Promise.resolve()]
    }
    return () => {
        return lifecycle.reduce((pre, current) => {
            current = current()
            if (!smellLikePromise(current)) {
                return Promise.reject(new Error(`${description} has error`))
            }
            return pre.then(current)
        }, Promise.resolve())
    }
}

export function getProps(app) {
    return {
        name: app.appName,
        // status: app.status,
        ...app.customProps
    }
}