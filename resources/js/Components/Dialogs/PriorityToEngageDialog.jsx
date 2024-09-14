import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

const PriorityToEngage = ({ visible, onProceed, onClose }) => (
    <Dialog
        modal
        header='Priority to Engage?'
        visible={visible}
        onHide={onClose}
        footer={(
            <div className='card flex justify-end gap-2'>
                <Button label='Proceed' icon='pi pi-check' onClick={onProceed} className='bg-blue-500 text-white p-button-text px-2' />
                <Button label='Cancel' icon='pi pi-times' onClick={onClose} className='bg-gray-500 text-white p-button-text p-2' />
            </div>
        )}
    >
        <p>Are you sure you want to proceed this action?</p>
    </Dialog>
);

export default PriorityToEngage;