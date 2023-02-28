import { ConfluenceEvent, JiraEvent } from './eventTriggers';
import { getUserRecord, User } from './storage/userData';

export interface StandardContext {
    product: 'jira' | 'confluence';
    accountId: string;
    atlassianId: string;
    cloudId: string;
    localId: string;
    moduleKey: string;
    environmentType: any;
    extensionContext: any;
    caller: string;
    isLicensed: boolean;
}

export interface StandardEvent {
    eventName: string;
    eventDisplayName: string;
    accountId: string;
    userRecord: User;
    source: string;
    product: string;
    context: StandardContext;
    event: ConfluenceEvent | JiraEvent;
}

export const getActivePowerUp = (userRecord) => {
    const activePowerUp = userRecord.activePowerUp;
    const activePowerUpExpiration = userRecord.activePowerUpExpiration;

    // Both of these must be populated to be valid
    if (!activePowerUp || !activePowerUpExpiration) {
        return 'none';
    }

    if (new Date(userRecord.activePowerUpExpiration).getTime() < new Date().getTime()) {
        console.debug('PowerUp has expired.');
        return 'none';
    } else {
        console.info(`${userRecord.accountId} is using ${activePowerUp}`);
        return activePowerUp;
    }
};

export function isLicenseActive(context) {
    // Check for an environment variable that overrides the license state
    const override = process.env.LICENSE_OVERRIDE;
    if (typeof override !== 'undefined') {
        if (override.toLowerCase() === 'active') {
            return true;
        }
        if (override.toLowerCase() === 'inactive') {
            return false;
        }
    }
    // Else return the actual value
    return context && context.license && context.license.isActive;
}

export const getStandardContext = (context, caller) => {
    let standardContext = {
        accountId: context.accountId,
        atlassianId: context.accountId,
        cloudId: context.cloudId,
        localId: context.localId,
        moduleKey: context.moduleKey,
        environmentType: context.environmentType,
        extensionContext: context.extensionContext,
        caller: caller,
        isLicensed: isLicenseActive(context)
    } as StandardContext;

    if (context.installContext.indexOf('jira') > -1) {
        standardContext.product = 'jira';
    } else if (context.installContext.indexOf('confluence') > -1) {
        standardContext.product = 'confluence';
    }

    return standardContext;
};

// we'll standardize the events so that we can add a schedule or webhook trigger to the same function later
export const getStandardEvent = async (sourceEvent: ConfluenceEvent | JiraEvent, context: StandardContext, sourceName) => {
    const standardEvent = {
        eventName: sourceEvent.eventName,
        eventDisplayName: sourceEvent.eventDisplayName,
        accountId: sourceEvent.accountId,
        userRecord: await getUserRecord(sourceEvent.accountId, context),
        source: sourceName,
        product: context.product,
        context: context,
        event: sourceEvent
    };

    console.debug('Standard event: ', standardEvent);
    return standardEvent as StandardEvent;
};

export const generateRandomString = (myLength) => {
    const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
    const randomArray = Array.from({ length: myLength }, () => chars[Math.floor(Math.random() * chars.length)]);

    const randomString = randomArray.join('');
    return randomString;
};
