/* eslint-disable react/jsx-no-bind */
import { Box, Button, Flex, FormControl, FormLabel, Heading, Input, Text, useToast } from '@invoke-ai/ui-library';
import { useAppDispatch } from 'app/store/storeHooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoginMutation } from 'services/api/endpoints/auth';

interface LoginPageProps {
  onRegisterClick: () => void;
}

export const LoginPage = ({ onRegisterClick }: LoginPageProps) => {
  const _dispatch = useAppDispatch();
  const { t: _t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useLoginMutation();
  const toast = useToast();

  const handleLogin = async () => {
    try {
      await login({ email, password }).unwrap();
      // Auth slice handles state update via matcher
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error?.data?.message || 'Please check your credentials',
        status: 'error',
      });
    }
  };

  return (
    <Flex width="100vw" height="100vh" alignItems="center" justifyContent="center" bg="base.900">
      <Box p={8} bg="base.800" borderRadius="lg" minW="400px" shadow="dark-lg">
        <Heading size="lg" mb={6} textAlign="center">
          Login
        </Heading>
        <Flex direction="column" gap={4}>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              type="email"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              type="password"
            />
          </FormControl>
          <Button onClick={handleLogin} isLoading={isLoading} colorScheme="invokeBlue" width="full">
            Login
          </Button>
          <Text fontSize="sm" textAlign="center" mt={2} color="base.300">
            Don&apos;t have an account?{' '}
            <Button variant="link" colorScheme="invokeBlue" size="sm" onClick={() => onRegisterClick()}>
              Register here
            </Button>
          </Text>
        </Flex>
      </Box>
    </Flex>
  );
};
