import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

const RemoveDialog = ({ visible, onRemove, onClose }) => (
    <Dialog
        modal
        header='Remove User'
        visible={visible}
        onHide={onClose}
        footer={(
            <div className='card flex justify-end gap-2'>
                <Button label='Remove' icon='pi pi-trash' onClick={onRemove} className='bg-red-500 text-white p-button-text px-2' />
                <Button label='Cancel' icon='pi pi-times' onClick={onClose} className='bg-gray-500 text-white p-button-text p-2' />
            </div>
        )}
    >
        <p>Are you sure you want to remove this user?</p>
    </Dialog>
);

export default RemoveDialog;