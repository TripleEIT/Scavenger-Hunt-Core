import ForgeUI, { Fragment, Text, Link, Em } from '@forge/ui';

/**
 * A simple component to display a help link.
 * @param {string} helpLink - The link to the help documentation.
 * @example
 * <HelpLink helpLink="https://tripleeit.atlassian.net/wiki/spaces/SHD/pages/9601093/Configuring+Rewards#Advanced" />
 */
export const HelpLink = (props) => {
    const { string: helpLink } = props;
    return (
        <Fragment>
            <Text>
                <Em>
                    See our online documentation for additional information. Click
                    <Link openNewTab={true} href={helpLink} appearance="link">
                        {' '}
                        here
                    </Link>
                    .
                </Em>
            </Text>
        </Fragment>
    );
};
