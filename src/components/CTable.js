import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import PropTypes from 'prop-types';
import './third-party/tableRow.css';

const CTable = (props) => {
    const { columns, content, onRowClick, keyProp } = props;

    const handleRowClick = async (row) => {
        if (onRowClick && typeof onRowClick === 'function') {
            await onRowClick(row);
        }
    };

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        {columns.map((headCell) => (
                            <TableCell
                                className="Cell"
                                key={headCell.label}
                                align={'center'}
                                padding={headCell.disablePadding ? 'none' : 'normal'}
                            >
                                {headCell.label}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {content.map((contentEntry) => {
                        return (
                            <TableRow key={contentEntry[keyProp] || contentEntry.id} onClick={() => handleRowClick(contentEntry)}>
                                {columns.map((column) => {
                                    if (contentEntry.hasOwnProperty(column.field)) {
                                        const value = contentEntry[column.field];
                                        return (
                                            <TableCell className="Cell" key={column.label}>
                                                {column.render ? column.render(contentEntry) : value}
                                            </TableCell>
                                        );
                                    }
                                    return (
                                        <TableCell className="Cell" key={column.label}>
                                            {column.render && column.render(contentEntry)}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

CTable.prototype = {
    columns: PropTypes.array.isRequired,
    content: PropTypes.array.isRequired,
    onRowClick: PropTypes.func
};

export default CTable;
