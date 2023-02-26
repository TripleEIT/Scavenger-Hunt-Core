import ForgeUI, { Text, render, GlobalPage, Fragment, Tabs, useProductContext, Tab, Heading, Strong } from '@forge/ui';
import { HelpAndWelcome } from './ui/leaderboard/HelpAndWelcome.js';
import { LeaderboardTable } from './ui/leaderboard/LeaderboardTable.js';
import { MyProfile } from './ui/leaderboard/MyProfile.js';
import { getStandardContext } from './utils.js';

const UserHomePage = () => {
    const context = getStandardContext(useProductContext(), 'user');
    
    if (context.isLicensed === false) {
        console.error('License not found', useProductContext())
        return (
            <Fragment>
                <Text>Please confirm you have a valid license for Scavenger Hunt</Text>
            </Fragment>
        );
    }

    return (
        <Fragment>
            <Heading size="large">Welcome to the Scavenger Hunt!</Heading>
            <Text>
                Here you can find all the information you need to get started with the Scavenger Hunt. You can also
                check your score on the leaderboard and redeem your points for rewards.
            </Text>
            <Heading size="small">What's the Scavenger Hunt?</Heading>
            <Text>
                We're glad you asked! A handful of prizes listed below have been broken into <Strong>increments</Strong>{' '}
                and hidden throughout Jira and Confluence. Your job is to find enough increments to earn the prize. You
                can find the increments by completing normal activities such as keeping documentation up to date or
                commenting on a ticket.
            </Text>
            <Heading size="small">How to Play</Heading>
            <Text>
                Just use Jira and Confluence as you normally would. You will earn points for completing activities and
                helping to keep your team on track. You can redeem your points for rewards and see your score on the
                leaderboard. If you're feeling lucking you can use a PowerUp to improve your chances of finding an
                increment or double your rewards.
            </Text>
            <Heading size="small">What do I Need to Do?</Heading>
            <Text>
                Nothing! Pretty easy, right? You'll automatically be added to the Leaderboard below when you find your
                first <Strong>increment</Strong> of an award. You'll be tagged in the comments of the activity when you
                find it, so you'll know when you've earned points.
            </Text>
            <Text> </Text>
            <Tabs>
                <Tab label="Scavenger Hunt Activity">
                    <Text> </Text>
                    <Heading size="medium">Leaderboard</Heading>
                    <Text>Check out your score on the leaderboard, are you keeping up with your teammates?</Text>
                    <LeaderboardTable context={context} />
                </Tab>

                <Tab label="My Profile">
                    <Text> </Text>
                    <Heading size="medium">My Profile</Heading>
                    <Text>Looking to redeem and award or enable a PowerUp? Everything you need is below.</Text>
                    <MyProfile context={context} />
                </Tab>
            </Tabs>
        </Fragment>
    );
};

export const run = render(
    <GlobalPage>
        <UserHomePage />
    </GlobalPage>
);
