/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { IRouter } from '@kbn/core/server';
import * as t from 'io-ts';
import { NonEmptyString } from '@kbn/securitysolution-io-ts-types';
import { transformError } from '@kbn/securitysolution-es-utils';

import type { RacRequestHandlerContext } from '../types';
import { BASE_RAC_ALERTS_API_PATH } from '../../common/constants';
import { buildRouteValidation } from './utils/route_validation';

export const getAlertByIdRoute = (router: IRouter<RacRequestHandlerContext>) => {
  router.get(
    {
      path: BASE_RAC_ALERTS_API_PATH,
      validate: {
        query: buildRouteValidation(
          t.intersection([
            t.exact(
              t.type({
                id: NonEmptyString,
              })
            ),
            t.exact(
              t.partial({
                index: t.string,
              })
            ),
          ])
        ),
      },
      security: {
        authz: {
          requiredPrivileges: ['rac'],
        },
      },
      options: {
        access: 'internal',
      },
    },
    async (context, request, response) => {
      try {
        const racContext = await context.rac;
        const alertsClient = await racContext.getAlertsClient();
        const { id, index } = request.query;
        const alert = await alertsClient.get({ id, index });
        if (alert == null) {
          return response.notFound({
            body: { message: `alert with id ${id} and index ${index} not found` },
          });
        }
        return response.ok({
          body: alert,
        });
      } catch (exc) {
        const err = transformError(exc);
        const contentType = {
          'content-type': 'application/json',
        };
        const defaultedHeaders = {
          ...contentType,
        };

        return response.customError({
          headers: defaultedHeaders,
          statusCode: err.statusCode,
          body: {
            message: err.message,
            attributes: {
              success: false,
            },
          },
        });
      }
    }
  );
};
