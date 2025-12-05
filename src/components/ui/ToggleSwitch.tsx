import React from 'react';
import './ToggleSwitch.css';

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label }) => {
    return (
        <label className="toggle-switch">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className="toggle-slider"></span>
            {label && <span className="toggle-label">{label}</span>}
        </label>
    );
};

export default ToggleSwitch;
