import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

const CancelDialog = ({ visible, onCancel, onClose }) => (
    <Dialog
        modal
        header='Cancel User Role'
        visible={visible}
        onHide={onClose}
        footer={(
            <div className='card flex justify-end gap-2'>
                <Button label='Proceed' icon='pi pi-trash' onClick={onCancel} className='bg-red-500 text-white p-button-text px-2' />
                <Button label='Cancel' icon='pi pi-times' onClick={onClose} className='bg-gray-500 text-white p-button-text p-2' />
            </div>
        )}
    >
        <p>Are you sure you want to cancel the role of this User?</p>
    </Dialog>
);

export default CancelDialog;