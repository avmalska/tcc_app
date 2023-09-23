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

type Dataset = {
  label: string,
  data: number[][]
  backgroundColor: string
}

type ScatterData = {
  datasets: Dataset[]
}

type ScatterInput = {
  data: ScatterData
}

// const teste: ChartData<"scatter"> = {
//   datasets: [
//     {
//       label: 'A dataset',
//       data: [1, 2],
//       backgroundColor: 'rgba(255, 99, 132, 1)',
//     }
//   ]
// }

export function Scatter({data}: ScatterInput) {
  return <ScatterPlot options={options} data={data} />;
}