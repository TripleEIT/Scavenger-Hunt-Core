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
    useState
} from '@forge/ui';
import { format } from 'date-fns';
import { blankAward } from '../../defaults/awardSuggestions';
import { getAwardOption, getNarrowAward, saveAwardOption } from '../../storage/awardData';

export const ManageAwardsModal = (props) => {
    const { awardActions, currentConfig, setCurrentConfig, context, deployingState } = props;

    const [awardOptionState, setAwardOptionState] = useState(blankAward);

    useEffect(async () => {
        if (deployingState.award?.id != null) {
            setAwardOptionState(await getAwardOption(deployingState.award.id, context));
        }
    }, [deployingState]);

    const deployAwardIncrements = async (formData) => {
        const awardHistoryRecord = {
            accountId: context.accountId,
            action: formData.quantityToDeploy > awardOptionState.outstandingAwards ? 'deployed' : 'revoked',
            difference: formData.quantityToDeploy - awardOptionState.outstandingAwards,
            balance: formData.quantityToDeploy,
            expirationDate: formData.expirationDate,
            locations: formData.availabilityLocations,
            date: new Date().toISOString()
        };

        const updatedAward = {...awardOptionState};

        updatedAward.validUntil = formData.expirationDate;
        updatedAward.outstandingAwards = formData.quantityToDeploy;
        updatedAward.availableLocations = formData.availabilityLocations;

        if (Array.isArray(awardOptionState.awardHistory)) {
            updatedAward.awardHistory.push(awardHistoryRecord);
        } else {
            updatedAward.awardHistory = [awardHistoryRecord];
        }

        await saveAwardOption(awardOptionState.id, { ...updatedAward }, context);
        const newAwardNarrowEntry = getNarrowAward(awardOptionState.id, updatedAward);
        awardActions.setDeployingState({ deploying: false, award: newAwardNarrowEntry });
        deployingState.award = newAwardNarrowEntry;
        setCurrentConfig({
            ...currentConfig,
            awards: [...currentConfig.awards.filter((a) => a.id !== awardOptionState.id), newAwardNarrowEntry]
        });
    };

    return (
        <Fragment>
            {deployingState.deploying && (
                <ModalDialog
                    header='Award Management'
                    onClose={() => awardActions.setDeployingState({ deploying: false, awardId: null })}
                    closeButtonText='Close'
                    width='x-large'
                >
                    <Tabs>
                        <Tab label='Deploy Awards'>
                            <Form onSubmit={deployAwardIncrements} submitButtonText='Update Award Availability'>
                                <Text>{`Lets deploy some ${awardOptionState.incrementName} for the Scavengers to find.`}</Text>
                                <TextField
                                    name='quantityToDeploy'
                                    description={`How many ${awardOptionState.incrementName} do you want to deploy?  A user will need to find ${awardOptionState.quantityRequired} of these to earn the ${awardOptionState.name} award.`}
                                    label='Quantity to Deploy'
                                    defaultValue={awardOptionState.quantityRequired * 3}
                                />
                                <Text></Text>
                                <CheckboxGroup
                                    name='availabilityLocations'
                                    label='Availability Locations'
                                    description={`The ${awardOptionState.incrementName} will be available on the products selected. To customize which Activities and Creations are
                            are eligible for a user to earn a award increment on, use the Jira and Confluence settings tabs. \n`}
                                >
                                    <Checkbox label='Jira' defaultChecked={true} value='jira' />
                                    <Checkbox label='Confluence' defaultChecked={true} value='confluence' />
                                </CheckboxGroup>
                                <DatePicker
                                    label='Expiration Date'
                                    name='expirationDate'
                                    defaultValue={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
                                    description='How long are these awards valid for?  Set a short date for a Bug Bash and they will be available for a limited time only.'
                                />
                            </Form>
                        </Tab>
                        <Tab label='Deployment History'>
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
                                {awardOptionState.awardHistory?.map((historyRecord) => {
                                    const actionMessage =`${historyRecord.action.charAt(0).toUpperCase() + historyRecord.action.slice(1)} ${Math.abs(historyRecord.difference)} increments`
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
                                                                text={location.charAt(0).toUpperCase() + location.slice(1)}
                                                                color='blue-light'
                                                            />
                                                        );
                                                    })}
                                                </TagGroup>
                                            </Cell>
                                            <Cell>
                                                <Text>{historyRecord.expirationDate ? format(new Date(historyRecord.expirationDate), 'dd-MMM-yy') : 'none'}</Text>
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
