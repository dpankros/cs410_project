import React from 'react';

export function Error(props) {
    const { error } = props;
    return <div className="error">{error}</div>
}
