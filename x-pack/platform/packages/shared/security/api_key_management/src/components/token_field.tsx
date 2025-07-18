/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { EuiFieldTextProps } from '@elastic/eui';
import {
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiCopy,
  EuiFieldText,
  EuiHorizontalRule,
  EuiPopover,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import type { FunctionComponent, ReactElement } from 'react';
import React, { useEffect, useState } from 'react';

import { i18n } from '@kbn/i18n';
import { euiThemeVars } from '@kbn/ui-theme';

export interface TokenFieldProps extends Omit<EuiFieldTextProps, 'append'> {
  value: string;
}

export const TokenField: FunctionComponent<TokenFieldProps> = ({ value, ...props }) => {
  return (
    <EuiFieldText
      data-test-subj="apiKeyTokenField"
      aria-label={i18n.translate('xpack.security.copyTokenField.tokenLabel', {
        defaultMessage: 'Token',
      })}
      value={value}
      css={{
        fontFamily: euiThemeVars.euiCodeFontFamily,
        fontSize: euiThemeVars.euiFontSizeXS,
      }}
      onFocus={(event) => event.currentTarget.select()}
      readOnly
      {...props}
      append={
        <EuiCopy textToCopy={value}>
          {(copyText) => (
            <EuiButtonIcon
              aria-label={i18n.translate('xpack.security.copyTokenField.copyButton', {
                defaultMessage: 'Copy to clipboard',
              })}
              iconType="copyClipboard"
              color="accentSecondary"
              onClick={copyText}
            />
          )}
        </EuiCopy>
      }
    />
  );
};

export interface SelectableTokenFieldOption {
  key: string;
  value: string;
  icon?: string;
  label: string;
  description?: string;
}

export interface SelectableTokenFieldProps extends Omit<EuiFieldTextProps, 'value' | 'prepend'> {
  options: SelectableTokenFieldOption[];
}

export const SelectableTokenField: FunctionComponent<SelectableTokenFieldProps> = (props) => {
  const { options, ...rest } = props;
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SelectableTokenFieldOption>(options[0]);

  useEffect(() => {
    if (options.length > 0) {
      setSelectedOption(options[0]);
    }
  }, [options]);

  const selectedIndex = options.findIndex((c) => c.key === selectedOption.key);
  const closePopover = () => setIsPopoverOpen(false);

  return (
    <TokenField
      {...rest}
      prepend={
        <EuiPopover
          button={
            <EuiButtonEmpty
              data-test-subj="selectableTokenFieldButton"
              size="xs"
              iconType="arrowDown"
              iconSide="right"
              color="success"
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            >
              {selectedOption.label}
            </EuiButtonEmpty>
          }
          isOpen={isPopoverOpen}
          panelPaddingSize="none"
          closePopover={closePopover}
        >
          <EuiContextMenuPanel
            initialFocusedItemIndex={selectedIndex}
            items={options.reduce<ReactElement[]>((items, option, i) => {
              items.push(
                <EuiContextMenuItem
                  key={option.key}
                  icon={option.icon}
                  layoutAlign="top"
                  onClick={() => {
                    closePopover();
                    setSelectedOption(option);
                  }}
                >
                  <strong>{option.label}</strong>
                  <EuiSpacer size="xs" />
                  <EuiText size="s" color="subdued">
                    <p>{option.description}</p>
                  </EuiText>
                </EuiContextMenuItem>
              );
              if (i < options.length - 1) {
                items.push(<EuiHorizontalRule key={`${option.key}-seperator`} margin="none" />);
              }
              return items;
            }, [])}
          />
        </EuiPopover>
      }
      value={selectedOption.value}
    />
  );
};
