import Select from 'react-select';

export default function SelectFilter({ label, options, value, onChange }) {
    return (
        <div className="flex items-center mb-4">
            <label className="text-gray-900 w-1/4">{label}</label>
            <Select
                options={options}
                value={value ? { value, label: value } : null}
                onChange={(selected) => onChange(selected ? selected.value : null)}
                className='w-3/4 p-2 border focus:outline-none focus:ring focus:ring-indigo-300'
            />
        </div>
    );
}