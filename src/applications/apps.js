import {
    NOT_LOADED,
    notSkip,
    noLoadError,
    isntLoaded,
    shouldBeActivity,
    isActive,
    isLoaded,
    isntActive,
    shouldntBeActivity
} from './apps.helper'
import {
    invoke
} from '../navigations/invoke'

/**
 * 注册app
 * @param {string} appName 要注册的app名称
 * @param {Function<Promise>|Object} loadFuction app异步加载函数或app内容
 * @param {Function<boolean>} activityWhen 判断该app应该在何时被启动
 * @param {Object} customProps 自定义配置
 * return Promise
 */
const Apps = []
export function registerApplication(appName, loadFunction, activityWhen, customProps = {}) {
    if (!appName || typeof appName !== 'string') {
        throw new Error('appName 不能为空，且为字符串')
    }
    if (!loadFunction) {
        throw new Error('loadFunction 不能为空')
    }
    if (typeof loadFunction !== 'function') {
        loadFunction = Promise.resolve(loadFunction)
    }
    if (!activityWhen || typeof activityWhen !== 'function') {
        throw new Error('activityWhen 不能为空')
    }

    Apps.push({
        appName,
        loadFunction,
        activityWhen,
        customProps,
        status: NOT_LOADED
    })
    invoke()
}

export function getAppsToLoad() {
    return Apps.filter(notSkip)
        .filter(noLoadError)
        .filter(isntLoaded)
        .filter(shouldBeActivity)
}

export function getAppsToUnmount() {
    return Apps.filter(notSkip)
        .filter(isActive)
        .filter(shouldntBeActivity)
}

export function getAppsToMount() {
    return Apps.filter(notSkip)
        .filter(isLoaded)
        .filter(isntActive)
        .filter(shouldBeActivity)
}

export function getMountedApps() {
    return Apps.filter(app => isActive(app))
}