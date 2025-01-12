import { OverlayPanel } from 'primereact/overlaypanel';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

const ViewSchoolProfile = ({ rowData, fetchOtherData, loading, otherData, op }) => (
    <>
        <Button
            type='Button'
            icon='pi pi-eye'
            onClick={(e) => fetchOtherData(rowData.id, e)}
            loading={loading}
            className='hover:text-blue-500 hover:cursor-pointer'
            title='View Details'
        />
        <OverlayPanel ref={op} showCloseIcon closeOnEscape dismissable={false}>
            <DataTable value={Array.isArray(otherData) ? otherData : [otherData]} size='small' scrollable className='text-xs'>
                <Column field='ttp' header='TTP' />
                <Column field='comma' header=',' />
                <Column field='f_v_b' header='1ST VALLEY BANK' />
                <Column field='bdo_nb' header='BDO NB' />
                <Column field='c_b_s' header='CHINA BANK SAVINGS' />
                <Column field='c_s_v' header='CITY SAVINGS BANK' />
                <Column field='e_b_i' header='Enterprise Bank Inc.' />
                <Column field='f_c_b' header='FIRST CONSOLIDATED BANK' />
                <Column field='gsis_cl' header='GSIS-Computer Loan' />
                <Column field='gsis_fa' header='GSIS Financial Assistance' />
                <Column field='gsis_el' header='GSIS-Emergency Loan' />
                <Column field='memba' header='MEMBA' />
                <Column field='phil_life' header='PHIL LIFE' />
                <Column field='plfac' header='Philippine Life Financial Assurance Corporation' />
                <Column field='p_b' header='PRODUCERS BANK' />
                <Column field='ucpb' header='UCPB' />
                <Column field='w_b' header='WEALTHBANK' />
                <Column field='grand_total' header='Grand Total' />
                <Column field='separation' header='Separation' />
                <Column field='elem_sec' header='Elementary/Secondary' />
            </DataTable>
        </OverlayPanel>
    </>
);

export default ViewSchoolProfile;