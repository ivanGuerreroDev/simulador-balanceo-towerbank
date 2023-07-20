import React, { useMemo } from 'react';
import { Box, Stack } from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
const Tabla = ({data}) => {
  const columns = useMemo(
    () => [
      {
        header: 'Balanceo',
        accessorKey: 'balancing',
      },
      {
        header: 'Desde',
        accessorKey: 'from',
      },
      {
        header: 'Hasta',
        accessorKey: 'to',
      },
      {
        header: 'Monto',
        accessorKey: 'amount',
        Cell: ({ cell }) => (
          <>
            {cell.getValue()?.toLocaleString?.('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </>
        ),
      }
    ]
  );

  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      enableColumnResizing
      enableGrouping
      enableTopToolbar={false}
      initialState={{
        density: 'compact',
        expanded: true, //expand all groups by default
        grouping: ['balancing'], //an array of columns to group by by default (can be multiple)
        pagination: { pageIndex: 0, pageSize: 20 },
        sorting: [{ id: 'balancing', desc: false }], //sort by state by default
      }}
      muiToolbarAlertBannerChipProps={{ color: 'primary' }}
      muiTableContainerProps={{ sx: { maxHeight: 700 } }}
    />
  );
};

export default Tabla;