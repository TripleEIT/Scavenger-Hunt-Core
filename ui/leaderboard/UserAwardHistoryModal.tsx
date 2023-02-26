import ForgeUI, { Cell, Fragment, Head, ModalDialog, Row, Table, Text, useEffect, useState } from '@forge/ui';
import { getUserRecord } from '../../storage/userData';
import { format } from 'date-fns';
import { defaultUserRecord} from '../../defaults/userRecord';

export const UserAwardHistoryModal = (props) => {
    const { viewingUserState, context, setViewingUserState } = props;
    const [userDetails, setUserDetails] = useState(defaultUserRecord);

    useEffect(async () => {
        if (viewingUserState.viewingUser && viewingUserState.viewingUserAccountId != null) {
            console.debug('Updating user details for award history');
            setUserDetails(await getUserRecord(viewingUserState.viewingUserAccountId, context));
        }
    }, [viewingUserState]);

    return (
        <Fragment>
            {viewingUserState.viewingUser && (
                <ModalDialog
                    header='Award History'
                    onClose={() => setViewingUserState({ viewingUser: false, viewingUserAccountId: null })}
                    width='large'
                >
                    <Text>Here's a list of all the awards this user has received.</Text>
                    <Table>
                        <Head>
                            <Cell>
                                <Text>Award Name</Text>
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
                        {userDetails.awardActivity.map((award) => (
                            <Row>
                                <Cell>
                                    <Text>{award.awardName}</Text>
                                </Cell>
                                <Cell>
                                    <Text>{award.incrementsWon}</Text>
                                </Cell>
                                <Cell>
                                    <Text>{award.awardActivity}</Text>
                                </Cell>
                                <Cell>
                                    <Text>{award.activePowerUp}</Text>
                                </Cell>
                                <Cell>
                                    <Text>{format(new Date(award.date), 'dd-MMM-yy p')}</Text>
                                </Cell>
                            </Row>
                        ))}
                    </Table>
                </ModalDialog>
            )}
        </Fragment>
    );
};
