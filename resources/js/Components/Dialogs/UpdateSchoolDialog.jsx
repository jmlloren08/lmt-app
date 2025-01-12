import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';

const UpdateSchoolDialog = ({
    visible,
    selectedTeacher,
    selectedStore,
    selectedDistrict,
    setSelectedDistrict,
    selectedSchool,
    setSelectedSchool,
    onAssign,
    onClose
}) => {
    const [districts, setDistricts] = useState([]);
    const [schools, setSchools] = useState([]);

    useEffect(() => {
        const fetchDistricts = async () => {
            setDistricts([]);
            setSchools([]);
            if (selectedStore) {
                try {
                    const response = await axios.get(`/get-distinct-districts/?store=${selectedStore}`);
                    setDistricts(response.data.map((district) => ({
                        value: district.district,
                        label: district.district
                    })));
                } catch (error) {
                    console.error('Error fetching districts: ', error);
                }
            }
        };

        fetchDistricts();
    }, [selectedStore]);

    useEffect(() => {
        const fetchSchools = async () => {
            setSchools([]);
            if (selectedDistrict) {
                try {
                    const response = await axios.get(`/get-distinct-schools?district=${selectedDistrict}`);
                    setSchools(response.data.map((school) => ({
                        value: school.school,
                        label: school.school
                    })));
                } catch (error) {
                    console.error('Error fetching schools: ', error);
                }
            }
        };

        fetchSchools();
    }, [selectedDistrict]);

    const handleAssign = () => {
        onAssign();
    };

    return (
        <Dialog
            modal
            header='Assign School'
            visible={visible}
            onHide={onClose}
            footer={(
                <div className='card flex justify-end gap-2'>
                    <Button label='Assign' icon='pi pi-check' onClick={handleAssign} className='bg-blue-500 text-white p-button-text px-2' />
                    <Button label='Cancel' icon='pi pi-times' onClick={onClose} className='bg-gray-500 text-white p-button-text p-2' />
                </div>
            )}
            className='w-full sm:w-1/2'
        >
            <div className='flex flex-col gap-4'>
                <div className='flex items-center'>
                    <input type="hidden" value={selectedTeacher} readOnly/>
                    <label className='text-gray-900 p-2'>District</label>
                    <Select
                        value={{ value: selectedDistrict, label: selectedDistrict }}
                        onChange={(option) => setSelectedDistrict(option.value)}
                        options={districts}
                        className='w-full rounded border py-3 px-5 mt-2'
                        menuPortalTarget={document.body}
                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                    />
                </div>
                <div className='flex items-center'>
                    <label className='text-gray-900 p-2'>School</label>
                    <Select
                        value={{ value: selectedSchool, label: selectedSchool }}
                        onChange={(option) => setSelectedSchool(option.value)}
                        options={schools}
                        className='w-full rounded border py-3 px-5'
                        menuPortalTarget={document.body}
                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                    />
                </div>
            </div>
        </Dialog>
    );
};

export default UpdateSchoolDialog;

