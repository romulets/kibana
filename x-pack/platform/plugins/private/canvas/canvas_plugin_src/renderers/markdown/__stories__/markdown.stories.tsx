/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { coreMock } from '@kbn/core/public/mocks';
import { getMarkdownRenderer } from '..';
import { Render } from '../../__stories__/render';

const markdown = getMarkdownRenderer(coreMock.createStart());

export default {
  title: 'renderers/markdown',
};

export const Default = {
  render: () => {
    const config = {
      content: '# This is Markdown',
      font: {
        css: '',
        spec: {},
        type: 'style' as 'style',
      },
      openLinksInNewTab: false,
    };
    return <Render renderer={markdown} config={config} />;
  },

  name: 'default',
};

export const LinksInNewTab = {
  render: () => {
    const config = {
      content: '[Elastic.co](https://elastic.co)',
      font: {
        css: '',
        spec: {},
        type: 'style' as 'style',
      },
      openLinksInNewTab: true,
    };
    return <Render renderer={markdown} config={config} />;
  },

  name: 'links in new tab',
};
