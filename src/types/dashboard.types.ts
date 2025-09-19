export interface DateRange {
  start_date: string
  end_date: string
}

export interface PeriodOption {
  key: string
  label: string
  getValue: () => DateRange
}

export interface DashboardComponentProps {
  dateRange: DateRange
}
