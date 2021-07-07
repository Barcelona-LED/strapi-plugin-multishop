import React from 'react';
import PropTypes from 'prop-types';
import { Label } from '@buffetjs/core';
import { Inputs } from '@buffetjs/custom';
import Select, { createFilter } from 'react-select';
import { Col, Row } from 'reactstrap';
import { useIntl } from 'react-intl';
import { useTheme } from 'styled-components';
import { BaselineAlignment, selectStyles, DropdownIndicator } from 'strapi-helper-plugin';
import { useFormikContext } from 'formik';
import { getTrad } from '../../utils';

const reactSelectShopFilter = createFilter({
  ignoreCase: true,
  ignoreAccents: true,
  matchFrom: 'start',
});

const BaseForm = ({ locales, defaultLocale }) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const { values, handleChange, setFieldValue } = useFormikContext();

  const styles = selectStyles(theme);

  return (<>
    <Row>
      <Col>
        <BaselineAlignment top size="5px" />

        <Inputs
          label={formatMessage({
            id: getTrad('Settings.shops.modal.shops.displayName'),
          })}
          name="displayName"
          description={formatMessage({
            id: getTrad('Settings.shops.modal.shops.displayName.description'),
          })}
          type="text"
          value={values.displayName}
          onChange={handleChange}
          validations={{
            max: 50,
          }}
          translatedErrors={{
            max: formatMessage({
              id: getTrad('Settings.shops.modal.shops.displayName.error'),
            }),
          }}
        />
      </Col>

      <Col>
        <BaselineAlignment top size="2px" />

        <Inputs
          label={formatMessage({
            id: getTrad('Settings.shops.modal.shops.url'),
          })}
          name="url"
          description={formatMessage({
            id: getTrad('Settings.shops.modal.shops.url.description'),
          })}
          type="text"
          value={values.url}
          onChange={handleChange}
          validations={{
            max: 50,
          }}
          translatedErrors={{
            max: formatMessage({
              id: getTrad('Settings.shops.modal.shops.url.error'),
            }),
          }}
        />
      </Col>
    </Row>
    <Row>
      <Col>
        <Select
            aria-labelledby="shop"
            options={locales}
            defaultValue={defaultLocale}
            filterOption={reactSelectShopFilter}
            onChange={selection => {
              setFieldValue('default_locale', selection.label);
            }}
            components={{ DropdownIndicator }}
            styles={{
              ...styles,
              control: (base, state) => ({ ...base, ...styles.control(base, state), height: '34px' }),
              indicatorsContainer: (base, state) => ({
                ...base,
                ...styles.indicatorsContainer(base, state),
                height: '32px',
              }),
            }}
          />
      </Col>
    </Row>
    </>
  );
};

export default BaseForm;
