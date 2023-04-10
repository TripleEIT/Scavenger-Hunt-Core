import ForgeUI, { Fragment, Text, Button, Table, Head, Cell, Heading, useState, useEffect, SectionMessage, Strong } from '@forge/ui';
import { getNewGenericReward } from '../../defaults/rewardSuggestions';
import { deleteRewardOption, getRewardOption, getNarrowReward, saveRewardOption } from '../../storage/rewardData';
import { generateRandomString } from '../../utils';
import { RewardOptionRow } from './RewardOptionRow';
import { ManageRewardsModal } from './ManageRewardsModal';

export const RewardOptionsTable = (props) => {
    const { currentConfig, setCurrentConfig, context } = props;
    const [rewards, setRewards] = useState(currentConfig.rewards);
    const [deployingState, setDeployingState] = useState({ deploying: false, rewardId: null });

    const deleteReward = async (rewardId) => {
        const newRewards = currentConfig.rewards.filter((reward) => reward.id !== rewardId);
        const setConfigPromise = setCurrentConfig({ ...currentConfig, rewards: newRewards });
        const deleteRewardPromise = deleteRewardOption(rewardId, context);
        await Promise.all([setConfigPromise, deleteRewardPromise]);
    };

    // Sums the number of all outstanding enabled rewards
    const getOutstandingRewards = () => {
        return rewards.reduce((total, reward) => {
            if (reward.enabled) {
                return total + reward.outstandingRewards;
            }
            return total;
        }, 0);
    };
    const [outstandingRewards, setOutstandingRewards] = useState(getOutstandingRewards());

    useEffect(async () => {
        console.debug('Updating reward rows');
        setRewards(currentConfig.rewards);
    }, [currentConfig]);

    useEffect(async () => {
        console.debug('Updating outstanding rewards');
        setOutstandingRewards(getOutstandingRewards());
    }, [rewards]);

    const cloneReward = async (rewardId) => {
        const rewardOptionState = await getRewardOption(rewardId, context);
        const newRewardName = `${rewardOptionState.name} (copy)`;
        const newlyCreatedReward = { ...rewardOptionState, outstandingRewards: 0, name: newRewardName, id: generateRandomString(30) };
        await saveRewardOption(newlyCreatedReward.id, newlyCreatedReward, context);
        const newRewardNarrowEntry = getNarrowReward(newlyCreatedReward.id, newlyCreatedReward);
        await setCurrentConfig({ ...currentConfig, rewards: [...currentConfig.rewards, newRewardNarrowEntry] });
    };

    const createReward = async () => {
        const newReward = getNewGenericReward();
        await saveRewardOption(newReward.id, newReward, context);
        const newRewardNarrowEntry = getNarrowReward(newReward.id, newReward);
        await setCurrentConfig({ ...currentConfig, rewards: [...currentConfig.rewards, newRewardNarrowEntry] });
    };

    const universalRewardActions = {
        deleteReward: deleteReward,
        cloneReward: cloneReward,
        setDeployingState: setDeployingState
    };

    return (
        <Fragment>
            {outstandingRewards < 10 && (
                <Fragment>
                    <SectionMessage title={`You have ${outstandingRewards} rewards configured. Let's fix that!`} appearance="warning">
                        <Text>You have limited outstanding rewards. You can configure rewards in the table below.</Text>
                        <Text>
                            Users will be unable to receive any rewards (or reward increments) if none are available.  You make some available through the{' '}
                            <Strong>Manage</Strong> button below.
                        </Text>
                    </SectionMessage>
                </Fragment>
            )}
            <Text>
                Configure the reward options for your teams. These rewards are synced between all Atlassian products which have the
                Scavenger Hunt installed.
            </Text>
            <Heading size="small">Editing Rewards:</Heading>
            <Text>
                Click the reward name or the Edit button to make changes to every aspect of the reward. We've tossed in some sensible
                defaults but but everything from the notification messages to the emojis can be customized to maximize user's engagement.
            </Text>
            <Heading size="small">Managing and Deploying Rewards:</Heading>
            <Text>
                This is where the fun really happens! Used the Manage Rewards button to hide incremental pieces of the reward throughout the
                Atlassian platform. As users perform their day to day work they will get the occasional surprise and a bit of proof you
                really do love your employees (I'm sure they know that already).
            </Text>
            <Table>
                <Head>
                    <Cell>
                        <Text>Reward</Text>
                    </Cell>
                    <Cell>
                        <Text>Status</Text>
                    </Cell>
                    <Cell>
                        <Text>Outstanding Rewards</Text>
                    </Cell>
                    <Cell>
                        <Text>Actions</Text>
                    </Cell>
                </Head>
                {rewards?.map((reward) => {
                    return (
                        <RewardOptionRow
                            reward={reward}
                            rewardList={rewards}
                            context={context}
                            rewardActions={universalRewardActions}
                            currentConfig={currentConfig}
                            setCurrentConfig={setCurrentConfig}
                            deployingState={deployingState}
                        />
                    );
                })}
            </Table>
            <Button text="Create New Reward" onClick={createReward} />
            {/* This is a very odd pattern at the moment, but the table in the ManageRewardsModal can't be within the above table */}
            <ManageRewardsModal
                currentConfig={currentConfig}
                setCurrentConfig={setCurrentConfig}
                rewardActions={universalRewardActions}
                deployingState={deployingState}
                context={context}
            />
        </Fragment>
    );
};
