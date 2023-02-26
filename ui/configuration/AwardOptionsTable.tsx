import ForgeUI, { Fragment, Text, Button, Table, Head, Cell, Heading, useState, useEffect } from '@forge/ui';
import { getNewGenericAward } from '../../defaults/awardSuggestions';
import { deleteAwardOption, getAwardOption, getNarrowAward, saveAwardOption } from '../../storage/awardData';
import { generateRandomString } from '../../utils';
import { AwardOptionRow } from './AwardOptionRow';
import { ManageAwardsModal } from './ManageAwardsModal';

export const AwardOptionsTable = (props) => {
    const { currentConfig, setCurrentConfig, context } = props;
    const [awards, setAwards] = useState(currentConfig.awards);
    const [deployingState, setDeployingState] = useState({ deploying: false, awardId: null });

    const deleteAward = async (awardId) => {
        const newAwards = currentConfig.awards.filter((award) => award.id !== awardId);
        await setCurrentConfig({ ...currentConfig, awards: newAwards });
        await deleteAwardOption(awardId, context);
    };

    useEffect(async () => {
        console.debug('Updating awards');
        setAwards(currentConfig.awards);
    }, [currentConfig]);

    const cloneAward = async (awardId) => {
        const awardOptionState = await getAwardOption(awardId, context);
        const newAwardName = `${awardOptionState.name} (copy)`;
        const newlyCreatedAward = { ...awardOptionState, outstandingAwards: 0, name: newAwardName, id: generateRandomString(30) };
        await saveAwardOption(newlyCreatedAward.id, newlyCreatedAward, context);
        const newAwardNarrowEntry = getNarrowAward(newlyCreatedAward.id, newlyCreatedAward);
        await setCurrentConfig({ ...currentConfig, awards: [...currentConfig.awards, newAwardNarrowEntry] });
    };

    const createAward = async () => {
        const newAward = getNewGenericAward();
        await saveAwardOption(newAward.id, newAward, context);
        const newAwardNarrowEntry = getNarrowAward(newAward.id, newAward);
        await setCurrentConfig({ ...currentConfig, awards: [...currentConfig.awards, newAwardNarrowEntry] });
    };

    const universalAwardActions = {
        deleteAward: deleteAward,
        cloneAward: cloneAward,
        setDeployingState: setDeployingState
    };

    return (
        <Fragment>
            <Text>
                Configure the award options for your teams. These awards are synced between all Atlassian products which have the
                Scavenger Hunt installed.
            </Text>
            <Heading size='small'>Editing Awards:</Heading>
            <Text>
                Click the award name or the Edit button to make changes to every aspect of the award. We've tossed in some sensible
                defaults but but everything from the notification messages to the emojis can be customized to maximize user's
                engagement.
            </Text>
            <Heading size='small'>Managing and Deploying Awards:</Heading>
            <Text>
                This is where the fun really happens! Used the Manage Awards button to hide incremental pieces of the award throughout
                the Atlassian platform. As users perform their day to day work they will get the occasional surprise and a bit of proof
                you really do love your employees (I'm sure they know that already).
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
                        <Text>Outstanding Awards</Text>
                    </Cell>
                    <Cell>
                        <Text>Actions</Text>
                    </Cell>
                </Head>
                {awards.map((award) => {
                        return (
                            <AwardOptionRow
                                award={award}
                                awardList={awards}
                                context={context}
                                awardActions={universalAwardActions}
                                currentConfig={currentConfig}
                                setCurrentConfig={setCurrentConfig}
                                deployingState={deployingState}
                            />
                        );
                    })}
            </Table>
            <Button text='Create New Award' onClick={createAward} />
            {/* This is a very odd pattern at the moment, but the table in the ManageAwardsModal can't be within the above table */}
            <ManageAwardsModal
                currentConfig={currentConfig}
                setCurrentConfig={setCurrentConfig}
                awardActions={universalAwardActions}
                deployingState={deployingState}
                context={context}
            />
        </Fragment>
    );
};
