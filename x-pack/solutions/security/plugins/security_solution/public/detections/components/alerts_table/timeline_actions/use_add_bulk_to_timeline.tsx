/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { TimelineItem } from '@kbn/timelines-plugin/common';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { Filter } from '@kbn/es-query';
import { getEsQueryConfig } from '@kbn/data-plugin/public';
import type { BulkActionsConfig } from '@kbn/response-ops-alerts-table/types';
import {
  dataTableActions,
  dataTableSelectors,
  tableDefaults,
  TableId,
} from '@kbn/securitysolution-data-table';
import type { RunTimeMappings } from '@kbn/timelines-plugin/common/search_strategy';
import { useDataView } from '../../../../data_view_manager/hooks/use_data_view';
import { useEnableExperimental } from '../../../../common/hooks/use_experimental_features';
import { useSelectedPatterns } from '../../../../data_view_manager/hooks/use_selected_patterns';
import { useBrowserFields } from '../../../../data_view_manager/hooks/use_browser_fields';
import type { CustomBulkAction } from '../../../../../common/types';
import { combineQueries } from '../../../../common/lib/kuery';
import { useKibana } from '../../../../common/lib/kibana';
import { BULK_ADD_TO_TIMELINE_LIMIT } from '../../../../../common/constants';
import type { TimelineArgs } from '../../../../timelines/containers';
import { useTimelineEventsHandler } from '../../../../timelines/containers';
import type { State } from '../../../../common/store/types';
import { useUpdateTimeline } from '../../../../timelines/components/open_timeline/use_update_timeline';
import { useCreateTimeline } from '../../../../timelines/hooks/use_create_timeline';
import { INVESTIGATE_BULK_IN_TIMELINE } from '../translations';
import { TimelineId } from '../../../../../common/types/timeline';
import { TimelineTypeEnum } from '../../../../../common/api/timeline';
import { sendBulkEventsToTimelineAction } from '../actions';
import type { CreateTimelineProps } from '../types';
import type { SourcererScopeName } from '../../../../sourcerer/store/model';
import type { Direction } from '../../../../../common/search_strategy';
import { useSourcererDataView } from '../../../../sourcerer/containers';
import { globalFiltersQuerySelector } from '../../../../common/store/inputs/selectors';

const { setEventsLoading, setSelected } = dataTableActions;

export interface UseAddBulkToTimelineActionProps {
  /* filters being passed to the Alert/events table */
  localFilters: Filter[];
  /* Table ID for which this hook is being used */
  tableId: TableId;
  /* start time being passed to the Events Table */
  from: string;
  /* End Time of the table being passed to the Events Table */
  to: string;
  /* Sourcerer Scope Id*/
  scopeId: SourcererScopeName;
}

const fields = ['_id', 'timestamp'];
/*
 * useAddBulkToTimelineAction  returns a bulk action that can be passed to the
 * TGrid so that multiple items at a time can be added to the timeline.
 *
 * It also syncs the timerange passed to the TGrid to that of  timeline
 *
 * */
