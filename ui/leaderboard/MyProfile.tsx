import ForgeUI, { Button, Cell, Fragment, Head, Heading, Row, Table, Text, useState } from '@forge/ui';
import { getPowerUpDefinition } from '../../defaults/powerUpSettings';
import { getConfigurationSettings } from '../../storage/configurationData';
import { getUserRecord } from '../../storage/userData';
import { ActivePowerUp } from './ActivePowerUp';
import { PowerUpTable } from './PowerUpTable';
import { RedeemRewardsBlock } from './RedeemRewardsBlock';

export const MyProfile = (props) => {
    const { context } = props;
    const [userDetails, setUserDetails] = useState(async () => getUserRecord(context.accountId, context));
    const [currentConfig, setCurrentConfig] = useState(async () => getConfigurationSettings(context));
    return (
        <Fragment>
            <Text> </Text>
            <Heading size='small'>Available PowerUps</Heading>
            <PowerUpTable userDetails={userDetails} setUserDetails={setUserDetails} currentConfig={currentConfig} context={context}/>
            <Text> </Text>
            <Text> </Text>
            <Heading size='small'>Rewards Redemption</Heading>
            <RedeemRewardsBlock
                userDetails={userDetails}
                setUserDetails={setUserDetails}
                currentConfig={currentConfig}
                setCurrentConfig={setCurrentConfig}
                context={context}
            />
        </Fragment>
    );
};
