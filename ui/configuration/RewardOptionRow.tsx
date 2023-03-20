import ForgeUI, { Text, ButtonSet, useState, Button, Row, Cell, useEffect, Fragment } from '@forge/ui';
import { EditRewardModal } from './EditRewardModal';
import { RewardEntry, getRewardOption, getNarrowReward, replaceUndefinedRewardValues, saveRewardOption } from '../../storage/rewardData';
import { AdvancedRewardModal } from './AdvancedRewardModal';
import { ConfirmationButton } from '../ConfirmationButton';

export const RewardOptionRow = (props) => {
    const { reward, context, currentConfig, setCurrentConfig, deployingState } = props;
    const rewardId = reward.id;

    const [rewardOptionState, setRewardOptionState] = useState(reward);
    const [editing, setEditing] = useState(false);
    const [advancedEditing, setAdvancedEditing] = useState(false);

    //Redraw when the reward changes
    useEffect(async () => {
        if (deployingState.reward?.id === rewardId) {
            console.debug('Reward deployment changed, updating state');
            setRewardOptionState(deployingState.reward);
        } else {
            setRewardOptionState(reward);
        }
    }, [reward, deployingState.reward]);

    const performEditing = async () => {
        setEditing(true);
        const updatedReward = await getRewardOption(rewardId, context);
        setRewardOptionState(updatedReward);
    };

    const performSave = async (formData) => {
        const newRewardOptionState: RewardEntry = replaceUndefinedRewardValues(formData, rewardOptionState);
        console.debug('Saving reward option', newRewardOptionState);
        setRewardOptionState(newRewardOptionState);
        await saveRewardOption(rewardId, newRewardOptionState, context);
        setEditing(false);
        setAdvancedEditing(false);
        const newRewardNarrowEntry = getNarrowReward(rewardId, newRewardOptionState);
        await setCurrentConfig({
            ...currentConfig,
            rewards: [...currentConfig.rewards.filter((reward) => reward.id !== rewardId), newRewardNarrowEntry]
        });
    };

    const performDelete = async () => {
        console.debug('Deleting reward option', rewardId);
        setEditing(false);
        setAdvancedEditing(false);
        await props.rewardActions.deleteReward(rewardId);
    };

    const performEnable = async (rewardId, enabled) => {
        console.debug(`Enabling reward ${rewardId} = ${enabled}`);
        const newRewardOptionState = { ...rewardOptionState, enabled: enabled };
        setRewardOptionState(newRewardOptionState);
        await saveRewardOption(rewardId, newRewardOptionState, context);
        const newRewardNarrowEntry = getNarrowReward(rewardId, newRewardOptionState);
        await setCurrentConfig({
            ...currentConfig,
            rewards: [...currentConfig.rewards.filter((reward) => reward.id !== rewardId), newRewardNarrowEntry]
        });
    };

    const rewardActions = {
        ...props.rewardActions,
        editing: editing,
        advancedEditing: advancedEditing,
        setEditing: setEditing,
        setAdvancedEditing: setAdvancedEditing,
        saveReward: performSave,
        deleteReward: performDelete
    };

    if (rewardOptionState == null) {
        console.debug(`No reward option found for ${rewardId}`);
        return null;
    }

    return (
        <Row>
            <Cell>
                <Button
                    text={rewardOptionState?.name}
                    onClick={() => rewardActions.setDeployingState({ deploying: true, reward: reward })}
                    appearance="link"
                />
            </Cell>
            <Cell>
                <Text>{rewardOptionState?.enabled ? 'Active' : 'Disabled'}</Text>
            </Cell>
            <Cell>
                <Text>
                    {rewardOptionState?.outstandingRewards?.toString()} {rewardOptionState.incrementName}
                </Text>
            </Cell>
            <Cell>
                <EditRewardModal rewardOptionState={rewardOptionState} rewardActions={rewardActions} />
                <AdvancedRewardModal rewardOptionState={rewardOptionState} rewardActions={rewardActions} />
                <ButtonSet>
                    {(() => {
                        if (rewardOptionState.enabled) {
                            return (
                                <Fragment>
                                    <Button
                                        text="Manage"
                                        onClick={() => rewardActions.setDeployingState({ deploying: true, reward: reward })}
                                        appearance="primary"
                                    />
                                </Fragment>
                            );
                        }
                    })()}
                    <Button text="Edit" onClick={performEditing} />
                    <Button text="Clone" onClick={() => rewardActions.cloneReward(rewardId)} />
                    {(() => {
                        if (rewardOptionState.enabled) {
                            return (
                                <Fragment>
                                    <Button text="Disable" onClick={() => performEnable(rewardId, false)} appearance="warning" />
                                </Fragment>
                            );
                        } else {
                            return (
                                <Fragment>
                                    <Button text="Enable" onClick={() => performEnable(rewardId, true)} appearance="default" />
                                    <ConfirmationButton text="Delete" onClick={performDelete} />
                                </Fragment>
                            );
                        }
                    })()}
                </ButtonSet>
            </Cell>
        </Row>
    );
};
