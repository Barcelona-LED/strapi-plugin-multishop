/**
 *
 * Initializer
 *
 */

import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import pluginId from '../pluginId';
import useShops from '../hooks/useShops';

const Initializer = ({ updatePlugin }) => {
  const { isLoading, shops } = useShops();
  const ref = useRef();

  ref.current = updatePlugin;

  useEffect(() => {
    if (!isLoading && shops.length > 0) {
      ref.current(pluginId, 'isReady', true);
    }
  }, [isLoading, shops]);

  return null;
};

Initializer.propTypes = {
  updatePlugin: PropTypes.func.isRequired,
};

export default Initializer;
