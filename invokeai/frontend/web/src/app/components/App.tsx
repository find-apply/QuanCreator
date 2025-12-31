import { Box } from '@invoke-ai/ui-library';
import { useStore } from '@nanostores/react';
import { GlobalHookIsolator } from 'app/components/GlobalHookIsolator';
import { GlobalModalIsolator } from 'app/components/GlobalModalIsolator';
import { clearStorage } from 'app/store/enhancers/reduxRemember/driver';
import { useAppSelector } from 'app/store/storeHooks';
import Loading from 'common/components/Loading/Loading';
import { LoginPage } from 'features/auth/components/LoginPage';
import { RegisterPage } from 'features/auth/components/RegisterPage';
import { selectIsAuthenticated } from 'features/auth/store/authSlice';
import { AppContent } from 'features/ui/components/AppContent';
import { navigationApi } from 'features/ui/layouts/navigation-api';
import { memo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import AppErrorBoundaryFallback from './AppErrorBoundaryFallback';
import ThemeLocaleProvider from './ThemeLocaleProvider';

const errorBoundaryOnReset = () => {
  clearStorage();
  location.reload();
  return false;
};

const App = () => {
  const isNavigationAPIConnected = useStore(navigationApi.$isConnected);
  const _isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // eslint-disable-next-line no-constant-condition
  if (false) {
    return (
      <ThemeLocaleProvider>
        <Box w="100dvw" h="100dvh" bg="base.900">
          {authView === 'login' ? (
            // eslint-disable-next-line react/jsx-no-bind
            <LoginPage onRegisterClick={() => setAuthView('register')} />
          ) : (
            // eslint-disable-next-line react/jsx-no-bind
            <RegisterPage onLoginClick={() => setAuthView('login')} />
          )}
        </Box>
      </ThemeLocaleProvider>
    );
  }

  return (
    <ThemeLocaleProvider>
      <ErrorBoundary onReset={errorBoundaryOnReset} FallbackComponent={AppErrorBoundaryFallback}>
        <Box id="invoke-app-wrapper" w="100dvw" h="100dvh" position="relative" overflow="hidden">
          {isNavigationAPIConnected ? <AppContent /> : <Loading />}
        </Box>
        <GlobalHookIsolator />
        <GlobalModalIsolator />
      </ErrorBoundary>
    </ThemeLocaleProvider>
  );
};

export default memo(App);
