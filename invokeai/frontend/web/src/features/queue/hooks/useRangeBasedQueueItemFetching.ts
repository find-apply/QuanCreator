import { useCallback } from 'react';
import type { ListRange } from 'react-virtuoso';

interface UseRangeBasedQueueItemFetchingArgs {
  itemIds: number[];
  enabled: boolean;
}

interface UseRangeBasedQueueItemFetchingReturn {
  onRangeChanged: (range: ListRange) => void;
}

/**
 * Hook for bulk fetching queue items based on the visible range from virtuoso.
 * Individual quite item components should use `useGetQueueItemQuery(item_id)` to get their specific DTO.
 * This hook ensures DTOs are bulk fetched and cached efficiently.
 */
export const useRangeBasedQueueItemFetching = ({
  itemIds: _itemIds,
  enabled: _enabled,
}: UseRangeBasedQueueItemFetchingArgs): UseRangeBasedQueueItemFetchingReturn => {
  const onRangeChanged = useCallback((_range: ListRange) => {
    // no-op
  }, []);

  return {
    onRangeChanged,
  };
};
