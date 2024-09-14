import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';

const StatusFilter = ({ value, options, onChange, getStatusSeverity }) => (
    <Dropdown
        value={value}
        options={options}
        onChange={(e) => onChange(e.target.value)}
        itemTemplate={(option) => <Tag value={option} severity={getStatusSeverity(option)} />}
        placeholder='Select One'
        className='p-column-filter'
        showClear
        style={{ minWidth: '12rem' }}
    />
);

export default StatusFilter;