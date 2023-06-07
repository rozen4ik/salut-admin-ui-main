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
        fontSize: '8pt'
    };

    const sti = {
        //position: '-webkit-sticky',
        position: 'sticky',
        background: '#fff',
        fontSize: '8pt',
        left: 0,
        zIndex: 1
    };

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                <TableHead>
                    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        {columns.map((headCell) => {
                            if (headCell.label == 'ФИО') {
                                return (
                                    <TableCell style={sti} className="Cell" key={headCell.label} align={'center'} padding="checkbox">
                                        <div className="vertical">{headCell.label}</div>
                                    </TableCell>
                                );
                            } else {
                                return (
                                    <TableCell
                                        style={customColumnStyle}
                                        className="Cell"
                                        key={headCell.label}
                                        align={'center'}
                                        padding="checkbox"
                                    >
                                        <div className="vertical">{headCell.label}</div>
                                    </TableCell>
                                );
                            }
                        })}
                        {/*{columns.map((headCell) => (*/}
                        {/*    <TableCell style={customColumnStyle} className="Cell" key={headCell.label} align={'center'} padding="checkbox">*/}
                        {/*        <div className="vertical">{headCell.label}</div>*/}
                        {/*    </TableCell>*/}
                        {/*))}*/}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {content.map((contentEntry) => {
                        return (
                            <TableRow
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                key={contentEntry[keyProp] || contentEntry.id}
                                onClick={() => handleRowClick(contentEntry)}
                            >
                                {columns.map((column) => {
                                    if (column.label == 'ФИО') {
                                        if (contentEntry.hasOwnProperty(column.field)) {
                                            const value = contentEntry[column.field];
                                            return (
                                                <TableCell padding="checkbox" style={sti} className="Cell" key={column.label}>
                                                    {column.render ? column.render(contentEntry) : value}
                                                </TableCell>
                                            );
                                        }
                                        return (
                                            <TableCell padding="checkbox" style={sti} className="Cell" key={column.label}>
                                                {column.render && column.render(contentEntry)}
                                            </TableCell>
                                        );
                                    } else {
                                        if (contentEntry.hasOwnProperty(column.field)) {
                                            const value = contentEntry[column.field];
                                            return (
                                                <TableCell padding="checkbox" style={customColumnStyle} className="Cell" key={column.label}>
                                                    {column.render ? column.render(contentEntry) : value}
                                                </TableCell>
                                            );
                                        }
                                        return (
                                            <TableCell padding="checkbox" style={customColumnStyle} className="Cell" key={column.label}>
                                                {column.render && column.render(contentEntry)}
                                            </TableCell>
                                        );
                                    }
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
