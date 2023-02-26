import { getDefaultAward, hasDefaultAwardSuggestion } from '../defaults/awardSuggestions';
import { generateRandomString, StandardContext } from '../utils';
import { getConfigurationSettings, setConfigurationSettings } from './configurationData';
import { deleteDistributedData, getDistributedData, setDistributedData } from './distributedStorage';
import { getNarrowUserRecord, getUserWinCount } from './userData';

const awardPrefix = 'awardSettings';

export interface AwardHistoryRecord {
    accountId: string;
    action: string;
    difference: number;
    balance: number;
    expirationDate?: any; // timestamp
    locations: string[];
    date: any; // timestamp
}

export interface AwardEntry {
    id: string;
    name: string;
    description: string;
    incrementName: string;
    quantityRequired: number;
    outstandingAwards: number;
    enabled: boolean;
    validUntil?: number; // timestamp
    availableLocations?: string[];
    icon?: string;
    awardHistory?: AwardHistoryRecord[];
    awardRedeemedMessage?: string;
}

export interface AwardEntryNarrow {
    id: string;
    name: string;
    description: string;
    incrementName: string;
    quantityRequired: number;
    outstandingAwards: number;
    enabled: boolean;
    icon?: string;
}

export const replaceUndefinedAwardValues = (formData, awardOptionState) => {
    const result = {};
    Object.keys(awardOptionState).forEach((key) => {
        if (formData[key] === undefined) {
            result[key] = awardOptionState[key];
        } else {
            result[key] = formData[key];
        }
    });

    Object.keys(formData).forEach((key) => {
        if (awardOptionState[key] === undefined) {
            result[key] = formData[key];
        }
    });

    return result as AwardEntry;
};

export const getNarrowAward = (awardId: string, awardOptions: AwardEntry) => {
    return {
        id: awardId,
        name: awardOptions.name,
        description: awardOptions.description,
        enabled: awardOptions.enabled,
        outstandingAwards: awardOptions.outstandingAwards,
        incrementName: awardOptions.incrementName,
        quantityRequired: awardOptions.quantityRequired,
    } as AwardEntryNarrow;
};

export const getAwardOption = async (awardId, context: StandardContext) => {
    try {
        const awardSettings = await getDistributedData(`${awardPrefix}.${awardId}`, context.product);
        if (!awardSettings) {
            console.debug(`No award settings found for ${awardId}, looking for a default`);
            if (hasDefaultAwardSuggestion(awardId)) {
                const defaultAward = getDefaultAward(awardId);
                console.debug(`Default award found for ${awardId}`);
                return defaultAward;
            } else {
                return null;
            }
        }
        return awardSettings as AwardEntry;
    } catch (error) {
        console.error(`Error getting award settings for ${awardId}`, error);
    }
};

export const deleteAwardOption = async (awardId: string, context: StandardContext) => {
    try {
        await deleteDistributedData(`${awardPrefix}.${awardId}`, context.product);
        console.debug(`Award settings deleted for ${awardId}`);
    } catch (error) {
        console.error(`Error deleting award settings for ${awardId}`, error);
    }
};

export const saveAwardOption = async (awardId: string, awardOption: AwardEntry, context: StandardContext) => {
    try {
        await setDistributedData(`${awardPrefix}.${awardId}`, awardOption, context.product);
        console.debug(`Award settings saved for ${awardId}`);
    } catch (error) {
        console.error(`Error saving award settings for ${awardId}`, error);
    }
};

export const getActiveProductAwards = async (product, context: StandardContext, configuration) => {
    if (!configuration) {
        configuration = await getConfigurationSettings(context);
    }

    let activeAwards = [];
    for (let i = 0; i < configuration.awards.length; i++) {
        const awardId = configuration.awards[i].id;
        const awardEnabled = configuration.awards[i].enabled;
        if (awardEnabled) {
            const awardOption = await getAwardOption(awardId, context);
            if (awardOption) {
                if (
                    Array.isArray(awardOption.availableLocations) &&
                    awardOption.availableLocations.indexOf(product) > -1
                ) {
                    activeAwards.push(awardOption);
                }
            } else {
                console.error(`No award settings found for ${awardId}`);
            }
        }
    }

    return activeAwards;
};

export const recordAwardRedemption = async (award, userRecord) => {
    const redemptionCode = generateRandomString(6).toUpperCase();
    const redemptionRecord = {
        accountId: userRecord.accountId,
        status: 'pending',
        awardId: award.id,
        awardName: award.name,
        redemptionCode: redemptionCode,
        date: new Date().toISOString(),
    };

    return redemptionRecord;
};

export const recordAwardedIncrementWon = async (
    standardEvent,
    awardWon,
    context: StandardContext,
    configuration,
    updatedUser
) => {
    try {
        const wonCount = getUserWinCount(standardEvent.userRecord);
        awardWon.outstandingAwards = awardWon.outstandingAwards - wonCount;
        const awardHistoryRecord = {
            accountId: standardEvent.accountId,
            action: 'won',
            difference: -wonCount,
            balance: awardWon.outstandingAwards,
            locations: [standardEvent.product],
            date: new Date().toISOString(),
        };

        if (Array.isArray(awardWon.awardHistory)) {
            awardWon.awardHistory.push(awardHistoryRecord);
        } else {
            awardWon.awardHistory = [awardHistoryRecord];
        }

        const narrowAward = getNarrowAward(awardWon.id, awardWon);
        const narrowUser = getNarrowUserRecord(updatedUser);

        configuration.awards = [...configuration.awards.filter((award) => award.id !== awardWon.id), narrowAward];

        configuration.activeUsers = [
            ...configuration.activeUsers.filter((user) => user.accountId !== narrowUser.accountId),
            narrowUser,
        ];

        let promises = [];
        promises.push(setConfigurationSettings(configuration, context));
        promises.push(saveAwardOption(awardWon.id, awardWon, context));
        await Promise.all(promises);
    } catch (error) {
        console.error(`Error recording awarded increment for ${awardWon.id} on user ${standardEvent.accountId}`, error);
    }
};
