import ForgeUI, { Fragment, useState, Text, Heading, Table, Head, Cell } from '@forge/ui';
import { getConfigurationSettings, setConfigurationSettings } from '../../storage/configurationData';
import { UserAwardHistoryModal } from './UserAwardHistoryModal';
import { UserLeaderboardRow } from './UserLeaderboardRow';

export const LeaderboardTable = (props) => {
    const { context } = props;

    const [currentConfig, setCurrentConfig] = useState(async () => await getConfigurationSettings(context));
    const [viewingUserState, setViewingUserState] = useState({ viewingUser: false, viewingUserAccountId: null });

    const saveConfig = async (newConfig) => {
        console.debug('Saving new config', newConfig);
        await setConfigurationSettings(context, newConfig);
        setCurrentConfig(newConfig);
    };

    return (
        <Fragment>
            <Table>
                <Head>
                    <Cell>
                        <Text>User</Text>
                    </Cell>
                    <Cell>
                        <Text>Active PowerUp</Text>
                    </Cell>
                    {currentConfig.awards.map((award) => {
                        return (
                            <Cell>
                                <Text>{award.name}</Text>
                            </Cell>
                        );
                    })}
                    <Cell>
                        <Text>Actions</Text>
                    </Cell>
                </Head>
                {currentConfig.activeUsers.map((user) => {
                    return <UserLeaderboardRow user={user} awards={currentConfig.awards} setViewingUserState={setViewingUserState} />;
                })}
            </Table>

            {/* This is another instance of a nested table and it needs to be outside of the table above */}
            <UserAwardHistoryModal viewingUserState={viewingUserState} context={context} setViewingUserState={setViewingUserState} />
        </Fragment>
    );
};
