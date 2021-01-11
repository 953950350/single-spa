
const TIMEOUTS = {
    bootstrap: {
        millisecods: 3000,
        rejectWhenTimeout: false
    },
    mount: {
        millisecods: 3000,
        rejectWhenTimeout: false
    },
    unmount: {
        millisecods: 3000,
        rejectWhenTimeout: false
    }
}

export function resonableTime(lifecyclePromise, description, timeout) {
    return new Promise((resolve, reject) => {
        let finished = false
        lifecyclePromise.then((data) => {
            finished = true
            resolve(data)
        }).catch(e => {
            finished = true
            reject(e)
        })

        setTimeout(() => {
            if (finished) {
                return
            }
            if (timeout.rejectWhenTimeout) {
                reject(`${description}`)
            } else {
                console.log('timeout but waiting')
            }
        }, timeout)
    })
}

export function ensureTImeout(timeouts = {}) {
    return {
        ...TIMEOUTS,
        ...timeouts
    }
}