import api, { route } from '@forge/api';
import { render } from 'mustache';
import {
    awardEarnedMessage,
    firstIncrementEarnedMessage,
    incrementEarnedMessage,
    oneIncrementRemainingMessage,
} from '../defaults/awardSuggestions';

export const commentOnIssue = async (standardEvent, awardWon, context) => {
    const comment = {
        body: {
            version: 1,
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: createCommentContent(standardEvent, awardWon),
                },
            ],
        },
    };

    //console.debug(`Commenting on issue ${standardEvent.event.issue.key}:`, JSON.stringify(comment, null, 2));

    const response = await api.asApp().requestJira(route`/rest/api/3/issue/${standardEvent.event.issue.key}/comment`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(comment),
    });

    if (response.status !== 201) {
        console.error(`Error commenting on issue ${standardEvent.event.issue.key}:`, response);
    }
};

export const commentOnConfluenceContent = async (standardEvent, awardWon, context) => {
    const comment = {
        type: 'comment',
        space: {
            id: standardEvent.event.content.space.id,
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
                            content: createCommentContent(standardEvent, awardWon),
                        },
                    ],
                }),
            },
        },
        title: 'Scavenger Hunt Award',
        container: {
            id: standardEvent.event.content.id,
            type: 'global',
            status: 'current',
        },
    };

    console.debug(`Commenting on content ${standardEvent.event.content.id}:`, JSON.stringify(comment, null, 2));

    const response = await api.asApp().requestConfluence(route`/wiki/rest/api/content`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(comment),
    });

    if (response.status !== 200) {
        console.error(`Error commenting on content ${standardEvent.event.content.id}:`, response);
    }

    return await response.json();
};

export const createCommentContent = (standardEvent, awardWon) => {
    const eventVariables = generateVariables(standardEvent, awardWon);
    let messageTemplate = awardWon.incrementEarnedMessage ?? incrementEarnedMessage;

    if (eventVariables.firstIncrement) {
        messageTemplate = awardWon.firstIncrementEarnedMessage ?? firstIncrementEarnedMessage;
    } else if (eventVariables.oneIncrementRemaining) {
        messageTemplate = awardWon.oneIncrementRemainingMessage ?? oneIncrementRemainingMessage;
    } else if (eventVariables.awardWon) {
        messageTemplate = awardWon.awardEarnedMessage ?? awardEarnedMessage;
    }

    const renderedMessage = render(messageTemplate ?? 'missing template', eventVariables);

    return createAdfBlocks(renderedMessage, standardEvent, awardWon);
};

// this is a bit of a hack to get the user mention to work in the comment, if ADF starts causing issues.
const createConfluenceContent = (baseMessage, standardEvent, awardWon) => {
    let confluenceContent = '';
    baseMessage.split('|§|').forEach((block) => {
        if (block === 'userMention') {
            confluenceContent += getConfluenceUserMention(standardEvent.accountId);
        } else if (block === 'awardIcon') {
            confluenceContent += getConfluenceIcon(awardWon.icon);
        } else if (block != '') {
            confluenceContent += block;
        }
    });

    return confluenceContent;
};

const createAdfBlocks = (baseMessage, standardEvent, awardWon) => {
    const adfContentBlocks = [];
    baseMessage.split('|§|').forEach((block) => {
        if (block === 'userMention') {
            adfContentBlocks.push(userMentionBlock(standardEvent.accountId));
        } else if (block === 'awardIcon') {
            adfContentBlocks.push(awardIconBlock(awardWon.icon));
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
            id: accountId,
        },
    };
};

const awardIconBlock = (awardIcon) => {
    return {
        type: 'emoji',
        attrs: {
            shortName: awardIcon,
        },
    };
};

const textBlock = (text) => {
    return {
        type: 'text',
        text: text,
    };
};

export const generateVariables = (standardEvent, awardWon) => {
    console.debug('user award balance', standardEvent.userRecord.awardBalance);
    const currentBalance : number =
        standardEvent.userRecord?.awardBalance?.find((award) => award.id === awardWon.id).balance ?? 0;

    let variables = {
        currentBalance: currentBalance,
        firstIncrement: currentBalance === 1,
        oneIncrementRemaining: currentBalance === awardWon.quantityRequired - 1,
        awardWon: currentBalance === awardWon.quantityRequired,
        userMention: '|§|userMention|§|',
        actionPerformed: standardEvent.eventDisplayName,
        incrementName: awardWon.incrementName,
        increment: awardWon.incrementName,
        quantityRequired: awardWon.quantityRequired,
        quantityRemaining: awardWon.quantityRequired - currentBalance,
        awardName: awardWon.name,
        awardDescription: awardWon.description,
        awardIcon: '|§|awardIcon|§|',
    };

    console.debug('variables:', variables);
    return variables;
};

const getConfluenceUserMention = (accountId) => {
    return `<ac:link><ri:user ri:account-id="${accountId}" /></ac:link>`;
};

const getConfluenceIcon = (awardIcon) => {
    return `<ac:emoticon ac:name="laugh" ac:emoji-id="1f600" ac:emoji-fallback="😀" ac:emoji-shortname="${awardIcon}" />`;
};
