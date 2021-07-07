import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { getTrad } from '../../utils';
import useHasMultishop from '../../hooks/useHasMultishop';

const DeleteModalAdditionalInfos = () => {
  const hasMultishopEnabled = useHasMultishop();

  if (!hasMultishopEnabled) {
    return null;
  }

  return (
    <span>
      <FormattedMessage
        id={getTrad('Settings.list.actions.deleteAdditionalInfos')}
        values={{
          em: chunks => <em>{chunks}</em>,
        }}
      />
    </span>
  );
};

export default DeleteModalAdditionalInfos;
