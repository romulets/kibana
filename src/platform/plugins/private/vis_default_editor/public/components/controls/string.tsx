/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useEffect, useCallback, ChangeEventHandler } from 'react';
import { EuiFieldText, EuiFormRow, type UseEuiTheme } from '@elastic/eui';

import { css } from '@emotion/react';
import { AggParamEditorProps } from '../agg_param_props';

const styles = ({ euiTheme }: UseEuiTheme) =>
  css({
    '.visEditorAgg__subAgg + &': {
      marginTop: euiTheme.size.base,
    },
  });

function StringParamEditor({
  agg,
  aggParam,
  showValidation,
  value,
  setValidity,
  setValue,
  setTouched,
}: AggParamEditorProps<string>) {
  const isValid = aggParam.required ? !!value : true;

  useEffect(() => {
    setValidity(isValid);
  }, [isValid, setValidity]);

  const onChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => setValue(e.target.value),
    [setValue]
  );

  return (
    <EuiFormRow
      className="visEditorAggParam__string"
      label={aggParam.displayName || aggParam.name}
      fullWidth={true}
      display="rowCompressed"
      isInvalid={showValidation ? !isValid : false}
      css={styles}
    >
      <EuiFieldText
        value={value || ''}
        data-test-subj={`visEditorStringInput${agg.id}${aggParam.name}`}
        onChange={onChange}
        fullWidth={true}
        compressed
        onBlur={setTouched}
        isInvalid={showValidation ? !isValid : false}
      />
    </EuiFormRow>
  );
}

export { StringParamEditor };
