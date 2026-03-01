export enum ViewState {
  PORTFOLIO = 'PORTFOLIO',
  STRATEGY_DETAILS = 'STRATEGY_DETAILS',
  CONFIGURATION = 'CONFIGURATION'
}

export interface Position {
  symbol: string;
  name: string;
  amount: string;
  value: string;
  change: number;
  icon: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface PortfolioChartDataPoint {
  timestamp: number;
  balance: number;
}