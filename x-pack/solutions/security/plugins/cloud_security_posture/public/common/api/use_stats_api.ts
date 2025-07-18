/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { CSPM_POLICY_TEMPLATE, KSPM_POLICY_TEMPLATE } from '@kbn/cloud-security-posture-common';
import { useKibana } from '../hooks/use_kibana';
import { ComplianceDashboardDataV2, PosturePolicyTemplate } from '../../../common/types_old';
import { STATS_ROUTE_PATH } from '../../../common/constants';
import { DEFAULT_NAMESPACE } from '../constants';

// TODO: consolidate both hooks into one hook with a dynamic key
export const CSPM_STATS_QUERY_KEY = 'csp_cspm_dashboard_stats';
export const KSPM_STATS_QUERY_KEY = 'csp_kspm_dashboard_stats';

export const getStatsRoute = (policyTemplate: PosturePolicyTemplate) => {
  return STATS_ROUTE_PATH.replace('{policy_template}', policyTemplate);
};

export const useCspmStatsApi = (
  options: UseQueryOptions<unknown, unknown, ComplianceDashboardDataV2, string[]>,
  namespace: string = DEFAULT_NAMESPACE
) => {
  const { http } = useKibana().services;
  return useQuery(
    [CSPM_STATS_QUERY_KEY, namespace],
    () => {
      return http.get<ComplianceDashboardDataV2>(getStatsRoute(CSPM_POLICY_TEMPLATE), {
        version: '2',
        query: {
          namespace,
        },
      });
    },
    options
  );
};

export const useKspmStatsApi = (
  options: UseQueryOptions<unknown, unknown, ComplianceDashboardDataV2, string[]>,
  namespace: string = DEFAULT_NAMESPACE
) => {
  const { http } = useKibana().services;
  return useQuery(
    [KSPM_STATS_QUERY_KEY, namespace],
    () =>
      http.get<ComplianceDashboardDataV2>(getStatsRoute(KSPM_POLICY_TEMPLATE), {
        version: '2',
        query: {
          namespace,
        },
      }),
    options
  );
};
