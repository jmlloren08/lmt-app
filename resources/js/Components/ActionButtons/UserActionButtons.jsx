import { Button } from 'primereact/button';
import { ButtonGroup } from 'primereact/buttongroup';

const UserActionButtons = ({ rowData, showUpdateDialog, showCancelDialog, showRemoveDialog, showStoreDialog }) => (
    <ButtonGroup>
        {/* {rowData.email_verified_at && ( */}
        <Button
            onClick={() => showUpdateDialog(rowData)}
            icon={`pi ${rowData.roles === 'User' ? 'pi-user-edit' : 'pi-user-plus'}`}
            tooltip='Assign/Modify Role'
            className='bg-blue-500 text-white p-2'
        />
        {/* )} */}
        {rowData.roles === 'User' && (
            <Button
                onClick={() => showCancelDialog(rowData)}
                icon='pi pi-times'
                tooltip='Cancel Role'
                className='bg-yellow-500 text-white font-medium p-2'
            />
        )}
        {rowData.roles === 'division_leader' && (
            <Button
                onClick={() => showStoreDialog(rowData)}
                icon='pi pi-building'
                tooltip='Assign Stores'
                className='bg-green-500 text-white font-medium p-2'
            />
        )}
        <Button
            onClick={() => showRemoveDialog(rowData)}
            icon='pi pi-trash'
            tooltip='Remove User'
            className='bg-red-500 text-white font-medium p-2'
        />
    </ButtonGroup>
);

export default UserActionButtons;