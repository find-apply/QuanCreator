import {
  Flex,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@invoke-ai/ui-library';
import QuanCreatorLogo from 'public/assets/images/quancreator-logo.png';
import type { ReactElement } from 'react';
import { cloneElement, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetAppVersionQuery } from 'services/api/endpoints/appInfo';

type AboutModalProps = {
  /* The button to open the Settings Modal */
  children: ReactElement;
};

const AboutModal = ({ children }: AboutModalProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();
  const { data: appVersion } = useGetAppVersionQuery();

  return (
    <>
      {cloneElement(children, {
        onClick: onOpen,
      })}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl" useInert={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('accessibility.about')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" gap={4} pb={8}>
            <Flex flexDir="column" gap={3} justifyContent="center" alignItems="center" h="full">
              <Image src={QuanCreatorLogo} alt="quancreator-logo" w="120px" />
              {appVersion && <Text>{`v${appVersion?.version}`}</Text>}
              <Heading fontSize="large">Quanticreator App</Heading>
              <Text fontSize="sm" textAlign="center">
                Quanticreator is a powerful AI-driven creative suite designed to empower artists and designers.
                Unleash your creativity with our advanced tools and features.
              </Text>
            </Flex>
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </>
  );
};

export default memo(AboutModal);
