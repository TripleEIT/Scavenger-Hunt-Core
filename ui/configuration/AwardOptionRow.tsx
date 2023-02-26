import ForgeUI, { Text, ButtonSet, useState, Button, Row, Cell, useEffect, Fragment } from '@forge/ui';
import { EditAwardModal } from './EditAwardModal';
import { AwardEntry, getAwardOption, getNarrowAward, replaceUndefinedAwardValues, saveAwardOption } from '../../storage/awardData';

export const AwardOptionRow = (props) => {
    const { award, context, currentConfig, setCurrentConfig, deployingState } = props;
    const awardId = award.id;

    const [awardOptionState, setAwardOptionState] = useState(award);
    const [editing, setEditing] = useState(false);

    //Redraw when the award changes
    useEffect(async () => {
        if (deployingState.award?.id === awardId) {
            console.debug('Award deployment changed, updating state');
            setAwardOptionState(deployingState.award);
        } else {
            setAwardOptionState(award);
        }
    }, [award, deployingState.award]);

    const performEditing = async () => {
        setEditing(true);
        const updatedAward = await getAwardOption(awardId, context);
        setAwardOptionState(updatedAward);
    };

    const performSave = async (formData) => {
        const newAwardOptionState : AwardEntry = replaceUndefinedAwardValues(formData, awardOptionState);
        console.debug('Saving award option', newAwardOptionState);
        setAwardOptionState(newAwardOptionState);
        await saveAwardOption(awardId, newAwardOptionState, context);
        setEditing(false);
        const newAwardNarrowEntry = getNarrowAward(awardId, newAwardOptionState);
        await setCurrentConfig({
            ...currentConfig,
            awards: [...currentConfig.awards.filter((award) => award.id !== awardId), newAwardNarrowEntry]
        });
    };

    const performDelete = async () => {
        console.debug('Deleting award option', awardId);
        await props.awardActions.deleteAward(awardId);
        setEditing(false);
    };

    const performEnable = async (awardId, enabled) => {
        console.debug(`Enabling award ${awardId} = ${enabled}`);
        const newAwardOptionState = { ...awardOptionState, enabled: enabled };
        setAwardOptionState(newAwardOptionState);
        await saveAwardOption(awardId, newAwardOptionState, context);
        const newAwardNarrowEntry = getNarrowAward(awardId, newAwardOptionState);
        await setCurrentConfig({
            ...currentConfig,
            awards: [...currentConfig.awards.filter((award) => award.id !== awardId), newAwardNarrowEntry]
        });
    };

    const awardActions = {
        ...props.awardActions,
        editing: editing,
        setEditing: setEditing,
        saveAward: performSave,
        deleteAward: performDelete
    };

    if (awardOptionState == null) {
        console.debug(`No award option found for ${awardId}`);
        return null;
    }

    return (
        <Row>
            <Cell>
                <Button text={awardOptionState?.name} onClick={() => awardActions.setDeployingState({ deploying: true, award: award })} appearance='link' />
                <EditAwardModal awardOptionState={awardOptionState} awardActions={awardActions} />
            </Cell>
            <Cell>
                <Text>{awardOptionState?.enabled ? 'Active' : 'Disabled'}</Text>
            </Cell>
            <Cell>
                <Text>
                    {awardOptionState?.outstandingAwards?.toString()} {awardOptionState.incrementName}
                </Text>
            </Cell>
            <Cell>
                <ButtonSet>
                    {(() => {
                        if (awardOptionState.enabled) {
                            return (
                                <Fragment>
                                    <Button
                                        text='Manage Awards'
                                        onClick={() => awardActions.setDeployingState({ deploying: true, award: award })}
                                        appearance='primary'
                                    />
                                </Fragment>
                            );
                        }
                    })()}
                    <Button text='Edit' onClick={performEditing} />
                    <Button text='Clone' onClick={() => awardActions.cloneAward(awardId)} />
                    {(() => {
                        if (awardOptionState.enabled) {
                            return (
                                <Fragment>
                                    <Button text='Disable' onClick={() => performEnable(awardId, false)} appearance='warning' />
                                </Fragment>
                            );
                        } else {
                            return (
                                <Fragment>
                                    <Button text='Enable' onClick={() => performEnable(awardId, true)} appearance='default' />
                                    <Button text='Delete' onClick={performDelete} appearance='danger' />
                                </Fragment>
                            );
                        }
                    })()}
                </ButtonSet>
                {/* <ManageAwardsModal awardOptionState={awardOptionState} awardActions={awardActions} context={context}/> */}
            </Cell>
        </Row>
    );
};
