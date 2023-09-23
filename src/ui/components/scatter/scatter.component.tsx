import React from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend, ChartOptions, ChartData,
} from 'chart.js';
import {ChartProps, Scatter as ScatterPlot} from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

const options: ChartOptions<"scatter"> = {
  // scales: {
  //   // y: {
  //   //   beginAtZero: true,
  //   // },
  // },
};

export type ScatterDataset = {
  label: string,
  data: {x: number, y: number}[]
  backgroundColor: string
  pointRadius: number
  pointHoverRadius: number
}

export type ScatterData = {
  datasets: ScatterDataset[]
}

type ScatterInput = {
  data: ScatterData
}


export function Scatter({data}: ScatterInput) {
  return <ScatterPlot options={options} data={data} />;
}