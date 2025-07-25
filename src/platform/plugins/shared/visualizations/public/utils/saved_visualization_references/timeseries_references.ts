/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { Reference } from '@kbn/content-management-utils';
import { DATA_VIEW_SAVED_OBJECT_TYPE } from '@kbn/data-views-plugin/common';
import { VisParams } from '../../../common';

/** @internal **/
const REF_NAME_POSTFIX = '_ref_name';

/** @internal **/
type Action = (object: Record<string, any>, key: string) => void;

const isMetricsVis = (visType: string) => visType === 'metrics';

const doForExtractedIndices = (action: Action, visParams: VisParams) => {
  action(visParams, 'index_pattern');

  visParams.series.forEach((series: any) => {
    if (series.override_index_pattern) {
      action(series, 'series_index_pattern');
    }
  });

  if (visParams.annotations) {
    visParams.annotations.forEach((annotation: any) => {
      action(annotation, 'index_pattern');
    });
  }
};

export const extractTimeSeriesReferences = (
  visType: string,
  visParams: VisParams,
  references: Reference[] = [],
  prefix: string = 'metrics'
) => {
  let i = 0;
  if (isMetricsVis(visType)) {
    doForExtractedIndices((object, key) => {
      if (object[key] && object[key].id) {
        const name = `${prefix}_${i++}_index_pattern`;

        object[key + REF_NAME_POSTFIX] = name;
        references.push({
          name,
          type: DATA_VIEW_SAVED_OBJECT_TYPE,
          id: object[key].id,
        });
        delete object[key];
      }
    }, visParams);
  }
};

export const injectTimeSeriesReferences = (
  visType: string,
  visParams: VisParams,
  references: Reference[]
) => {
  if (isMetricsVis(visType)) {
    doForExtractedIndices((object, key) => {
      const refKey = key + REF_NAME_POSTFIX;

      if (object[refKey]) {
        const refValue = references.find((ref) => ref.name === object[refKey]);

        if (refValue) {
          object[key] = { id: refValue.id };
        }

        delete object[refKey];
      }
    }, visParams);
  }
};
