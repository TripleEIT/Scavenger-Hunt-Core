import ForgeUI, { Button, Cell, Fragment, Head, Heading, ModalDialog, Row, Table, Text, useState } from '@forge/ui';
import { render } from 'mustache';
import { awardRedeemedMessage } from '../../defaults/awardSuggestions';
import { getAwardOption, recordAwardRedemption } from '../../storage/awardData';
import { setConfigurationSettings } from '../../storage/configurationData';
import { getNarrowUserRecord, setUserRecord } from '../../storage/userData';

export const RedeemAwardsBlock = (props) => {
    const { userDetails, setUserDetails, currentConfig, setCurrentConfig, context } = props;
    const [isRedeeming, setIsRedeeming] = useState({ isRedeeming: false, message: null, redemptionCode: null });

    const redeemAward = async (awardId) => {
        const awardData = await getAwardOption(awardId, context);
        const awardBalance = userDetails.awardBalance.find((awardBalance) => awardBalance.id == awardId);
        if (awardBalance && awardBalance.balance >= awardData.quantityRequired) {
            console.info(`Redeeming award ${awardId} for ${awardData.quantityRequired} for user ${userDetails.accountId}`);

            const newAwardBalance = { id: awardId, balance: awardBalance.balance - awardData.quantityRequired };
            const newUserDetails = {
                ...userDetails,
                awardBalance: [...userDetails.awardBalance.filter((awardBalance) => awardBalance.id != awardId), newAwardBalance]
            };

            newUserDetails.awardActivity.push({
                awardId: awardData.id,
                awardName: awardData.name,
                incrementName: awardData.incrementName,
                incrementsWon: awardData.quantityRequired,
                activePowerUp: null,
                awardActivity: 'Redeemed',
                date: new Date().toISOString()
            });

            const newNarrowUserDetails = getNarrowUserRecord(newUserDetails);

            const redemptionRecord = await recordAwardRedemption(awardData, userDetails, context, currentConfig);
            const newConfig = {
                ...currentConfig,
                activeUsers: [
                    ...currentConfig.activeUsers.filter((user) => user.accountId != newUserDetails.accountId),
                    newNarrowUserDetails
                ],
                awards: [...currentConfig.awards],
                redemptions: [...(currentConfig?.redemptions ?? []), redemptionRecord]
            };

            setUserDetails(newUserDetails);
            setCurrentConfig(newConfig);

            setIsRedeeming({
                isRedeeming: true,
                message: awardData.awardRedeemedMessage ?? awardRedeemedMessage,
                redemptionCode: redemptionRecord.redemptionCode
            });

            // Save the new user record and the new global config
            await Promise.all([
                setUserRecord(newUserDetails.accountId, newUserDetails, context),
                setConfigurationSettings(newConfig, context)
            ]);
        }
    };

    return (
        <Fragment>
            <Table>
                <Head>
                    <Cell>
                        <Text>Award Name</Text>
                    </Cell>
                    <Cell>
                        <Text>Description</Text>
                    </Cell>
                    <Cell>
                        <Text>Quantity Collected</Text>
                    </Cell>
                    <Cell>
                        <Text>Quantity Required</Text>
                    </Cell>
                    <Cell>
                        <Text>Actions</Text>
                    </Cell>
                </Head>
                {currentConfig.awards
                    .filter((award) => award.enabled)
                    .map((award) => {
                        const awardBalance = userDetails.awardBalance.find((awardBalance) => awardBalance.id == award.id);
                        return (
                            <Row>
                                <Cell>
                                    <Text>{award.name}</Text>
                                </Cell>
                                <Cell>
                                    <Text>{award.description}</Text>
                                </Cell>
                                <Cell>
                                    <Text>{awardBalance ? awardBalance.balance : 0}</Text>
                                </Cell>
                                <Cell>
                                    <Text>{award.quantityRequired}</Text>
                                </Cell>
                                <Cell>
                                    {awardBalance && awardBalance.balance >= award.quantityRequired && (
                                        <Button text='Redeem Award' appearance='primary' onClick={async () => redeemAward(award.id)} />
                                    )}
                                    {awardBalance && awardBalance.balance < award.quantityRequired && <Text>Not Enough Yet</Text>}
                                    {!awardBalance && <Text>Not Enough Yet</Text>}
                                </Cell>
                            </Row>
                        );
                    })}
            </Table>
            {isRedeeming.isRedeeming && (
                <Fragment>
                    <ModalDialog header='Congratulations' onClose={() => setIsRedeeming(false)} closeButtonText='Close'>
                        <Text>{isRedeeming.message}</Text>
                        <Text> </Text>
                        <Heading size='small'>Redemption Code</Heading>
                        <Text>{isRedeeming.redemptionCode}</Text>
                    </ModalDialog>
                </Fragment>
            )}
        </Fragment>
    );
};
