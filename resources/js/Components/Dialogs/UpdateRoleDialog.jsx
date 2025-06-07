import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

const UpdateDialog = ({ visible, selectedRole, setSelectedRole, onSave, onClose }) => (
    <Dialog
        modal
        header='Add/Modify Role'
        visible={visible}
        onHide={onClose}
        footer={(
            <div className='card flex justify-end gap-2'>
                <Button label='Save' icon='pi pi-check' onClick={onSave} className='bg-blue-500 text-white p-button-text px-2' />
                <Button label='Cancel' icon='pi pi-times' onClick={onClose} className='bg-gray-500 text-white p-button-text p-2' />
            </div>
        )}
    >
        <div className='flex items-center'>
            <label className='text-gray-900 p-2'>Role</label>
            <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className='w-full rounded border py-3 px-5'
            >
                <option value=''>Select</option>
                <option value='User'>User</option>
                <option value='Division Leader'>Division Leader</option>
                <option value='Team Leader'>Team Leader</option>
                <option value='Loan Specialist'>Loan Specialist</option>
            </select>
        </div>
    </Dialog>
)

export default UpdateDialog;