import { useState } from 'react';
import { Button, Table, Tag, Space, Tooltip, Card } from 'antd';
import { IconPlus, IconEye } from '@tabler/icons-react';
import type { ColumnsType } from 'antd/es/table';
import type { RmaSummaryResponse, CreateRmaRequest } from '@types';
import { useMyRmas } from '../hooks/useMyRmas';
import { useCreateRma } from '../hooks/useCreateRma';
import { CreateRmaModal } from '../components/CreateRmaModal';
import { RmaDetailModal } from '../components/RmaDetailModal';
import {
    RMA_STATUS_LABELS,
    RMA_STATUS_COLORS,
    RMA_REASON_LABELS,
} from '@features/backoffice/rma/constants/rmaConstants';
import { formatCurrency } from '@shared/utils/formatters';
import dayjs from 'dayjs';

/**
 * Página de lista de devoluciones para clientes (storefront)
 * Permite ver todas las solicitudes de devolución del cliente y crear nuevas
 */
export const ReturnsPage = () => {
    const [page, setPage] = useState(0);
    const [pageSize] = useState(20);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedRmaId, setSelectedRmaId] = useState<number | null>(null);

    const { data: rmasPage, isLoading } = useMyRmas(page, pageSize);
    const { mutateAsync: createRma, isPending: isCreating } = useCreateRma();

    const handleViewDetail = (rmaId: number) => {
        setSelectedRmaId(rmaId);
        setDetailModalOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailModalOpen(false);
        setSelectedRmaId(null);
    };

    const handleCreateRma = async (request: CreateRmaRequest) => {
        await createRma(request);
    };

    const columns: ColumnsType<RmaSummaryResponse> = [
        {
            title: 'N° RMA',
            dataIndex: 'rmaNumber',
            key: 'rmaNumber',
            width: 150,
            render: (text: string) => <strong>{text}</strong>,
        },
        {
            title: 'N° Pedido',
            dataIndex: 'orderNumber',
            key: 'orderNumber',
            width: 150,
        },
        {
            title: 'Motivo',
            dataIndex: 'reason',
            key: 'reason',
            width: 180,
            render: (reason: string) => (
                <Tag color="blue">{RMA_REASON_LABELS[reason as keyof typeof RMA_REASON_LABELS]}</Tag>
            ),
        },
        {
            title: 'Estado',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: (status: string) => (
                <Tag color={RMA_STATUS_COLORS[status as keyof typeof RMA_STATUS_COLORS]}>
                    {RMA_STATUS_LABELS[status as keyof typeof RMA_STATUS_LABELS]}
                </Tag>
            ),
        },
        {
            title: 'Items',
            dataIndex: 'itemCount',
            key: 'itemCount',
            width: 100,
            align: 'center',
        },
        {
            title: 'Monto',
            dataIndex: 'refundAmount',
            key: 'refundAmount',
            width: 120,
            align: 'right',
            render: (amount: number) => formatCurrency(amount),
        },
        {
            title: 'Fecha',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Acciones',
            key: 'actions',
            width: 100,
            fixed: 'right',
            render: (_: unknown, record: RmaSummaryResponse) => (
                <Space>
                    <Tooltip title="Ver detalle">
                        <Button
                            type="text"
                            icon={<IconEye size={18} />}
                            onClick={() => handleViewDetail(record.id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card
                title="Mis Devoluciones"
                extra={
                    <Button
                        type="primary"
                        icon={<IconPlus size={18} />}
                        onClick={() => setCreateModalOpen(true)}
                    >
                        Nueva Devolución
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={rmasPage?.content ?? []}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        current: page + 1,
                        pageSize,
                        total: rmasPage?.totalElements ?? 0,
                        onChange: (newPage) => setPage(newPage - 1),
                        showSizeChanger: false,
                        showTotal: (total) => `Total: ${total} devoluciones`,
                    }}
                    scroll={{ x: 1100 }}
                    locale={{
                        emptyText: 'No tienes solicitudes de devolución',
                    }}
                />
            </Card>

            <CreateRmaModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSubmit={handleCreateRma}
                isLoading={isCreating}
            />

            <RmaDetailModal
                rmaId={selectedRmaId}
                open={detailModalOpen}
                onClose={handleCloseDetail}
            />
        </div>
    );
};
