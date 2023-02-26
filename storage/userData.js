import api, { route } from '@forge/api';
import { defaultUserRecord } from '../defaults/userRecord';
import { getActivePowerUp } from '../utils';
import { setConfigurationSettings } from './configurationData';
import { deleteDistributedData, getDistributedData, setDistributedData } from './distributedStorage';

const userPrefix = 'userRecord';

export const getJiraUserProperty = async (propertyName) => {
    try {
        const userData = await getJiraAppUser();

        const userPropertyResponse = await api
            .asApp()
            .requestJira(route`/rest/api/3/user/properties/${propertyName}?accountId=${userData.accountId}`, {
                headers: {
                    Accept: 'application/json'
                }
            });

        if (userPropertyResponse.status === 404 || userPropertyResponse.status === 403) {
            return null;
        }

        return (await userPropertyResponse.json()).value;
    } catch (error) {
        console.error('Error getting jira user property:', error);
    }
};

export const setJiraUserProperty = async (propertyName, propertyValue) => {
    console.debug('setJiraUserProperty', propertyName, propertyValue);
    try {
        const userData = await getJiraAppUser();

        const response = await api
            .asApp()
            .requestJira(route`/rest/api/3/user/properties/${propertyName}?accountId=${userData.accountId}`, {
                method: 'PUT',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(propertyValue)
            });

        if (response.status !== 204 && response.status !== 201 && response.status !== 200) {
            console.error(response);
            throw new Error('Error setting jira user property: ' + response.status);
        }
    } catch (error) {
        console.error('Error setting jira user property:', error);
    }
};

export const getConfluenceUserProperty = async (propertyName) => {
    try {
        const userData = await getConfluenceAppUser();

        const userPropertyResponse = await api
            .asApp()
            .requestConfluence(route`/wiki/rest/api/user/${userData.accountId}/property/${propertyName}`, {
                headers: {
                    Accept: 'application/json'
                }
            });

        if (userPropertyResponse.status === 404 || userPropertyResponse.status === 403) {
            return null;
        } else if (userPropertyResponse.status !== 200) {
            console.error('Error getting confluence user property:', userPropertyResponse);
            throw new Error('Error getting confluence user property: ' + userPropertyResponse.status);
        }

        return (await userPropertyResponse.json()).value;
    } catch (error) {
        console.error('Error getting confluence user property:', error);
    }
};

export const setConfluenceUserProperty = async (propertyName, propertyValue) => {
    console.debug('setConfluenceUserProperty', propertyName, propertyValue);
    try {
        const userData = await getConfluenceAppUser();
        var bodyData = {
            value: propertyValue
        };

        const response = await api
            .asApp()
            .requestConfluence(route`/wiki/rest/api/user/${userData.accountId}/property/${propertyName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });

        if (response.status !== 204 && response.status !== 201 && response.status !== 200) {
            console.error(response);
            throw new Error('Error setting confluence user property: ' + response.status);
        }
    } catch (error) {
        console.error('Error setting confluence user property:', error);
    }
};

export const getConfluenceAppUser = async () => {
    const userDataResponse = await api.asApp().requestConfluence(route`/wiki/rest/api/user/current`, {
        headers: {
            Accept: 'application/json'
        }
    });

    const userData = await userDataResponse.json();
    return userData;
}

export const getJiraAppUser = async () => {
    const userDataResponse = await api.asApp().requestJira(route`/rest/api/3/myself`, {
        headers: {
            Accept: 'application/json'
        }
    });

    const userData = await userDataResponse.json();
    return userData;
}

export const isUserRegistered = async (accountId, autoRegister) => {};

export const getUserRecord = async (accountId, context) => {
    try {
        const userRecord = await getDistributedData(`${userPrefix}.${accountId}`, context.product);
        if (userRecord === null) {
            let newUserRecord = {...defaultUserRecord, accountId: accountId};
            console.debug('Creating new user record for', accountId, newUserRecord);
            await setUserRecord(accountId, newUserRecord, context);
            return newUserRecord;
        } else {
            return userRecord;
        }
    } catch (error) {
        console.error(`Error getting user record for ${accountId}:`, error);
    }
};

export const setUserRecord = async (accountId, userRecord, context) => {
    try {
        await setDistributedData(`${userPrefix}.${accountId}`, userRecord, context.product);
    } catch (error) {
        console.error(`Error setting user record for ${accountId}:`, error);
    }
};

export const deleteUserRecord = async (accountId, context) => {
    try {
        await deleteDistributedData(`${userPrefix}.${accountId}`, context.product);
    } catch (error) {
        console.error(`Error deleting user record for ${accountId}:`, error);
    }
};

export const getNarrowUserRecord = (userRecord) => {
    return {
        accountId: userRecord.accountId,
        awardBalance: userRecord.awardBalance,
        activePowerUp: userRecord.activePowerUp,
        activePowerUpExpiration: userRecord.activePowerUpExpiration
    };
};

export const awardUserAwardIncrement = async (standardEvent, awardWon, context) => {
    const wonCount = getUserWinCount(standardEvent.userRecord);

    let userRecord = standardEvent.userRecord;

    userRecord.awardActivity.push({
        awardId: awardWon.id,
        awardName: awardWon.name,
        incrementName: awardWon.incrementName,
        incrementsWon: wonCount,
        activePowerUp: userRecord.activePowerUp,
        awardActivity: standardEvent.eventDisplayName,
        date: new Date().toISOString()
    });

    let currentAwardBalance = userRecord.awardBalance.find((awardBalance) => awardBalance.id === awardWon.id);
    if (currentAwardBalance) {
        currentAwardBalance.balance += wonCount;
        userRecord.awardBalance = [...userRecord.awardBalance.filter((awardBalance) => awardBalance.id != awardWon.id), currentAwardBalance];
    } else {
        userRecord.awardBalance.push({
            id: awardWon.id,
            balance: wonCount
        });
    }

    await setUserRecord(standardEvent.accountId, userRecord, context);
    return userRecord;
};

export const applyUserEligibility = (eligibility, userRecord) => {
    const activePowerUp = getActivePowerUp(userRecord);

    switch (activePowerUp) {
        case 'luckyCharm10':
            console.info('Applying luckyCharm10 power up');
            return {
                ...eligibility,
                probability: eligibility.probability + 10
            };
        default:
            return eligibility;
    }
};

export const getUserWinCount = (userRecord) => {
    const activePowerUp = getActivePowerUp(userRecord);

    switch (activePowerUp) {
        case 'doubleReward':
            console.info('Applying doubleReward power up');
            return 2;
        default:
            return 1;
    }
};
