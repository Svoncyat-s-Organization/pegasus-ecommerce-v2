import { Button, Dropdown } from 'antd';
import { IconDownload, IconFileSpreadsheet } from '@tabler/icons-react';
import type { MenuProps } from 'antd';

interface ExportButtonProps {
  onExportCSV: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const ExportButton = ({
  onExportCSV,
  disabled = false,
  loading = false,
}: ExportButtonProps) => {
  const menuItems: MenuProps['items'] = [
    {
      key: 'csv',
      label: 'Exportar a CSV (Excel)',
      icon: <IconFileSpreadsheet size={16} />,
      onClick: onExportCSV,
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} disabled={disabled || loading}>
      <Button icon={<IconDownload size={16} />} loading={loading}>
        Exportar
      </Button>
    </Dropdown>
  );
};
