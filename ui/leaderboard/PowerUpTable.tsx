import ForgeUI, { Button, Cell, Fragment, Head, Heading, Row, Table, Text, useState } from '@forge/ui';
import { getPowerUpDefinition } from '../../defaults/powerUpSettings';
import { setConfigurationSettings } from '../../storage/configurationData';
import { getNarrowUserRecord, getUserRecord, setUserRecord } from '../../storage/userData';
import { ActivePowerUp } from './ActivePowerUp';

export const PowerUpTable = (props) => {
    const { userDetails, setUserDetails, context, currentConfig } = props;
    const [powerUpBalance, setPowerUpBalance] = useState(userDetails.powerUpBalance);

    const usePowerUp = async (powerUpType) => {
        const powerUpSettings = getPowerUpDefinition(powerUpType);
        userDetails.activePowerUp = powerUpType;
        userDetails.activePowerUpExpiration = new Date().getTime() + powerUpSettings.durationSeconds * 1000;
        userDetails.powerUpBalance = userDetails.powerUpBalance.map((powerUp) => {
            if (powerUp.type == powerUpType) {
                powerUp.quantity--;
            }
            return powerUp;
        });

        setUserDetails(userDetails);
        setPowerUpBalance(userDetails.powerUpBalance);

        const narrowUser = getNarrowUserRecord(userDetails);
        const updatedConfig = {
            ...currentConfig,
            activeUsers: [...currentConfig.activeUsers.filter((user) => user.accountId != userDetails.accountId), narrowUser]
        };

        await Promise.all([setConfigurationSettings(updatedConfig, context), setUserRecord(userDetails.accountId, userDetails, context)]);
    };

    return (
        <Fragment>
            <ActivePowerUp user={userDetails} />
            <Table>
                <Head>
                    <Cell>
                        <Text>Name</Text>
                    </Cell>
                    <Cell>
                        <Text>Description</Text>
                    </Cell>
                    <Cell>
                        <Text>Quantity Available</Text>
                    </Cell>
                    <Cell>
                        <Text>Duration</Text>
                    </Cell>
                    <Cell>
                        <Text>Actions</Text>
                    </Cell>
                </Head>
                {powerUpBalance.map((powerUp) => {
                    const powerUpSettings = getPowerUpDefinition(powerUp.type);
                    return (
                        <Row>
                            <Cell>
                                <Text>{powerUpSettings.name}</Text>
                            </Cell>
                            <Cell>
                                <Text>{powerUpSettings.description}</Text>
                            </Cell>
                            <Cell>
                                <Text>{powerUp.quantity}</Text>
                            </Cell>
                            <Cell>
                                <Text>{powerUpSettings.duration}</Text>
                            </Cell>
                            <Cell>
                                {powerUp.quantity > 0 && (
                                    <Button text="Use PowerUp" appearance="link" onClick={async () => usePowerUp(powerUp.type)} />
                                )}
                                {powerUp.quantity == 0 && <Text>None Available</Text>}
                            </Cell>
                        </Row>
                    );
                })}
            </Table>
        </Fragment>
    );
};