export const useAddBulkToTimelineAction = ({
  localFilters,
  tableId,
  from,
  to,
  scopeId,
}: UseAddBulkToTimelineActionProps) => {
  const [disableActionOnSelectAll, setDisabledActionOnSelectAll] = useState(false);
  const { newDataViewPickerEnabled } = useEnableExperimental();

  const { dataView: experimentalDataView } = useDataView(scopeId);
  const experimentalBrowserFields = useBrowserFields(scopeId);
  const experimentalSelectedPatterns = useSelectedPatterns(scopeId);

  const {
    browserFields: oldBrowserFields,
    dataViewId: oldDataViewId,
    sourcererDataView: oldSourcererDataViewSpec,
    // important to get selectedPatterns from useSourcererDataView
    // in order to include the exclude filters in the search that are not stored in the timeline
    selectedPatterns: oldSelectedPatterns,
  } = useSourcererDataView(scopeId);

  const runtimeMappings = useMemo(() => {
    return newDataViewPickerEnabled
      ? (experimentalDataView.getRuntimeMappings() as RunTimeMappings)
      : (oldSourcererDataViewSpec.runtimeFieldMap as RunTimeMappings);
  }, [newDataViewPickerEnabled, experimentalDataView, oldSourcererDataViewSpec.runtimeFieldMap]);

  const dataViewId = useMemo(
    () => (newDataViewPickerEnabled ? experimentalDataView.id ?? '' : oldDataViewId),
    [experimentalDataView.id, newDataViewPickerEnabled, oldDataViewId]
  );
  const browserFields = useMemo(
    () => (newDataViewPickerEnabled ? experimentalBrowserFields : oldBrowserFields),
    [experimentalBrowserFields, newDataViewPickerEnabled, oldBrowserFields]
  );
  const selectedPatterns = useMemo(
    () => (newDataViewPickerEnabled ? experimentalSelectedPatterns : oldSelectedPatterns),
    [experimentalSelectedPatterns, newDataViewPickerEnabled, oldSelectedPatterns]
  );

  const dispatch = useDispatch();
  const { uiSettings } = useKibana().services;

  const selectGlobalFiltersQuerySelector = useMemo(() => globalFiltersQuerySelector(), []);
  const filters = useSelector(selectGlobalFiltersQuerySelector);
  const selectTableById = useMemo(() => dataTableSelectors.createTableSelector(tableId), [tableId]);
  const { selectAll, totalCount, sort, selectedEventIds } = useSelector(
    (state: State) => selectTableById(state) ?? tableDefaults
  );

  const esQueryConfig = useMemo(() => getEsQueryConfig(uiSettings), [uiSettings]);

  const timelineQuerySortField = useMemo(() => {
    return sort.map(({ columnId, columnType, esTypes, sortDirection }) => ({
      field: columnId,
      direction: sortDirection as Direction,
      esTypes: esTypes ?? [],
      type: columnType,
    }));
  }, [sort]);

  const combinedFilters = useMemo(() => [...localFilters, ...filters], [localFilters, filters]);

  const combinedQuery = useMemo(() => {
    return combineQueries({
      config: esQueryConfig,
      dataProviders: [],
      dataViewSpec: oldSourcererDataViewSpec,
      dataView: experimentalDataView,
      filters: combinedFilters,
      kqlQuery: { query: '', language: 'kuery' },
      browserFields,
      kqlMode: 'filter',
    });
  }, [
    esQueryConfig,
    oldSourcererDataViewSpec,
    experimentalDataView,
    combinedFilters,
    browserFields,
  ]);

  const filterQuery = useMemo(() => {
    if (!combinedQuery) return '';
    return combinedQuery.filterQuery;
  }, [combinedQuery]);

  // in case user selects all items, we will use below handler to get the IDs of
  // all items (with max limit)
  const [, , searchhandler] = useTimelineEventsHandler({
    dataViewId,
    endDate: to,
    startDate: from,
    id: tableId,
    fields,
    sort: timelineQuerySortField,
    indexNames: selectedPatterns,
    filterQuery,
    runtimeMappings,
    limit: Math.min(BULK_ADD_TO_TIMELINE_LIMIT, totalCount),
    timerangeKind: 'absolute',
  });

  useEffect(() => {
    if (!selectAll) {
      setDisabledActionOnSelectAll(false);
      return;
    }
    if (totalCount > BULK_ADD_TO_TIMELINE_LIMIT) {
      setDisabledActionOnSelectAll(true);
    } else {
      setDisabledActionOnSelectAll(false);
    }
  }, [selectAll, totalCount]);

  const clearActiveTimeline = useCreateTimeline({
    timelineId: TimelineId.active,
    timelineType: TimelineTypeEnum.default,
  });

  const updateTimeline = useUpdateTimeline();

  const createTimeline = useCallback(
    async ({ timeline, ruleNote, timeline: { filters: eventIdFilters } }: CreateTimelineProps) => {
      await clearActiveTimeline();
      updateTimeline({
        duplicate: true,
        from,
        id: TimelineId.active,
        notes: [],
        timeline: {
          ...timeline,
          indexNames: timeline.indexNames ?? [],
          show: true,
          filters: eventIdFilters,
        },
        to,
        ruleNote,
      });
    },
    [updateTimeline, clearActiveTimeline, from, to]
  );

  const sendBulkEventsToTimelineHandler = useCallback(
    (items: TimelineItem[]) => {
      sendBulkEventsToTimelineAction(
        createTimeline,
        items.map((item) => item.ecs),
        'KqlFilter'
      );

      dispatch(
        setSelected({
          id: tableId,
          isSelectAllChecked: false,
          isSelected: false,
          eventIds: selectedEventIds,
        })
      );
    },
    [dispatch, createTimeline, selectedEventIds, tableId]
  );

  const onActionClick = useCallback<
    NonNullable<BulkActionsConfig['onClick'] | CustomBulkAction['onClick']>
  >(
    (items, isAllSelected, setLoading, clearSelection) => {
      if (!items) return;
      /*
       * Trigger actions table passed isAllSelected param
       *
       * and selectAll is used when using DataTable
       * */
      const onResponseHandler = (localResponse: TimelineArgs) => {
        sendBulkEventsToTimelineHandler(localResponse.events);
        if (tableId === TableId.alertsOnAlertsPage) {
          setLoading(false);
          clearSelection();
        } else {
          dispatch(
            setEventsLoading({
              id: tableId,
              isLoading: false,
              eventIds: Object.keys(selectedEventIds),
            })
          );
        }
      };

      if (isAllSelected || selectAll) {
        if (tableId === TableId.alertsOnAlertsPage) {
          setLoading(true);
        } else {
          dispatch(
            setEventsLoading({
              id: tableId,
              isLoading: true,
              eventIds: Object.keys(selectedEventIds),
            })
          );
        }
        searchhandler(onResponseHandler);
        return;
      }
      sendBulkEventsToTimelineHandler(items);
      clearSelection();
    },
    [dispatch, selectedEventIds, tableId, searchhandler, selectAll, sendBulkEventsToTimelineHandler]
  );

  const investigateInTimelineTitle = useMemo(() => {
    return disableActionOnSelectAll
      ? `${INVESTIGATE_BULK_IN_TIMELINE} ( max ${BULK_ADD_TO_TIMELINE_LIMIT} )`
      : INVESTIGATE_BULK_IN_TIMELINE;
  }, [disableActionOnSelectAll]);

  const memoized = useMemo(
    () => ({
      label: investigateInTimelineTitle,
      key: 'add-bulk-to-timeline',
      'data-test-subj': 'investigate-bulk-in-timeline',
      disableOnQuery: disableActionOnSelectAll,
      onClick: onActionClick,
    }),
    [disableActionOnSelectAll, investigateInTimelineTitle, onActionClick]
  );
  return memoized;
};
