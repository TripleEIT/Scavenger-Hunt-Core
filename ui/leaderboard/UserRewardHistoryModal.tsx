import ForgeUI, { Cell, Fragment, Head, ModalDialog, Row, Table, Text, useEffect, useState } from '@forge/ui';
import { getUserRecord } from '../../storage/userData';
import { format } from 'date-fns';
import { defaultUserRecord} from '../../defaults/userRecord';

export const UserRewardHistoryModal = (props) => {
    const { viewingUserState, context, setViewingUserState } = props;
    const [userDetails, setUserDetails] = useState(defaultUserRecord);

    useEffect(async () => {
        if (viewingUserState.viewingUser && viewingUserState.viewingUserAccountId != null) {
            console.debug('Updating user details for reward history');
            setUserDetails(await getUserRecord(viewingUserState.viewingUserAccountId, context));
        }
    }, [viewingUserState]);

    return (
        <Fragment>
            {viewingUserState.viewingUser && (
                <ModalDialog
                    header='Reward History'
                    onClose={() => setViewingUserState({ viewingUser: false, viewingUserAccountId: null })}
                    width='large'
                >
                    <Text>Here's a list of all the rewards this user has received.</Text>
                    <Table>
                        <Head>
                            <Cell>
                                <Text>Reward Name</Text>
                            </Cell>
                            <Cell>
                                <Text>Increments Received</Text>
                            </Cell>
                            <Cell>
                                <Text>Activity</Text>
                            </Cell>
                            <Cell>
                                <Text>PowerUp Used</Text>
                            </Cell>
                            <Cell>
                                <Text>Time</Text>
                            </Cell>
                        </Head>
                        {userDetails.rewardActivity.map((reward) => (
                            <Row>
                                <Cell>
                                    <Text>{reward.rewardName}</Text>
                                </Cell>
                                <Cell>
                                    <Text>{reward.incrementsWon}</Text>
                                </Cell>
                                <Cell>
                                    <Text>{reward.rewardActivity}</Text>
                                </Cell>
                                <Cell>
                                    <Text>{reward.activePowerUp}</Text>
                                </Cell>
                                <Cell>
                                    <Text>{format(new Date(reward.date), 'dd-MMM-yy p')}</Text>
                                </Cell>
                            </Row>
                        ))}
                    </Table>
                </ModalDialog>
            )}
        </Fragment>
    );
};
