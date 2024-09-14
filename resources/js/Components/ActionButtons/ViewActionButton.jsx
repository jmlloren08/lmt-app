import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const ViewActionButton = ({ rowData, fetchOtherData, loading, otherData, op }) => (
    <>
        <Button
            type='Button'
            icon='pi pi-eye'
            label='View'
            onClick={(e) => fetchOtherData(rowData.id, e)}
            loading={loading}
            className='bg-gray-500 text-white p-button p-component p-button-text p-2'
        />
        <OverlayPanel ref={op} showCloseIcon closeOnEscape dismissable={false}>
            <DataTable value={Array.isArray(otherData) ? otherData : [otherData]} size='small' scrollable className='text-xs'>
                <Column field='gtd' header='Granted' />
                <Column field='prncpl' header='Principal' />
                <Column field='tsndng' header='Outstanding' />
                <Column field='ntrst' header='Interest' />
                <Column field='mrtztn' header='Amortization' />
                <Column field='ewrbddctn' header='EWRB Deduction' />
                <Column field='nthp' header='NTHP' />
                <Column field='nddctd' header='Undeducted' />
                <Column field='dedstat' header='DedStat' />
                <Column field='ntprcd' header='Net Proceed' />
                <Column field='mntd' header='Amount Due' />
                <Column field='engagement_status' header='Engagement Status' />
                <Column field='progress_report' header='Progress Report' />
            </DataTable>
        </OverlayPanel>
    </>
);

export default ViewActionButton;