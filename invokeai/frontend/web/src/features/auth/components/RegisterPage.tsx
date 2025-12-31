/* eslint-disable react/jsx-no-bind */
import { Box, Button, Flex, FormControl, FormLabel, Heading, Input, Text, useToast } from '@invoke-ai/ui-library';
import { useState } from 'react';
import { useRegisterMutation } from 'services/api/endpoints/auth';

interface RegisterPageProps {
  onLoginClick: () => void;
}

export const RegisterPage = ({ onLoginClick }: RegisterPageProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [register, { isLoading }] = useRegisterMutation();
  const toast = useToast();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', status: 'error' });
      return;
    }

    try {
      await register({ name, email, password, password_confirmation: confirmPassword }).unwrap();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error?.data?.message || 'Could not create account',
        status: 'error',
      });
    }
  };

  return (
    <Flex width="100vw" height="100vh" alignItems="center" justifyContent="center" bg="base.900">
      <Box p={8} bg="base.800" borderRadius="lg" minW="400px" shadow="dark-lg">
        <Heading size="lg" mb={6} textAlign="center">
          Register
        </Heading>
        <Flex direction="column" gap={4}>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
          </FormControl>
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
              placeholder="Choose a password"
              type="password"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              type="password"
            />
          </FormControl>
          <Button onClick={handleRegister} isLoading={isLoading} colorScheme="invokeBlue" width="full">
            Register
          </Button>
          <Text fontSize="sm" textAlign="center" mt={2} color="base.300">
            Already have an account?{' '}
            <Button variant="link" colorScheme="invokeBlue" size="sm" onClick={() => onLoginClick()}>
              Login here
            </Button>
          </Text>
        </Flex>
      </Box>
    </Flex>
  );
};
