import { getDefaultReward, hasDefaultRewardSuggestion } from '../defaults/rewardSuggestions';
import { generateRandomString, StandardContext } from '../utils';
import { getConfigurationSettings, setConfigurationSettings } from './configurationData';
import { deleteDistributedData, getDistributedData, setDistributedData } from './distributedStorage';
import { getNarrowUserRecord, getUserWinCount } from './userData';

const rewardPrefix = 'rewardSettings';

export interface RewardHistoryRecord {
    accountId: string;
    action: string;
    difference: number;
    balance: number;
    expirationDate?: any; // timestamp
    locations: string[];
    date: any; // timestamp
}

export interface RewardEntry {
    id: string;
    name: string;
    description: string;
    incrementName: string;
    quantityRequired: number;
    outstandingRewards: number;
    enabled: boolean;
    validUntil?: number; // timestamp
    availableLocations?: string[];
    icon?: string;
    rewardHistory?: RewardHistoryRecord[];
    rewardRedeemedMessage?: string;
}

export interface RewardEntryNarrow {
    id: string;
    name: string;
    description: string;
    incrementName: string;
    quantityRequired: number;
    outstandingRewards: number;
    enabled: boolean;
    icon?: string;
}

export const replaceUndefinedRewardValues = (formData, rewardOptionState) => {
    const result = {};
    Object.keys(rewardOptionState).forEach((key) => {
        if (formData[key] === undefined) {
            result[key] = rewardOptionState[key];
        } else {
            result[key] = formData[key];
        }
    });

    Object.keys(formData).forEach((key) => {
        if (rewardOptionState[key] === undefined) {
            result[key] = formData[key];
        }
    });

    return result as RewardEntry;
};

export const getNarrowReward = (rewardId: string, rewardOptions: RewardEntry) => {
    return {
        id: rewardId,
        name: rewardOptions.name,
        description: rewardOptions.description,
        enabled: rewardOptions.enabled,
        outstandingRewards: rewardOptions.outstandingRewards,
        incrementName: rewardOptions.incrementName,
        quantityRequired: rewardOptions.quantityRequired
    } as RewardEntryNarrow;
};

export const getRewardOption = async (rewardId, context: StandardContext) => {
    try {
        const rewardSettings = await getDistributedData(`${rewardPrefix}.${rewardId}`, context.product);
        if (!rewardSettings) {
            console.debug(`No reward settings found for ${rewardId}, looking for a default`);
            if (hasDefaultRewardSuggestion(rewardId)) {
                const defaultReward = getDefaultReward(rewardId);
                console.debug(`Default reward found for ${rewardId}`);
                return defaultReward;
            } else {
                return null;
            }
        }
        console.debug(`Fetched reward settings for ${rewardId}`, rewardSettings);
        return rewardSettings as RewardEntry;
    } catch (error) {
        console.error(`Error getting reward settings for ${rewardId}`, error);
    }
};

export const deleteRewardOption = async (rewardId: string, context: StandardContext) => {
    try {
        await deleteDistributedData(`${rewardPrefix}.${rewardId}`, context.product);
        console.debug(`Reward settings deleted for ${rewardId}`);
    } catch (error) {
        console.error(`Error deleting reward settings for ${rewardId}`, error);
    }
};

export const saveRewardOption = async (rewardId: string, rewardOption: RewardEntry, context: StandardContext) => {
    try {
        await setDistributedData(`${rewardPrefix}.${rewardId}`, rewardOption, context.product);
        console.debug(`Reward settings saved for ${rewardId}`, rewardOption);
    } catch (error) {
        console.error(`Error saving reward settings for ${rewardId}`, error);
    }
};

export const getActiveProductRewards = async (product, context: StandardContext, configuration) => {
    if (!configuration) {
        configuration = await getConfigurationSettings(context);
    }

    let activeRewards = [];
    for (let i = 0; i < configuration.rewards.length; i++) {
        const rewardId = configuration.rewards[i].id;
        const rewardEnabled = configuration.rewards[i].enabled;
        if (rewardEnabled) {
            const rewardOption = await getRewardOption(rewardId, context);
            if (rewardOption) {
                if (Array.isArray(rewardOption.availableLocations) && rewardOption.availableLocations.indexOf(product) > -1) {
                    activeRewards.push(rewardOption);
                }
            } else {
                console.error(`No reward settings found for ${rewardId}`);
            }
        }
    }

    console.debug(`Active rewards for ${product}`, activeRewards);
    return activeRewards;
};

export const recordRewardRedemption = async (reward, userRecord) => {
    const redemptionCode = generateRandomString(6).toUpperCase();
    const redemptionRecord = {
        accountId: userRecord.accountId,
        status: 'pending',
        rewardId: reward.id,
        rewardName: reward.name,
        redemptionCode: redemptionCode,
        date: new Date().toISOString()
    };

    console.debug(`Reward redemption recorded`, redemptionRecord);
    return redemptionRecord;
};

export const recordRewardedIncrementWon = async (standardEvent, rewardWon, context: StandardContext, configuration, updatedUser) => {
    try {
        const wonCount = getUserWinCount(standardEvent.userRecord);
        rewardWon.outstandingRewards = rewardWon.outstandingRewards - wonCount;
        const rewardHistoryRecord = {
            accountId: standardEvent.accountId,
            action: 'won',
            difference: -wonCount,
            balance: rewardWon.outstandingRewards,
            locations: [standardEvent.product],
            date: new Date().toISOString()
        };

        if (Array.isArray(rewardWon.rewardHistory)) {
            rewardWon.rewardHistory.push(rewardHistoryRecord);
        } else {
            rewardWon.rewardHistory = [rewardHistoryRecord];
        }

        const narrowReward = getNarrowReward(rewardWon.id, rewardWon);
        const narrowUser = getNarrowUserRecord(updatedUser);

        configuration.rewards = [...configuration.rewards.filter((reward) => reward.id !== rewardWon.id), narrowReward];
        console.debug(`Updated rewards for ${standardEvent.accountId}`, narrowReward);

        configuration.activeUsers = [...configuration.activeUsers.filter((user) => user.accountId !== narrowUser.accountId), narrowUser];
        console.debug(`Updated users for ${standardEvent.accountId}`, narrowUser);

        let promises = [];
        promises.push(setConfigurationSettings(configuration, context));
        promises.push(saveRewardOption(rewardWon.id, rewardWon, context));
        await Promise.all(promises);
    } catch (error) {
        console.error(`Error recording rewarded increment for ${rewardWon.id} on user ${standardEvent.accountId}`, error);
    }
};
