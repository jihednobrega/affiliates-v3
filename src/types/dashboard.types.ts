export interface DateRange {
  start_date: string // Format: "YYYY-MM-DD"
  end_date: string // Format: "YYYY-MM-DD"
}

export interface PeriodOption {
  key: string
  label: string
  getValue: () => DateRange
}

export interface DashboardComponentProps {
  dateRange: DateRange
}
