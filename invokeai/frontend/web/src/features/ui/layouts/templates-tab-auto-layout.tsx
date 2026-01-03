import type { GridviewApi, IGridviewReactProps } from 'dockview';
import { GridviewReact, LayoutPriority, Orientation } from 'dockview';
import { TemplatesPage } from 'features/template-gallery/components/TemplatesPage';
import type { RootLayoutGridviewComponents } from 'features/ui/layouts/auto-layout-context';
import { AutoLayoutProvider } from 'features/ui/layouts/auto-layout-context';
import type { TabName } from 'features/ui/store/uiTypes';
import { memo, useCallback, useEffect } from 'react';

import { navigationApi } from './navigation-api';

const TEMPLATES_PANEL_ID = 'templates';

const rootPanelComponents: RootLayoutGridviewComponents = {
  [TEMPLATES_PANEL_ID]: TemplatesPage,
};

const initializeRootPanelLayout = (tab: TabName, api: GridviewApi) => {
  navigationApi.registerContainer(tab, 'root', api, () => {
    api.addPanel({
      id: TEMPLATES_PANEL_ID,
      component: TEMPLATES_PANEL_ID,
      priority: LayoutPriority.High,
    });
  });
};

export const TemplatesTabAutoLayout = memo(() => {
  const onReady = useCallback<IGridviewReactProps['onReady']>(({ api }) => {
    initializeRootPanelLayout('templates', api);
  }, []);

  useEffect(
    () => () => {
      navigationApi.unregisterTab('templates');
    },
    []
  );

  return (
    <AutoLayoutProvider tab="templates">
      <GridviewReact
        className="dockview-theme-invoke"
        components={rootPanelComponents}
        onReady={onReady}
        orientation={Orientation.VERTICAL}
      />
    </AutoLayoutProvider>
  );
});

TemplatesTabAutoLayout.displayName = 'TemplatesTabAutoLayout';
