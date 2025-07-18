/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { fieldList } from '@kbn/data-views-plugin/common';
import { buildDataViewMock } from '@kbn/discover-utils/src/__mocks__';
import { createContextAwarenessMocks } from '../../../../context_awareness/__mocks__';
import { dataViewWithTimefieldMock } from '../../../../__mocks__/data_view_with_timefield';
import { getDefaultProfileState } from './get_default_profile_state';

const emptyDataView = buildDataViewMock({
  name: 'emptyDataView',
  fields: fieldList(),
});
const { profilesManagerMock, scopedEbtManagerMock } = createContextAwarenessMocks();
const scopedProfilesManager = profilesManagerMock.createScopedProfilesManager({
  scopedEbtManager: scopedEbtManagerMock,
});

scopedProfilesManager.resolveDataSourceProfile({});

describe('getDefaultProfileState', () => {
  describe('getPreFetchState', () => {
    it('should return expected breakdownField', () => {
      let appState = getDefaultProfileState({
        scopedProfilesManager,
        resetDefaultProfileState: {
          resetId: 'test',
          columns: false,
          rowHeight: false,
          breakdownField: true,
          hideChart: false,
        },
        dataView: dataViewWithTimefieldMock,
      }).getPreFetchState();
      expect(appState).toEqual({
        breakdownField: 'extension',
      });
      appState = getDefaultProfileState({
        scopedProfilesManager,
        resetDefaultProfileState: {
          resetId: 'test',
          columns: false,
          rowHeight: false,
          breakdownField: true,
          hideChart: false,
        },
        dataView: emptyDataView,
      }).getPreFetchState();
      expect(appState).toEqual(undefined);
    });

    it('should return expected hideChart', () => {
      let appState = getDefaultProfileState({
        scopedProfilesManager,
        resetDefaultProfileState: {
          resetId: 'test',
          columns: false,
          rowHeight: false,
          breakdownField: false,
          hideChart: true,
        },
        dataView: dataViewWithTimefieldMock,
      }).getPreFetchState();
      expect(appState).toEqual({
        hideChart: true,
      });
      appState = getDefaultProfileState({
        scopedProfilesManager,
        resetDefaultProfileState: {
          resetId: 'test',
          columns: false,
          rowHeight: false,
          breakdownField: false,
          hideChart: false,
        },
        dataView: emptyDataView,
      }).getPreFetchState();
      expect(appState).toEqual(undefined);
    });
  });

  describe('getPostFetchState', () => {
    it('should return expected columns', () => {
      let appState = getDefaultProfileState({
        scopedProfilesManager,
        resetDefaultProfileState: {
          resetId: 'test',
          columns: true,
          rowHeight: false,
          breakdownField: false,
          hideChart: false,
        },
        dataView: dataViewWithTimefieldMock,
      }).getPostFetchState({
        defaultColumns: ['messsage', 'bytes'],
        esqlQueryColumns: undefined,
      });
      expect(appState).toEqual({
        columns: ['message', 'extension', 'bytes'],
        grid: {
          columns: {
            extension: {
              width: 200,
            },
            message: {
              width: 100,
            },
          },
        },
      });
      appState = getDefaultProfileState({
        scopedProfilesManager,
        resetDefaultProfileState: {
          resetId: 'test',
          columns: true,
          rowHeight: false,
          breakdownField: false,
          hideChart: false,
        },
        dataView: emptyDataView,
      }).getPostFetchState({
        defaultColumns: ['messsage', 'bytes'],
        esqlQueryColumns: [
          { id: '1', name: 'foo', meta: { type: 'string' } },
          { id: '2', name: 'bar', meta: { type: 'string' } },
        ],
      });
      expect(appState).toEqual({
        columns: ['foo', 'bar'],
        grid: {
          columns: {
            foo: {
              width: 300,
            },
          },
        },
      });
    });

    it('should return expected rowHeight', () => {
      const appState = getDefaultProfileState({
        scopedProfilesManager,
        resetDefaultProfileState: {
          resetId: 'test',
          columns: false,
          rowHeight: true,
          breakdownField: false,
          hideChart: false,
        },
        dataView: dataViewWithTimefieldMock,
      }).getPostFetchState({
        defaultColumns: [],
        esqlQueryColumns: undefined,
      });
      expect(appState).toEqual({
        rowHeight: 3,
      });
    });

    it('should return undefined', () => {
      const appState = getDefaultProfileState({
        scopedProfilesManager,
        resetDefaultProfileState: {
          resetId: 'test',
          columns: false,
          rowHeight: false,
          breakdownField: false,
          hideChart: false,
        },
        dataView: dataViewWithTimefieldMock,
      }).getPostFetchState({
        defaultColumns: [],
        esqlQueryColumns: undefined,
      });
      expect(appState).toEqual(undefined);
    });
  });
});
