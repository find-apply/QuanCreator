import { Image, Text, Tooltip } from '@invoke-ai/ui-library';
import QuanCreatorLogo from 'public/assets/images/quancreator-logo.png';
import { memo, useMemo, useRef } from 'react';
import { useGetAppVersionQuery } from 'services/api/endpoints/appInfo';

const InvokeAILogoComponent = () => {
  const { data: appVersion } = useGetAppVersionQuery();
  const ref = useRef(null);
  const tooltip = useMemo(() => {
    if (appVersion) {
      return <Text fontWeight="semibold">v{appVersion.version}</Text>;
    }
    return null;
  }, [appVersion]);

  return (
    <Tooltip placement="right" label={tooltip} p={1} px={2} gutter={16}>
      <Image
        ref={ref}
        src={QuanCreatorLogo}
        alt="quancreator-logo"
        w="32px"
        h="32px"
        minW="32px"
        minH="32px"
        userSelect="none"
      />
    </Tooltip>
  );
};

export default memo(InvokeAILogoComponent);
