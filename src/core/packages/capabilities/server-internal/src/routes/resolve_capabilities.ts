/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { schema } from '@kbn/config-schema';
import type { IRouter } from '@kbn/core-http-server';
import type { CapabilitiesResolver } from '../resolve_capabilities';

const applicationIdRegexp = /^[a-zA-Z0-9_:-]+$/;

export function registerCapabilitiesRoutes(router: IRouter, resolver: CapabilitiesResolver) {
  router.post(
    {
      path: '/api/core/capabilities',
      security: {
        authz: {
          enabled: false,
          reason: 'This route delegates authorization to the Capabilities Resolver',
        },
        authc: {
          enabled: 'optional',
        },
      },
      validate: {
        query: schema.object({
          useDefaultCapabilities: schema.boolean({ defaultValue: false }),
        }),
        body: schema.object({
          applications: schema.arrayOf(
            schema.string({
              validate: (appName) => {
                if (!applicationIdRegexp.test(appName)) {
                  return `Invalid application id: ${
                    appName.length > 20 ? `${appName.substring(0, 20)}...` : appName
                  }`;
                }
              },
            })
          ),
        }),
      },
    },
    async (ctx, req, res) => {
      const { useDefaultCapabilities } = req.query;
      const { applications } = req.body;
      const capabilities = await resolver({
        request: req,
        applications,
        useDefaultCapabilities,
        capabilityPath: ['*'],
      });
      return res.ok({
        body: capabilities,
      });
    }
  );
}
