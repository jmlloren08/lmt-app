import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';

const EligibilityFilter = ({ value, options, onChange, getEligibilitySeverity }) => (
    <Dropdown
        value={value}
        options={options}
        onChange={(e) => onChange(e.target.value)}
        itemTemplate={(option) => <Tag value={option} severity={getEligibilitySeverity(option)} />}
        placeholder='Select One'
        className='p-column-filter'
        showClear
        style={{ minWidth: '12rem' }}
    />
);

export default EligibilityFilter;