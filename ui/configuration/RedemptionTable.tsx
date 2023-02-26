import ForgeUI, { Fragment, Text, Button, Table, Head, Cell, Heading, useState, useEffect, ButtonSet, Row, User } from '@forge/ui';
import { format } from 'date-fns';

export const RedemptionTable = (props) => {
    const { currentConfig, setCurrentConfig } = props;
    const [redemptionTable, setRedemptionTable] = useState(currentConfig.redemptions);

    const updateRedemption = async (redemptionCode, approved) => {
        const updatedRedemptions = currentConfig.redemptions.map((redemption) => {
            if (redemption.redemptionCode === redemptionCode) {
                redemption.status = approved ? 'Approved' : 'Rejected';
            }
            return redemption;
        });
        const updatedConfig = { ...currentConfig, redemptions: updatedRedemptions };
        await setCurrentConfig(updatedConfig);
        setRedemptionTable(updatedRedemptions);
    };

    return (
        <Fragment>
            <Table>
                <Head>
                    <Cell>
                        <Text>User</Text>
                    </Cell>
                    <Cell>
                        <Text>Status</Text>
                    </Cell>
                    <Cell>
                        <Text>Redemption Code</Text>
                    </Cell>
                    <Cell>
                        <Text>Award</Text>
                    </Cell>
                    <Cell>
                        <Text>Date</Text>
                    </Cell>
                    <Cell>
                        <Text>Actions</Text>
                    </Cell>
                </Head>
                {redemptionTable.map((redemption) => {
                    return (
                        <Fragment>
                            <Row>
                                <Cell>
                                    <User accountId={redemption.accountId} />
                                </Cell>
                                <Cell>
                                    <Text>{redemption.status}</Text>
                                </Cell>
                                <Cell>
                                    <Text>{redemption.redemptionCode}</Text>
                                </Cell>
                                <Cell>
                                    <Text>{redemption.awardName}</Text>
                                </Cell>
                                <Cell>
                                    <Text>{format(new Date(redemption.date), 'dd-MMM-yy p')}</Text>
                                </Cell>
                                <Cell>
                                    <ButtonSet>
                                        <Button
                                            text='Approve'
                                            appearance='primary'
                                            onClick={() => updateRedemption(redemption.redemptionCode, true)}
                                        />
                                        <Button
                                            text='Reject'
                                            appearance='danger'
                                            onClick={() => updateRedemption(redemption.redemptionCode, false)}
                                        />
                                    </ButtonSet>
                                </Cell>
                            </Row>
                        </Fragment>
                    );
                })}
            </Table>
        </Fragment>
    );
};
