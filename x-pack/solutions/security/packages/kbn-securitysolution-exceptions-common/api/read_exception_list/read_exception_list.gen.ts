/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/*
 * NOTICE: Do not edit this file manually.
 * This file is automatically generated by the OpenAPI Generator, @kbn/openapi-generator.
 *
 * info:
 *   title: Read exception list API endpoint
 *   version: 2023-10-31
 */

import { z } from '@kbn/zod';

import {
  ExceptionListId,
  ExceptionListHumanId,
  ExceptionNamespaceType,
  ExceptionList,
} from '../model/exception_list_common.gen';

export type ReadExceptionListRequestQuery = z.infer<typeof ReadExceptionListRequestQuery>;
export const ReadExceptionListRequestQuery = z.object({
  /**
   * Exception list's identifier. Either `id` or `list_id` must be specified.
   */
  id: ExceptionListId.optional(),
  /**
   * Human readable exception list string identifier, e.g. `trusted-linux-processes`. Either `id` or `list_id` must be specified.
   */
  list_id: ExceptionListHumanId.optional(),
  namespace_type: ExceptionNamespaceType.optional().default('single'),
});
export type ReadExceptionListRequestQueryInput = z.input<typeof ReadExceptionListRequestQuery>;

export type ReadExceptionListResponse = z.infer<typeof ReadExceptionListResponse>;
export const ReadExceptionListResponse = ExceptionList;
