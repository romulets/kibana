/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { CoreSetup } from '@kbn/core/server';
import type { RuleType } from '@kbn/alerting-plugin/server';
import { schema } from '@kbn/config-schema';
import type { FixtureStartDeps, FixtureSetupDeps } from './plugin';

export function defineAlertTypes(
  core: CoreSetup<FixtureStartDeps>,
  { alerting }: Pick<FixtureSetupDeps, 'alerting'>
) {
  const noopRestrictedAlertType: RuleType<{}, {}, {}, {}, {}, 'default', 'restrictedRecovered'> = {
    id: 'test.restricted-noop',
    name: 'Test: Restricted Noop',
    actionGroups: [{ id: 'default', name: 'Default' }],
    category: 'kibana',
    producer: 'alertsRestrictedFixture',
    solution: 'stack',
    defaultActionGroupId: 'default',
    minimumLicenseRequired: 'basic',
    isExportable: true,
    recoveryActionGroup: { id: 'restrictedRecovered', name: 'Restricted Recovery' },
    async executor() {
      return { state: {} };
    },
    validate: {
      params: schema.any(),
    },
  };
  const noopUnrestrictedAlertType: RuleType<{}, {}, {}, {}, {}, 'default'> = {
    id: 'test.unrestricted-noop',
    name: 'Test: Unrestricted Noop',
    actionGroups: [{ id: 'default', name: 'Default' }],
    category: 'kibana',
    producer: 'alertsRestrictedFixture',
    solution: 'stack',
    defaultActionGroupId: 'default',
    minimumLicenseRequired: 'basic',
    isExportable: true,
    async executor() {
      return { state: {} };
    },
    validate: {
      params: schema.any(),
    },
  };
  alerting.registerType(noopRestrictedAlertType);
  alerting.registerType(noopUnrestrictedAlertType);
}
