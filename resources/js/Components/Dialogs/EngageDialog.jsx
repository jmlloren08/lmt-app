import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

const EngageDialog = ({ visible, currentEngageData, prData, setPrData, onSave, onClose }) => (
    <Dialog
        modal
        header='Action Taken'
        visible={visible}
        onHide={onClose}
        footer={(
            <div className='card flex justify-end gap-2'>
                <Button label='Save' icon='pi pi-check' onClick={onSave} className='bg-blue-500 text-white p-button-text px-2' />
                <Button label='Cancel' icon='pi pi-times' onClick={onClose} className='bg-gray-500 text-white p-button-text p-2' />
            </div>
        )}
    >
        {currentEngageData && (
            <div>
                <div className="mb-3">
                    <label className="font-bold text-gray-900">Teacher: </label>
                    <p>{currentEngageData.name}</p>
                </div>
                <div className="mb-3">
                    <label className="font-bold text-gray-900">Account Status: </label>
                    <p>{currentEngageData.account_status}</p>
                </div>
                <div className="mb-3">
                    <label className="font-bold text-gray-900">Eligibility: </label>
                    <p>{currentEngageData.eligibility}</p>
                </div>
                <div className="flex items=center">
                    <label className="text-gray-900 p-2">Action Taken/Remarks</label>
                    <textarea value={prData} autoFocus={true} onChange={(e) => setPrData(e.target.value)} />
                </div>
            </div>
        )}
    </Dialog>
)

export default EngageDialog;