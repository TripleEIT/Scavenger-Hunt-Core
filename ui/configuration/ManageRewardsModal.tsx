import ForgeUI, {
    Fragment,
    ModalDialog,
    Text,
    Form,
    TextField,
    CheckboxGroup,
    Checkbox,
    Tabs,
    DatePicker,
    Tab,
    Table,
    Head,
    Cell,
    Row,
    User,
    Tag,
    TagGroup,
    useEffect,
    useState,
} from '@forge/ui';
import { format } from 'date-fns';
import { blankReward } from '../../defaults/rewardSuggestions';
import {
    RewardEntry,
    RewardHistoryRecord,
    getRewardOption,
    getNarrowReward,
    saveRewardOption,
} from '../../storage/rewardData';

export const ManageRewardsModal = (props) => {
    const { rewardActions, currentConfig, setCurrentConfig, context, deployingState } = props;

    const [rewardOptionState, setRewardOptionState] = useState(blankReward);

    useEffect(async () => {
        if (deployingState.reward?.id != null) {
            setRewardOptionState(await getRewardOption(deployingState.reward.id, context));
        }
    }, [deployingState]);

    const deployRewardIncrements = async (formData) => {
        const rewardHistoryRecord = {
            accountId: context.accountId,
            action: formData.quantityToDeploy > rewardOptionState.outstandingRewards ? 'deployed' : 'revoked',
            difference: formData.quantityToDeploy - rewardOptionState.outstandingRewards,
            balance: formData.quantityToDeploy,
            expirationDate: formData.expirationDate,
            locations: formData.availabilityLocations,
            date: new Date().toISOString(),
        } as RewardHistoryRecord;

        const updatedReward: RewardEntry = { ...rewardOptionState };

        updatedReward.validUntil = formData.expirationDate;
        updatedReward.outstandingRewards = formData.quantityToDeploy;
        updatedReward.availableLocations = formData.availabilityLocations;

        if (Array.isArray(rewardOptionState.rewardHistory)) {
            updatedReward.rewardHistory.push(rewardHistoryRecord);
        } else {
            updatedReward.rewardHistory = [rewardHistoryRecord];
        }

        await saveRewardOption(rewardOptionState.id, { ...updatedReward }, context);
        const newRewardNarrowEntry = getNarrowReward(rewardOptionState.id, updatedReward);
        rewardActions.setDeployingState({ deploying: false, reward: newRewardNarrowEntry });
        deployingState.reward = newRewardNarrowEntry;
        setCurrentConfig({
            ...currentConfig,
            rewards: [...currentConfig.rewards.filter((a) => a.id !== rewardOptionState.id), newRewardNarrowEntry],
        });
    };

    return (
        <Fragment>
            {deployingState.deploying && (
                <ModalDialog
                    header="Reward Management"
                    onClose={() => rewardActions.setDeployingState({ deploying: false, rewardId: null })}
                    closeButtonText="Close"
                    width="x-large"
                >
                    <Tabs>
                        <Tab label="Deploy Rewards">
                            <Form onSubmit={deployRewardIncrements} submitButtonText="Update Reward Availability">
                                <Text>{`Lets deploy some ${rewardOptionState.incrementName} for the Scavengers to find.`}</Text>
                                <TextField
                                    name="quantityToDeploy"
                                    description={`How many ${rewardOptionState.incrementName} do you want to deploy?  A user will need to find ${rewardOptionState.quantityRequired} of these to earn the ${rewardOptionState.name} reward.`}
                                    label="Quantity to Deploy"
                                    defaultValue={(rewardOptionState.quantityRequired * 3).toString()}
                                />
                                <Text> </Text>
                                <CheckboxGroup
                                    name="availabilityLocations"
                                    label="Availability Locations"
                                    description={`The ${rewardOptionState.incrementName} will be available on the products selected. To customize which Activities and Creations are
                            are eligible for a user to earn a reward increment on, use the Jira and Confluence settings tabs. \n`}
                                >
                                    <Checkbox label="Jira" defaultChecked={true} value="jira" />
                                    <Checkbox label="Confluence" defaultChecked={true} value="confluence" />
                                </CheckboxGroup>
                                <DatePicker
                                    label="Expiration Date"
                                    name="expirationDate"
                                    defaultValue={new Date(
                                        new Date().setFullYear(new Date().getFullYear() + 1)
                                    ).toString()}
                                    description="How long are these rewards valid for?  Set a short date for a Bug Bash and they will be available for a limited time only."
                                />
                            </Form>
                        </Tab>
                        <Tab label="Deployment History">
                            <Table>
                                <Head>
                                    <Cell>
                                        <Text>Deployment Date</Text>
                                    </Cell>
                                    <Cell>
                                        <Text>User</Text>
                                    </Cell>
                                    <Cell>
                                        <Text>Action</Text>
                                    </Cell>
                                    <Cell>
                                        <Text>Locations</Text>
                                    </Cell>
                                    <Cell>
                                        <Text>Expiration</Text>
                                    </Cell>
                                    <Cell>
                                        <Text>Balance</Text>
                                    </Cell>
                                </Head>
                                {rewardOptionState.rewardHistory?.map((historyRecord) => {
                                    const actionMessage = `${
                                        historyRecord.action.charAt(0).toUpperCase() + historyRecord.action.slice(1)
                                    } ${Math.abs(historyRecord.difference)} increments`;
                                    return (
                                        <Row>
                                            <Cell>
                                                <Text>{format(new Date(historyRecord.date), 'dd-MMM-yy')}</Text>
                                            </Cell>
                                            <Cell>
                                                <User accountId={historyRecord.accountId} />
                                            </Cell>
                                            <Cell>
                                                <Text>{actionMessage}</Text>
                                            </Cell>
                                            <Cell>
                                                <TagGroup>
                                                    {historyRecord.locations?.map((location) => {
                                                        return (
                                                            <Tag
                                                                text={
                                                                    location.charAt(0).toUpperCase() + location.slice(1)
                                                                }
                                                                color="blue-light"
                                                            />
                                                        );
                                                    })}
                                                </TagGroup>
                                            </Cell>
                                            <Cell>
                                                <Text>
                                                    {historyRecord.expirationDate
                                                        ? format(new Date(historyRecord.expirationDate), 'dd-MMM-yy')
                                                        : 'none'}
                                                </Text>
                                            </Cell>
                                            <Cell>
                                                <Text>{historyRecord.balance}</Text>
                                            </Cell>
                                        </Row>
                                    );
                                })}
                            </Table>
                        </Tab>
                    </Tabs>
                </ModalDialog>
            )}
        </Fragment>
    );
};
