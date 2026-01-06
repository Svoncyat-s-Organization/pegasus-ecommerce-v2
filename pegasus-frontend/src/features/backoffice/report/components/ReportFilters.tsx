import { DatePicker, Space, Button, Select } from 'antd';
import { IconSearch } from '@tabler/icons-react';
import dayjs, { Dayjs } from 'dayjs';
import { DATE_RANGE_PRESETS } from '../constants/reportConstants';

const { RangePicker } = DatePicker;

interface ReportFiltersProps {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  onDateChange: (dates: [Dayjs | null, Dayjs | null] | null) => void;
  onSearch: () => void;
  loading?: boolean;
}

export const ReportFilters = ({
  startDate,
  endDate,
  onDateChange,
  onSearch,
  loading = false,
}: ReportFiltersProps) => {
  const handlePresetChange = (days: number) => {
    const end = dayjs();
    const start = days === 0 ? dayjs() : dayjs().subtract(days, 'day');
    onDateChange([start, end]);
  };

  return (
    <Space wrap>
      <Select
        placeholder="Rango rápido"
        style={{ width: 160 }}
        onChange={handlePresetChange}
        options={DATE_RANGE_PRESETS.map((preset) => ({
          label: preset.label,
          value: preset.days,
        }))}
      />
      <RangePicker
        value={[startDate, endDate]}
        onChange={onDateChange}
        format="DD/MM/YYYY"
        placeholder={['Desde', 'Hasta']}
        allowClear
      />
      <Button
        type="primary"
        icon={<IconSearch size={16} />}
        onClick={onSearch}
        loading={loading}
        disabled={!startDate || !endDate}
      >
        Generar Reporte
      </Button>
    </Space>
  );
};
