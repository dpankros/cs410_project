import React from 'react';

export function FormInput (props) {
    const { type, size, onChange, value, ...passThrough } = props;
    return (
        <input
            {...passThrough}
            type={type}
            size={size}
            value={value}
            onChange={e => onChange(e.target.value)}
        />
    );
}

const logOutput = v => console.log(v)
FormInput.defaultProps = {
    type: "text",
    size: 20,
    value: '',
    onChange: logOutput
}

