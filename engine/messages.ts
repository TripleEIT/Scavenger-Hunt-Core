import api, { route } from '@forge/api';
import { render } from 'mustache';
import {
    rewardEarnedMessage,
    firstIncrementEarnedMessage,
    incrementEarnedMessage,
    oneIncrementRemainingMessage
} from '../defaults/rewardSuggestions';

export const commentOnIssue = async (standardEvent, rewardWon, context) => {
    const comment = {
        body: {
            version: 1,
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: createCommentContent(standardEvent, rewardWon)
                }
            ]
        }
    };

    //console.debug(`Commenting on issue ${standardEvent.event.issue.key}:`, JSON.stringify(comment, null, 2));

    const response = await api.asApp().requestJira(route`/rest/api/3/issue/${standardEvent.event.issue.key}/comment`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(comment)
    });

    if (response.status !== 201) {
        console.error(`Error commenting on issue ${standardEvent.event.issue.key}:`, response);
    }
};

export const commentOnConfluenceContent = async (standardEvent, rewardWon, context) => {
    const comment = {
        type: 'comment',
        space: {
            id: standardEvent.event.content.space.id
        },
        body: {
            atlas_doc_format: {
                representation: 'atlas_doc_format',
                value: JSON.stringify({
                    version: 1,
                    type: 'doc',
                    content: [
                        {
                            type: 'paragraph',
                            content: createCommentContent(standardEvent, rewardWon)
                        }
                    ]
                })
            }
        },
        title: 'Scavenger Hunt Reward',
        container: {
            id: standardEvent.event.content.id,
            type: 'global',
            status: 'current'
        }
    };

    console.debug(`Commenting on content ${standardEvent.event.content.id}:`, JSON.stringify(comment, null, 2));

    const response = await api.asApp().requestConfluence(route`/wiki/rest/api/content`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(comment)
    });

    if (response.status !== 200) {
        console.error(`Error commenting on content ${standardEvent.event.content.id}:`, response);
    }

    return await response.json();
};

export const createCommentContent = (standardEvent, rewardWon) => {
    const eventVariables = generateVariables(standardEvent, rewardWon);
    let messageTemplate = rewardWon.incrementEarnedMessage ?? incrementEarnedMessage;

    if (eventVariables.firstIncrement) {
        messageTemplate = rewardWon.firstIncrementEarnedMessage ?? firstIncrementEarnedMessage;
    } else if (eventVariables.oneIncrementRemaining) {
        messageTemplate = rewardWon.oneIncrementRemainingMessage ?? oneIncrementRemainingMessage;
    } else if (eventVariables.rewardWon) {
        messageTemplate = rewardWon.rewardEarnedMessage ?? rewardEarnedMessage;
    }

    const renderedMessage = render(messageTemplate ?? 'missing template', eventVariables);

    return createAdfBlocks(renderedMessage, standardEvent, rewardWon);
};

// this is a bit of a hack to get the user mention to work in the comment, if ADF starts causing issues.
const createConfluenceContent = (baseMessage, standardEvent, rewardWon) => {
    let confluenceContent = '';
    baseMessage.split('|§|').forEach((block) => {
        if (block === 'userMention') {
            confluenceContent += getConfluenceUserMention(standardEvent.accountId);
        } else if (block === 'rewardIcon') {
            confluenceContent += getConfluenceIcon(rewardWon.icon);
        } else if (block != '') {
            confluenceContent += block;
        }
    });

    return confluenceContent;
};

const createAdfBlocks = (baseMessage, standardEvent, rewardWon) => {
    const adfContentBlocks = [];
    baseMessage.split('|§|').forEach((block) => {
        if (block === 'userMention') {
            adfContentBlocks.push(userMentionBlock(standardEvent.accountId));
        } else if (block === 'rewardIcon') {
            adfContentBlocks.push(rewardIconBlock(rewardWon.icon));
        } else if (block != '') {
            adfContentBlocks.push(textBlock(block));
        }
    });

    return adfContentBlocks;
};

const userMentionBlock = (accountId) => {
    return {
        type: 'mention',
        attrs: {
            id: accountId
        }
    };
};

const rewardIconBlock = (rewardIcon) => {
    return {
        type: 'emoji',
        attrs: {
            shortName: rewardIcon
        }
    };
};

const textBlock = (text) => {
    return {
        type: 'text',
        text: text
    };
};

export const generateVariables = (standardEvent, rewardWon) => {
    console.debug('user reward balance', standardEvent.userRecord.rewardBalance);
    const currentBalance: number = standardEvent.userRecord?.rewardBalance?.find((reward) => reward.id === rewardWon.id).balance ?? 0;

    let variables = {
        currentBalance: currentBalance,
        firstIncrement: currentBalance === 1,
        oneIncrementRemaining: currentBalance === rewardWon.quantityRequired - 1,
        rewardWon: currentBalance === rewardWon.quantityRequired,
        userMention: '|§|userMention|§|',
        actionPerformed: standardEvent.eventDisplayName,
        incrementName: rewardWon.incrementName,
        increment: rewardWon.incrementName,
        quantityRequired: rewardWon.quantityRequired,
        quantityRemaining: rewardWon.quantityRequired - currentBalance,
        rewardName: rewardWon.name,
        rewardDescription: rewardWon.description,
        rewardIcon: '|§|rewardIcon|§|'
    };

    console.debug('variables:', variables);
    return variables;
};

const getConfluenceUserMention = (accountId) => {
    return `<ac:link><ri:user ri:account-id="${accountId}" /></ac:link>`;
};

const getConfluenceIcon = (rewardIcon) => {
    return `<ac:emoticon ac:name="laugh" ac:emoji-id="1f600" ac:emoji-fallback="😀" ac:emoji-shortname="${rewardIcon}" />`;
};
