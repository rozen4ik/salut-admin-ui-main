import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import PropTypes from 'prop-types';
import './third-party/tableRow.css';

const GroupClientTable = (props) => {
    const { columns, content, onRowClick, keyProp } = props;

    const handleRowClick = async (row) => {
        if (onRowClick && typeof onRowClick === 'function') {
            await onRowClick(row);
        }
    };

    const customColumnStyle = {
        wordWrap: 'break-word',
        width: '70%'
    };

    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        {columns.map((headCell) => (
                            <TableCell
                                style={customColumnStyle}
                                className="Cell"
                                key={headCell.label}
                                align={'center'}
                                padding={headCell.disablePadding ? 'none' : 'normal'}
                            >
                                <div className="vertical">{headCell.label}</div>
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
                                            <TableCell style={customColumnStyle} className="Cell" key={column.label}>
                                                <div className="vertical">{column.render ? column.render(contentEntry) : value}</div>
                                            </TableCell>
                                        );
                                    }
                                    return (
                                        <TableCell style={customColumnStyle} className="Cell" key={column.label}>
                                            <div className="vertical">{column.render && column.render(contentEntry)}</div>
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

GroupClientTable.prototype = {
    columns: PropTypes.array.isRequired,
    content: PropTypes.array.isRequired,
    onRowClick: PropTypes.func
};

export default GroupClientTable;
