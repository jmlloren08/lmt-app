import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

const AssignStoreDialog = ({ visible, stores, selectedStore, setSelectedStore, onAssign, onClose }) => (
    <Dialog
        modal
        header='Assign Store'
        visible={visible}
        onHide={onClose}
        footer={(
            <div className='card flex justify-end gap-2'>
                <Button label='Assign' icon='pi pi-check' onClick={onAssign} className='bg-blue-500 text-white p-button-text px-2' />
                <Button label='Cancel' icon='pi pi-times' onClick={onClose} className='bg-gray-500 text-white p-button-text p-2' />
            </div>
        )}
    >
        <div className='flex items-center'>
            <label className='text-gray-900 p-2'>Store</label>
            <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className='w-full rounded border py-3 px-5'
            >
                <option value="" disabled>Select</option>
                {stores.map((store, index) => (
                    <option key={index} value={store.store}>{store.store}</option>
                ))}
            </select>
        </div>
    </Dialog>
);

export default AssignStoreDialog;